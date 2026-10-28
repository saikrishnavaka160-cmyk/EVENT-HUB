"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/store";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  UserCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const AttendanceScannerView: React.FC = () => {
  const { currentUser, assignments, scanAttendanceToken } = useApp();
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    assignment?: any;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);

  // Available tokens for quick-testing
  const activeTokens = assignments.filter((a) => a.checkInToken || a.checkOutToken);

  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(true);
    setScanResult(null);

    try {
      const codeReader = new BrowserMultiFormatReader();
      const videoElem = videoRef.current;
      if (!videoElem) return;

      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoElem,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            stopScanner();
            handleProcessCode(scannedText);
          }
        }
      );
      controlsRef.current = controls;
    } catch (err: any) {
      setCameraError("Camera stream unavailable. You can use manual code verification or simulator tokens below.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleProcessCode = (code: string) => {
    if (!code) return;
    const res = scanAttendanceToken(code);
    setScanResult(res);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleProcessCode(manualCode);
    setManualCode("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
          Universal Attendance Scanner
        </h1>
        <p className="text-xs text-slate-500">
          Open to all signed-in students and volunteers. Prevents self-scanning and securely records verification timestamps.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Camera Scanner Card */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Camera Scanner
            </h2>
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
              <Shield className="h-3 w-3 text-indigo-600" /> Scanner ID: {currentUser?.collegeId}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Point camera at the volunteer’s dynamic 2-minute Check-In or Check-Out QR pass.
          </p>

          <div className="relative mt-4 flex min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-950 dark:border-slate-800">
            {isScanning ? (
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                autoPlay
              />
            ) : (
              <div className="flex flex-col items-center p-6 text-center text-slate-400">
                <Camera className="h-10 w-10 text-slate-600" />
                <span className="mt-2 text-xs font-medium">Camera is inactive</span>
                <span className="text-[11px] text-slate-500">Tap below to grant access</span>
              </div>
            )}

            {isScanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-44 w-44 rounded-xl border-2 border-indigo-400 border-dashed animate-pulse" />
              </div>
            )}
          </div>

          {cameraError && (
            <div className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {cameraError}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            {!isScanning ? (
              <button
                onClick={startScanner}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
              >
                <Camera className="h-4 w-4" /> Start Camera Scanner
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
              >
                Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Manual Code Input & Simulator Tokens */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Manual Token Verification
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            If lighting is dim or camera permissions are restricted, paste the attendance code below:
          </p>

          <form onSubmit={handleManualSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Attendance Token String
              </label>
              <input
                type="text"
                placeholder="e.g. VIGNAN-CHK-IN-asg-frames-01-XXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              Verify Attendance Pass
            </button>
          </form>

          {/* Quick Click Tokens for Testing */}
          <div className="mt-6 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Active Generated Passes ({activeTokens.length})
              </span>
              <span className="text-[10px] text-slate-400">Tap to test scan</span>
            </div>

            <div className="mt-2 space-y-2">
              {activeTokens.length === 0 ? (
                <div className="text-[11px] text-slate-400">
                  No active passes right now. Open the <strong className="text-slate-600 dark:text-slate-300">Assigned Work</strong> tab and tap &quot;Show Check-In QR&quot; on any assignment to generate one!
                </div>
              ) : (
                activeTokens.map((asg) => {
                  const token = asg.checkInToken || asg.checkOutToken;
                  const isCheckIn = !!asg.checkInToken;
                  return (
                    <div
                      key={asg.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {asg.dutyTitle}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {asg.assigneeName} ({asg.assigneeCollegeId}) • {isCheckIn ? "Check-In" : "Check-Out"}
                        </div>
                      </div>
                      <button
                        onClick={() => handleProcessCode(token!)}
                        className="ml-2 rounded bg-indigo-50 px-2 py-1 font-mono text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                      >
                        Scan Pass
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SCAN RESULT BANNER */}
      {scanResult && (
        <div
          className={`rounded-2xl border p-5 shadow-md ${
            scanResult.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
              : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {scanResult.success ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-sm">
                {scanResult.success ? "Attendance Recorded Successfully" : "Attendance Verification Failed"}
              </h3>
              <p className="mt-1 text-xs">{scanResult.message}</p>

              {scanResult.assignment && (
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-white/70 p-3 text-xs text-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
                  <div>
                    <span className="text-slate-500">Duty:</span> {scanResult.assignment.dutyTitle}
                  </div>
                  <div>
                    <span className="text-slate-500">Assignee:</span> {scanResult.assignment.assigneeName} ({scanResult.assignment.assigneeCollegeId})
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span> {scanResult.assignment.status}
                  </div>
                  <div>
                    <span className="text-slate-500">Verified by:</span> Scanner {currentUser?.collegeId}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
