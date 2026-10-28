"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { OrganizationId, WorkAssignment } from "@/lib/types";
import { ORGANIZATIONS } from "@/lib/constants";
import QRCode from "qrcode";
import {
  Sparkles,
  QrCode,
  Users,
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  UserCheck,
} from "lucide-react";

export const AssignedWorkView: React.FC = () => {
  const {
    currentUser,
    assignments,
    createAssignment,
    generateCheckInToken,
    generateCheckOutToken,
  } = useApp();

  const [selectedBody, setSelectedBody] = useState<OrganizationId>("SAC");
  const [filterMode, setFilterMode] = useState<"my" | "all">("my");
  const [showAssignModal, setShowAssignModal] = useState(false);

  // QR Modal states
  const [activeQrModal, setActiveQrModal] = useState<{
    assignment: WorkAssignment;
    type: "in" | "out";
    token: string;
    expiresAt: number;
    qrDataUrl?: string;
  } | null>(null);

  const [secondsRemaining, setSecondsRemaining] = useState(120);

  // New assignment form
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [dutyTitle, setDutyTitle] = useState("");
  const [dutyDescription, setDutyDescription] = useState("");
  const [dutyRole, setDutyRole] = useState<"volunteer" | "coordinator">("volunteer");
  const [dutyDate, setDutyDate] = useState("2026-11-12");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const canManage =
    currentUser?.role === "coordinator" ||
    currentUser?.role === "admin" ||
    currentUser?.role === "faculty" ||
    currentUser?.role === "dean";

  const bodyAssignments = assignments.filter((a) => a.bodyId === selectedBody);
  const displayAssignments =
    filterMode === "my"
      ? bodyAssignments.filter((a) => a.assigneeCollegeId === currentUser?.collegeId)
      : bodyAssignments;

  // Countdown timer for active QR
  useEffect(() => {
    if (!activeQrModal) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.round((activeQrModal.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(left);
      if (left === 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQrModal]);

  const handleShowCheckInQr = async (asg: WorkAssignment) => {
    const res = generateCheckInToken(asg.id);
    if (!res) return;
    try {
      const url = await QRCode.toDataURL(res.token, { width: 280, margin: 2 });
      setActiveQrModal({
        assignment: asg,
        type: "in",
        token: res.token,
        expiresAt: res.expiresAt,
        qrDataUrl: url,
      });
      setSecondsRemaining(120);
    } catch {
      // fallback
    }
  };

  const handleShowCheckOutQr = async (asg: WorkAssignment) => {
    const res = generateCheckOutToken(asg.id);
    if (!res) return;
    try {
      const url = await QRCode.toDataURL(res.token, { width: 280, margin: 2 });
      setActiveQrModal({
        assignment: asg,
        type: "out",
        token: res.token,
        expiresAt: res.expiresAt,
        qrDataUrl: url,
      });
      setSecondsRemaining(120);
    } catch {
      // fallback
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    createAssignment({
      bodyId: selectedBody,
      assigneeCollegeId: assigneeId.trim().toUpperCase(),
      assigneeName: assigneeName.trim() || `Volunteer ${assigneeId.toUpperCase()}`,
      role: dutyRole,
      dutyTitle,
      dutyDescription,
      date: dutyDate,
      startTime,
      endTime,
    });
    setShowAssignModal(false);
    setDutyTitle("");
    setDutyDescription("");
    setAssigneeId("");
    setAssigneeName("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
            Assigned Work & Volunteer Shifts
          </h1>
          <p className="text-xs text-slate-500">
            Official duties, check-in/out QR generation, and verified service hour records across 7 student bodies
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Appoint Duty / Assignment
          </button>
        )}
      </div>

      {/* Body Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {Object.values(ORGANIZATIONS).map((org) => {
          const isSelected = selectedBody === org.id;
          return (
            <button
              key={org.id}
              onClick={() => setSelectedBody(org.id as OrganizationId)}
              className={`flex flex-col rounded-xl border p-3 text-left transition ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/50 shadow-xs dark:bg-indigo-950/40"
                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{org.shortName}</span>
                <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-indigo-600" : "bg-slate-300"}`} />
              </div>
              <span className="mt-1 text-[10px] text-slate-500 line-clamp-1">{org.name}</span>
            </button>
          );
        })}
      </div>

      {/* Filter My vs All */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Selected Body: <span className="text-indigo-600">{ORGANIZATIONS[selectedBody]?.name}</span>
          </span>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setFilterMode("my")}
            className={`rounded-md px-3 py-1 transition ${
              filterMode === "my"
                ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            My Assigned Duties ({bodyAssignments.filter((a) => a.assigneeCollegeId === currentUser?.collegeId).length})
          </button>
          <button
            onClick={() => setFilterMode("all")}
            className={`rounded-md px-3 py-1 transition ${
              filterMode === "all"
                ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            All Body Duties ({bodyAssignments.length})
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {displayAssignments.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
            {filterMode === "my"
              ? "You do not have any work assignments for this body. Switch to 'All Body Duties' or request duty appointment from leadership."
              : "No duty assignments recorded for this body yet."}
          </div>
        ) : (
          displayAssignments.map((asg) => {
            const isMe = asg.assigneeCollegeId === currentUser?.collegeId;
            return (
              <div
                key={asg.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {asg.role}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                      {asg.dutyTitle}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                      asg.status === "completed"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : asg.status === "checked_in"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {asg.status.replace("_", " ")}
                  </span>
                </div>

                {asg.dutyDescription && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {asg.dutyDescription}
                  </p>
                )}

                <div className="mt-4 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assignee:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {asg.assigneeName} ({asg.assigneeCollegeId})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Shift Timing:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {asg.date} • {asg.startTime} - {asg.endTime}
                    </span>
                  </div>
                  {asg.checkInTime && (
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                      <span>Check-In:</span>
                      <span className="font-mono text-[11px]">
                        {new Date(asg.checkInTime).toLocaleTimeString()} (by {asg.checkInBy})
                      </span>
                    </div>
                  )}
                  {asg.checkOutTime && (
                    <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400">
                      <span>Check-Out:</span>
                      <span className="font-mono text-[11px]">
                        {new Date(asg.checkOutTime).toLocaleTimeString()} ({asg.verifiedHours}h credited)
                      </span>
                    </div>
                  )}
                </div>

                {/* QR Generation Actions (Allowed for Assignee or Admin) */}
                <div className="mt-4 flex items-center gap-2 pt-2">
                  {asg.status === "assigned" && (
                    <button
                      onClick={() => handleShowCheckInQr(asg)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                    >
                      <QrCode className="h-4 w-4" /> Show Check-In QR
                    </button>
                  )}

                  {asg.status === "checked_in" && (
                    <button
                      onClick={() => handleShowCheckOutQr(asg)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700"
                    >
                      <QrCode className="h-4 w-4" /> Show Check-Out QR
                    </button>
                  )}

                  {asg.status === "completed" && (
                    <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" /> Shift Verified ({asg.verifiedHours}h)
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR CODE MODAL WITH 2-MINUTE COUNTDOWN */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {activeQrModal.type === "in" ? "Check-In Attendance Pass" : "Check-Out Attendance Pass"}
              </span>
              <button
                onClick={() => setActiveQrModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-500">
                {activeQrModal.assignment.dutyTitle}
              </p>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {activeQrModal.assignment.assigneeName} ({activeQrModal.assignment.assigneeCollegeId})
              </p>
            </div>

            {/* QR Image */}
            <div className="mx-auto my-4 flex justify-center rounded-xl border border-slate-200 bg-white p-3 shadow-inner">
              {activeQrModal.qrDataUrl ? (
                <img
                  src={activeQrModal.qrDataUrl}
                  alt="Attendance Pass QR"
                  className="h-56 w-56 object-contain"
                />
              ) : (
                <div className="h-56 w-56 flex items-center justify-center bg-slate-100 text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5" />
              Expires in: {secondsRemaining} seconds
            </div>

            {/* Token String Fallback */}
            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2 text-left dark:border-slate-800 dark:bg-slate-950">
              <span className="block text-[10px] text-slate-400">One-Time Token (or manual scan code):</span>
              <span className="block truncate font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {activeQrModal.token}
              </span>
            </div>

            <div className="mt-3 text-[11px] text-slate-400">
              Policy: Self-scanning is blocked. Hand device or show screen to any other signed-in student/coordinator to scan.
            </div>
          </div>
        </div>
      )}

      {/* APPOINT DUTY MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Appoint Body Work Assignment
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assignee College ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 251FA19106"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assignee Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Role
                  </label>
                  <select
                    value={dutyRole}
                    onChange={(e) => setDutyRole(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Duty Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dutyDate}
                    onChange={(e) => setDutyDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Duty Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage Logistics & Delegate Reception"
                  value={dutyTitle}
                  onChange={(e) => setDutyTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description / Responsibilities
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific tasks, reporting supervisor..."
                  value={dutyDescription}
                  onChange={(e) => setDutyDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Appoint Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
