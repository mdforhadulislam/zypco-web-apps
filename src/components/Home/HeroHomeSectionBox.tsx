"use client";
import { Calculator, PackagePlus, PackageSearch } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const HeroHomeSectionBox = () => {
  const [activeBox, setActiveBox] = useState({
    calculatorBox: false,
    trackingBox: true,
    createBox: false,
  });
  return (
    <div className="w-full h-auto grid lg:grid-cols-2 lg:grid-rows-1 grid-cols-1 grid-rows-2 justify-between pt-5 ">
      <div className=" w-full lg:w-[95%] bg-white rounded-2xl p-2 shadow-2xl">
        <div className="w-full h-auto flex justify-evenly align-middle items-center">
          <div
            className={`w-full h-auto p-4  ${
              activeBox.calculatorBox && "bg-2 text-white hover:bg-2-90"
            } transition-all duration-300 rounded-tl-lg cursor-pointer flex justify-center align-middle items-center `}
            onClick={() => {
              setActiveBox({
                trackingBox: false,
                createBox: false,
                calculatorBox: true,
              });
            }}
          >
            <Calculator size={38} />
          </div>
          <div
            className={`w-full p-4 ${
              activeBox.trackingBox && "bg-2 text-white hover:bg-2-90"
            } transition-all duration-300 cursor-pointer flex justify-center align-middle items-center`}
            onClick={() => {
              setActiveBox({
                trackingBox: true,
                createBox: false,
                calculatorBox: false,
              });
            }}
          >
            <PackageSearch size={38} />
          </div>
          <div
            className={`w-full p-4 ${
              activeBox.createBox && "bg-2 text-white hover:bg-2-90"
            } transition-all duration-300 cursor-pointer rounded-tr-lg flex justify-center align-middle items-center`}
            onClick={() => {
              setActiveBox({
                trackingBox: false,
                createBox: true,
                calculatorBox: false,
              });
            }}
          >
            <PackagePlus size={38} />
          </div>
        </div>

        {activeBox.calculatorBox && (
          <div className="w-full h-auto bg-2 rounded-b-lg p-3">
            <div>
              <input />
            </div>
          </div>
        )}
        {activeBox.trackingBox && (
          <div className="w-full h-auto bg-2 rounded-b-lg p-3 flex-col flex gap-3">
            <Input className="bg-white text-xl md:text-xl p-4 py-6" />
            <Button className="bg-1 text-white w-full p-6 cursor-pointer text-xl">
              TRACK SHIPPMENT
            </Button>
          </div>
        )}

        {activeBox.createBox && <div></div>}
      </div>

      <div></div>
    </div>
  );
};

export default HeroHomeSectionBox;
