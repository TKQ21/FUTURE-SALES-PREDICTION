import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Download } from "lucide-react";

const SAMPLE_CSV = `date,product_id,store_id,sales,price,promotion
2024-01-01,P001,S001,45,79.99,0
2024-01-01,P002,S001,23,129.99,1
2024-01-01,P003,S002,67,14.99,0
2024-01-02,P001,S001,52,79.99,0
2024-01-02,P004,S003,31,39.99,1`;

const REQUIRED_COLS = ["date", "product_id", "store_id", "sales", "price"];

export default function UploadData() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string[][]>([]);

  const processFile = useCallback((f: File) => {
    setFile(f);
    setStatus("validating");

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.trim().split("\n");
      if (lines.length < 2) {
        setStatus("error");
        setMessage("File must contain at least a header row and one data row.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const missing = REQUIRED_COLS.filter((c) => !headers.includes(c));

      if (missing.length > 0) {
        setStatus("error");
        setMessage(`Missing required columns: ${missing.join(", ")}`);
        return;
      }

      const rows = lines.slice(0, 6).map((l) => l.split(",").map((c) => c.trim()));
      setPreview(rows);
      setStatus("success");
      setMessage(`Successfully validated ${lines.length - 1} records with ${headers.length} columns.`);
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && f.name.endsWith(".csv")) processFile(f);
      else {
        setStatus("error");
        setMessage("Please upload a CSV file.");
      }
    },
    [processFile]
  );

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_sales_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Sales Data</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload a CSV file with historical sales data to train forecasting models
        </p>
      </div>

      {/* Required Columns */}
      <div className="glass-card rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-2">Required Columns</h2>
        <div className="flex flex-wrap gap-2">
          {REQUIRED_COLS.map((c) => (
            <span
              key={c}
              className="px-2.5 py-1 bg-accent text-accent-foreground rounded-md text-xs font-mono"
            >
              {c}
            </span>
          ))}
          <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-xs font-mono">
            promotion (optional)
          </span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`glass-card rounded-lg border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
          dragOver ? "border-primary bg-accent/50" : "border-border"
        }`}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".csv";
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) processFile(f);
          };
          input.click();
        }}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="font-medium">Drop CSV file here or click to browse</p>
        <p className="text-sm text-muted-foreground mt-1">Supports .csv files up to 50MB</p>
      </div>

      {/* Status */}
      {status !== "idle" && (
        <div
          className={`glass-card rounded-lg p-4 flex items-start gap-3 ${
            status === "error" ? "border-destructive/50" : status === "success" ? "border-primary/50" : ""
          }`}
        >
          {status === "validating" && <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          {status === "success" && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
          {status === "error" && <AlertCircle className="h-5 w-5 text-destructive shrink-0" />}
          <div>
            <p className="font-medium text-sm">
              {file?.name}
              {status === "validating" && " — Validating..."}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && status === "success" && (
        <div className="glass-card rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-3">Data Preview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {preview[0].map((h, i) => (
                    <th key={i} className="text-left py-2 px-3 stat-label">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(1).map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 px-3 font-mono text-xs">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Download Sample */}
      <button
        onClick={handleDownloadSample}
        className="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <Download className="h-4 w-4" />
        Download sample CSV dataset
      </button>
    </div>
  );
}
