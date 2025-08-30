import AboutUsOurServiceSection from "@/components/About/AboutUsOurServiceSection";
import AboutUsOurStorySection from "@/components/About/AboutUsOurStorySection";
import PageHeader from "@/utilities/PageHeader";

const ZypcoAbout = () => {
  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader title="ABOUT US" subtitle="" />
      <AboutUsOurStorySection />
      <AboutUsOurServiceSection />
    </div>
  );
};

export default ZypcoAbout;
