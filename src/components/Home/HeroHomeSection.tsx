import Globe from "../ui/globe";
import HeroHomeSectionBox from "./HeroHomeSectionBox";

const HeroHomeSection = () => {
  return (
    <div className="w-full h-auto bg-1">
  
      <div className="container m-auto p-4 relative overflow-hidden">
            <Globe
  theta={0.2}
  dark={1}
  scale={1.2}
  diffuse={1.5}
  baseColor="#c10a0a"
  markerColor="#c10a0a"
  glowColor="#c10a0a"
  className={` container left-0 absolute -bottom-[30%] sm:-bottom-[60%] md:-bottom-[80%] lg:-bottom-[110%] xl:-bottom-[200%] m-auto`}
/>

        <div className="w-full h-auto pt-8 sm:pt-14 pb-5 z-[10] relative flex justify-center text-center align-middle items-center flex-col">
          <h1 className="text-5xl sm:text-5xl  font-extrabold text-white overflow-hidden z-[10]">
            ZYPCO COURIER SOLUTATIONS
          </h1>
          <h3 className="text-base sm:text-2xl md:text-3xl font-semibold text-white z-[10]">
            ZIP IT SHIP IT ZYPCO
          </h3>
        </div>
        <HeroHomeSectionBox />
      </div>
    </div>
  );
};

export default HeroHomeSection;
