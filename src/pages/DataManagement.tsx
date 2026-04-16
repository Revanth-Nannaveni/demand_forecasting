import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadStatus = "idle" | "uploading" | "success" | "error";

const UploadBox = ({ label, onUpload }: { label: string; onUpload: () => void }) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("uploading");
    setTimeout(() => {
      if (file.name.endsWith(".csv") || file.name.endsWith(".json")) {
        setStatus("success");
        onUpload();
      } else {
        setStatus("error");
      }
    }, 1200);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2"><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
      <CardContent>
        <label className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors",
          status === "success" ? "border-surplus bg-surplus/5" : status === "error" ? "border-shortage bg-shortage/5" : "border-border hover:border-primary/40 hover:bg-secondary/50"
        )}>
          <input type="file" accept=".csv,.json" className="hidden" onChange={handleFile} />
          {status === "idle" && (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drop CSV / JSON here or click to browse</p>
            </>
          )}
          {status === "uploading" && (
            <>
              <FileText className="w-8 h-8 text-primary mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Uploading {fileName}...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="w-8 h-8 text-surplus mb-2" />
              <p className="text-sm text-surplus font-medium">{fileName} uploaded successfully</p>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="w-8 h-8 text-shortage mb-2" />
              <p className="text-sm text-shortage font-medium">Invalid file format. Use CSV or JSON.</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={(e) => { e.preventDefault(); setStatus("idle"); }}>
                Try Again
              </Button>
            </>
          )}
        </label>
      </CardContent>
    </Card>
  );
};

const DataManagement = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display">Data Management</h1>
        <p className="text-muted-foreground text-sm">Upload buyer and seller data</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadBox label="Upload Seller Data" onUpload={() => {}} />
        <UploadBox label="Upload Buyer Data" onUpload={() => {}} />
      </div>
    </div>
  );
};

export default DataManagement;
