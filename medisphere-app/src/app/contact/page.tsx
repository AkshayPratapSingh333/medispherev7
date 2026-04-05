import InfoPage from "@/components/common/InfoPage";

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact Us"
      subtitle="Our support team is here to help with access issues, booking assistance, and platform questions."
      sections={[
        {
          heading: "General Support",
          body: "Email us at support@medisphere.com and include your registered email for faster verification.",
        },
        {
          heading: "Doctor and Clinic Onboarding",
          body: "For verification and onboarding assistance, mention your medical registration details so our admin team can review quickly.",
        },
        {
          heading: "Response Time",
          body: "Most requests receive a response within one business day. Urgent account issues are prioritized.",
        },
      ]}
    />
  );
}
