"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "John Doe",
    role: "CEO & Founder",
    avatar: "/professional-male-avatar.png",
    quote:
      "This platform has transformed how we manage our business. The results speak for themselves.",
  },
  {
    name: "Jane Doe",
    role: "CTO",
    avatar: "/professional-female-avatar.png",
    quote:
      "Outstanding technical capabilities and seamless integration. Highly recommended for any team.",
  },
  {
    name: "John Smith",
    role: "COO",
    avatar: "/business-professional-avatar.png",
    quote:
      "The efficiency gains we've seen are remarkable. This solution exceeded all our expectations.",
  },
  {
    name: "Jane Smith",
    role: "Tech Lead",
    avatar: "/tech-professional-avatar.png",
    quote:
      "Clean, intuitive interface with powerful features. Perfect for our development workflow.",
  },
  {
    name: "Richard Doe",
    role: "Designer",
    avatar: "/creative-professional-avatar.png",
    quote:
      "Beautiful design and excellent user experience. Everything we needed in one platform.",
  },
  {
    name: "Gordon Doe",
    role: "Developer",
    avatar: "/developer-professional-avatar.png",
    quote:
      "Robust architecture and great developer tools. Makes our job so much easier.",
  },
];

const HomeCustomerReviewSection = () => {
  const [api1, setApi1] = useState<CarouselApi>();
  const [api2, setApi2] = useState<CarouselApi>();

  useEffect(() => {
    if (!api1 || !api2) return;

    const interval1 = setInterval(() => {
      api1.scrollNext();
    }, 3000);

    const interval2 = setInterval(() => {
      api2.scrollPrev();
    }, 3000);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, [api1, api2]);

  return (
    <section className="py-26 w-full h-auto bg-[#241F21] px-4">
      <div className="container m-auto">
        {/* <div className="container flex flex-col items-center gap-6">
          <h2 className="mb-2 text-center text-3xl font-semibold lg:text-5xl text-balance">
            Meet our happy clients
          </h2>
          <p className="text-muted-foreground lg:text-lg">
            All of our 1000+ clients are happy
          </p>
          <Button className="mt-6">Get started for free</Button>
        </div> */}

        <div className="lg:container m-auto">
          <div className="mt-5 space-y-4">
            {/* First carousel row - slides right */}
            <Carousel
              className="w-full"
              setApi={setApi1}
              opts={{
                align: "center",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem
                    key={`row1-${index}`}
                    className="pl-4 basis-auto "
                  >
                    <Card className="max-w-68 p-3 select-none bg-[#FEF400]">
                      <div className="mb-2 flex gap-4 items-center align-middle">
                        <Avatar className="size-9 ring-1 ring-input">
                          <AvatarImage
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                          />
                          <AvatarFallback>
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                       
                          <p className="font-medium text-lg">
                            {testimonial.name}
                          </p>
                          {/* <p className="text-muted-foreground">{testimonial.role}</p> */}
                       
                      </div>
                      <blockquote className="text-sm">
                        &ldquo;{testimonial.quote}&ldquo;
                      </blockquote>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Second carousel row - slides left */}
            <Carousel
              className="w-full"
              setApi={setApi2}
              opts={{
                align: "center",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem
                    key={`row2-${index}`}
                    className="pl-4 basis-auto"
                  >
                    <Card className="max-w-68 p-3 select-none bg-[#FEF400]">
                      <div className="mb-2 flex gap-4 items-center align-middle">
                        <Avatar className="size-9 ring-1 ring-input">
                          <AvatarImage
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                          />
                          <AvatarFallback>
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                     
                          <p className="text-lg font-medium">{testimonial.name}</p>
                          
                    
                      </div>
                      <blockquote className="text-sm">
                        &quot;{testimonial.quote}&quot;
                      </blockquote>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCustomerReviewSection;
