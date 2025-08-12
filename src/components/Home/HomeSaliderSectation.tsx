"use client";
import React from 'react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

const slider_image = [
  { id: 135, src: "/slider.jpg" },
  { id: 2345, src: "/slider.jpg" },
  { id: 123, src: "/slider.jpg" },
  { id: 234, src: "/slider.jpg" },
  { id: 156, src: "/slider.jpg" },
  { id: 278, src: "/slider.jpg" },
  
  { id: 1535, src: "/slider.jpg" },
  { id: 267, src: "/slider.jpg" },
  { id: 165, src: "/slider.jpg" },
  { id: 243, src: "/slider.jpg" },
  { id: 121, src: "/slider.jpg" },
  { id: 23456, src: "/slider.jpg" },




];
 


const HomeSaliderSectation = () => {
  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="w-full h-auto py-16 bg-white px-5">
      <div className="container h-auto m-auto p-10">
        <Carousel setApi={setApi}>
          <CarouselContent>
            {slider_image.map((item) => (
              <CarouselItem key={item.id}>
                <div
                  className="w-full h-[230px] md:h-[480px] p-2 bg-cover rounded-lg bg-no-repeat bg-center"
                  style={{ backgroundImage: `url(${item.src})` }}
                ></div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}



export default HomeSaliderSectation