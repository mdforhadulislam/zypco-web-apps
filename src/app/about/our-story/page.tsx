import PageHeader from "@/utilities/PageHeader";
import Image from "next/image";

const ZypcoStory = () => {
  return (
    <>
      <div className="w-full h-auto bg-[#241F21]">
        <PageHeader title="ABOUT US" subtitle="OUR STORY" />
      </div>

      <section className="w-full h-auto p-4">
        <div className="container py-20 m-auto">
          <div className="w-full h-auto flex justify-center align-middle">
            <h1 className="text-4xl sm:text-5xl font-bold">OUR STORY</h1>
          </div>

          <div className="w-full h-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-center align-middle justify-center mt-14">
            <div className="w-full h-auto p-4">
              <Image width={500} height={500} alt="Zypco Man"  src={"/zypco-man.jpg"} className="w-full h-full rounded-lg" />
            </div>
            <div className="w-full h-auto p-6">
              <p className="font-semibold text-xl">Zypco was founded with a clear vision: to make international courier services more affordable, reliable, and accessible in Bangladesh.</p>
              <br />
              <p className="font-medium text-base">We noticed that many people were paying high fees for global shipping without realizing that smarter, cost-saving options existed. With this in mind, Zypco began as a home-office model, built on trust, dedication, and customer convenience.</p>
              <br />
              <p className="font-medium text-base">By partnering with world-renowned courier services such as DHL, FedEx, Aramex, UPS, along with selected local providers, we created a unique network that allows us to deliver the same premium services at discounted rates.</p>
              <br />
              <p className="font-medium text-base">From the very beginning, our focus has been on customer-first solutions: offering doorstep pickup, seamless processing, and safe delivery to the right courier hub. Whether it’s important documents, personal gifts, or commercial shipments, Zypco ensures every package is handled with care.</p>
              <br />
              <p className="font-semibold text-lg">Today, Zypco continues to grow — but our foundation remains the same: a commitment to connecting Bangladesh with the world, one parcel at a time.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ZypcoStory;
