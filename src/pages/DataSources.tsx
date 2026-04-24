import React, { useState, useCallback, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { DataSourceBrowser, SelectedItem } from "@/components/Datasourcebrowser";
import {
  CheckCircle2, Loader2, ChevronRight, X,
  Database, Cloud, Snowflake, Table2, HardDrive, Upload, Server,
  ArrowLeft,
} from "lucide-react";

// const API_BASE = "http://localhost:8000";
const API_BASE = "http://65.0.54.48:8000";

// ── Source definitions ────────────────────────────────────────────────────────

type SourceId = "s3" | "adls" | "onelake" | "local" | "snowflake" | "sap" | "databases" | "databricks";

type SourceDef = {
  id: SourceId;
  name: string;
  type: string;
  icon: React.ReactNode;
  /** Sources with no real backend yet — modal opens but Connect does nothing */
  stubOnly?: boolean;
};

const SOURCES: SourceDef[] = [
  {
    id: "s3",
    name: "AWS S3",
    type: "Cloud storage",
    icon: <HardDrive size={22} className="text-amber-500" />,
  },
  {
    id: "adls",
    name: "Azure ADLS",
    type: "Cloud storage",
    icon: <Cloud size={22} className="text-blue-500" />,
  },
  {
    id: "onelake",
    name: "OneLake",
    type: "Microsoft Fabric",
    icon: <Database size={22} className="text-purple-500" />,
  },
  {
    id: "local",
    name: "Local files",
    type: "Upload",
    icon: <Upload size={22} className="text-emerald-500" />,
  },
  {
    id: "snowflake",
    name: "Snowflake",
    type: "Database",
    icon: <Snowflake size={22} className="text-sky-400" />,
    stubOnly: true,
  },
  {
    id: "sap",
    name: "SAP",
    type: "Database",
    icon: <Server size={22} className="text-teal-500" />,
    stubOnly: true,
  },
  {
    id: "databases",
    name: "Databases",
    type: "Generic SQL",
    icon: <Table2 size={22} className="text-indigo-500" />,
    stubOnly: true,
  },
  {
    id: "databricks",
    name: "Databricks",
    type: "Delta Lake",
    icon: <Database size={22} className="text-orange-500" />,
    stubOnly: true,
  },
];

// ── Auth field definitions per source ────────────────────────────────────────

type FieldDef = {
  key: string;
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  hint?: string;
  colSpan?: 1 | 2;
};

const AUTH_FIELDS: Record<SourceId, FieldDef[][]> = {
  s3: [
    [
      { key: "ak", label: "Access key ID", placeholder: "AKIA...", type: "password", value: "AKIAQXPZDH6LCI7UUNWK" },
      { key: "sk", label: "Secret access key", placeholder: "wJalr...", type: "password", value:"" },
    ],
    [
      { key: "region", label: "Region", placeholder: "ap-south-1", colSpan: 2, value:"ap-south-1" },
    ],
  ],
  adls: [
    [
      {
        key: "connstr",
        label: "Connection string",
        placeholder: "DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net",
        type: "password",
        colSpan: 2,
        hint: "Find this in Azure Portal → Storage account → Access keys → Connection string",
        value: ""
      },
    ],
  ],
  onelake: [
    [
      { key: "tid", label: "Tenant ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", value: "0eadb77e-42dc-47f8-bbe3-ec2395e0712c" },
      { key: "cid", label: "Client ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", value: "e2eaa87b-ee2a-4680-9982-870896175cfc" },
    ],
    [
      { key: "csec", label: "Client secret", placeholder: "your-client-secret", type: "password", colSpan: 2, value: "" },
    ],
  ],
  local: [],
  snowflake: [
    [
      { key: "account", label: "Account identifier", placeholder: "xy12345.us-east-1", value: "" },
      { key: "warehouse", label: "Warehouse", placeholder: "COMPUTE_WH", value: "" },
    ],
    [
      { key: "database", label: "Database", placeholder: "MY_DATABASE", value: "" },
      { key: "schema", label: "Schema", placeholder: "PUBLIC", value: "" },
    ],
    [
      { key: "user", label: "Username", placeholder: "your_username", value: "" },
      { key: "password", label: "Password", placeholder: "••••••••", type: "password", value: "" },
    ],
  ],
  sap: [
    [
      { key: "host", label: "Host", placeholder: "sap.example.com", value: "" },
      { key: "sysnr", label: "System number", placeholder: "00", value: "" },
    ],
    [
      { key: "client", label: "Client", placeholder: "100", value: "" },
      { key: "user", label: "Username", placeholder: "SAP_USER", value: "" },
    ],
    [
      { key: "password", label: "Password", placeholder: "••••••••", type: "password", colSpan: 2, value: "" },
    ],
  ],
  databases: [
    [
      { key: "type", label: "Database type", placeholder: "PostgreSQL / MySQL / MSSQL", value: "" },
      { key: "host", label: "Host", placeholder: "db.example.com", value: "" },
    ],
    [
      { key: "port", label: "Port", placeholder: "5432", value: "" },
      { key: "database", label: "Database name", placeholder: "my_database", value: "" },
    ],
    [
      { key: "user", label: "Username", placeholder: "db_user", value: "" },
      { key: "password", label: "Password", placeholder: "••••••••", type: "password", value: "" },
    ],
  ],
  databricks: [
    [
      { key: "host", label: "Workspace URL", placeholder: "adb-123.azuredatabricks.net", colSpan: 2, value: "" },
    ],
    [
      { key: "token", label: "Personal access token", placeholder: "dapi...", type: "password", colSpan: 2, value: "" },
    ],
    [
      { key: "cluster", label: "Cluster ID", placeholder: "0123-456789-abcdefgh", value: "" },
      { key: "catalog", label: "Catalog", placeholder: "main", value: "" },
    ],
  ],
};

// ── Small helpers ─────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}> = ({ label, value, onChange, placeholder, type = "text", hint }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    {hint && <p className="text-[11px] text-muted-foreground/70 mb-1">{hint}</p>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-border rounded-md px-2.5 py-1.5 w-full bg-background text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 text-foreground placeholder:text-muted-foreground/50"
    />
  </div>
);

