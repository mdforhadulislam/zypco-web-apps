"use client";
import { Input } from "../ui/input";

const HeroHomeSectionBox = () => {
  return (
    <div className="w-full h-auto flex items-center align-middle justify-center pt-5 pb-36 sm:pb-24 relative z-[20] m-auto">
      <div className=" w-[650px] bg-white rounded-lg shadow-2xl p-1 ">
        <div className=" w-full h-auto p-3 border-b border-[#FEF400] mb-2">
          <div className=" border-[#FEF400] border rounded-lg mb-3">
            <Input
              className=" outline-0 border-none p-5 text-lg md:text-lg "
              placeholder="Enter Tracking Number"
            />
            <button className=" text-[#241F21] font-semibold rounded-b-md w-full h-auto p-3 bg-[#FEF400] cursor-pointer">
              Track shipment
            </button>
          </div>
        </div>

        <div className="p-4 pt-2">
          <h3 className="font-bold text-base md:text-lg">Can’t Find Your Order Details?</h3>
          <h4 className="font-medium text-sm md:text-base">
            We have sent your AWB (tracking) number to you via email and
            WhatsApp upon booking the shipment.
          </h4>
        </div>
      </div>
    </div>
  );
};

export default HeroHomeSectionBox;
