import InfoPage from "@/components/common/InfoPage";

export default function HelpCenterPage() {
  return (
    <InfoPage
      title="Help Center"
      subtitle="Get quick guidance for account setup, appointments, reports, and virtual consultations."
      sections={[
        {
          heading: "Getting Started",
          body: "Create your account, complete your profile, and choose whether you are joining as a patient or doctor to unlock the right tools.",
        },
        {
          heading: "Appointments and Calls",
          body: "Use the booking section to pick available slots, confirm appointments, and join telemedicine calls from your dashboard.",
        },
        {
          heading: "Reports and Prescriptions",
          body: "Upload your medical reports securely and access prescription summaries directly from your patient area.",
        },
      ]}
    />
  );
}
