import React, { useState, useCallback, useEffect } from "react";
import {
  ChevronRight, ArrowLeft, Check, Table2, FileText,
  HardDrive, Layers, Loader2, AlertCircle, Database, Info, Search,
} from "lucide-react";

const API_BASE = "http://65.0.54.48:8000";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SelectedItem = {
  id: string;
  label: string;
  role?: "buyer" | "seller";
};

type BrowserProps = {
  sourceId: "s3" | "adls" | "onelake";
  authParams: Record<string, string>;
  onSelectionChange: (items: SelectedItem[]) => void;
};

type PaneItem = {
  id: string;
  label: string;
  meta?: string;
};

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// ── useAsync ──────────────────────────────────────────────────────────────────

function useAsync<T>(fetcher: () => Promise<T>, deps: React.DependencyList): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: false, error: null });
  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetcher()
      .then((d) => { if (!cancelled) setState({ data: d, loading: false, error: null }); })
      .catch((e) => { if (!cancelled) setState({ data: null, loading: false, error: e.message ?? "Failed" }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

// ── API ───────────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().then((j) => j.detail ?? res.statusText).catch(() => res.statusText);
    throw new Error(detail);
  }
  return res.json();
}

const fetchOneLakeWorkspaces = (auth: Record<string, string>) =>
  post<{ workspaces: { id: string; name: string }[] }>("/sources/onelake/workspaces", {
    tenant_id: auth.tid, client_id: auth.cid, client_secret: auth.csec,
    workspace_id: "00000000-0000-0000-0000-000000000000",
  });

const fetchOneLakeLakehouses = (auth: Record<string, string>, workspaceId: string) =>
  post<{ lakehouses: { id: string; name: string }[] }>("/sources/onelake/lakehouses", {
    tenant_id: auth.tid, client_id: auth.cid, client_secret: auth.csec,
    workspace_id: workspaceId, workspace_name: "",
  });

const fetchOneLakeTables = (auth: Record<string, string>, workspaceId: string, lakehouseId: string) =>
  post<{ tables: { name: string; type: string }[] }>("/sources/onelake/tables", {
    tenant_id: auth.tid, client_id: auth.cid, client_secret: auth.csec,
    workspace_id: workspaceId, lakehouse_id: lakehouseId,
  });

const fetchS3Buckets = (auth: Record<string, string>) =>
  post<{ buckets: string[] }>("/sources/s3/buckets", {
    access_key: auth.ak, secret_key: auth.sk, region: auth.region || "us-east-1",
  });

const fetchS3Folders = (auth: Record<string, string>, bucket: string) =>
  post<{ folders: string[] }>("/sources/s3/folders", {
    access_key: auth.ak, secret_key: auth.sk, region: auth.region || "us-east-1", bucket,
  });

const fetchS3Files = (auth: Record<string, string>, bucket: string, folder: string) =>
  post<{ files: { key: string; name: string; size_bytes: number }[] }>("/sources/s3/files", {
    access_key: auth.ak, secret_key: auth.sk, region: auth.region || "us-east-1", bucket, folder,
  });

const fetchAdlsContainers = (auth: Record<string, string>) =>
  post<{ containers: string[] }>("/sources/adls/containers", {
    connection_string: auth.connstr,
  });

const fetchAdlsFolders = (auth: Record<string, string>, container: string) =>
  post<{ folders: { name: string; path: string }[] }>("/sources/adls/folders", {
    connection_string: auth.connstr,
    container,
    prefix: "",
  });

const fetchAdlsFiles = (auth: Record<string, string>, container: string, prefix: string) =>
  post<{ files: { path: string; name: string; size_bytes: number }[] }>("/sources/adls/files", {
    connection_string: auth.connstr,
    container,
    prefix,
  });

// ── InfoTooltip ───────────────────────────────────────────────────────────────

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative flex-shrink-0">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <Info size={13} />
      </button>
      {visible && (
        <div
          className="absolute right-0 top-5 z-50 w-52 rounded-md border border-border bg-popover px-2.5 py-2 text-[11px] text-muted-foreground shadow-md leading-relaxed"
        >
          {text}
        </div>
      )}
    </div>
  );
};

// ── DrillList — full-width single-level list ──────────────────────────────────

