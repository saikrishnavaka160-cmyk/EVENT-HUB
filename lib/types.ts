export type UserRole = "student" | "coordinator" | "faculty" | "dean" | "admin";

export interface CollegeUser {
  collegeId: string;
  displayName: string;
  role: UserRole;
  email: string;
  emailVerified: boolean;
  department?: string;
  year?: string;
  phone?: string;
  createdAt: string;
}

export type EventStatus =
  | "draft"
  | "submitted"
  | "faculty_approved"
  | "dean_approved"
  | "published"
  | "completed"
  | "rejected";

export type OrganizationId =
  | "SAC"
  | "ARC"
  | "NSS"
  | "NCC"
  | "ALUMNI"
  | "EEL_ECL"
  | "VSC";

export interface OrganizationInfo {
  id: OrganizationId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  organization: OrganizationId;
  category: "Technical" | "Cultural" | "Sports" | "Social Service" | "Workshop" | "Seminar";
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  venue: string;
  capacity: number;
  registeredCount: number;
  status: EventStatus;
  createdBy: string; // College ID
  createdByName: string;
  facultyComments?: string;
  deanComments?: string;
  registrationDeadline: string; // YYYY-MM-DDTHH:MM
  imageUrl?: string;
  allowPublicRegistration: boolean;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  collegeId: string;
  studentName: string;
  registeredAt: string;
  attended: boolean;
}

export interface WorkAssignment {
  id: string;
  bodyId: OrganizationId;
  assigneeCollegeId: string;
  assigneeName: string;
  role: "coordinator" | "volunteer";
  dutyTitle: string;
  dutyDescription?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "assigned" | "checked_in" | "completed";
  checkInTime?: string;
  checkInBy?: string; // College ID of scanner
  checkOutTime?: string;
  checkOutBy?: string;
  checkInToken?: string;
  checkOutToken?: string;
  tokenExpiresAt?: number; // timestamp ms
  verifiedHours?: number;
}

export interface Certificate {
  id: string;
  studentCollegeId: string;
  studentName: string;
  eventId: string;
  eventTitle: string;
  organization: OrganizationId;
  role: string;
  verificationCode: string;
  issueDate: string;
  hoursVerified: number;
  signedBy: string;
}

export interface BodyFile {
  id: string;
  bodyId: OrganizationId;
  title: string;
  category: "permission_letter" | "photo";
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadDate: string;
  fileSize: string;
  status: "pending" | "approved";
}
