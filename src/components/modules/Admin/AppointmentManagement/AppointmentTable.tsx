"use client";

import ManagementTable from "@/components/shared/ManagementTable";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IAppointment } from "@/types/appointment.interface";
import { AppointmentColumns } from "./AppointmentColumn";
import AppointmentViewDetailDialogue from "./AppointmentViewDetailDialogue";
import ChangeAppointmentStatusDialogue from "./ChangeAppointementStatusDialogue";


interface AppointmentsTableProps {
  appointments: IAppointment[];
}

const AppointmentTable = ({ appointments }: AppointmentsTableProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [viewingAppointment, setViewingAppointment] =
    useState<IAppointment | null>(null);
  const [changingStatusAppointment, setChangingStatusAppointment] =
    useState<IAppointment | null>(null);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleView = (appointment: IAppointment) => {
    setViewingAppointment(appointment);
  };

  const handleEdit = (appointment: IAppointment) => {
    setChangingStatusAppointment(appointment);
  };

  return (
    <>
      <ManagementTable
        data={appointments}
        columns={AppointmentColumns}
        onView={handleView}
        onEdit={handleEdit}
        getRowKey={(appointment) => appointment.id!}
        emptyMessage="No appointments found"
      />

      {/* View Appointment Detail Dialog */}
      <AppointmentViewDetailDialogue
        open={!!viewingAppointment}
        onClose={() => setViewingAppointment(null)}
        appointment={viewingAppointment}
      />

      {/* Change Status Dialog */}
      <ChangeAppointmentStatusDialogue
        open={!!changingStatusAppointment}
        onClose={() => setChangingStatusAppointment(null)}
        appointment={changingStatusAppointment}
        onSuccess={() => {
          setChangingStatusAppointment(null);
          handleRefresh();
        }}
      />
    </>
  );
};

export default AppointmentTable;