"use client";
import { Input } from "../ui/input";

const HeroHomeSectionBox = () => {
  return (
    <div className="w-full h-auto flex items-center align-middle justify-center pt-5 pb-10 relative z-[20] m-auto">
      <div className=" w-[700px] bg-white rounded-lg shadow-2xl p-1 ">
        <div className=" w-full h-auto p-3 border-b mb-2">
          <div className=" border-[#008000] border rounded-md mb-4 ">
            <Input
              className=" outline-0 border-none p-5 text-lg md:text-lg "
              placeholder="Enter Tracking Number"
            />
            <button className=" text-white rounded-b-md w-full h-auto p-3 bg-1 cursor-pointer">
              Track shipment
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg">Can’t Find Your Order Details?</h3>
          <h4 className="font-medium text-base">
            We have sent your AWB (tracking) number to you via email and
            WhatsApp upon booking the shipment.
          </h4>
        </div>
      </div>
    </div>
  );
};

export default HeroHomeSectionBox;
