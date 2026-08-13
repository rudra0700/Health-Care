import { IDoctor } from "./doctor.interface";
import { IPatient } from "./patient.interface";
import { IPrescription } from "./prescriptions.interface";
import { IReview } from "./review.interface";
import { ISchedule } from "./schedule.interface";

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export enum PaymentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
}

export interface IAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduleId: string;
  videoCallingId: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  patient?: IPatient;
  doctor?: IDoctor;
  schedule?: ISchedule;
  prescription?: IPrescription;
  review?: IReview;
}

export interface IAppointmentFormData {
  doctorId: string;
  scheduleId: string;
}
