import InfoPage from "@/components/common/InfoPage";

export default function AboutPage() {
  return (
    <InfoPage
      title="About Us"
      subtitle="MediSphere blends trusted Ayurvedic care with modern digital access for patients and doctors."
      sections={[
        {
          heading: "Our Mission",
          body: "Make quality wellness guidance accessible, secure, and convenient through telemedicine-first experiences.",
        },
        {
          heading: "What We Build",
          body: "From appointment booking to report management and AI-assisted support, we focus on practical healthcare workflows.",
        },
        {
          heading: "Our Commitment",
          body: "We prioritize patient trust, clinical collaboration, and continuous improvement in every feature release.",
        },
      ]}
    />
  );
}