const DrillList: React.FC<{
  title: string;
  /** Optional helper text shown in the ⓘ tooltip next to the search box */
  infoText?: string;
  items: PaneItem[];
  loading: boolean;
  error: string | null;
  onBack?: () => void;
  onSelect: (item: PaneItem) => void;
  renderRight?: (item: PaneItem) => React.ReactNode;
  icon?: React.ReactNode;
  /** When true the header shows a search input that filters items by label */
  searchable?: boolean;
}> = ({ title, infoText, items, loading, error, onBack, onSelect, renderRight, icon, searchable }) => {
  const [query, setQuery] = useState("");

  // Reset search whenever the item list changes (i.e. user drilled into a new level)
  useEffect(() => { setQuery(""); }, [items]);

  const filtered = query.trim()
    ? items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden min-h-[220px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/40 border-b border-border flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <ArrowLeft size={13} />
          </button>
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}

        {searchable ? (
          /* Search row — title as small label above, input below */
          <div className="flex flex-1 items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap flex-shrink-0">
              {title}
            </span>
            <div className="relative flex-1 min-w-0">
              <Search
                size={11}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter…"
                className="w-full pl-6 pr-2 py-0.5 text-[12px] bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-foreground placeholder:text-muted-foreground/40"
              />
            </div>
            {infoText && <InfoTooltip text={infoText} />}
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground leading-tight">{title}</p>
          </div>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-[13px] text-muted-foreground py-8">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-[12px] text-destructive px-4 text-center py-8">
          <AlertCircle size={13} className="flex-shrink-0" /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground py-8">
          {query ? "No matches" : "No items found"}
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 max-h-[260px]">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex items-center gap-2 px-3 py-[9px] text-[13px] cursor-pointer border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/50"
            >
              <span className="flex-1 truncate text-foreground">{item.label}</span>
              {item.meta && <span className="text-[11px] text-muted-foreground">{item.meta}</span>}
              {renderRight ? renderRight(item) : <ChevronRight size={12} className="text-muted-foreground/50 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── S3 Browser ────────────────────────────────────────────────────────────────

type S3Level = "buckets" | "folders" | "files";

const S3Browser: React.FC<{ authParams: Record<string, string>; onSelectionChange: (items: SelectedItem[]) => void }> = ({
  authParams, onSelectionChange,
}) => {
  const [level, setLevel] = useState<S3Level>("buckets");
  const [bucket, setBucket] = useState<PaneItem | null>(null);
  const [folder, setFolder] = useState<PaneItem | null>(null);
  const [checked, setChecked] = useState<SelectedItem[]>([]);

  const bucketsState = useAsync(() => fetchS3Buckets(authParams), [authParams]);
  const foldersState = useAsync(
    () => bucket ? fetchS3Folders(authParams, bucket.id) : Promise.resolve({ folders: [] }),
    [bucket?.id]
  );
  const filesState = useAsync(
    () => bucket && folder ? fetchS3Files(authParams, bucket.id, folder.id) : Promise.resolve({ files: [] }),
    [bucket?.id, folder?.id]
  );

  const toggleFile = (item: PaneItem) => {
    setChecked((prev) => {
      const next = prev.find((f) => f.id === item.id)
        ? prev.filter((f) => f.id !== item.id)
        : [...prev, { id: item.id, label: item.label }];
      onSelectionChange(next);
      return next;
    });
  };

  if (level === "buckets") return (
    <DrillList
      title="Select a bucket"
      items={bucketsState.data?.buckets.map((b) => ({ id: b, label: b })) ?? []}
      loading={bucketsState.loading} error={bucketsState.error}
      icon={<HardDrive size={14} className="text-amber-500" />}
      searchable
      onSelect={(item) => { setBucket(item); setLevel("folders"); }}
    />
  );

  if (level === "folders") return (
    <DrillList
      title="Select a folder"
      items={foldersState.data?.folders.map((f) => ({ id: f, label: f })) ?? []}
      loading={foldersState.loading} error={foldersState.error}
      icon={<span className="text-[14px]">📦</span>}
      searchable
      onBack={() => { setLevel("buckets"); setBucket(null); setChecked([]); onSelectionChange([]); }}
      onSelect={(item) => { setFolder(item); setLevel("files"); setChecked([]); onSelectionChange([]); }}
    />
  );

  const fileItems = filesState.data?.files.map((f) => ({
    id: `${bucket!.id}/${f.key}`, label: f.name,
    meta: f.size_bytes ? `${(f.size_bytes / 1024).toFixed(0)} KB` : undefined,
  })) ?? [];

  return (
    <DrillList
      title="Select files"
      infoText="Select files in order — the 1st becomes the buyer dataset, the 2nd becomes the seller dataset."
      items={fileItems}
      loading={filesState.loading} error={filesState.error}
      icon={<FileText size={14} className="text-muted-foreground" />}
      searchable
      onBack={() => { setLevel("folders"); setFolder(null); setChecked([]); onSelectionChange([]); }}
      onSelect={toggleFile}
      renderRight={(item) => {
        const idx = checked.findIndex((c) => c.id === item.id);
        if (idx === 0) return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-600 text-white">buyer</span>;
        if (idx === 1) return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-600 text-white">seller</span>;
        if (idx > 1) return <Check size={13} className="text-blue-600" />;
        return <div className="w-[14px] h-[14px] border border-border rounded flex-shrink-0" />;
      }}
    />
  );
};

// ── ADLS Browser ──────────────────────────────────────────────────────────────

type AdlsLevel = "containers" | "folders" | "files";

const AdlsBrowser: React.FC<{ authParams: Record<string, string>; onSelectionChange: (items: SelectedItem[]) => void }> = ({
  authParams, onSelectionChange,
}) => {
  const [level, setLevel] = useState<AdlsLevel>("containers");
  const [container, setContainer] = useState<PaneItem | null>(null);
  const [folder, setFolder] = useState<PaneItem | null>(null);
  const [checked, setChecked] = useState<SelectedItem[]>([]);

  const containersState = useAsync(() => fetchAdlsContainers(authParams), [authParams]);
  const foldersState = useAsync(
    () => container ? fetchAdlsFolders(authParams, container.id) : Promise.resolve({ folders: [] }),
    [container?.id]
  );
  const filesState = useAsync(
    () => container && folder
      ? fetchAdlsFiles(authParams, container.id, folder.id)
      : Promise.resolve({ files: [] }),
    [container?.id, folder?.id]
  );

  const toggleFile = (item: PaneItem) => {
    setChecked((prev) => {
      const next = prev.find((f) => f.id === item.id)
        ? prev.filter((f) => f.id !== item.id)
        : [...prev, { id: item.id, label: item.label }];
      onSelectionChange(next);
      return next;
    });
  };

  if (level === "containers") return (
    <DrillList
      title="Select a container"
      items={containersState.data?.containers.map((c) => ({ id: c, label: c })) ?? []}
      loading={containersState.loading} error={containersState.error}
      icon={<Layers size={14} className="text-blue-500" />}
      searchable
      onSelect={(item) => { setContainer(item); setLevel("folders"); }}
    />
  );

  if (level === "folders") return (
    <DrillList
      title="Select a folder"
      items={foldersState.data?.folders.map((f) => ({ id: f.path, label: f.name })) ?? []}
      loading={foldersState.loading} error={foldersState.error}
      icon={<span className="text-[14px]">📁</span>}
      searchable
      onBack={() => { setLevel("containers"); setContainer(null); setChecked([]); onSelectionChange([]); }}
      onSelect={(item) => { setFolder(item); setLevel("files"); setChecked([]); onSelectionChange([]); }}
    />
  );

  const fileItems = filesState.data?.files.map((f) => ({
    id: `${authParams.connstr?.split(";").find(p => p.startsWith("AccountName"))?.split("=")[1] ?? "adls"}/${container!.id}/${f.path}`,
    label: f.name,
    meta: f.size_bytes ? `${(f.size_bytes / 1024).toFixed(0)} KB` : undefined,
  })) ?? [];

  return (
    <DrillList
      title="Select files"
      infoText="Select files in order — the 1st becomes the buyer dataset, the 2nd becomes the seller dataset."
      items={fileItems}
      loading={filesState.loading} error={filesState.error}
      icon={<FileText size={14} className="text-muted-foreground" />}
      searchable
      onBack={() => { setLevel("folders"); setFolder(null); setChecked([]); onSelectionChange([]); }}
      onSelect={toggleFile}
      renderRight={(item) => {
        const idx = checked.findIndex((c) => c.id === item.id);
        if (idx === 0) return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-600 text-white">buyer</span>;
        if (idx === 1) return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-600 text-white">seller</span>;
        if (idx > 1) return <Check size={13} className="text-blue-600" />;
        return <div className="w-[14px] h-[14px] border border-border rounded flex-shrink-0" />;
      }}
    />
  );
};

// ── OneLake Browser ───────────────────────────────────────────────────────────

type OneLakeLevel = "workspaces" | "lakehouses" | "tables";

const OneLakeBrowser: React.FC<{ authParams: Record<string, string>; onSelectionChange: (items: SelectedItem[]) => void }> = ({
  authParams, onSelectionChange,
}) => {
  const [level, setLevel] = useState<OneLakeLevel>("workspaces");
  const [workspace, setWorkspace] = useState<{ id: string; name: string } | null>(null);
  const [lakehouse, setLakehouse] = useState<{ id: string; name: string } | null>(null);
  // Same checked[] pattern as S3 / ADLS — index 0 = buyer, index 1 = seller
  const [checked, setChecked] = useState<SelectedItem[]>([]);

  const workspacesState = useAsync(() => fetchOneLakeWorkspaces(authParams), [authParams]);
  const lakehousesState = useAsync(
    () => workspace ? fetchOneLakeLakehouses(authParams, workspace.id) : Promise.resolve({ lakehouses: [] }),
    [workspace?.id]
  );
  const tablesState = useAsync(
    () => workspace && lakehouse
      ? fetchOneLakeTables(authParams, workspace.id, lakehouse.id)
      : Promise.resolve({ tables: [] }),
    [workspace?.id, lakehouse?.id]
  );

  const toggleTable = (item: PaneItem) => {
    setChecked((prev) => {
      const next = prev.find((t) => t.id === item.id)
        ? prev.filter((t) => t.id !== item.id)
        : [...prev, { id: item.id, label: item.label }];
      // Emit with roles derived from position
      onSelectionChange(
        next.map((t, i) => ({
          ...t,
          role: i === 0 ? ("buyer" as const) : ("seller" as const),
        }))
      );
      return next;
    });
  };

  if (level === "workspaces") return (
    <DrillList
      title="Select a workspace"
      items={workspacesState.data?.workspaces.map((w) => ({ id: w.id, label: w.name })) ?? []}
      loading={workspacesState.loading} error={workspacesState.error}
      icon={<span className="text-[14px]">🏢</span>}
      searchable
      onSelect={(item) => {
        const ws = workspacesState.data?.workspaces.find((w) => w.id === item.id);
        if (ws) { setWorkspace(ws); setLevel("lakehouses"); }
      }}
    />
  );

  if (level === "lakehouses") return (
    <DrillList
      title="Select a lakehouse"
      items={lakehousesState.data?.lakehouses.map((lh) => ({ id: lh.id, label: lh.name })) ?? []}
      loading={lakehousesState.loading} error={lakehousesState.error}
      icon={<span className="text-[14px]">🏠</span>}
      searchable
      onBack={() => { setLevel("workspaces"); setWorkspace(null); setChecked([]); onSelectionChange([]); }}
      onSelect={(item) => {
        const lh = lakehousesState.data?.lakehouses.find((l) => l.id === item.id);
        if (lh) { setLakehouse(lh); setLevel("tables"); setChecked([]); onSelectionChange([]); }
      }}
    />
  );

  const tableItems = tablesState.data?.tables.map((t) => ({
    id: `${workspace!.id}/${lakehouse!.id}/${t.name}`,
    label: t.name,
    meta: t.type,
  })) ?? [];

  return (
    <DrillList
      title="Select tables"
      infoText="Select tables in order — the 1st becomes the buyer dataset, the 2nd becomes the seller dataset."
      items={tableItems}
      loading={tablesState.loading} error={tablesState.error}
      icon={<Database size={14} className="text-purple-500" />}
      searchable
      onBack={() => {
        setLevel("lakehouses");
        setLakehouse(null);
        setChecked([]);
        onSelectionChange([]);
      }}
      onSelect={toggleTable}
      renderRight={(item) => {
        const idx = checked.findIndex((c) => c.id === item.id);
        if (idx === 0) return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-600 text-white">buyer</span>;
        if (idx === 1) return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-600 text-white">seller</span>;
        if (idx > 1) return <Check size={13} className="text-blue-600" />;
        return <div className="w-[14px] h-[14px] border border-border rounded flex-shrink-0" />;
      }}
    />
  );
};

// ── Main export ───────────────────────────────────────────────────────────────

export const DataSourceBrowser: React.FC<BrowserProps> = ({ sourceId, authParams, onSelectionChange }) => {
  if (sourceId === "s3") return <S3Browser authParams={authParams} onSelectionChange={onSelectionChange} />;
  if (sourceId === "adls") return <AdlsBrowser authParams={authParams} onSelectionChange={onSelectionChange} />;
  if (sourceId === "onelake") return <OneLakeBrowser authParams={authParams} onSelectionChange={onSelectionChange} />;
  return null;
};

export default DataSourceBrowser;
