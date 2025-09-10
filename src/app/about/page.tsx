import OurStorySection from "@/components/About/OurStorySection";
import PageHeader from "@/utilities/PageHeader";
import Head from "next/head";

const ZypcoAbout = () => {
  return (
    <>
      <Head>
        <title>About</title>
      </Head>
      <div className="w-full h-auto bg-[#241F21]">
        <PageHeader title="ABOUT US" subtitle="" />
      </div>

      <OurStorySection />
    </>
  );
};

export default ZypcoAbout;
