"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { CampusEvent, EventStatus, OrganizationId } from "@/lib/types";
import { ORGANIZATIONS } from "@/lib/constants";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  XCircle,
  RotateCcw,
  Check,
  Plus,
  MessageSquare,
} from "lucide-react";

interface EventWorkflowViewProps {
  onOpenCreate: () => void;
}

export const EventWorkflowView: React.FC<EventWorkflowViewProps> = ({ onOpenCreate }) => {
  const { events, updateEventStatus, currentUser } = useApp();
  const [activePipelineTab, setActivePipelineTab] = useState<EventStatus | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [actionComments, setActionComments] = useState("");
  const [reviewDialog, setReviewDialog] = useState<{
    event: CampusEvent;
    action: "approve" | "reject" | "publish" | "complete";
  } | null>(null);

  const tabs: { id: EventStatus | "all"; label: string; count: number }[] = [
    { id: "all", label: "All Proposals", count: events.length },
    { id: "draft", label: "Drafts", count: events.filter((e) => e.status === "draft").length },
    { id: "submitted", label: "Faculty Review", count: events.filter((e) => e.status === "submitted").length },
    { id: "faculty_approved", label: "Dean Approval", count: events.filter((e) => e.status === "faculty_approved").length },
    { id: "published", label: "Campus Published", count: events.filter((e) => e.status === "published").length },
    { id: "completed", label: "Completed", count: events.filter((e) => e.status === "completed").length },
  ];

  const filteredEvents = activePipelineTab === "all"
    ? events
    : events.filter((e) => e.status === activePipelineTab);

  const canCreate = currentUser?.role === "coordinator" || currentUser?.role === "admin";
  const canFacultyReview = currentUser?.role === "faculty" || currentUser?.role === "admin";
  const canDeanReview = currentUser?.role === "dean" || currentUser?.role === "admin";

  const handleReviewAction = () => {
    if (!reviewDialog) return;
    const { event, action } = reviewDialog;

    if (action === "approve") {
      // Faculty endorses -> moves to faculty_approved (awaiting Dean)
      updateEventStatus(event.id, "faculty_approved", actionComments || "Endorsed with faculty recommendation.");
    } else if (action === "publish") {
      // Dean publishes -> moves to published
      updateEventStatus(event.id, "published", actionComments || "Sanctioned and published for campus registrations.");
    } else if (action === "reject") {
      updateEventStatus(event.id, "rejected", actionComments || "Requires budget or scheduling revision.");
    } else if (action === "complete") {
      updateEventStatus(event.id, "completed", actionComments || "Marked event as concluded.");
    }

    setReviewDialog(null);
    setActionComments("");
  };

  const handleSubmitForReview = (eventId: string) => {
    updateEventStatus(eventId, "submitted");
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "submitted":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case "faculty_approved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "published":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
      case "rejected":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
            Event Management & Staged Approvals
          </h1>
          <p className="text-xs text-slate-500">
            Lifecycle workflow: Coordinator Draft → Faculty Advisor Endorsement → Dean University Sanction → Campus Publication
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New Event Proposal
          </button>
        )}
      </div>

      {/* Pipeline Stages */}
      <div className="overflow-x-auto border-b border-slate-200 scrollbar-none dark:border-slate-800">
        <div className="flex space-x-2 pb-2">
          {tabs.map((tab) => {
            const isActive = activePipelineTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePipelineTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Pipeline Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No events found in this stage of the workflow pipeline.
            </div>
          ) : (
            filteredEvents.map((event) => {
              const org = ORGANIZATIONS[event.organization];
              return (
                <div
                  key={event.id}
                  className="flex flex-col justify-between gap-4 p-5 transition hover:bg-slate-50/50 sm:flex-row sm:items-center dark:hover:bg-slate-800/40"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${org?.badgeBg}`}>
                        {org?.shortName}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusBadge(event.status)}`}>
                        {event.status.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className="font-mono text-[11px] text-slate-500">{event.date}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-1 dark:text-slate-400">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                      <span>Proposer: <strong className="text-slate-700 dark:text-slate-300">{event.createdByName}</strong> ({event.createdBy})</span>
                      <span>Venue: <strong className="text-slate-700 dark:text-slate-300">{event.venue}</strong></span>
                      <span>Capacity: <strong className="text-slate-700 dark:text-slate-300">{event.capacity}</strong></span>
                    </div>

                    {/* Reviewer comments if present */}
                    {event.facultyComments && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-blue-50/70 p-2 text-[11px] text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <div>
                          <strong>Faculty Advisor Note:</strong> {event.facultyComments}
                        </div>
                      </div>
                    )}

                    {event.deanComments && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-purple-50/70 p-2 text-[11px] text-purple-900 dark:bg-purple-950/40 dark:text-purple-200">
                        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
                        <div>
                          <strong>Dean Sanction Note:</strong> {event.deanComments}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contextual Action Buttons based on User Role */}
                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    {/* Coordinator: Submit draft */}
                    {event.status === "draft" && canCreate && (
                      <button
                        onClick={() => handleSubmitForReview(event.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                      >
                        <Send className="h-3 w-3" /> Submit to Faculty
                      </button>
                    )}

                    {/* Faculty: Review submitted */}
                    {event.status === "submitted" && canFacultyReview && (
                      <>
                        <button
                          onClick={() => setReviewDialog({ event, action: "approve" })}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <Check className="h-3 w-3" /> Endorse to Dean
                        </button>
                        <button
                          onClick={() => setReviewDialog({ event, action: "reject" })}
                          className="flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <XCircle className="h-3 w-3" /> Request Revision
                        </button>
                      </>
                    )}

                    {/* Dean: Approve & Publish */}
                    {event.status === "faculty_approved" && canDeanReview && (
                      <>
                        <button
                          onClick={() => setReviewDialog({ event, action: "publish" })}
                          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700"
                        >
                          <FileCheck className="h-3 w-3" /> Sanction & Publish
                        </button>
                        <button
                          onClick={() => setReviewDialog({ event, action: "reject" })}
                          className="flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <XCircle className="h-3 w-3" /> Return to Faculty
                        </button>
                      </>
                    )}

                    {/* Coordinator/Admin: Mark as completed once event ends */}
                    {event.status === "published" && canCreate && (
                      <button
                        onClick={() => setReviewDialog({ event, action: "complete" })}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-700 dark:bg-slate-700"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Mark Complete
                      </button>
                    )}

                    {event.status === "completed" && (
                      <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        ✓ Certificates Ready
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REVIEW ACTION MODAL */}
      {reviewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {reviewDialog.action === "approve" && "Faculty Advisor Endorsement"}
              {reviewDialog.action === "publish" && "Dean Official Sanction & Publication"}
              {reviewDialog.action === "reject" && "Return Proposal for Revision"}
              {reviewDialog.action === "complete" && "Mark Campus Event Completed"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Event: <span className="font-semibold text-slate-800 dark:text-slate-200">{reviewDialog.event.title}</span>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Official Review Notes & Instructions:
              </label>
              <textarea
                rows={3}
                required={reviewDialog.action === "reject"}
                placeholder="Enter feedback, logistics checklist, or approval comments..."
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setReviewDialog(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewAction}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
