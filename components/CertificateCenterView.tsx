"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { Certificate } from "@/lib/types";
import { ORGANIZATIONS } from "@/lib/constants";
import {
  GraduationCap,
  Award,
  Search,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  X,
  FileCheck,
} from "lucide-react";

export const CertificateCenterView: React.FC = () => {
  const { certificates, events, assignments, users, issueCertificate, verifyCertificateCode, currentUser } = useApp();
  const [searchCode, setSearchCode] = useState("");
  const [verifiedResult, setVerifiedResult] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Issue form
  const [targetStudentId, setTargetStudentId] = useState("241FA04021");
  const [targetEventId, setTargetEventId] = useState("evt-frames-campus");
  const [verifiedHours, setVerifiedHours] = useState(8);

  const completedEvents = events.filter((e) => e.status === "completed");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cert = verifyCertificateCode(searchCode);
    setVerifiedResult(cert);
  };

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const res = issueCertificate(targetStudentId, targetEventId, Number(verifiedHours));
    if (res.success && res.certificate) {
      setSelectedCertificate(res.certificate);
      setShowIssueModal(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const canIssue =
    currentUser?.role === "dean" ||
    currentUser?.role === "coordinator" ||
    currentUser?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
            Certificate Center & Verification Authority
          </h1>
          <p className="text-xs text-slate-500">
            Issue verified volunteer service & coordinator certificates with cryptographically verifiable tamper-proof codes
          </p>
        </div>

        {canIssue && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4" /> Issue Volunteer Certificate
          </button>
        )}
      </div>

      {/* Code Verification Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Public Certificate Authenticity Verification
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter the unique certificate serial number to verify issuing dean signature, service hours, and event records.
        </p>

        <form onSubmit={handleVerify} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. VIGNAN-SAC-2026-FC-8492"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 font-mono text-xs uppercase text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            Verify Authenticity
          </button>
        </form>

        {hasSearched && (
          <div className="mt-4">
            {verifiedResult ? (
              <div className="flex items-start justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/50">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Authentic Certificate Verified
                    </h4>
                    <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-300">
                      Awarded to <strong className="font-semibold">{verifiedResult.studentName}</strong> ({verifiedResult.studentCollegeId}) for active service during <strong>{verifiedResult.eventTitle}</strong>.
                    </p>
                    <div className="mt-2 flex gap-4 text-[11px] text-emerald-700 dark:text-emerald-400">
                      <span>Issued: {verifiedResult.issueDate}</span>
                      <span>Hours Credited: {verifiedResult.hoursVerified}h</span>
                      <span>Dean: {verifiedResult.signedBy}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCertificate(verifiedResult)}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  View Certificate
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                No certificate found with serial number <strong className="font-mono">{searchCode}</strong>. Please confirm exact alphanumeric code.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Issued Certificates Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Issued University Certificates ({certificates.length})
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {cert.organization}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{cert.issueDate}</span>
              </div>

              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                {cert.studentName}
              </h3>
              <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                {cert.studentCollegeId}
              </p>

              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Event: <strong className="text-slate-800 dark:text-slate-200">{cert.eventTitle}</strong>
              </div>

              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2 text-left font-mono text-[10px] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                {cert.verificationCode}
              </div>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => setSelectedCertificate(cert)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  <Award className="h-4 w-4" /> Open Official Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OFFICIAL PRINTABLE CERTIFICATE MODAL */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Official University Certificate
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Printer className="h-3.5 w-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Print Area */}
            <div
              id="printable-certificate"
              className="mt-4 rounded-xl border-8 border-double border-indigo-900 bg-white p-8 text-center text-slate-900 shadow-md dark:bg-white dark:text-slate-900"
            >
              {/* Crest & Header */}
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-900 text-2xl font-serif font-black text-amber-400 shadow-sm">
                  V
                </div>
                <h3 className="mt-2 text-xl font-serif font-black uppercase tracking-wider text-indigo-950">
                  Vignan&apos;s Foundation for Science, Technology & Research
                </h3>
                <p className="text-[10px] tracking-widest uppercase text-slate-500">
                  (Deemed to be University) • Vadlamudi, Guntur, AP
                </p>
                <div className="mt-1 h-0.5 w-32 bg-amber-500" />
              </div>

              {/* Title */}
              <div className="mt-6">
                <span className="text-xs font-serif italic text-slate-600">
                  This Certificate of Merit & Dedicated Service is Proudly Awarded To
                </span>
                <h2 className="mt-3 font-serif text-2xl font-bold underline decoration-amber-500 underline-offset-4 text-indigo-950">
                  {selectedCertificate.studentName}
                </h2>
                <p className="mt-1 font-mono text-xs font-bold text-slate-700">
                  College ID: {selectedCertificate.studentCollegeId}
                </p>
              </div>

              <p className="mx-auto mt-5 max-w-lg text-xs leading-relaxed text-slate-700">
                in recognition of outstanding contributions as an <strong>{selectedCertificate.role}</strong> during the campus event <strong>&ldquo;{selectedCertificate.eventTitle}&rdquo;</strong> organized by the <strong>{ORGANIZATIONS[selectedCertificate.organization]?.name}</strong>, with <strong>{selectedCertificate.hoursVerified} hours</strong> of verified campus service.
              </p>

              {/* Signatures & Verification */}
              <div className="mt-8 flex items-end justify-between border-t border-slate-200 pt-4 text-xs">
                <div className="text-left">
                  <div className="font-mono text-[10px] text-slate-500">
                    Serial No: {selectedCertificate.verificationCode}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Issued: {selectedCertificate.issueDate}
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-serif italic font-semibold text-slate-800">
                    Prof. P. V. Rao
                  </div>
                  <div className="h-0.5 w-28 bg-slate-300 my-1 mx-auto" />
                  <div className="text-[10px] font-bold uppercase text-slate-600">
                    Dean, Student Affairs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ISSUE CERTIFICATE MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Issue Volunteer Service Certificate
              </h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleIssue} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Completed Event
                </label>
                <select
                  value={targetEventId}
                  onChange={(e) => setTargetEventId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {completedEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.organization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Eligible Volunteer / Student
                </label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {users.map((u) => (
                    <option key={u.collegeId} value={u.collegeId}>
                      {u.displayName} ({u.collegeId}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Verified Volunteer Service Hours
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={verifiedHours}
                  onChange={(e) => setVerifiedHours(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Generate & Sign Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
