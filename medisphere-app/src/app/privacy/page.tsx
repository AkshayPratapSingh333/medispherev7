import InfoPage from "@/components/common/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      subtitle="MediSphere is designed to protect personal and medical information with strong access controls."
      sections={[
        {
          heading: "Data Collection",
          body: "We collect only the information needed to provide telemedicine features such as appointments, reports, and consultation history.",
        },
        {
          heading: "Data Usage",
          body: "Your data is used for care delivery, account functionality, and platform reliability. We do not sell personal health data.",
        },
        {
          heading: "Security and Access",
          body: "Role-based access and authenticated sessions are used so only authorized users can view or manage sensitive records.",
        },
      ]}
    />
  );
}
