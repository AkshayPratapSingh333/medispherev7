import InfoPage from "@/components/common/InfoPage";

export default function CareersPage() {
  return (
    <InfoPage
      title="Careers"
      subtitle="Join a team building meaningful healthcare technology for patients, doctors, and clinics."
      sections={[
        {
          heading: "Who We Hire",
          body: "We look for builders in engineering, product, operations, and care enablement who care deeply about impact.",
        },
        {
          heading: "How We Work",
          body: "Our culture values ownership, clarity, and cross-functional collaboration to ship reliable health-first products.",
        },
        {
          heading: "Apply",
          body: "Send your profile and role interests to careers@medisphere.com. Include links to projects or case studies when possible.",
        },
      ]}
    />
  );
}
