"use client";
import { AdminData, ModaretorData, UserData } from "@/components/ApiCall/data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useAuth } from "@/hooks/AuthContext";
import Link from "next/link";

const DashBoard = () => {
  const auth = useAuth();

  const headerBar =
    auth.user?.role == "user"
      ? [...UserData.navMain]
      : auth.user?.role == "modaretor"
      ? [...ModaretorData.navMain]
      : auth.user?.role == "admin"
      ? [...AdminData.navMain]
      : [...UserData.navMain];

  console.log(headerBar);

  return (
    <div>
    
        <Carousel className=" pt-1 pb-2 w-auto sm:w-full border-b">
          <CarouselContent className="-ml-1">
            {headerBar.map((item, index) => (
              <CarouselItem
                key={index}
                className="pl-1 md:basis-1/4 basis-1/2 sm:basis-1/3 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7"
              >
                <div className="p-1">
                  <Link
                    href={item.url}
                    className={`w-full h-auto rounded-lg border-[#241F21] border bg-[#FEF400]/10 text-[#241F21] flex justify-center align-middle items-center shadow-3xl py-5 px-1 flex-col gap-1 hover:bg-defult/10 transition-all duration-300 text-center`}
                  >
                    <item.icon size={38} strokeWidth={1.25} />
                    <span className=" text-sm font-semibold">{item.title}</span>
                  </Link>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="w-full h-auto py-2 ">


        </div>
     
    </div>
  );
};

export default DashBoard;