// ── Modal shell ───────────────────────────────────────────────────────────────

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}> = ({ open, onClose, title, subtitle, icon, children, wide }) => {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative bg-background border border-border rounded-2xl shadow-2xl flex flex-col
          ${wide ? "w-full max-w-3xl" : "w-full max-w-lg"}`}
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-shrink-0">
          {icon && (
            <div className="w-9 h-9 rounded-full border border-border bg-muted/40 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Step pill indicator ───────────────────────────────────────────────────────

const StepPills: React.FC<{ step: 1 | 2 }> = ({ step }) => (
  <div className="flex items-center gap-2 mb-5">
    {[1, 2].map((n) => (
      <React.Fragment key={n}>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors
          ${step === n
            ? "bg-blue-600 text-white"
            : step > n
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"}`}>
          {step > n
            ? <CheckCircle2 size={11} />
            : <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[9px]">{n}</span>}
          {n === 1 ? "Authenticate" : "Select data"}
        </div>
        {n < 2 && <div className="flex-1 h-px bg-border max-w-[32px]" />}
      </React.Fragment>
    ))}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const DataSources: React.FC = () => {
  // const { setData, setActiveSource } = useData();

  //credentials
  const { setData, setActiveSource, setActiveCredentials } = useData();

  // Modal state
  const [modalSrc, setModalSrc] = useState<SourceDef | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  // Auth state
  const [authParams, setAuthParams] = useState<Record<string, string>>({});
  const [authed, setAuthed] = useState(false);
  const [authing, setAuthing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Selection state
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [buyerFile, setBuyerFile] = useState<File | null>(null);
  const [sellerFile, setSellerFile] = useState<File | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // const openModal = (src: SourceDef) => {
  //   setModalSrc(src);
  //   setModalStep(1);
  //   setAuthParams({});
  //   setAuthed(false);
  //   setAuthError(null);
  //   setSelected([]);
  //   setBuyerFile(null);
  //   setSellerFile(null);
  //   setConnecting(false);
  //   setConnectError(null);
  //   setConnected(false);
  // };
  const openModal = (src: SourceDef) => {
    setModalSrc(src);
    setModalStep(1);

    // Seed authParams from any default values defined in AUTH_FIELDS
    const defaults: Record<string, string> = {};
    (AUTH_FIELDS[src.id] ?? []).forEach((row) =>
      row.forEach((f) => {
        if (f.value) defaults[f.key] = f.value;
      })
    );
    setAuthParams(defaults);  // ← pre-filled now

    setAuthed(false);
    setAuthError(null);
    setSelected([]);
    setBuyerFile(null);
    setSellerFile(null);
    setConnecting(false);
    setConnectError(null);
    setConnected(false);
  };

  const closeModal = () => {
    setModalSrc(null);
  };

  const handleAuthParamChange = (key: string, val: string) => {
    setAuthParams((p) => ({ ...p, [key]: val }));
  };

  // const handleAuth = async () => {
  //   setAuthing(true);
  //   setAuthError(null);
  //   try {
  //     await new Promise((r) => setTimeout(r, 1200));
  //     setAuthed(true);
  //     // Advance to step 2 for sources that have a browser
  //     if (modalSrc?.id !== "local") {
  //       setTimeout(() => setModalStep(2), 300);
  //     } else {
  //       setModalStep(2);
  //     }
  //   } catch (e: any) {
  //     setAuthError(e.message || "Authentication failed");
  //   } finally {
  //     setAuthing(false);
  //   }
  // };
  // const handleAuth = async () => {
  //   setAuthing(true);
  //   setAuthError(null);
  //   try {
  //     if (modalSrc?.id === "s3") {
  //     //   if (!authParams.ak || !authParams.sk) {
  //     //     throw new Error("Access key ID and Secret access key are required.");
  //     //   }
  //     //   const res = await fetch(`${API_BASE}/sources/s3/buckets`, {
  //     //     method: "POST",
  //     //     headers: { "Content-Type": "application/json" },
  //     //     body: JSON.stringify({
  //     //       access_key: authParams.ak,
  //     //       secret_key: authParams.sk,
  //     //       region: authParams.region || "ap-south-1",
  //     //     }),
  //     //   });
  //     //   if (!res.ok) {
  //     //     const err = await res.json().catch(() => ({}));
  //     //     throw new Error(err.detail || "S3 authentication failed.");
  //     //   }
      
  //       if (!authParams.ak || !authParams.sk) {
  //         throw new Error("Access key ID and Secret access key are required.");
  //       }
  //       const res = await fetch(`${API_BASE}/sources/s3/buckets`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           access_key: authParams.ak,
  //           secret_key: authParams.sk,
  //           region: authParams.region || "ap-south-1",
  //         }),
  //       });
  //       console.log("S3 auth response status:", res.status); // ← add
  //       if (!res.ok) {
  //         const err = await res.json().catch(() => ({}));
  //         console.log("S3 auth error:", err); // ← add
  //         throw new Error(err.detail || "S3 authentication failed.");
  //       }

  //     } else if (modalSrc?.id === "adls") {
  //       if (!authParams.connstr) {
  //         throw new Error("Connection string is required.");
  //       }
  //       const res = await fetch(`${API_BASE}/sources/adls/containers`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ connection_string: authParams.connstr }),
  //       });
  //       if (!res.ok) {
  //         const err = await res.json().catch(() => ({}));
  //         throw new Error(err.detail || "ADLS authentication failed.");
  //       }

  //     } else if (modalSrc?.id === "onelake") {
  //       if (!authParams.tid || !authParams.cid || !authParams.csec) {
  //         throw new Error("Tenant ID, Client ID and Client Secret are required.");
  //       }
  //       const res = await fetch(`${API_BASE}/sources/onelake/workspaces`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           tenant_id: authParams.tid,
  //           client_id: authParams.cid,
  //           client_secret: authParams.csec,
  //           workspace_id: "00000000-0000-0000-0000-000000000000",
  //         }),
  //       });
  //       if (!res.ok) {
  //         const err = await res.json().catch(() => ({}));
  //         throw new Error(err.detail || "OneLake authentication failed.");
  //       }

  //     } else {
  //       // stub sources — just simulate
  //       await new Promise((r) => setTimeout(r, 1200));
  //     }

  //     setAuthed(true);
  //     if (modalSrc?.id !== "local") {
  //       setTimeout(() => setModalStep(2), 300);
  //     } else {
  //       setModalStep(2);
  //     }
  //   } catch (e: any) {
  //     setAuthError(e.message || "Authentication failed");
  //   } finally {
  //     setAuthing(false);
  //   }
  // };

  const handleAuth = async () => {
    setAuthing(true);
    setAuthError(null);
    try {
      if (modalSrc?.id === "s3") {
        if (!authParams.ak || !authParams.sk) {
          throw new Error("Please enter both Access Key ID and Secret Access Key.");
        }
        const res = await fetch(`${API_BASE}/sources/s3/buckets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: authParams.ak,
            secret_key: authParams.sk,
            region: authParams.region || "ap-south-1",
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const detail = err.detail || "";
          // ← friendly messages based on AWS error type
          if (detail.includes("InvalidAccessKeyId"))
            throw new Error("Invalid Access Key ID. Please check and try again.");
          if (detail.includes("SignatureDoesNotMatch"))
            throw new Error("Invalid Secret Access Key. Please check and try again.");
          if (detail.includes("AccessDenied"))
            throw new Error("Access denied. This key doesn't have permission to list buckets.");
          if (detail.includes("NoSuchBucket"))
            throw new Error("Bucket not found. Check your region and bucket name.");
          throw new Error("S3 authentication failed. Please check your credentials.");
        }

      } else if (modalSrc?.id === "adls") {
        if (!authParams.connstr) {
          throw new Error("Please enter the Connection String.");
        }
        const res = await fetch(`${API_BASE}/sources/adls/containers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connection_string: authParams.connstr }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const detail = err.detail || "";
          if (detail.includes("AuthenticationFailed"))
            throw new Error("Authentication failed. Please check your connection string.");
          if (detail.includes("AccountNameInvalid") || detail.includes("InvalidUri"))
            throw new Error("Invalid connection string format. Please check and try again.");
          throw new Error("ADLS authentication failed. Please check your connection string.");
        }

      // } else if (modalSrc?.id === "onelake") {
      //   if (!authParams.tid || !authParams.cid || !authParams.csec) {
      //     throw new Error("Please enter Tenant ID, Client ID and Client Secret.");
      //   }
      //   const res = await fetch(`${API_BASE}/sources/onelake/workspaces`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       tenant_id: authParams.tid,
      //       client_id: authParams.cid,
      //       client_secret: authParams.csec,
      //       workspace_id: "00000000-0000-0000-0000-000000000000",
      //     }),
      //   });
      //   if (!res.ok) {
      //     const err = await res.json().catch(() => ({}));
      //     const detail = err.detail || "";
      //     if (detail.includes("401") || detail.includes("Unauthorized"))
      //       throw new Error("Invalid credentials. Please check Tenant ID, Client ID and Secret.");
      //     if (detail.includes("403") || detail.includes("Forbidden"))
      //       throw new Error("Access denied. This service principal doesn't have workspace access.");
      //     throw new Error("OneLake authentication failed. Please check your credentials.");
      //   }
      } else if (modalSrc?.id === "onelake") {
        if (!authParams.tid || !authParams.cid || !authParams.csec) {
          throw new Error("Please enter Tenant ID, Client ID and Client Secret.");
        }
        
        let res: Response;
        try {
          res = await fetch(`${API_BASE}/sources/onelake/workspaces`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenant_id: authParams.tid,
              client_id: authParams.cid,
              client_secret: authParams.csec,
              workspace_id: "00000000-0000-0000-0000-000000000000",
            }),
          });
        } catch (networkErr) {
          // fetch itself failed — backend down or CORS
          throw new Error("Unable to reach the server. Please check your network or try again.");
        }

        if (!res.ok) {
          let detail = "";
          try {
            const err = await res.json();
            detail = err.detail || "";
          } catch {
            detail = await res.text().catch(() => "");
          }
          if (detail.includes("401") || detail.includes("Unauthorized") || detail.includes("invalid_client"))
            throw new Error("Invalid credentials. Please check your Tenant ID, Client ID and Client Secret.");
          if (detail.includes("403") || detail.includes("Forbidden"))
            throw new Error("Access denied. This service principal doesn't have workspace access.");
          if (detail.includes("AADSTS"))
            throw new Error("Azure AD authentication failed. Please verify your credentials.");
          throw new Error("OneLake authentication failed. Please check your credentials.");
        }
      }

      // } else {
      //   await new Promise((r) => setTimeout(r, 1200));
      // }

      setAuthed(true);
      if (modalSrc?.id !== "local") {
        setTimeout(() => setModalStep(2), 300);
      } else {
        setModalStep(2);
      }
    } catch (e: any) {
      setAuthError(e.message || "Authentication failed.");
    } finally {
      setAuthing(false);
    }
  };


  const handleSelectionChange = useCallback((items: SelectedItem[]) => {
    setSelected(items);
    setConnected(false);
    setConnectError(null);
  }, []);

  const localSelection: SelectedItem[] = [
    ...(buyerFile ? [{ id: "buyer/" + buyerFile.name, label: "buyer: " + buyerFile.name }] : []),
    ...(sellerFile ? [{ id: "seller/" + sellerFile.name, label: "seller: " + sellerFile.name }] : []),
  ];
  const effectiveSelection = modalSrc?.id === "local" ? localSelection : selected;
  const canConnect = effectiveSelection.length > 0 && !connecting;

  const handleConnect = async () => {
    if (!canConnect || !modalSrc) return;
    if (modalSrc.stubOnly) {
      // Stub sources: just simulate success, no real API call
      setConnecting(true);
      await new Promise((r) => setTimeout(r, 900));
      setConnecting(false);
      setConnected(true);
      return;
    }

    setConnecting(true);
    setConnectError(null);
    try {
      let data: any;

      if (modalSrc.id === "local") {
        if (!buyerFile || !sellerFile) throw new Error("Please select both buyer and seller files.");
        const fd = new FormData();
        fd.append("buyer_file", buyerFile);
        fd.append("seller_file", sellerFile);
        const res = await fetch(`${API_BASE}/dashboard/data/local`, { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json()).detail || "Upload failed");
        // data = await res.json();
        // setData(data);
        // setActiveSource("local");
        data = await res.json();
        setActiveCredentials(null); // ← local has no credentials for forecast
        setData(data);
        setActiveSource("local");

      } else if (modalSrc.id === "s3") {
        const [buyerItem, sellerItem] = effectiveSelection;
        if (!buyerItem) throw new Error("Select at least one file as the buyer dataset.");
        const [bBucket, ...bRest] = buyerItem.id.split("/");
        const bKey = bRest.join("/");
        const sBucket = sellerItem ? sellerItem.id.split("/")[0] : bBucket;
        const sKey = sellerItem ? sellerItem.id.split("/").slice(1).join("/") : bKey;
        const fd = new FormData();
        fd.append("buyer_bucket", bBucket); fd.append("buyer_key", bKey);
        fd.append("buyer_region", authParams.region || "ap-south-1");
        fd.append("buyer_access_key", authParams.ak || "");
        fd.append("buyer_secret_key", authParams.sk || "");
        fd.append("seller_bucket", sBucket); fd.append("seller_key", sKey);
        fd.append("seller_region", authParams.region || "ap-south-1");
        fd.append("seller_access_key", authParams.ak || "");
        fd.append("seller_secret_key", authParams.sk || "");
        const res = await fetch(`${API_BASE}/dashboard/data/s3`, { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json()).detail || "S3 fetch failed");
        // data = await res.json();
        // setData(data); setActiveSource("s3");
        data = await res.json();
        setActiveCredentials({
          data_source: "s3",
          credentials: {
            accessKeyId: authParams.ak || "",
            secretAccessKey: authParams.sk || "",
            region: authParams.region || "ap-south-1",
            bucket: bBucket,
            buyers_key: bKey,
            sellers_key: sKey,
          },
        });
        setData(data);
        setActiveSource("s3");

      } else if (modalSrc.id === "adls") {
        const [buyerItem, sellerItem] = effectiveSelection;
        if (!buyerItem) throw new Error("Select at least one file as the buyer dataset.");
        const parts = (item: SelectedItem) => {
          const segs = item.id.split("/");
          return { account: segs[0], container: segs[1], path: segs.slice(2).join("/") };
        };
        const bp = parts(buyerItem);
        const sp = sellerItem ? parts(sellerItem) : bp;
        const fd = new FormData();
        fd.append("buyer_account_name", bp.account); 
        fd.append("buyer_filesystem", bp.container);
        fd.append("buyer_path", bp.path); 
        fd.append("buyer_connection_string", authParams.connstr || "");
        fd.append("seller_account_name", sp.account); 
        fd.append("seller_filesystem", sp.container);
        fd.append("seller_path", sp.path); 
        fd.append("seller_connection_string", authParams.connstr || "");
        const res = await fetch(`${API_BASE}/dashboard/data/adls`, { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json()).detail || "ADLS fetch failed");
        // data = await res.json();
        // setData(data); setActiveSource("adls");
        data = await res.json();
        setActiveCredentials({
          data_source: "adls",
          credentials: {
            connection_string: authParams.connstr || "",
            container: bp.container,
            folder: bp.path.split("/")[0],
            buyers_file: bp.path.split("/").pop(),
            sellers_file: sp.path.split("/").pop(),
          },
        });
        setData(data);
        setActiveSource("adls");

      } else if (modalSrc.id === "onelake") {
        const buyerItem = effectiveSelection.find((s) => s.role === "buyer") ?? effectiveSelection[0];
        const sellerItem = effectiveSelection.find((s) => s.role === "seller") ?? effectiveSelection[1] ?? buyerItem;
        // id format: "workspaceId/lakehouseId/tableName"
        const [workspaceId, lakehouseId, buyerTable] = buyerItem.id.split("/");
        const sellerTable = sellerItem.id.split("/")[2] ?? buyerTable;
        const params = new URLSearchParams({
          buyer_table: buyerTable,
          seller_table: sellerTable,
          tenant_id: authParams.tid || "",
          client_id: authParams.cid || "",
          client_secret: authParams.csec || "",
          workspace_id: workspaceId || "",
          lakehouse_id: lakehouseId || "",
        });
        const res = await fetch(`${API_BASE}/dashboard/data/onelake/custom?${params}`);
        if (!res.ok) throw new Error((await res.json()).detail || "OneLake fetch failed");
        // data = await res.json();
        // setData(data); setActiveSource("onelake_custom");

        data = await res.json();
        setActiveCredentials({
          data_source: "onelake",
          credentials: {
            tenant_id: authParams.tid || "",
            client_id: authParams.cid || "",
            client_secret: authParams.csec || "",
            workspace_name: "demand_forecasting",
            lakehouse_name: "uploaded_files.lakehouse",
            datasets: {
              buyers: { path: "Files/uploads/buyer/" },
              sellers: { path: "Files/uploads/seller/" },
            },
          },
        });
        setData(data);
        setActiveSource("onelake_custom");
      }

      setConnected(true);
    } catch (e: any) {
      setConnectError(e.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  // ── Auth fields renderer ──
  const renderAuthFields = (srcId: SourceId) => {
    const rows = AUTH_FIELDS[srcId] ?? [];
    if (rows.length === 0) return null;
    return (
      <div className="space-y-3">
        {rows.map((row, ri) => (
          <div key={ri} className={`grid gap-3`} style={{ gridTemplateColumns: row.length === 1 ? "1fr" : "1fr 1fr" }}>
            {row.map((f) => (
              <div key={f.key} style={{ gridColumn: f.colSpan === 2 ? "1 / -1" : undefined }}>
                <Field
                  label={f.label}
                  value={authParams[f.key] ?? ""}
                  onChange={(v) => handleAuthParamChange(f.key, v)}
                  placeholder={f.placeholder}
                  type={f.type}
                  hint={f.hint}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // ── Modal content: step 1 (auth) ──
  const renderAuthStep = () => {
    const srcId = modalSrc!.id;

    if (srcId === "local") {
      // Local has no auth — go straight to step 2 on next render
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Upload CSV files directly from your machine.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Buyer file (CSV)</label>
              <input type="file" accept=".csv,.txt"
                onChange={(e) => setBuyerFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm border border-border rounded-md p-1.5 bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Seller file (CSV)</label>
              <input type="file" accept=".csv,.txt"
                onChange={(e) => setSellerFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm border border-border rounded-md p-1.5 bg-background text-foreground" />
            </div>
          </div>
          {/* Loading state */}
          {connecting && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Loader2 size={18} className="animate-spin text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Uploading files…</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-500 mt-0.5">Parsing and loading your data, please wait.</p>
              </div>
            </div>
          )}

          {/* Success state */}
          {connected && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Data source connected successfully</p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">
                  Both buyer and seller files have been loaded and are ready to use.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            {connectError && <span className="text-xs text-destructive flex-1">{connectError}</span>}
            {!connected && (
              <button
                onClick={handleConnect}
                disabled={!canConnect || connecting}
                className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {connecting ? <><Loader2 size={13} className="animate-spin" /> Connecting…</> : "Connect"}
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {modalSrc?.stubOnly && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
            <span className="font-medium">Preview</span> — fill in credentials below; connection will be enabled in an upcoming release.
          </div>
        )}
        {renderAuthFields(srcId)}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleAuth}
            disabled={authing}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {authing ? <><Loader2 size={13} className="animate-spin" /> Authenticating…</> : authed ? "Re-authenticate" : "Authenticate"}
          </button>
          {authError && <span className="text-xs text-destructive">{authError}</span>}
          {authed && <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium"><CheckCircle2 size={13} /> Connected</span>}
        </div>
      </div>
    );
  };

  // ── Modal content: step 2 (browse + connect) ──
  const renderBrowseStep = () => {
    const srcId = modalSrc!.id;

    // const browserPane = (
    //   <div className="border border-border rounded-lg overflow-hidden">
    //     <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
    //       <span className="text-sm font-medium">Browse</span>
    //       <span className="text-xs text-muted-foreground">
    //         {srcId === "onelake" ? "Select a table" : "Select one or more files — first = buyer, second = seller"}
    //       </span>
    //     </div>
    //     <div className="p-3">
    //       <DataSourceBrowser
    //         sourceId={srcId as "s3" | "adls" | "onelake"}
    //         authParams={authParams}
    //         onSelectionChange={handleSelectionChange}
    //       />
    //     </div>
    //   </div>
    // );
    const browserPane = (
      <DataSourceBrowser
        sourceId={srcId as "s3" | "adls" | "onelake"}
        authParams={authParams}
        onSelectionChange={handleSelectionChange}
      />
    );

    return (
      <div className="space-y-4">
        {/* Back to auth */}
        <button
          onClick={() => { setModalStep(1); setAuthed(false); setSelected([]); setConnected(false); setConnectError(null); }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={12} /> Back to authentication
        </button>

        {browserPane}

        {/* Selection summary */}
        {effectiveSelection.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border rounded-lg flex-wrap">
            <span className="text-xs font-medium text-muted-foreground flex-shrink-0">Selected:</span>
            <div className="flex gap-2 flex-wrap flex-1">
              {effectiveSelection.map((item) => (
                <span key={item.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background text-xs text-foreground">
                  {item.label}
                  <button
                    onClick={() => handleSelectionChange(effectiveSelection.filter((s) => s.id !== item.id))}
                    className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {connecting && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Loader2 size={18} className="animate-spin text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Connecting to {modalSrc?.name}…</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-500 mt-0.5">
                Fetching and loading{" "}
                {effectiveSelection.length} {srcId === "onelake" ? "table" : "file"}
                {effectiveSelection.length !== 1 ? "s" : ""}, please wait.
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {connected && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Data source connected successfully</p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-0.5">
                {effectiveSelection.length} {srcId === "onelake" ? "table" : "file"}
                {effectiveSelection.length !== 1 ? "s" : ""} loaded from {modalSrc?.name} and ready to use.
              </p>
            </div>
          </div>
        )}

        {/* Connect button — hidden once connected */}
        {!connected && (
          <div className="flex items-center justify-end gap-3">
            {connectError && <span className="text-xs text-destructive flex-1">{connectError}</span>}
            <button
              onClick={handleConnect}
              disabled={!canConnect || connecting}
              className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {connecting ? <><Loader2 size={13} className="animate-spin" /> Connecting…</> : "Connect"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Decide modal size: step 2 with a browser needs more width
  const isWide = modalStep === 2 && modalSrc?.id !== "local";

  return (
    <div className="p-2 w-full max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Data Sources</h1>
        <p className="text-muted-foreground text-sm">
          Connect to your sources and select the files or tables you want to process.
        </p>
      </div>

      {/* Source grid */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Select a source
        </p>
        <div className="grid grid-cols-4 gap-3">
          {SOURCES.map((src) => (
            <button
              key={src.id}
              onClick={() => openModal(src)}
              className="relative flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all
                border-border bg-background hover:border-blue-400/60 hover:bg-muted/40 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-muted/40">
                {src.icon}
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground leading-tight">{src.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{src.type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalSrc && (
        <Modal
          open
          onClose={closeModal}
          title={`Connect to ${modalSrc.name}`}
          subtitle={modalSrc.type}
          icon={modalSrc.icon}
          wide={isWide}
        >
          {/* Step pills — only for sources with a 2-step flow */}
          {modalSrc.id !== "local" && <StepPills step={modalStep} />}

          {modalStep === 1 || modalSrc.id === "local"
            ? renderAuthStep()
            : renderBrowseStep()}
        </Modal>
      )}
    </div>
  );
};

export default DataSources;
