import { BriefcaseBusiness, Headset, LaptopMinimalCheck } from "lucide-react";

const HomeCustomerServiceSection = () => {
  return (
    <div className="w-full h-auto p-4 bg-[#241F21]">
      <div className="container py-6 m-auto">
        <div className="w-full h-auto flex flex-col md:flex-row  gap-8 justify-between items-center align-middle">
          <div className="w-full p-5 rounded-md h-full bg-[#FEF400] shadow-lg border flex flex-col justify-center align-middle items-center">
            <div className="p-5">
              <Headset size={58} className="text-[#241F21]" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h1 className="text-base font-bold text-[#241F21]">Customer Support</h1>
              <p className="text-sm font-normal text-[#241F21]">Inquire about due deliveries or report a problem</p>
            </div>
          </div>

          <div className="w-full p-5 rounded-md h-full  bg-[#FEF400] shadow-lg border flex flex-col justify-center align-middle items-center">
            <div className="p-5">
              <LaptopMinimalCheck size={58} className="text-[#241F21]" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h1 className="text-base font-bold text-[#241F21]">Business Enquiries</h1>
              <p className="text-sm font-normal text-[#241F21]">Connect with our team to discuss your needs</p>
            </div>
          </div>

          <div className="w-full p-5 rounded-md h-full  bg-[#FEF400] shadow-lg border flex flex-col justify-center align-middle items-center">
            <div className="p-5">
              <BriefcaseBusiness size={58} className="text-[#241F21]" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h1  className="text-base font-bold text-[#241F21]">Careers</h1>
              <p className="text-sm font-normal text-[#241F21]">Explore opportunities to join our team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCustomerServiceSection;
