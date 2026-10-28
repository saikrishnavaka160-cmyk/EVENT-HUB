"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardView } from "@/components/DashboardView";
import { EventCalendarView } from "@/components/EventCalendarView";
import { EventWorkflowView } from "@/components/EventWorkflowView";
import { AssignedWorkView } from "@/components/AssignedWorkView";
import { AttendanceScannerView } from "@/components/AttendanceScannerView";
import { CertificateCenterView } from "@/components/CertificateCenterView";
import { BodyFilesView } from "@/components/BodyFilesView";
import { CollegeAuthModal } from "@/components/CollegeAuthModal";
import { CreateEventModal } from "@/components/CreateEventModal";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: "login" | "register" | "password";
  }>({
    isOpen: false,
    mode: "login",
  });
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalState({ isOpen: true, mode: "login" })}
        onOpenPasswordModal={() => setAuthModalState({ isOpen: true, mode: "password" })}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {activeTab === "dashboard" && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenCreateEvent={() => setIsCreateEventOpen(true)}
          />
        )}
        {activeTab === "calendar" && <EventCalendarView />}
        {activeTab === "workflows" && (
          <EventWorkflowView onOpenCreate={() => setIsCreateEventOpen(true)} />
        )}
        {activeTab === "assigned" && <AssignedWorkView />}
        {activeTab === "scanner" && <AttendanceScannerView />}
        {activeTab === "certificates" && <CertificateCenterView />}
        {activeTab === "files" && <BodyFilesView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-xs text-slate-500 sm:flex-row sm:px-6 sm:text-left">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Vignan EventHub
            </span>{" "}
            • Vignan&apos;s Foundation for Science, Technology & Research (Deemed to be University)
            <div className="mt-0.5 text-[11px] text-slate-400">
              College ID accounts format: <code className="font-mono">^[0-9]&#123;2&#125;1FA[A-Z0-9]&#123;5&#125;$</code> (e.g. 251FA0AI65).
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span>SAC</span>
            <span>•</span>
            <span>ARC</span>
            <span>•</span>
            <span>NSS</span>
            <span>•</span>
            <span>NCC</span>
            <span>•</span>
            <span>Alumni</span>
            <span>•</span>
            <span>EEL/ECL</span>
            <span>•</span>
            <span>VSC</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CollegeAuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ isOpen: false, mode: "login" })}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
      />
    </div>
  );
}
