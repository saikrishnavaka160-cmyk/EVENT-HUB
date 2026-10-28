"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { CampusEvent, OrganizationId } from "@/lib/types";
import { ORGANIZATIONS } from "@/lib/constants";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Share2,
} from "lucide-react";

export const EventCalendarView: React.FC = () => {
  const { events, registrations, registerForEvent, unregisterFromEvent, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const categories = ["ALL", "Technical", "Cultural", "Sports", "Social Service", "Workshop", "Seminar"];

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = selectedOrg === "ALL" || ev.organization === selectedOrg;
    const matchesCat = selectedCategory === "ALL" || ev.category === selectedCategory;
    return matchesSearch && matchesOrg && matchesCat;
  });

  const handleRegister = (eventId: string) => {
    setActionMessage(null);
    const res = registerForEvent(eventId);
    if (res.success) {
      setActionMessage({ type: "success", text: "Successfully registered! Your seat is reserved." });
    } else {
      setActionMessage({ type: "error", text: res.error || "Registration failed." });
    }
  };

  const handleUnregister = (eventId: string) => {
    unregisterFromEvent(eventId);
    setActionMessage({ type: "success", text: "Registration cancelled." });
  };

  const isUserRegistered = (eventId: string) => {
    return registrations.some(
      (r) => r.eventId === eventId && r.collegeId === currentUser?.collegeId
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
            Campus Events & Academic Calendar
          </h1>
          <p className="text-xs text-slate-500">
            Browse published competitions, guest lectures, cultural fests, and workshops
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setActiveView("list")}
              className={`rounded-md px-3 py-1.5 transition ${
                activeView === "list"
                  ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setActiveView("calendar")}
              className={`rounded-md px-3 py-1.5 transition ${
                activeView === "calendar"
                  ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Month View
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, venue, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Org Filter */}
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Organizations (7)</option>
            {Object.values(ORGANIZATIONS).map((o) => (
              <option key={o.id} value={o.id}>
                {o.shortName} - {o.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="p-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* LIST VIEW */}
      {activeView === "list" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const org = ORGANIZATIONS[event.organization];
            const isReg = isUserRegistered(event.id);
            const isFull = event.registeredCount >= event.capacity;
            const isPastDeadline = new Date() > new Date(event.registrationDeadline);

            return (
              <div
                key={event.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                {event.imageUrl ? (
                  <div className="relative h-44 w-full bg-slate-100">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-3 top-3">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-bold shadow-xs ${org?.badgeBg}`}>
                        {org?.shortName}
                      </span>
                    </div>
                    <div className="absolute right-3 top-3">
                      <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white capitalize backdrop-blur-xs">
                        {event.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 bg-linear-to-r from-indigo-500 to-purple-600 p-4 text-white">
                    <span className="rounded-md bg-white/20 px-2 py-1 text-xs font-bold backdrop-blur-xs">
                      {org?.shortName}
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {event.category}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{event.date}</span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 dark:text-slate-400">
                    {event.description}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        Capacity:{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {event.registeredCount} / {event.capacity}
                        </span>{" "}
                        registered
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-auto pt-4">
                    {isReg ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-lg bg-emerald-50 py-2 text-center text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          ✓ You are Registered
                        </div>
                        <button
                          onClick={() => handleUnregister(event.id)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRegister(event.id)}
                          disabled={isFull || isPastDeadline || event.status !== "published"}
                          className="flex-1 rounded-lg bg-indigo-600 py-2 text-center text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {event.status !== "published"
                            ? "Not Open"
                            : isFull
                            ? "Seats Full"
                            : isPastDeadline
                            ? "Registration Closed"
                            : "Register for Event"}
                        </button>
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CALENDAR MONTH VIEW */}
      {activeView === "calendar" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              November 2026 Academic & Event Schedule
            </h3>
            <span className="text-xs text-slate-500">Vignan University Semester Term</span>
          </div>

          <div className="grid grid-cols-7 gap-2 border-b border-slate-100 pb-2 text-center text-xs font-semibold text-slate-500 dark:border-slate-800">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const dateStr = `2026-11-${day < 10 ? "0" + day : day}`;
              const dayEvents = events.filter((e) => e.date === dateStr);

              return (
                <div
                  key={day}
                  className={`min-h-[90px] rounded-xl border p-2 transition ${
                    dayEvents.length > 0
                      ? "border-indigo-200 bg-indigo-50/30 dark:border-indigo-900/40 dark:bg-indigo-950/20"
                      : "border-slate-100 bg-slate-50/40 dark:border-slate-800/60 dark:bg-slate-950/30"
                  }`}
                >
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{day}</div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((de) => (
                      <button
                        key={de.id}
                        onClick={() => setSelectedEvent(de)}
                        className="w-full truncate rounded bg-indigo-600 px-1.5 py-0.5 text-left text-[10px] font-medium text-white shadow-xs hover:bg-indigo-700"
                        title={de.title}
                      >
                        {de.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {selectedEvent.imageUrl && (
              <div className="relative h-48 w-full bg-slate-200">
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-xs hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="p-6">
              {!selectedEvent.imageUrl && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {selectedEvent.organization}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {selectedEvent.category}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {selectedEvent.title}
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedEvent.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950">
                <div>
                  <span className="text-slate-400">Date:</span>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{selectedEvent.date}</div>
                </div>
                <div>
                  <span className="text-slate-400">Time:</span>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Venue:</span>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{selectedEvent.venue}</div>
                </div>
                <div>
                  <span className="text-slate-400">Registration:</span>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {selectedEvent.registeredCount} / {selectedEvent.capacity} booked
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                {isUserRegistered(selectedEvent.id) ? (
                  <button
                    onClick={() => {
                      handleUnregister(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                    className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Cancel Registration
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleRegister(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                    disabled={selectedEvent.registeredCount >= selectedEvent.capacity || selectedEvent.status !== "published"}
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
