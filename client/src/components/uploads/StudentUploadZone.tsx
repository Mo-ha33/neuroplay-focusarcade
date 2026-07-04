// @ts-nocheck
/**
 * NeuroPlay AI FocusArcade — Student Space Scanner Station
 * =========================================================
 * Gamified homework/activity upload for students.
 * Triggers instant dopamine hit (+50 Space XP!) with confetti on file drop.
 * 
 * Design: Fun space-themed scanner aesthetic, lime green rewards,
 * large touch targets, minimal text for ADHD-friendly interaction.
 */

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { fireConfetti, fireMegaConfetti } from "@/lib/confetti";

type ScanState = "idle" | "scanning" | "success" | "error";

const ACCEPTED_TYPES: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "application/pdf": [".pdf"],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export function StudentUploadZone() {
  const [state, setState] = useState<ScanState>("idle");
  const [xpEarned, setXpEarned] = useState(0);

  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: (data) => {
      setState("success");
      const result = data.processingResult as { xpAwarded?: number } | null;
      const xp = result?.xpAwarded ?? 50;
      setXpEarned(xp);

      // DOPAMINE HIT! 🎉
      fireMegaConfetti();
      setTimeout(() => fireConfetti(), 300);

      toast.success(`🚀 +${xp} Space XP! Homework scanned!`, {
        duration: 4000,
        style: {
          background: "#1E293B",
          border: "1px solid #AEEA00",
          color: "#AEEA00",
        },
      });
    },
    onError: (err) => {
      setState("error");
      toast.error(`Scan failed: ${err.message}`);
    },
  });

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        toast.error("Oops! Try a photo or PDF file.");
        return;
      }
      if (accepted.length === 0) return;

      const file = accepted[0];
      setState("scanning");

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1] || "";

        uploadMutation.mutate({
          fileName: file.name,
          fileContent: base64,
          fileType: "student_homework",
          mimeType: file.type || "image/png",
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
    disabled: state === "scanning",
  });

  const reset = () => {
    setState("idle");
    setXpEarned(0);
  };

  const getBorderColor = () => {
    if (isDragReject) return "#FF6B6B";
    if (isDragActive) return "#AEEA00";
    if (state === "success") return "#AEEA00";
    return "#00E5FF";
  };

  const getGlow = () => {
    if (isDragActive)
      return "0 0 40px rgba(174,234,0,0.5), inset 0 0 25px rgba(174,234,0,0.15)";
    if (state === "success")
      return "0 0 35px rgba(174,234,0,0.4), 0 0 60px rgba(174,234,0,0.2)";
    return "0 0 20px rgba(0,229,255,0.2)";
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(0,229,255,0.06), rgba(124,77,255,0.06))",
        border: "1px solid rgba(0,229,255,0.2)",
        borderRadius: 24,
        padding: "20px",
        marginBottom: 20,
      }}
    >
      <h3
        style={{
          color: "#00E5FF",
          fontSize: 15,
          fontWeight: 700,
          margin: "0 0 4px",
          fontFamily: "'Comfortaa', sans-serif",
          textAlign: "center",
        }}
      >
        🛸 Space Scanner Station
      </h3>
      <p
        style={{
          color: "#64748B",
          fontSize: 12,
          margin: "0 0 14px",
          textAlign: "center",
        }}
      >
        Drop your homework for instant XP!
      </p>

      <div
        {...getRootProps()}
        style={{
          background: isDragActive
            ? "rgba(174,234,0,0.08)"
            : "rgba(15,23,42,0.7)",
          border: `3px dashed ${getBorderColor()}`,
          borderRadius: 24,
          padding: "32px 20px",
          textAlign: "center",
          cursor: state === "scanning" ? "wait" : "pointer",
          transition: "all 0.3s ease",
          boxShadow: getGlow(),
          minHeight: 150,
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
            <span
              style={{
                fontSize: 48,
                display: "block",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              🛸
            </span>
            <p
              style={{
                color: "#E2E8F0",
                fontSize: 16,
                fontWeight: 700,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              Drop Homework Here!
            </p>
            <p style={{ color: "#00E5FF", fontSize: 13, margin: 0, fontWeight: 600 }}>
              +50 Space XP per scan! 🚀
            </p>
          </>
        )}

        {isDragActive && !isDragReject && (
          <>
            <span
              style={{
                fontSize: 56,
                display: "block",
                animation: "pulse 0.5s infinite alternate",
              }}
            >
              ⚡
            </span>
            <p
              style={{
                color: "#AEEA00",
                fontSize: 20,
                fontWeight: 800,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
                textShadow: "0 0 10px rgba(174,234,0,0.5)",
              }}
            >
              SCANNING...!
            </p>
          </>
        )}

        {isDragReject && (
          <>
            <span style={{ fontSize: 40 }}>🚫</span>
            <p style={{ color: "#FF6B6B", fontSize: 14, fontWeight: 700, margin: 0 }}>
              Try a photo or PDF!
            </p>
          </>
        )}

        {state === "scanning" && (
          <>
            <div
              style={{
                width: 50,
                height: 50,
                border: "4px solid rgba(0,229,255,0.2)",
                borderTop: "4px solid #00E5FF",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p
              style={{
                color: "#00E5FF",
                fontSize: 15,
                fontWeight: 700,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
                animation: "pulse 1s infinite",
              }}
            >
              Scanning homework...
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <span
              style={{
                fontSize: 48,
                display: "block",
                animation: "bounce 0.5s ease",
              }}
            >
              🎉
            </span>
            <p
              style={{
                color: "#AEEA00",
                fontSize: 24,
                fontWeight: 900,
                margin: 0,
                fontFamily: "'Comfortaa', sans-serif",
                textShadow: "0 0 15px rgba(174,234,0,0.6)",
              }}
            >
              +{xpEarned} Space XP!
            </p>
            <p
              style={{
                color: "#E2E8F0",
                fontSize: 13,
                margin: "4px 0 0",
                fontWeight: 600,
              }}
            >
              Homework scanned successfully! 🛸
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              style={{
                background: "linear-gradient(135deg, #AEEA00, #00E5FF)",
                border: "none",
                borderRadius: 100,
                color: "#0F172A",
                fontSize: 13,
                fontWeight: 800,
                padding: "10px 24px",
                cursor: "pointer",
                marginTop: 10,
                fontFamily: "'Comfortaa', sans-serif",
                boxShadow: "0 0 20px rgba(174,234,0,0.4)",
              }}
            >
              Scan Another! 🚀
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <span style={{ fontSize: 40 }}>😵</span>
            <p style={{ color: "#FF6B6B", fontSize: 14, fontWeight: 700, margin: 0 }}>
              Oops! Scanner glitched!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              style={{
                background: "transparent",
                border: "2px solid #FF6B6B",
                borderRadius: 100,
                color: "#FF6B6B",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 20px",
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Try Again!
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes bounce {
          0% { transform: scale(0.5); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
