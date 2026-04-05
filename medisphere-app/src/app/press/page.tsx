import InfoPage from "@/components/common/InfoPage";

export default function PressKitPage() {
  return (
    <InfoPage
      title="Press Kit"
      subtitle="Resources for media, partnerships, and official MediSphere communications."
      sections={[
        {
          heading: "Brand Assets",
          body: "For approved logo usage, product screenshots, and brand references, contact our communications team.",
        },
        {
          heading: "Media Inquiries",
          body: "Journalists and editors can reach us at press@medisphere.com for interviews and statements.",
        },
        {
          heading: "Announcements",
          body: "We share major launches, collaborations, and milestones through official press updates.",
        },
      ]}
    />
  );
}
