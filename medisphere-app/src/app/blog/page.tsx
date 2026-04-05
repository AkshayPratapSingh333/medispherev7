import InfoPage from "@/components/common/InfoPage";

export default function BlogPage() {
  return (
    <InfoPage
      title="Blog"
      subtitle="Insights on preventive care, digital health, and practical ways to improve everyday wellness."
      sections={[
        {
          heading: "Wellness Education",
          body: "Explore easy-to-understand articles that explain symptoms, prevention, and healthy routines.",
        },
        {
          heading: "Doctor Perspectives",
          body: "Read practitioner-backed guidance that helps patients prepare for better consultations.",
        },
        {
          heading: "Platform Updates",
          body: "Follow product release notes and feature improvements that enhance your care journey.",
        },
      ]}
    />
  );
}
