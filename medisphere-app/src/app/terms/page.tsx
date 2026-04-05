import InfoPage from "@/components/common/InfoPage";

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Service"
      subtitle="These terms describe your responsibilities while using MediSphere services."
      sections={[
        {
          heading: "Account Responsibility",
          body: "Users are responsible for keeping login credentials secure and ensuring profile details remain accurate.",
        },
        {
          heading: "Clinical Disclaimer",
          body: "MediSphere supports tele-consultation workflows but does not replace emergency or in-person medical services when required.",
        },
        {
          heading: "Acceptable Use",
          body: "Any misuse of platform communication, records, or access controls may result in account restrictions.",
        },
      ]}
    />
  );
}
