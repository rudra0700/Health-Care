
import PatientPrescriptionsList from "@/components/modules/Patient/PatientPrescription/PatientPrescriptionList";
import { getMyPrescriptions } from "@/services/patient/prescription.services";
import { IPrescription } from "@/types/prescriptions.interface";


export default async function MyPrescriptionsPage() {
  const response = await getMyPrescriptions();
  const prescriptions: IPrescription[] = response?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Prescriptions</h1>
        <p className="text-muted-foreground mt-2">
          View all your medical prescriptions from completed appointments
        </p>
      </div>

      <PatientPrescriptionsList prescriptions={prescriptions} />
    </div>
  );
}