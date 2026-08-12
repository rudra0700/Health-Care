



import AppointmentFilter from "@/components/modules/Admin/AppointmentManagement/AppointmentFilter";
import AppointmentTable from "@/components/modules/Admin/AppointmentManagement/AppointmentTable";
import ManagementPageHeader from "@/components/shared/ManagementPageHeader";
import TablePagination from "@/components/shared/TablePagination";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { queryStringFormatter } from "@/lib/formatters";
import { getAppointments } from "@/services/admin/appointmentManagement";
import { Suspense } from "react";

const AppointmentsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);
  const response = await getAppointments(queryString);

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Appointments Management"
        description="View and manage all appointments"
      />

      <AppointmentFilter />

      <Suspense fallback={<TableSkeleton columns={7} />}>
        <AppointmentTable appointments={response?.data || []} />
      </Suspense>

      <TablePagination
        currentPage={response?.meta?.page || 1}
        totalPages={response?.meta?.totalPage || 1}
      />
    </div>
  );
};

export default AppointmentsManagementPage;