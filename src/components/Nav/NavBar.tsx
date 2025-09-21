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
import { useAuth } from "@/hooks/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import Logo from "@/utilities/Logo";
import {
  BadgeCheck,
  Building2,
  Calculator,
  ChevronsUpDown,
  Factory,
  LogOut,
  Menu,
  PackagePlus,
  PackageSearch,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
  setMobileMenuOpen?: (open: boolean) => void;
}

const NavData = [
  {
    title: "Home",
    href: "/",
    items: [],
  },
  {
    title: "Ship & Track",
    href: "/ship-and-track",
    items: [
      {
        title: "Track Shipment",
        href: "/ship-and-track/track-shipment",
        description:
          "Track your parcel in real-time and stay updated throughout its journey.",
        icon: <PackageSearch className="size-5 shrink-0" />,
      },
      {
        title: "Create Shipment",
        href: "/ship-and-track/create-shipment",
        description:
          "Easily create a new shipment and schedule pickups with just a few clicks.",
        icon: <PackagePlus className="size-5 shrink-0" />,
      },
      {
        title: "Calculate Shipping Charge",
        href: "/ship-and-track/claculate-shipping-charge",
        description:
          "Quickly estimate your shipping charges based on weight and destination.",
        icon: <Calculator className="size-5 shrink-0" />,
      },
    ],
  },
  {
    title: "Logistics Solutions",
    href: "/logistics-solutions",
    items: [
      {
        title: "E-commerce Solutions",
        href: "/logistics-solutions/e-commerce-solutions",
        description:
          "Smart and scalable logistics services designed for online businesses and marketplaces.",
        icon: <ShoppingCart className="size-5 shrink-0" />,
      },
      {
        title: "Business Solutions",
        href: "/logistics-solutions/bussiness-solution",
        description:
          "Reliable logistics support to streamline and optimize your business operations.",
        icon: <Building2 className="size-5 shrink-0" />,
      },
      {
        title: "Industry Solutions",
        href: "/logistics-solutions/industry-solutions",
        description:
          "Customized logistics services for various industries to meet specific supply chain needs.",
        icon: <Factory className="size-5 shrink-0" />,
      },
    ],
  },
  // {
  //   title: "About Us",
  //   href: "/about",
  //   items: [
  //     {
  //       title: "Our Story",
  //       href: "/about/our-story",
  //       description:
  //         "Discover how Zypco Courier started and our mission to revolutionize delivery services.",
  //       icon: <Users className="size-5 shrink-0" />,
  //     },
  //     {
  //       title: "Our Services",
  //       href: "/about/our-services",
  //       description:
  //         "Explore the wide range of courier and logistics services we provide across the globe.",
  //       icon: <Cog className="size-5 shrink-0" />,
  //     },
  //     {
  //       title: "Our Work Process",
  //       href: "/about/our-work-process",
  //       description:
  //         "Meet the dedicated professionals driving Zypco Courier’s success and innovation.",
  //       icon: <BriefcaseBusiness className="size-5 shrink-0" />,
  //     },
  //     {
  //       title: "Our Team",
  //       href: "/about/our-team",
  //       description:
  //         "A passionate team committed to delivering excellence in logistics and customer care.",
  //       icon: <ShieldHalf className="size-5 shrink-0" />,
  //     },
  //   ],
  // },
  {
    title: "API Integration",
    href: "/contact",
    items: [],
  },
  {
    title: "Contact",
    href: "/contact",
    items: [],
  },

  {
    title: "Career",
    href: "/career",
    items: [],
  },
  {
    title: "Zypco Corporate",
    href: "/zypco-corporate",
    items: [],
  },
];

