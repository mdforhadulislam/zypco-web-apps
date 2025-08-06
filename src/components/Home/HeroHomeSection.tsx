import HeroHomeSectionBox from "./HeroHomeSectionBox";

const HeroHomeSection = () => {
  return (
    <div className="w-full h-auto bg-1">
      <div className="container m-auto md:h-[60vh] p-4">
        <div className="w-full h-auto pt-20 pb-5">
          <h1 className="text-5xl sm:text-5xl  font-extrabold text-white overflow-hidden">
            ZYPCO COURIER SOLUTATIONS
          </h1>
          <h3 className="text-base sm:text-2xl md:text-3xl font-semibold text-white ">
            ZIP IT SHIP IT ZYPCO
          </h3>
        </div>
        <HeroHomeSectionBox />
      </div>
    </div>
  );
};

export default HeroHomeSection;
