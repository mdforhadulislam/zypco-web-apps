import { BriefcaseBusiness, Headset, LaptopMinimalCheck } from "lucide-react";

const HomeCustomerServiceSection = () => {
  return (
    <div className="w-full h-auto p-4">
      <div className="container py-4 pb-28 m-auto">
        <div className="w-full h-auto flex flex-col md:flex-row  gap-8 justify-between items-center align-middle">
          <div className="w-full p-10 rounded-md h-full shadow-lg border flex flex-col justify-center align-middle items-center">
            <div className="p-5">
              <Headset size={58} className="color-2" strokeWidth={1.25} />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold color-2">Customer Support</h1>
              <p className="text-base font-normal text-gray-700">Inquire about due deliveries or report a problem</p>
            </div>
          </div>

          <div className="w-full p-10 rounded-md h-full  shadow-lg border flex flex-col justify-center align-middle items-center">
            <div className="p-5">
              <LaptopMinimalCheck size={58} className="color-2 " strokeWidth={1.25} />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold color-2">Business Enquiries</h1>
              <p>Connect with our team to discuss your needs</p>
            </div>
          </div>

          <div className="w-full p-10 rounded-md h-full  shadow-lg border flex flex-col justify-center align-middle items-center">
            <div className="p-5">
              <BriefcaseBusiness size={58} className="color-2" strokeWidth={1.25} />
            </div>
            <div className="text-center">
              <h1  className="text-lg font-bold color-2">Careers</h1>
              <p className="text-base font-normal text-gray-700">Explore opportunities to join our team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCustomerServiceSection;
