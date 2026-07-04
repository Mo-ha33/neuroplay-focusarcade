// @ts-nocheck
/**
 * NeuroPlay AI FocusArcade — Teacher Curriculum Upload Zone
 * ==========================================================
 * ADHD-friendly drag-and-drop component for curriculum PDF ingestion.
 * Features: Neon glow on drag, animated processing state, success toast.
 * Design: Deep Slate Navy bg, Electric Cyan dashed border, soft rounded corners.
 */

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ProcessingState = "idle" | "uploading" | "processing" | "success" | "error";

const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export function TeacherUploadZone() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [questCount, setQuestCount] = useState(0);

  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: (data) => {
      setState("success");
      const result = data.processingResult as { questCount?: number } | null;
      setQuestCount(result?.questCount ?? 0);
      toast.success(
        `✨ ${data.fileName} parsed! ${result?.questCount ?? 0} ADHD micro-quests generated.`,
        { duration: 5000 }
      );
    },
    onError: (err) => {
      setState("error");
      toast.error(`Upload failed: ${err.message}`);
    },
  });

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        toast.error("Invalid file type. Please upload PDF, TXT, or DOCX files.");
        return;
      }
      if (accepted.length === 0) return;

      const file = accepted[0];
      setUploadedFile(file.name);
      setState("uploading");

      // Read file as base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1] || "";
        setState("processing");

        uploadMutation.mutate({
          fileName: file.name,
          fileContent: base64,
          fileType: "curriculum_pdf",
          mimeType: file.type || "application/pdf",
          fileSizeBytes: file.size,
          userId: 0, // Demo mode
        });
      };
      reader.readAsDataURL(file);
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: state === "uploading" || state === "processing",
  });

  const reset = () => {
    setState("idle");
    setUploadedFile(null);
    setQuestCount(0);
  };

  // Dynamic styling based on state
  const getBorderColor = () => {
    if (isDragReject) return "#FF6B6B";
    if (isDragActive) return "#AEEA00";
    if (state === "success") return "#AEEA00";
    if (state === "error") return "#FF6B6B";
    return "#00E5FF";
  };

  const getGlow = () => {
    if (isDragActive) return "0 0 30px rgba(174,234,0,0.4), inset 0 0 20px rgba(174,234,0,0.1)";
    if (state === "success") return "0 0 25px rgba(174,234,0,0.3)";
    return "0 0 15px rgba(0,229,255,0.15)";
  };

  return (
    <div
      style={{
        background: "#1E293B",
        border: "1px solid rgba(0,229,255,0.15)",
        borderRadius: 24,
        padding: "20px",
        marginBottom: 24,
      }}
    >
      <h3
        style={{
          color: "#00E5FF",
          fontSize: 14,
          fontWeight: 700,
          margin: "0 0 14px",
          fontFamily: "'Comfortaa', sans-serif",
        }}
      >
        📚 AI Curriculum Ingestion Engine
      </h3>

      <div
        {...getRootProps()}
        style={{
          background: isDragActive
            ? "rgba(174,234,0,0.06)"
            : "rgba(15,23,42,0.6)",
          border: `2px dashed ${getBorderColor()}`,
          borderRadius: 20,
          padding: "28px 20px",
          textAlign: "center",
          cursor: state === "uploading" || state === "processing" ? "wait" : "pointer",
          transition: "all 0.3s ease",
          boxShadow: getGlow(),
          minHeight: 140,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <input {...getInputProps()} />

        {state === "idle" && !isDragActive && (
          <>
            <span style={{ fontSize: 36, display: "block" }}>📄</span>
            <p
              style={{
                color: "#E2E8F0",
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              Drop Curriculum PDF Here
            </p>
            <p
              style={{
                color: "#64748B",
                fontSize: 12,
                margin: 0,
              }}
            >
              to Generate AI Focus Quests
            </p>
            <p
              style={{
                color: "#475569",
                fontSize: 11,
                margin: "4px 0 0",
              }}
            >
              PDF, TXT, DOCX — up to 20MB
            </p>
          </>
        )}

        {isDragActive && !isDragReject && (
          <>
            <span
              style={{
                fontSize: 42,
                display: "block",
                animation: "bounce 0.6s infinite alternate",
              }}
            >
              🌌
            </span>
            <p
              style={{
                color: "#AEEA00",
                fontSize: 16,
                fontWeight: 800,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              Drop it into orbit!
            </p>
          </>
        )}

        {isDragReject && (
          <>
            <span style={{ fontSize: 36 }}>🚫</span>
            <p style={{ color: "#FF6B6B", fontSize: 14, fontWeight: 600, margin: 0 }}>
              Invalid file type
            </p>
          </>
        )}

        {(state === "uploading" || state === "processing") && (
          <>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(0,229,255,0.2)",
                borderTop: "3px solid #00E5FF",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p
              style={{
                color: "#00E5FF",
                fontSize: 13,
                fontWeight: 600,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              {state === "uploading"
                ? "Uploading curriculum..."
                : "Brain-parsing curriculum... Extracting key ADHD micro-tasks..."}
            </p>
            <p style={{ color: "#64748B", fontSize: 11, margin: 0 }}>
              {uploadedFile}
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <span style={{ fontSize: 36 }}>✅</span>
            <p
              style={{
                color: "#AEEA00",
                fontSize: 14,
                fontWeight: 700,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              {questCount} Focus Quests Generated!
            </p>
            <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>
              {uploadedFile}
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info("Assigning quests to students...");
                }}
                style={{
                  background: "linear-gradient(135deg, #7C4DFF, #00E5FF)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontFamily: "'Comfortaa', sans-serif",
                }}
              >
                Assign to Students
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  color: "#94A3B8",
                  fontSize: 12,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Upload Another
              </button>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <span style={{ fontSize: 36 }}>❌</span>
            <p style={{ color: "#FF6B6B", fontSize: 14, fontWeight: 600, margin: 0 }}>
              Processing failed
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,107,107,0.3)",
                borderRadius: 12,
                color: "#FF6B6B",
                fontSize: 12,
                padding: "6px 14px",
                cursor: "pointer",
                marginTop: 4,
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
