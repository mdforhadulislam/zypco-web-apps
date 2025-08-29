"use client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Logo from "@/utilities/Logo";
import {
  BriefcaseBusiness,
  Building2,
  Calculator,
  Cog,
  Factory,
  Menu,
  PackagePlus,
  PackageSearch,
  ShieldHalf,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface MenuItem {
  title: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

const NavData = [
  {
    title: "Home",
    href: "/",
    items: [],
  },
  {
    title: "Ship & Track",
    href: "/",
    items: [
      {
        title: "Track Shipment",
        href: "/service/track",
        description:
          "Track your parcel in real-time and stay updated throughout its journey.",
        icon: <PackageSearch className="size-5 shrink-0" />,
      },
      {
        title: "Create Shipment",
        href: "/service/create",
        description:
          "Easily create a new shipment and schedule pickups with just a few clicks.",
        icon: <PackagePlus className="size-5 shrink-0" />,
      },
      {
        title: "Calculate Shipping Charge",
        href: "/service/calculate",
        description:
          "Quickly estimate your shipping charges based on weight and destination.",
        icon: <Calculator className="size-5 shrink-0" />,
      },
    ],
  },
  {
    title: "Logistics Solutions",
    href: "/service/logistics",
    items: [
      {
        title: "E-commerce Solutions",
        href: "/service/ecommerce",
        description:
          "Smart and scalable logistics services designed for online businesses and marketplaces.",
        icon: <ShoppingCart className="size-5 shrink-0" />,
      },
      {
        title: "Business Solutions",
        href: "/service/business",
        description:
          "Reliable logistics support to streamline and optimize your business operations.",
        icon: <Building2 className="size-5 shrink-0" />,
      },
      {
        title: "Industry Solutions",
        href: "/service/industry",
        description:
          "Customized logistics services for various industries to meet specific supply chain needs.",
        icon: <Factory className="size-5 shrink-0" />,
      },
    ],
  },
  {
    title: "About Us",
    href: "/about",
    items: [
      {
        title: "Our Story",
        href: "/about/our-story",
        description:
          "Discover how Zypco Courier started and our mission to revolutionize delivery services.",
        icon: <Users className="size-5 shrink-0" />,
      },
      {
        title: "Our Services",
        href: "/about/our-services",
        description:
          "Explore the wide range of courier and logistics services we provide across the globe.",
        icon: <Cog className="size-5 shrink-0" />,
      },
      {
        title: "Our Work Process",
        href: "/about/our-team",
        description:
          "Meet the dedicated professionals driving Zypco Courier’s success and innovation.",
        icon: <BriefcaseBusiness className="size-5 shrink-0" />,
      },
      {
        title: "Our Team",
        href: "/about/our-team",
        description:
          "A passionate team committed to delivering excellence in logistics and customer care.",
        icon: <ShieldHalf className="size-5 shrink-0" />,
      },
    ],
  },
  {
    title: "Contact",
    href: "/contact",
    items: [],
  },

  {
    title: "Career",
    href: "/Career",
    items: [],
  },
  {
    title: "Zypco Corporate",
    href: "/",
    items: [],
  },
];

const NavBar = () => {
  const [navBarScrolled, setNavBarScrolled] = useState<boolean>(false);

  const handleScroll = () => {
    const offset = window.scrollY;

    if (offset > 120) {
      setNavBarScrolled(true);
    } else {
      setNavBarScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // className="shadow-sm  z-[40]"
  return (
    <header
      className={`z-[40] w-full  bg-[#241F21] ${
        navBarScrolled
          ? " fixed w-full h-auto animate-in duration-100 shadow-lg"
          : "animate-in duration-100 w-full lg:px-6 m-auto fixed "
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2  ">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Logo />

          {/* NavigationMenu */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="space-x-1">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    href="/"
                    className="font-semibold text-[#FEF400] hover:text-[#FEF400]"
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem className="font-semibold text-[#FEF400] hover:text-[#FEF400]">
                <NavigationMenuTrigger className="font-semibold text-[#FEF400] hover:text-[#FEF400]">
                  About Us
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-[#241F21] border-[#241F21] border">
                  <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.85fr_1fr] p-2">
                    <li className="row-span-4">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/about"
                          className="flex h-full w-full flex-col justify-end rounded-md p-4 bg-black no-underline outline-none select-none focus:shadow-md"
                          style={{
                            backgroundImage: `url('/icon.png')`,
                            backgroundSize: "80%",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            height: "100%",
                            width: "100%",
                          }}
                        >
                          <div className="mb-2 text-lg font-semibold text-white">
                            Zypco Courier
                          </div>
                          <p className="text-sm   leading-tight text-white/80">
                            Beautifully designed components built with Tailwind
                            CSS.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>

                    {NavData?.[3]?.items.map((component) => (
                      <ListItem
                        key={component.title}
                        href={component.href}
                        title={component.title}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem className="font-semibold text-[#FEF400] hover:text-[#FEF400]">
                <NavigationMenuTrigger className="font-semibold text-[#FEF400] hover:text-[#FEF400]">
                  {NavData?.[1]?.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-[#241F21] border-[#241F21] border">
                  <ul className=" flex w-[800px] gap-2 p-2  ">
                    {NavData?.[1]?.items.map((component) => (
                      <ListItem
                        key={component.title}
                        href={component.href}
                        title={component.title}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                    <li className=" ">
                      <img
                        src={"/logistic.png"}
                        className="w-[380px] h-[160px]"
                        alt="logistic-image"
                      />
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem className="font-semibold text-[#FEF400] hover:text-[#FEF400]">
                <NavigationMenuTrigger className="font-semibold text-[#FEF400] hover:text-[#FEF400]">
                  Logistics Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-[#241F21] border-[#241F21] border">
                  <ul className=" flex w-[800px] gap-2 p-2  ">
                    {NavData?.[2]?.items.map((component) => (
                      <ListItem
                        key={component.title}
                        href={component.href}
                        title={component.title}
                      >
                        {component.description}
                      </ListItem>
                    ))}

                    <li className=" ">
                      <img
                        src={"/solutions.png"}
                        className="w-[380px] h-[160px] rounded-2xl"
                        alt="logistic-image"
                      />
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    href="/contact"
                    className="hover:text-[#FEF400] font-semibold text-[#FEF400] "
                  >
                    Contact
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          <ul className="hidden lg:flex space-x-4 text-sm font-medium text-gray-700">
            <li>
              <Link
                href="/career"
                className="text-[#FEF400] hover:text-[#FEF400]  font-semibold cursor-pointer"
              >
                Career
              </Link>
            </li>
            <li>
              <Link
                href="/corporate"
                className="text-[#FEF400] hover:text-[#FEF400]  font-semibold cursor-pointer"
              >
                Zypco Corporate
              </Link>
            </li>
          </ul>
          <Button className="bg-2 font-semibold  text-[#241F21] bg-[#FEF400]  hover:bg-[#FEF400]/90 px-6 py-6 rounded-4xl">
            Login
          </Button>

          {/* Mobile Menu */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className=" px-6 py-6 hover:text-[#241F21] text-[#FEF400] hover:bg-[#FEF400] bg-[] border border-[#FEF400]"
                  >
                    <Menu className="size-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto ">
                  <SheetHeader className="border-b py-2">
                    <SheetTitle>
                      <a href={"/"} className="flex items-center gap-2">
                        <Logo />
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 p-4 py-1">
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {NavData.map((item) => renderMobileMenuItem(item))}
                    </Accordion>

                    <div className="flex flex-col gap-3"></div>
                  </div>

                  <div className="w-full h-auto flex gap-3 justify-center align-middle items-center">
                    <Button className="px-3 py-6 w-[45%] bg-[#241F21] hover:bg-[#241F21]/80 cursor-pointer font-bold">
                      Login
                    </Button>
                    <Button className="px-3 py-6 w-[45%] bg-[#241F21] hover:bg-[#241F21]/80 cursor-pointer font-bold">
                      SingUp
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block rounded-sm px-3 py-2 transition text-sm font-medium leading-tight"
        >
          <div className="text-white">{title}</div>
          <p className="text-white/80 text-xs">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="  hover:text-[#241F21] flex select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none hover:bg-[#FEF400]/30 group transition-all duration-250"
      href={item.href}
    >
      <div className="text-foreground group-hover:text-[#241F21] transition-all duration-250">
        {item.icon}
      </div>
      <div>
        <div className="text-sm font-semibold ">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug ">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items?.length) {
    return (
      <AccordionItem
        key={item.title}
        value={item.title}
        className="border-b-0 "
      >
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline cursor-pointer text-[#241F21]">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link
      key={item.title}
      href={item.href}
      className="text-md font-semibold cursor-pointer text-[#241F21]"
    >
      {item.title}
    </Link>
  );
};

export default NavBar;
