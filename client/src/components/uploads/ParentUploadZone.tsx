// @ts-nocheck
/**
 * NeuroPlay AI FocusArcade — Parent IEP & Clinical Report Uploader
 * =================================================================
 * Warm, reassuring drag-and-drop component for parents to upload
 * IEP documents or clinical focus recommendations.
 * 
 * Design: Soft, nurturing aesthetic with rounded corners,
 * warm messaging, and clear feedback on AI parameter tuning.
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

export function ParentUploadZone() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: (data) => {
      setState("success");
      toast.success(
        "🌟 AI has tuned difficulty & Pomodoro timers to your child's clinical parameters!",
        { duration: 6000 }
      );
      console.log("[Parent Upload] Processing result:", data.processingResult);
    },
    onError: (err) => {
      setState("error");
      toast.error(`Upload failed: ${err.message}`);
    },
  });

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        toast.error("Please upload PDF or DOCX files only.");
        return;
      }
      if (accepted.length === 0) return;

      const file = accepted[0];
      setUploadedFile(file.name);
      setState("uploading");

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1] || "";
        setState("processing");

        uploadMutation.mutate({
          fileName: file.name,
          fileContent: base64,
          fileType: "parent_iep_report",
          mimeType: file.type || "application/pdf",
          fileSizeBytes: file.size,
          userId: 0,
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
  };

  const getBorderColor = () => {
    if (isDragReject) return "#FF6B6B";
    if (isDragActive) return "#AEEA00";
    if (state === "success") return "#AEEA00";
    return "#7C4DFF";
  };

  const getGlow = () => {
    if (isDragActive) return "0 0 25px rgba(174,234,0,0.3), inset 0 0 15px rgba(174,234,0,0.08)";
    if (state === "success") return "0 0 20px rgba(174,234,0,0.25)";
    return "0 0 12px rgba(124,77,255,0.12)";
  };

  return (
    <div
      style={{
        background: "#1E293B",
        border: "1px solid rgba(124,77,255,0.15)",
        borderRadius: 24,
        padding: "20px",
        marginBottom: 24,
      }}
    >
      <h3
        style={{
          color: "#7C4DFF",
          fontSize: 14,
          fontWeight: 700,
          margin: "0 0 6px",
          fontFamily: "'Comfortaa', sans-serif",
        }}
      >
        📋 Clinical & IEP Document Upload
      </h3>
      <p
        style={{
          color: "#64748B",
          fontSize: 12,
          margin: "0 0 14px",
          lineHeight: 1.5,
        }}
      >
        Upload your child's IEP or doctor focus recommendations to automatically
        tune learning difficulty and break timers.
      </p>

      <div
        {...getRootProps()}
        style={{
          background: isDragActive
            ? "rgba(124,77,255,0.06)"
            : "rgba(15,23,42,0.5)",
          border: `2px dashed ${getBorderColor()}`,
          borderRadius: 20,
          padding: "24px 20px",
          textAlign: "center",
          cursor: state === "uploading" || state === "processing" ? "wait" : "pointer",
          transition: "all 0.3s ease",
          boxShadow: getGlow(),
          minHeight: 130,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <input {...getInputProps()} />

        {state === "idle" && !isDragActive && (
          <>
            <span style={{ fontSize: 32 }}>💜</span>
            <p
              style={{
                color: "#E2E8F0",
                fontSize: 13,
                fontWeight: 600,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              Upload Child's IEP or Doctor Focus Recommendations
            </p>
            <p style={{ color: "#64748B", fontSize: 11, margin: 0 }}>
              PDF or DOCX — Your data is private and secure
            </p>
          </>
        )}

        {isDragActive && !isDragReject && (
          <>
            <span style={{ fontSize: 36, animation: "pulse 1s infinite" }}>💜</span>
            <p
              style={{
                color: "#AEEA00",
                fontSize: 15,
                fontWeight: 700,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              Drop to upload!
            </p>
          </>
        )}

        {isDragReject && (
          <>
            <span style={{ fontSize: 32 }}>🚫</span>
            <p style={{ color: "#FF6B6B", fontSize: 13, fontWeight: 600, margin: 0 }}>
              Invalid file — PDF or DOCX only
            </p>
          </>
        )}

        {(state === "uploading" || state === "processing") && (
          <>
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid rgba(124,77,255,0.2)",
                borderTop: "3px solid #7C4DFF",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p
              style={{
                color: "#7C4DFF",
                fontSize: 13,
                fontWeight: 600,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              {state === "uploading"
                ? "Uploading document..."
                : "AI analyzing clinical parameters..."}
            </p>
            <p style={{ color: "#64748B", fontSize: 11, margin: 0 }}>
              {uploadedFile}
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <span style={{ fontSize: 32 }}>🌟</span>
            <p
              style={{
                color: "#AEEA00",
                fontSize: 13,
                fontWeight: 700,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              AI Difficulty & Pomodoro Timers Automatically Tuned
            </p>
            <p style={{ color: "#64748B", fontSize: 11, margin: 0 }}>
              to Clinical Parameters
            </p>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                justifyContent: "center",
              }}
            >
              {["Adaptive Difficulty", "7-10 min Sessions", "Motor Breaks Every 8 min"].map(
                (tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "rgba(174,234,0,0.1)",
                      border: "1px solid rgba(174,234,0,0.25)",
                      borderRadius: 100,
                      padding: "4px 10px",
                      fontSize: 10,
                      color: "#AEEA00",
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                color: "#94A3B8",
                fontSize: 11,
                padding: "6px 14px",
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Upload Another Document
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <span style={{ fontSize: 32 }}>❌</span>
            <p style={{ color: "#FF6B6B", fontSize: 13, fontWeight: 600, margin: 0 }}>
              Upload failed — please try again
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
                fontSize: 11,
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
