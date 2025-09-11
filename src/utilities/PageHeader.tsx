import Globe from "@/components/ui/globe";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  mainLink?: string;
  subLink?: string;
}

const PageHeader = ({
  title,
  subtitle,
  mainLink = "/",
  subLink = "/",
}: PageHeaderProps) => {
  return (
    <div className="container m-auto h-auto bg-[#241F21] relative overflow-hidden">
      <div className="flex flex-col py-32 sm:py-28 px-4 z-[20] container m-auto">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white z-[20]">
          {subtitle}
        </h1>
        <div className="text-xl sm:text-2xl font-extrabold text-gray-300 z-[20]">
          <Link href="/">HOME</Link> / <Link href={mainLink}>{title}</Link>
          {subtitle !== title ? <Link href={subLink}> / {subtitle}</Link> : null}
        </div>
      </div>
      <Globe
        theta={0.2}
        dark={1}
        scale={1.2}
        diffuse={1.5}
        baseColor="#FEF400"
        markerColor="#FEF400"
        glowColor="#FEF400"
        className={` container left-0 absolute -bottom-[65%] sm:-bottom-[120%] md:-bottom-[160%] lg:-bottom-[240%] xl:-bottom-[310%] 2xl:-bottom-[390%] m-auto`}
      />
    </div>
  );
};

export default PageHeader;
