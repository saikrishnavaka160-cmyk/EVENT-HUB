"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import {
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  QrCode,
  Shield,
  User,
  Key,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenPasswordModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenPasswordModal,
}) => {
  const { currentUser, logout, users, switchDemoUser } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "calendar", label: "Events & Calendar", icon: Calendar },
    { id: "workflows", label: "Event Approvals", icon: CheckCircle2 },
    { id: "assigned", label: "Assigned Work", icon: Sparkles },
    { id: "scanner", label: "Attendance Scanner", icon: QrCode },
    { id: "certificates", label: "Certificate Center", icon: GraduationCap },
    { id: "files", label: "Letters & Photos", icon: FileText },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300";
      case "dean":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300";
      case "faculty":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300";
      case "coordinator":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <span className="text-xl tracking-tighter">V</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Vignan EventHub
              </span>
              <span className="hidden rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 sm:inline-block">
                VFSTR
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Campus Event Workspace & Verification Portal
            </p>
          </div>
        </div>

        {/* Quick Demo Role Switcher bar */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs dark:border-slate-800 dark:bg-slate-950 lg:flex">
          <span className="flex items-center gap-1 px-2 font-medium text-slate-500">
            <RefreshCw className="h-3 w-3" /> Quick Switch:
          </span>
          {users.slice(0, 4).map((u) => (
            <button
              key={u.collegeId}
              onClick={() => switchDemoUser(u.collegeId)}
              className={`rounded px-2 py-1 font-medium transition-colors ${
                currentUser?.collegeId === u.collegeId
                  ? "bg-white text-indigo-700 shadow-xs dark:bg-slate-800 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              title={`${u.displayName} (${u.role})`}
            >
              {u.role.toUpperCase()}
            </button>
          ))}
        </div>

        {/* User Account / Auth Button */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {currentUser.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden text-xs sm:block">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {currentUser.displayName}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-slate-500">
                      {currentUser.collegeId}
                    </span>
                    <span
                      className={`rounded-full border px-1.5 py-0.2 text-[9px] font-medium capitalize ${getRoleBadge(
                        currentUser.role
                      )}`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="border-b border-slate-100 p-2 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {currentUser.displayName}
                    </p>
                    <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                      {currentUser.collegeId}
                    </p>
                    <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                    <div className="mt-1 inline-block rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      Role: {currentUser.role}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={onOpenPasswordModal}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Key className="h-3.5 w-3.5 text-slate-500" />
                      Change Password
                    </button>
                    <button
                      onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                      Switch Account / Role
                    </button>
                  </div>

                  {showSwitchMenu && (
                    <div className="my-1 rounded-lg border border-slate-100 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-500">
                        Select Demo Profile
                      </p>
                      {users.map((u) => (
                        <button
                          key={u.collegeId}
                          onClick={() => switchDemoUser(u.collegeId)}
                          className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs ${
                            currentUser.collegeId === u.collegeId
                              ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className="truncate">{u.displayName}</span>
                          <span className="rounded bg-slate-200 px-1 text-[9px] dark:bg-slate-700">
                            {u.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-1 dark:border-slate-700">
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <User className="h-4 w-4" /> Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="overflow-x-auto border-t border-slate-100 bg-slate-50/50 px-4 scrollbar-none dark:border-slate-800/80 dark:bg-slate-950/50 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-3 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-xs ring-1 ring-slate-200 dark:bg-slate-800 dark:text-indigo-400 dark:ring-slate-700"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
