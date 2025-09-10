import OurStorySection from "@/components/About/OurStorySection";
import PageHeader from "@/utilities/PageHeader";

const ZypcoStory = () => {
  return (
    <>
      <div className="w-full h-auto bg-[#241F21]">
        <PageHeader title="OUR STORY" subtitle="OUR STORY" />
      </div>
      <OurStorySection />
    </>
  );
};

export default ZypcoStory;
