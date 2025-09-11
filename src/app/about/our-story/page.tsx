import OurStorySection from "@/components/About/OurStorySection";
import PageHeader from "@/utilities/PageHeader";

const ZypcoStory = () => {
  return (
    <>
      <div className="w-full h-auto bg-[#241F21]">
        <PageHeader title="ABOUT US" subtitle="OUR STORY" mainLink="/about" subLink="/about/our-story" />
      </div>
      <OurStorySection />
    </>
  );
};

export default ZypcoStory;