const NavBar = () => {
  const [navBarScrolled, setNavBarScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const router = useRouter();

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
      className={`z-[40] w-full  bg-white border-b ${
        navBarScrolled
          ? " fixed w-full h-auto animate-in duration-100 shadow-lg"
          : "animate-in duration-100 w-full lg:px-6 m-auto fixed "
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2  ">
        {/* Logo */}
        <div className="flex items-center gap-8">
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
                    className="font-semibold text-black hover:text-black"
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* <NavigationMenuItem className="font-semibold text-black hover:text-black">
                <NavigationMenuTrigger className="font-semibold text-black hover:text-black">
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
              </NavigationMenuItem> */}

              <NavigationMenuItem className="font-semibold text-black hover:text-black">
                <NavigationMenuTrigger className="font-semibold text-black hover:text-black">
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

              <NavigationMenuItem className="font-semibold text-black hover:text-black">
                <NavigationMenuTrigger className="font-semibold text-black hover:text-black">
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
                    className="hover:text-black font-semibold text-black "
                  >
                    API Integration
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    href="/contact"
                    className="hover:text-black font-semibold text-black "
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
                className="text-black hover:text-black  font-semibold cursor-pointer"
              >
                Career
              </Link>
            </li>
            <li>
              <Link
                href="/zypco-corporate"
                className="text-black hover:text-black  font-semibold cursor-pointer"
              >
                Zypco Corporate
              </Link>
            </li>
          </ul>
          {user?.token && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="h-13 w-full">
                <Avatar className="h-12 w-12  rounded-full cursor-pointer">
                  <AvatarImage src={""} alt={user.name} />
                  <AvatarFallback className="rounded-full bg-black text-white">
                    {user.name.split("")[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "bottom"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={""} alt={user.name} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      router.push("/dashboard");
                    }}
                  >
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    logout();

                    router.push("/");
                  }}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!user?.token && (
            <Link
              href={"/auth/login"}
              className="bg-2 font-semibold  text-[#FEF400] bg-black  hover:bg-black/90 px-6 py-3 rounded-4xl"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className=" px-6 py-6  text-black hover:bg-black hover:text-[#FEF400] border border-black cursor-pointer"
                  >
                    <Menu className="size-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="overflow-y-auto ">
                  <SheetHeader className="border-b py-2">
                    <SheetTitle>
                      <div
                        className="flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Logo />
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 p-4 py-1">
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {NavData.map((item) =>
                        renderMobileMenuItem({ ...item, setMobileMenuOpen })
                      )}
                    </Accordion>

                    <div className="flex flex-col gap-3"></div>
                  </div>
                  <div className=" relative w-full h-full">
                    <div className="px-4 w-full absolute bottom-3">
                      {user?.token && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild className="h-13 w-full">
                            <Button
                              size="lg"
                              className="bg-white text-black hover:bg-white p-2 shadow-4xl"
                            >
                              <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={""} alt={user.name} />
                                <AvatarFallback className="rounded-lg">
                                  {user.name.split("")[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                  {user.name}
                                </span>
                                <span className="truncate text-xs">
                                  {user.email}
                                </span>
                              </div>
                              <ChevronsUpDown className="ml-auto size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                          >
                            <DropdownMenuLabel className="p-0 font-normal">
                              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                  <AvatarImage src={""} alt={user.name} />
                                  <AvatarFallback className="rounded-lg">
                                    CN
                                  </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                  <span className="truncate font-medium">
                                    {user.name}
                                  </span>
                                  <span className="truncate text-xs">
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                  router.push("/dashboard");
                                }}
                              >
                                <BadgeCheck />
                                Account
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                logout();
                                router.push("/");
                              }}
                            >
                              <LogOut />
                              Log out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {!user?.token && (
                        <div className="w-full h-auto flex gap-3 justify-center align-middle items-center">
                          <Link
                            href={"/auth/login"}
                            className="px-3 py-4 flex justify-center align-middle items-center w-[48%] bg-[#241F21] hover:bg-[#241F21]/80 cursor-pointer font-bold text-white rounded-lg"
                          >
                            Login
                          </Link>
                          <Link
                            href={"/auth/register"}
                            className="px-3 py-4 text-white w-[48%] bg-[#241F21] hover:bg-[#241F21]/80 rounded-lg cursor-pointer font-bold flex justify-center align-middle items-center"
                          >
                            SingUp
                          </Link>
                        </div>
                      )}
                    </div>
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
    <Link
      className="  hover:text-[#241F21] flex select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none hover:bg-black/30 group transition-all duration-250"
      href={item.href}
      onClick={() => item.setMobileMenuOpen?.(false)}
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
    </Link>
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
        <AccordionContent
          className="mt-2"
          onClick={() => item.setMobileMenuOpen?.(false)}
        >
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
      onClick={() => item.setMobileMenuOpen?.(false)}
    >
      {item.title}
    </Link>
  );
};

export default NavBar;
