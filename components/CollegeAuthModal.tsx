"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { isValidCollegeId, isValidPassword, sanitizeCollegeId, getCollegeEmail } from "@/lib/auth-validation";
import { X, ShieldCheck, Mail, KeyRound, AlertCircle, CheckCircle2, UserCheck } from "lucide-react";

interface CollegeAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register" | "password";
}

export const CollegeAuthModal: React.FC<CollegeAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
}) => {
  const { login, registerUser, verifyEmailOtp, changePassword, currentUser } = useApp();
  const [mode, setMode] = useState<"login" | "register" | "otp" | "password">(initialMode);

  // Form states
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [otpCode, setOtpCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await login(collegeId, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = sanitizeCollegeId(collegeId);
    if (!isValidCollegeId(cleanId)) {
      setErrorMessage("College ID must match pattern: 251FAXXXXX (e.g. 251FA0AI65)");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const passCheck = isValidPassword(password);
    if (!passCheck.valid) {
      setErrorMessage(passCheck.reason || "Invalid password");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(cleanId, displayName, password, department);
      if (res.success && res.verificationRequired) {
        setPendingEmail(res.email || getCollegeEmail(cleanId));
        setMode("otp");
      } else if (!res.success) {
        setErrorMessage(res.error || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await verifyEmailOtp(collegeId, otpCode);
      if (res.success) {
        setSuccessMessage("Email verified! Account created and signed in.");
        setTimeout(() => onClose(), 1200);
      } else {
        setErrorMessage(res.error || "Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccessMessage("Password changed successfully! All sessions updated.");
        setTimeout(() => onClose(), 1500);
      } else {
        setErrorMessage(res.error || "Password change failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (id: string, pass: string) => {
    setCollegeId(id);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              {mode === "login" && "College ID Authentication"}
              {mode === "register" && "Student Account Registration"}
              {mode === "otp" && "College Email Verification"}
              {mode === "password" && "Change Account Password"}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === "login" && "Enter your 10-character Vignan College ID"}
              {mode === "register" && "Must follow 251FAXXXXX format"}
              {mode === "otp" && `Enter 6-digit code sent to ${pendingEmail}`}
              {mode === "password" && `Logged in as ${currentUser?.collegeId}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switchers if not OTP */}
        {mode !== "otp" && mode !== "password" && (
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950">
            <button
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
              }}
              className={`flex-1 py-3 text-center transition ${
                mode === "login"
                  ? "border-b-2 border-indigo-600 bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
              }}
              className={`flex-1 py-3 text-center transition ${
                mode === "register"
                  ? "border-b-2 border-indigo-600 bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              New Registration
            </button>
          </div>
        )}

        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  College ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 251FA0AI65"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase text-slate-900 placeholder:normal-case focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="mt-1 block text-[11px] text-slate-400">
                  Format: 2 digits, 1FA, 5 alphanumeric chars
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-hidden disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Sign In to EventHub"}
              </button>

              {/* Demo Accounts Quick-fill */}
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Quick-Fill Demo Credentials:
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => fillQuickDemo("251FA0AI65", "vignan@2026")}
                    className="rounded border border-slate-200 bg-white p-1.5 text-left hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Coordinator</div>
                    <div className="font-mono text-slate-500">251FA0AI65</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo("251FA19106", "student@123")}
                    className="rounded border border-slate-200 bg-white p-1.5 text-left hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Student</div>
                    <div className="font-mono text-slate-500">251FA19106</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo("221FA04001", "faculty@123")}
                    className="rounded border border-slate-200 bg-white p-1.5 text-left hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Faculty Advisor</div>
                    <div className="font-mono text-slate-500">221FA04001</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo("211FA01000", "dean@12345")}
                    className="rounded border border-slate-200 bg-white p-1.5 text-left hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Dean</div>
                    <div className="font-mono text-slate-500">211FA01000</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  College ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 251FA0AI65"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="mt-1 block text-[11px] text-slate-400">
                  Must follow format: 251FAXXXXX
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sai Krishna"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="CSE (Artificial Intelligence)">CSE (Artificial Intelligence)</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Management Studies">Management Studies</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-indigo-50 p-2.5 text-[11px] text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                <span className="font-semibold">Email Verification Policy:</span> A 6-digit confirmation code will be simulated for your official inbox at:{" "}
                <span className="font-mono font-medium">
                  {collegeId ? getCollegeEmail(collegeId) : "your-id@vignan.ac.in"}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-hidden disabled:opacity-60"
              >
                {loading ? "Generating Code..." : "Continue to Email Verification"}
              </button>
            </form>
          )}

          {/* OTP VERIFICATION FORM */}
          {mode === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <Mail className="h-6 w-6" />
                </div>
                <h4 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">
                  Enter 6-Digit Verification Code
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  We sent a code to <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{pendingEmail}</span>.
                </p>
                <div className="mt-2 inline-block rounded-md bg-amber-50 px-2.5 py-1 text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Demo code: <span className="font-mono font-bold">123456</span>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border-2 border-indigo-200 bg-white py-3 text-center font-mono text-2xl font-bold tracking-widest text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-hidden disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify & Complete Registration"}
              </button>

              <button
                type="button"
                onClick={() => setMode("register")}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
              >
                Back to Registration
              </button>
            </form>
          )}

          {/* PASSWORD CHANGE FORM */}
          {mode === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-hidden disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password & Invalidate Sessions"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
