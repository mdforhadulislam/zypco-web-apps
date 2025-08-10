"use client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const HeroHomeSectionBox = () => {
 
  return (
    <div className="w-full h-auto flex items-center align-middle justify-center pt-5 pb-12 relative z-[20] m-auto">
      <div className=" w-[700px] bg-white rounded-lg shadow-2xl p-2 ">

        <div>

<div className=" border-[#008000] border rounded-md mb-5">
  <Input className=" outline-0 border-none p-5 text-lg md:text-lg" />
  <Button className="w-full h-auto p-3 bg-1 rounded-t-0 rounded-0 cursor-pointer">Track shipment</Button>
</div>



        </div>

        
        

      </div>
    </div>
  );
};

export default HeroHomeSectionBox;
