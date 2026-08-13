

// import DoctorAppointmentsTable from "@/components/modules/Doctor/DoctorAppointments/DoctorAppointmentTable";
import DoctorAppointmentsTable from "@/components/modules/Doctor/DoctorAppointments/DoctorAppointmentTable";
import { getMyAppointments } from "@/services/patient/appointment.services";
import { IAppointment } from "@/types/appointment.interface";

import { Suspense } from "react";

async function AppointmentsContent() {
  const response = await getMyAppointments();
  const appointments: IAppointment[] = response?.data || [];

  return <DoctorAppointmentsTable appointments={appointments} />;
}

export default async function DoctorAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground mt-2">
          Manage your patient appointments and prescriptions
        </p>
      </div>

      <Suspense fallback={<div>Loading appointments...</div>}>
        <AppointmentsContent />
      </Suspense>
    </div>
  );
}