"use client";

import React, { useState, useRef } from "react";
import { useApp } from "@/lib/store";
import { OrganizationId, BodyFile } from "@/lib/types";
import { ORGANIZATIONS } from "@/lib/constants";
import {
  FileText,
  Image as ImageIcon,
  Camera,
  Upload,
  Download,
  Filter,
  Plus,
  CheckCircle2,
  X,
  FileCheck,
} from "lucide-react";

export const BodyFilesView: React.FC = () => {
  const { files, uploadFile, currentUser } = useApp();
  const [selectedBody, setSelectedBody] = useState<OrganizationId | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "permission_letter" | "photo">("ALL");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Upload form
  const [fileTitle, setFileTitle] = useState("");
  const [bodyTarget, setBodyTarget] = useState<OrganizationId>("SAC");
  const [fileCat, setFileCat] = useState<"permission_letter" | "photo">("permission_letter");
  const [filePreview, setFilePreview] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredFiles = files.filter((f) => {
    const matchBody = selectedBody === "ALL" || f.bodyId === selectedBody;
    const matchCat = selectedCategory === "ALL" || f.category === selectedCategory;
    return matchBody && matchCat;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCameraScan = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // ignore
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setFilePreview(dataUrl);
      }
      // Stop tracks
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
    }
    setShowCameraModal(false);
    setShowUploadModal(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadFile({
      bodyId: bodyTarget,
      title: fileTitle,
      category: fileCat,
      fileUrl: filePreview || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
      fileType: fileCat === "photo" ? "image/jpeg" : "application/pdf",
      fileSize: "1.2 MB",
    });
    setShowUploadModal(false);
    setFileTitle("");
    setFilePreview("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
            Permission Letters & Event Photos
          </h1>
          <p className="text-xs text-slate-500">
            Digital repository for official Dean/Faculty sanction letters, hall requisitions, and high-resolution event media
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startCameraScan}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Camera className="h-4 w-4" /> Scan Letter (Camera)
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Upload className="h-4 w-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Body:</span>
        </div>

        <select
          value={selectedBody}
          onChange={(e) => setSelectedBody(e.target.value as any)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Bodies (SAC, ARC, NSS, NCC...)</option>
          {Object.values(ORGANIZATIONS).map((o) => (
            <option key={o.id} value={o.id}>
              {o.shortName}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Categories</option>
          <option value="permission_letter">Permission Letters (PDF)</option>
          <option value="photo">Event Photos (Media)</option>
        </select>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFiles.map((file) => {
          const isPhoto = file.category === "photo";
          const org = ORGANIZATIONS[file.bodyId];

          return (
            <div
              key={file.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
            >
              {isPhoto && file.fileUrl ? (
                <div className="relative h-44 w-full bg-slate-100">
                  <img
                    src={file.fileUrl}
                    alt={file.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${org?.badgeBg}`}>
                      {org?.shortName}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${org?.badgeBg}`}>
                      {org?.shortName}
                    </span>
                    <span className="ml-2 text-[10px] font-semibold text-slate-400 uppercase">
                      Official Letter
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {file.title}
                </h3>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Uploaded By:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {file.uploadedByName} ({file.uploadedBy})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{file.uploadDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span>{file.fileSize}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <a
                    href={file.fileUrl}
                    download={file.title}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Document
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CAMERA SCAN MODAL */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Scan Permission Letter Page
              </h3>
              <button
                onClick={() => {
                  if (videoRef.current?.srcObject) {
                    (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
                  }
                  setShowCameraModal(false);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 overflow-hidden rounded-xl bg-black">
              <video ref={videoRef} autoPlay playsInline className="h-64 w-full object-cover" />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  if (videoRef.current?.srcObject) {
                    (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
                  }
                  setShowCameraModal(false);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                <Camera className="h-4 w-4" /> Capture Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Upload Letter or Event Photo
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Student Body
                </label>
                <select
                  value={bodyTarget}
                  onChange={(e) => setBodyTarget(e.target.value as OrganizationId)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {Object.values(ORGANIZATIONS).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.shortName} - {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <div className="mt-1 flex gap-2">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="fileCat"
                      checked={fileCat === "permission_letter"}
                      onChange={() => setFileCat("permission_letter")}
                    />
                    <span>Permission Letter</span>
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="fileCat"
                      checked={fileCat === "photo"}
                      onChange={() => setFileCat("photo")}
                    />
                    <span>Event Photo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auditorium Sound Sanction Approval"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Choose File (PDF or Image)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="mt-1 w-full text-xs text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {filePreview && (
                <div className="mt-2 h-28 w-full overflow-hidden rounded-lg border border-slate-200">
                  <img src={filePreview} alt="Preview" className="h-full w-full object-contain" />
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
