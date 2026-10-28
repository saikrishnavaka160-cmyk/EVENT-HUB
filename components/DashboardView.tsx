"use client";

import React from "react";
import { useApp } from "@/lib/store";
import { ORGANIZATIONS } from "@/lib/constants";
import {
  Calendar,
  Sparkles,
  QrCode,
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from "lucide-react";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenCreateEvent: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCreateEvent,
}) => {
  const { currentUser, events, registrations, assignments, certificates } = useApp();

  const myRegistrations = registrations.filter(
    (r) => r.collegeId === currentUser?.collegeId
  );
  const myAssignments = assignments.filter(
    (a) => a.assigneeCollegeId === currentUser?.collegeId
  );
  const totalVerifiedHours = assignments
    .filter((a) => a.assigneeCollegeId === currentUser?.collegeId && a.verifiedHours)
    .reduce((sum, a) => sum + (a.verifiedHours || 0), 0);

  const pendingFacultyReviews = events.filter((e) => e.status === "submitted");
  const pendingDeanApprovals = events.filter((e) => e.status === "faculty_approved");
  const publishedEvents = events.filter((e) => e.status === "published");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-xs">
              Vignan University EventHub
            </span>
            <span className="font-mono text-xs text-indigo-300">
              ID: {currentUser?.collegeId}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {currentUser?.displayName}!
          </h1>
          <p className="mt-2 text-sm text-indigo-200">
            {currentUser?.role === "coordinator" &&
              "You have Coordinator privileges. Manage SAC event proposals, assign volunteer shifts, and verify attendance."}
            {currentUser?.role === "faculty" &&
              "You have Faculty Advisor privileges. Review club event proposals, verify safety requisitions, and endorse submissions."}
            {currentUser?.role === "dean" &&
              "You have Dean privileges. Grant final university sanctions, publish events to campus, and issue official certificates."}
            {currentUser?.role === "student" &&
              "Explore upcoming campus festivals, workshops, register with one click, and track your volunteer service hours."}
            {currentUser?.role === "admin" &&
              "Central administrator console. Oversee all 7 student bodies, leadership roles, and security policies."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("calendar")}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-900 shadow-sm transition hover:bg-indigo-50"
            >
              <Calendar className="h-4 w-4" /> Browse Campus Calendar
            </button>
            {(currentUser?.role === "coordinator" || currentUser?.role === "admin") && (
              <button
                onClick={onOpenCreateEvent}
                className="flex items-center gap-2 rounded-xl bg-indigo-600/80 px-4 py-2.5 text-xs font-bold text-white shadow-sm ring-1 ring-white/20 transition hover:bg-indigo-600"
              >
                <Sparkles className="h-4 w-4" /> Create Event Proposal
              </button>
            )}
            <button
              onClick={() => onNavigate("assigned")}
              className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-white ring-1 ring-white/20 transition hover:bg-slate-800"
            >
              <QrCode className="h-4 w-4" /> Show Attendance Pass
            </button>
          </div>
        </div>

        {/* Ambient decorative gradient */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Role specific Action Alert */}
      {currentUser?.role === "faculty" && pendingFacultyReviews.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="text-sm font-bold">
                {pendingFacultyReviews.length} Event Proposal(s) Pending Your Review
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                Action required to review safety, budget, and recommend to Dean.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate("workflows")}
            className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Review Now <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {currentUser?.role === "dean" && pendingDeanApprovals.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4 text-purple-900 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-sm font-bold">
                {pendingDeanApprovals.length} Event Proposal(s) Awaiting Dean Publication
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">
                Endorsed by faculty advisors and ready for campus publication.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate("workflows")}
            className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
          >
            Review & Publish <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Published Events</span>
            <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {publishedEvents.length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            Open for registration
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">My Registrations</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {myRegistrations.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Confirmed seats
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Assigned Shifts</span>
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {myAssignments.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Coordinating & Volunteering
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Verified Hours</span>
            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {totalVerifiedHours}h
          </div>
          <div className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400">
            Certificate eligible
          </div>
        </div>
      </div>

      {/* Featured Campus Events */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Upcoming Campus Highlights
            </h2>
            <p className="text-xs text-slate-500">
              Events scheduled across cultural, technical, and sports bodies
            </p>
          </div>
          <button
            onClick={() => onNavigate("calendar")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View full calendar <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((event) => {
            const org = ORGANIZATIONS[event.organization];
            const isReg = registrations.some(
              (r) => r.eventId === event.id && r.collegeId === currentUser?.collegeId
            );
            return (
              <div
                key={event.id}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
              >
                {event.imageUrl && (
                  <div className="relative h-36 w-full overflow-hidden bg-slate-200">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-3 top-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${org?.badgeBg}`}>
                        {org?.shortName}
                      </span>
                    </div>
                    <div className="absolute right-3 top-3">
                      <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs capitalize">
                        {event.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Calendar className="h-3 w-3" />
                    <span>{event.date}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 dark:text-slate-400">
                    {event.description}
                  </p>

                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        Venue: <span className="font-medium text-slate-700 dark:text-slate-300">{event.venue}</span>
                      </span>
                      {isReg && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Registered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The 7 Student Bodies Showcase */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Vignan Student Organizations & Bodies
            </h2>
            <p className="text-xs text-slate-500">
              Shared workspaces, assigned work duties, and leadership for SAC, ARC, NSS, NCC, Alumni, EEL/ECL, and VSC
            </p>
          </div>
          <button
            onClick={() => onNavigate("assigned")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Manage duties <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {Object.values(ORGANIZATIONS).map((org) => (
            <button
              key={org.id}
              onClick={() => onNavigate("assigned")}
              className="flex flex-col items-center rounded-xl border border-slate-200 p-3 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-xs dark:border-slate-800 dark:hover:bg-indigo-950/20"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${org.badgeBg}`}>
                {org.shortName.slice(0, 3)}
              </div>
              <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                {org.shortName}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">
                {org.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
