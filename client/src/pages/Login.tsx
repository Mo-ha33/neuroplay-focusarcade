/**
 * NeuroPlay AI FocusArcade — Unified Login Page
 * ===============================================
 * A single login view with 4 role-selector cards.
 * Each role has a distinct visual identity and Space Passcode.
 * Demo passcodes are shown on-screen for hackathon judges.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useRbac } from "@/contexts/RbacContext";
import type { RbacRole } from "../../../server/routers/rbacRouter";

const ROLE_CONFIG: Record<RbacRole, {
  emoji: string;
  label: string;
  tagline: string;
  color: string;
  bg: string;
  border: string;
  demoPasscode: string;
  description: string;
}> = {
  student: {
    emoji: "🧑‍🚀",
    label: "Student",
    tagline: "Space Explorer",
    color: "#00E5FF",
    bg: "rgba(0,229,255,0.08)",
    border: "rgba(0,229,255,0.4)",
    demoPasscode: "1234",
    description: "Jump into your Space Lab mission!",
  },
  teacher: {
    emoji: "👩‍🏫",
    label: "Teacher",
    tagline: "Classroom Commander",
    color: "#7C4DFF",
    bg: "rgba(124,77,255,0.08)",
    border: "rgba(124,77,255,0.4)",
    demoPasscode: "5678",
    description: "View your class progress & missions.",
  },
  parent: {
    emoji: "👨‍👩‍👦",
    label: "Parent",
    tagline: "Focus Guardian",
    color: "#AEEA00",
    bg: "rgba(174,234,0,0.08)",
    border: "rgba(174,234,0,0.4)",
    demoPasscode: "9012",
    description: "Track your child's focus journey.",
  },
  admin: {
    emoji: "🛡️",
    label: "Admin",
    tagline: "Galactic Overseer",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.08)",
    border: "rgba(255,107,107,0.4)",
    demoPasscode: "0000",
    description: "System-wide analytics & management.",
  },
};

const ROLES: RbacRole[] = ["student", "teacher", "parent", "admin"];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<RbacRole>("student");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useRbac();
  const [, navigate] = useLocation();
  const demoLogin = trpc.rbac.demoLogin.useMutation();

  const cfg = ROLE_CONFIG[selectedRole];

  const handleRoleSelect = (role: RbacRole) => {
    setSelectedRole(role);
    setPasscode("");
    setError("");
  };

  const handlePasscodeInput = (digit: string) => {
    if (passcode.length < 4) {
      const next = passcode + digit;
      setPasscode(next);
      setError("");
      if (next.length === 4) {
        handleLogin(next);
      }
    }
  };

  const handleLogin = async (code: string) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await demoLogin.mutateAsync({ role: selectedRole, spacePasscode: code });
      if (result.success && result.user) {
        login(selectedRole, result.user as Parameters<typeof login>[1]);
        const destinations: Record<RbacRole, string> = {
          student: "/student",
          teacher: "/teacher",
          parent: "/parent",
          admin: "/admin",
        };
        navigate(destinations[selectedRole]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Try again!");
      setPasscode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackspace = () => {
    setPasscode(prev => prev.slice(0, -1));
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'Comfortaa', 'Poppins', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🚀</div>
        <h1 style={{ color: "#00E5FF", fontSize: 28, fontWeight: 700, margin: 0 }}>
          NeuroPlay AI
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 14, margin: "4px 0 0" }}>
          FocusArcade — Solar System Lab
        </p>
      </div>

      {/* Role Selector */}
      <div style={{ marginBottom: 24, width: "100%", maxWidth: 480 }}>
        <p style={{ color: "#94A3B8", textAlign: "center", fontSize: 13, marginBottom: 12 }}>
          Who are you today?
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ROLES.map(role => {
            const c = ROLE_CONFIG[role];
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                style={{
                  background: isSelected ? c.bg : "rgba(255,255,255,0.03)",
                  border: `2px solid ${isSelected ? c.color : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 16,
                  padding: "14px 12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                  boxShadow: isSelected ? `0 0 20px ${c.color}33` : "none",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>{c.emoji}</div>
                <div style={{ color: isSelected ? c.color : "#CBD5E1", fontWeight: 600, fontSize: 14 }}>
                  {c.label}
                </div>
                <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>
                  {c.tagline}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Login Card */}
      <div
        style={{
          background: "#1E293B",
          border: `2px solid ${cfg.border}`,
          borderRadius: 24,
          padding: "28px 24px",
          width: "100%",
          maxWidth: 380,
          boxShadow: `0 0 40px ${cfg.color}22`,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>{cfg.emoji}</div>
          <h2 style={{ color: cfg.color, fontSize: 18, fontWeight: 700, margin: "8px 0 4px" }}>
            {cfg.label} Portal
          </h2>
          <p style={{ color: "#94A3B8", fontSize: 13, margin: 0 }}>{cfg.description}</p>
        </div>

        {/* Passcode dots */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <p style={{ color: "#64748B", fontSize: 12, marginBottom: 10 }}>
            Enter your Space Passcode 🔑
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 8 }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: i < passcode.length ? cfg.color : "rgba(255,255,255,0.1)",
                  border: `2px solid ${i < passcode.length ? cfg.color : "rgba(255,255,255,0.2)"}`,
                  transition: "all 0.15s ease",
                  boxShadow: i < passcode.length ? `0 0 8px ${cfg.color}` : "none",
                }}
              />
            ))}
          </div>
          {error && (
            <p style={{ color: "#FF6B6B", fontSize: 12, marginTop: 6 }}>{error}</p>
          )}
        </div>

        {/* Number pad */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {["1","2","3","4","5","6","7","8","9","←","0","✓"].map(key => (
            <button
              key={key}
              onClick={() => {
                if (key === "←") handleBackspace();
                else if (key === "✓") handleLogin(passcode);
                else handlePasscodeInput(key);
              }}
              disabled={isLoading}
              style={{
                background: key === "✓"
                  ? cfg.color
                  : key === "←"
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.07)",
                color: key === "✓" ? "#0F172A" : "#E2E8F0",
                border: "none",
                borderRadius: 12,
                padding: "14px 0",
                fontSize: key === "✓" || key === "←" ? 18 : 20,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
                fontFamily: "'Comfortaa', sans-serif",
              }}
            >
              {isLoading && key === "✓" ? "..." : key}
            </button>
          ))}
        </div>

        {/* Demo hint */}
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          <p style={{ color: "#64748B", fontSize: 11, margin: 0 }}>
            🎯 Demo passcode for <span style={{ color: cfg.color }}>{cfg.label}</span>:{" "}
            <span style={{ color: "#E2E8F0", fontWeight: 700, letterSpacing: 3 }}>
              {cfg.demoPasscode}
            </span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p style={{ color: "#334155", fontSize: 11, marginTop: 24, textAlign: "center" }}>
        NeuroPlay AI FocusArcade · ADHD-Friendly Learning · Solar System Lab MVP
      </p>
    </div>
  );
}
