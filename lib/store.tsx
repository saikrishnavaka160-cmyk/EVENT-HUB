"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import {
  CampusEvent,
  Certificate,
  CollegeUser,
  EventRegistration,
  OrganizationId,
  UserRole,
  WorkAssignment,
  BodyFile,
} from "./types";
import {
  INITIAL_ASSIGNMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_EVENTS,
  INITIAL_FILES,
  INITIAL_USERS,
} from "./mock-data";
import { isValidCollegeId, isValidPassword, sanitizeCollegeId, getCollegeEmail } from "./auth-validation";

interface AppContextType {
  currentUser: CollegeUser | null;
  users: CollegeUser[];
  events: CampusEvent[];
  registrations: EventRegistration[];
  assignments: WorkAssignment[];
  certificates: Certificate[];
  files: BodyFile[];
  // Auth methods
  login: (collegeId: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (collegeId: string, displayName: string, passwordPlain: string, department?: string) => Promise<{ success: boolean; error?: string; verificationRequired?: boolean; email?: string }>;
  verifyEmailOtp: (collegeId: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoUser: (collegeId: string) => void;
  changePassword: (oldPlain: string, newPlain: string) => Promise<{ success: boolean; error?: string }>;
  // Event methods
  createEvent: (data: Omit<CampusEvent, "id" | "registeredCount" | "status" | "createdBy" | "createdByName">) => void;
  updateEventStatus: (eventId: string, newStatus: CampusEvent["status"], comments?: string) => void;
  registerForEvent: (eventId: string) => { success: boolean; error?: string };
  unregisterFromEvent: (eventId: string) => void;
  // Assignment methods
  createAssignment: (data: Omit<WorkAssignment, "id" | "status">) => void;
  generateCheckInToken: (assignmentId: string) => { token: string; expiresAt: number } | null;
  generateCheckOutToken: (assignmentId: string) => { token: string; expiresAt: number } | null;
  scanAttendanceToken: (token: string) => { success: boolean; message: string; assignment?: WorkAssignment };
  // Certificate methods
  issueCertificate: (studentCollegeId: string, eventId: string, hours: number) => { success: boolean; error?: string; certificate?: Certificate };
  verifyCertificateCode: (code: string) => Certificate | null;
  // File methods
  uploadFile: (file: Omit<BodyFile, "id" | "uploadDate" | "status" | "uploadedBy" | "uploadedByName">) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// In-memory passwords for demo accounts (cost 10)
const DEFAULT_PASSWORDS: Record<string, string> = {
  "251FA0AI65": bcrypt.hashSync("vignan@2026", 10),
  "251FA19106": bcrypt.hashSync("student@123", 10),
  "221FA04001": bcrypt.hashSync("faculty@123", 10),
  "211FA01000": bcrypt.hashSync("dean@12345", 10),
  "201FA00001": bcrypt.hashSync("admin@1234", 10),
  "241FA04021": bcrypt.hashSync("volunteer12", 10),
};

const SIMULATED_OTPS: Record<string, string> = {
  // Always allows "123456" for demonstration
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<CollegeUser[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<CollegeUser | null>(INITIAL_USERS[0]);
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(DEFAULT_PASSWORDS);
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([
    {
      id: "reg-1",
      eventId: "evt-frames-campus",
      collegeId: "241FA04021",
      studentName: "Rahul Varma",
      registeredAt: "2026-10-15T12:00:00Z",
      attended: true,
    },
    {
      id: "reg-2",
      eventId: "evt-hack-vignan-2026",
      collegeId: "251FA19106",
      studentName: "Ananya Sharma",
      registeredAt: "2026-10-25T15:20:00Z",
      attended: false,
    },
  ]);
  const [assignments, setAssignments] = useState<WorkAssignment[]>(INITIAL_ASSIGNMENTS);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [files, setFiles] = useState<BodyFile[]>(INITIAL_FILES);
  const [pendingOtp, setPendingOtp] = useState<Record<string, { otp: string; user: CollegeUser; passHash: string }>>({});

  // Sync state to localStorage on mount & update
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("vignan_current_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      const savedEvents = localStorage.getItem("vignan_events");
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
      const savedAssignments = localStorage.getItem("vignan_assignments");
      if (savedAssignments) {
        setAssignments(JSON.parse(savedAssignments));
      }
      const savedCerts = localStorage.getItem("vignan_certs");
      if (savedCerts) {
        setCertificates(JSON.parse(savedCerts));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveState = (
    newEvents?: CampusEvent[],
    newAssignments?: WorkAssignment[],
    newCerts?: Certificate[]
  ) => {
    try {
      if (newEvents) localStorage.setItem("vignan_events", JSON.stringify(newEvents));
      if (newAssignments) localStorage.setItem("vignan_assignments", JSON.stringify(newAssignments));
      if (newCerts) localStorage.setItem("vignan_certs", JSON.stringify(newCerts));
    } catch {
      // ignore
    }
  };

  const login = async (collegeId: string, passwordPlain: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = sanitizeCollegeId(collegeId);
    if (!isValidCollegeId(cleanId)) {
      return { success: false, error: "Invalid College ID format. Expected format: 251FA0AI65 (two digits, 1FA, 5 characters)." };
    }
    const foundUser = users.find((u) => u.collegeId === cleanId);
    if (!foundUser) {
      return { success: false, error: "Account not found with this College ID. Please register first." };
    }
    const storedHash = userPasswords[cleanId];
    if (storedHash) {
      const match = await bcrypt.compare(passwordPlain, storedHash);
      if (!match) {
        return { success: false, error: "Invalid password. Passwords are case-sensitive." };
      }
    }
    setCurrentUser(foundUser);
    localStorage.setItem("vignan_current_user", JSON.stringify(foundUser));
    return { success: true };
  };

  const registerUser = async (
    collegeId: string,
    displayName: string,
    passwordPlain: string,
    department?: string
  ): Promise<{ success: boolean; error?: string; verificationRequired?: boolean; email?: string }> => {
    const cleanId = sanitizeCollegeId(collegeId);
    if (!isValidCollegeId(cleanId)) {
      return { success: false, error: "College ID must follow format: 251FAXXXXX (e.g. 251FA0AI65)." };
    }
    const passVal = isValidPassword(passwordPlain);
    if (!passVal.valid) {
      return { success: false, error: passVal.reason };
    }
    if (users.some((u) => u.collegeId === cleanId)) {
      return { success: false, error: "This College ID is already registered. Please sign in." };
    }

    const email = getCollegeEmail(cleanId);
    const passHash = await bcrypt.hash(passwordPlain, 10);
    const generatedOtp = "123456"; // Standard demo simulation code

    const newUser: CollegeUser = {
      collegeId: cleanId,
      displayName: displayName.trim() || `Student ${cleanId}`,
      role: "student", // Always starts as student per specs
      email,
      emailVerified: false,
      department: department || "General Engineering",
      year: "1st Year",
      createdAt: new Date().toISOString(),
    };

    setPendingOtp((prev) => ({
      ...prev,
      [cleanId]: { otp: generatedOtp, user: newUser, passHash },
    }));

    return { success: true, verificationRequired: true, email };
  };

  const verifyEmailOtp = async (collegeId: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = sanitizeCollegeId(collegeId);
    const pending = pendingOtp[cleanId];
    if (!pending) {
      return { success: false, error: "No pending verification found for this account." };
    }
    if (otp !== pending.otp && otp !== "123456") {
      return { success: false, error: "Incorrect 6-digit code. Please enter the verification code sent to your college inbox." };
    }

    const verifiedUser = { ...pending.user, emailVerified: true };
    setUsers((prev) => [...prev, verifiedUser]);
    setUserPasswords((prev) => ({ ...prev, [cleanId]: pending.passHash }));
    setCurrentUser(verifiedUser);
    localStorage.setItem("vignan_current_user", JSON.stringify(verifiedUser));

    setPendingOtp((prev) => {
      const copy = { ...prev };
      delete copy[cleanId];
      return copy;
    });

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("vignan_current_user");
  };

  const switchDemoUser = (collegeId: string) => {
    const user = users.find((u) => u.collegeId === collegeId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("vignan_current_user", JSON.stringify(user));
    }
  };

  const changePassword = async (oldPlain: string, newPlain: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "Not logged in." };
    const cleanId = currentUser.collegeId;
    const storedHash = userPasswords[cleanId];
    if (storedHash) {
      const match = await bcrypt.compare(oldPlain, storedHash);
      if (!match) return { success: false, error: "Current password does not match." };
    }
    const val = isValidPassword(newPlain);
    if (!val.valid) return { success: false, error: val.reason };

    const newHash = await bcrypt.hash(newPlain, 10);
    setUserPasswords((prev) => ({ ...prev, [cleanId]: newHash }));
    return { success: true };
  };

  const createEvent = (data: Omit<CampusEvent, "id" | "registeredCount" | "status" | "createdBy" | "createdByName">) => {
    if (!currentUser) return;
    const newEvent: CampusEvent = {
      ...data,
      id: `evt-${Date.now()}`,
      registeredCount: 0,
      status: "draft",
      createdBy: currentUser.collegeId,
      createdByName: currentUser.displayName,
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    saveState(updated);
  };

  const updateEventStatus = (eventId: string, newStatus: CampusEvent["status"], comments?: string) => {
    const updated = events.map((ev) => {
      if (ev.id === eventId) {
        const item = { ...ev, status: newStatus };
        if (currentUser?.role === "faculty" && comments) {
          item.facultyComments = comments;
        } else if (currentUser?.role === "dean" && comments) {
          item.deanComments = comments;
        }
        return item;
      }
      return ev;
    });
    setEvents(updated);
    saveState(updated);
  };

  const registerForEvent = (eventId: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: "You must be signed in to register." };
    const event = events.find((e) => e.id === eventId);
    if (!event) return { success: false, error: "Event not found." };

    if (event.status !== "published") {
      return { success: false, error: "Registration is not open for this event." };
    }

    if (event.registeredCount >= event.capacity) {
      return { success: false, error: "Event capacity has been reached." };
    }

    // Check deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return { success: false, error: "Registration deadline has passed." };
    }

    // Check duplicate
    const alreadyRegistered = registrations.some(
      (r) => r.eventId === eventId && r.collegeId === currentUser.collegeId
    );
    if (alreadyRegistered) {
      return { success: false, error: "You are already registered for this event." };
    }

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}`,
      eventId,
      collegeId: currentUser.collegeId,
      studentName: currentUser.displayName,
      registeredAt: new Date().toISOString(),
      attended: false,
    };

    setRegistrations((prev) => [...prev, newReg]);
    const updated = events.map((e) =>
      e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
    );
    setEvents(updated);
    saveState(updated);
    return { success: true };
  };

  const unregisterFromEvent = (eventId: string) => {
    if (!currentUser) return;
    setRegistrations((prev) =>
      prev.filter((r) => !(r.eventId === eventId && r.collegeId === currentUser.collegeId))
    );
    const updated = events.map((e) =>
      e.id === eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e
    );
    setEvents(updated);
    saveState(updated);
  };

  const createAssignment = (data: Omit<WorkAssignment, "id" | "status">) => {
    const newAsg: WorkAssignment = {
      ...data,
      id: `asg-${Date.now()}`,
      status: "assigned",
    };
    const updated = [newAsg, ...assignments];
    setAssignments(updated);
    saveState(undefined, updated);
  };

  const generateCheckInToken = (assignmentId: string) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return null;
    const token = `VIGNAN-CHK-IN-${assignmentId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes

    const updated = assignments.map((a) =>
      a.id === assignmentId ? { ...a, checkInToken: token, tokenExpiresAt: expiresAt } : a
    );
    setAssignments(updated);
    saveState(undefined, updated);
    return { token, expiresAt };
  };

  const generateCheckOutToken = (assignmentId: string) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return null;
    const token = `VIGNAN-CHK-OUT-${assignmentId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes

    const updated = assignments.map((a) =>
      a.id === assignmentId ? { ...a, checkOutToken: token, tokenExpiresAt: expiresAt } : a
    );
    setAssignments(updated);
    saveState(undefined, updated);
    return { token, expiresAt };
  };

  const scanAttendanceToken = (
    token: string
  ): { success: boolean; message: string; assignment?: WorkAssignment } => {
    if (!currentUser) {
      return { success: false, message: "Scanner must be signed in with a College ID." };
    }

    const cleanToken = token.trim();
    const asg = assignments.find(
      (a) => a.checkInToken === cleanToken || a.checkOutToken === cleanToken
    );

    if (!asg) {
      return { success: false, message: "Invalid or expired attendance QR token." };
    }

    if (asg.tokenExpiresAt && Date.now() > asg.tokenExpiresAt) {
      return { success: false, message: "Attendance QR code expired (valid for 2 minutes). Please regenerate." };
    }

    if (asg.assigneeCollegeId === currentUser.collegeId) {
      return {
        success: false,
        message: "Policy restriction: Self-scanning is prohibited. Another signed-in student or volunteer must scan your pass.",
      };
    }

    const nowIso = new Date().toISOString();

    if (cleanToken.startsWith("VIGNAN-CHK-IN-")) {
      const updatedAsg: WorkAssignment = {
        ...asg,
        status: "checked_in",
        checkInTime: nowIso,
        checkInBy: currentUser.collegeId,
        checkInToken: undefined,
      };
      const updated = assignments.map((a) => (a.id === asg.id ? updatedAsg : a));
      setAssignments(updated);
      saveState(undefined, updated);
      return {
        success: true,
        message: `Successfully verified Check-In for ${asg.assigneeName} (${asg.assigneeCollegeId})!`,
        assignment: updatedAsg,
      };
    } else {
      // Check-out
      const updatedAsg: WorkAssignment = {
        ...asg,
        status: "completed",
        checkOutTime: nowIso,
        checkOutBy: currentUser.collegeId,
        checkOutToken: undefined,
        verifiedHours: 6, // Approved service shift
      };
      const updated = assignments.map((a) => (a.id === asg.id ? updatedAsg : a));
      setAssignments(updated);
      saveState(undefined, updated);
      return {
        success: true,
        message: `Successfully verified Check-Out for ${asg.assigneeName} (${asg.assigneeCollegeId})! 6 service hours credited.`,
        assignment: updatedAsg,
      };
    }
  };

  const issueCertificate = (
    studentCollegeId: string,
    eventId: string,
    hours: number
  ): { success: boolean; error?: string; certificate?: Certificate } => {
    const student = users.find((u) => u.collegeId === studentCollegeId);
    const event = events.find((e) => e.id === eventId);
    if (!student || !event) {
      return { success: false, error: "Student or event record not found." };
    }

    const code = `VIGNAN-${event.organization}-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      studentCollegeId,
      studentName: student.displayName,
      eventId,
      eventTitle: event.title,
      organization: event.organization,
      role: "Active Volunteer Coordinator",
      verificationCode: code,
      issueDate: new Date().toISOString().split("T")[0],
      hoursVerified: hours,
      signedBy: "Prof. P. V. Rao (Dean, Student Affairs)",
    };

    const updated = [newCert, ...certificates];
    setCertificates(updated);
    saveState(undefined, undefined, updated);
    return { success: true, certificate: newCert };
  };

  const verifyCertificateCode = (code: string): Certificate | null => {
    const clean = code.trim().toUpperCase();
    return certificates.find((c) => c.verificationCode.toUpperCase() === clean) || null;
  };

  const uploadFile = (file: Omit<BodyFile, "id" | "uploadDate" | "status" | "uploadedBy" | "uploadedByName">) => {
    if (!currentUser) return;
    const newFile: BodyFile = {
      ...file,
      id: `file-${Date.now()}`,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "approved",
      uploadedBy: currentUser.collegeId,
      uploadedByName: currentUser.displayName,
    };
    setFiles((prev) => [newFile, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        events,
        registrations,
        assignments,
        certificates,
        files,
        login,
        registerUser,
        verifyEmailOtp,
        logout,
        switchDemoUser,
        changePassword,
        createEvent,
        updateEventStatus,
        registerForEvent,
        unregisterFromEvent,
        createAssignment,
        generateCheckInToken,
        generateCheckOutToken,
        scanAttendanceToken,
        issueCertificate,
        verifyCertificateCode,
        uploadFile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
