import OurTeamMemberSection from "@/components/About/OurTeamMemberSection";
import PageHeader from "@/utilities/PageHeader";

const ZypcoTeamMember = () => {
  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader
        title="ABOUT US"
        subtitle="OUR TEAM MEMBERS"
        mainLink="/about"
        subLink="/about/our-team"
      />
      <OurTeamMemberSection />
    </div>
  );
};

export default ZypcoTeamMember;
