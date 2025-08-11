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
import { Book, Box, BriefcaseBusiness, Building2, Calculator, Cog, Factory, Menu, PackagePlus, PackageSearch, ShieldHalf, ShoppingCart, Sunset, Trees, Users, Zap } from "lucide-react";
import Link from "next/link";
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
     items:[]
  },
  {
    title: "Ship & Track",
    href: "/",
    items: [
      {
        title: "Track Shipment",
        href: "/track",
        description:
          "Track your parcel in real-time and stay updated throughout its journey.",
        icon:  <PackageSearch className="size-5 shrink-0"  />, 
      },
      {
        title: "Create Shipment",
        href: "/create",
        description:
          "Easily create a new shipment and schedule pickups with just a few clicks.",
        icon: <PackagePlus  className="size-5 shrink-0" />,
      },
      {
        title: "Calculate Shipping Charge",
        href: "/calculate",
        description:
          "Quickly estimate your shipping charges based on weight and destination.",
        icon: <Calculator className="size-5 shrink-0" />,
      },
    ],
  },
  {
    title: "Logistics Solutions",
    href: "/logistics",
    items: [
      {
        title: "E-commerce Solutions",
        href: "/ecommerce",
        description:
          "Smart and scalable logistics services designed for online businesses and marketplaces.",
        icon: <ShoppingCart className="size-5 shrink-0" />,
      },
      {
        title: "Business Solutions",
        href: "/business",
        description:
          "Reliable logistics support to streamline and optimize your business operations.",
        icon: <Building2 className="size-5 shrink-0" />,
      },
      {
        title: "Industry Solutions",
        href: "/industry",
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
        href: "/our-story",
        description:
          "Discover how Zypco Courier started and our mission to revolutionize delivery services.",
        icon: <Users  className="size-5 shrink-0" />,
      },
      {
        title: "Our Services",
        href: "/our-services",
        description:
          "Explore the wide range of courier and logistics services we provide across the globe.",
        icon: <Cog  className="size-5 shrink-0" />,
      },
      {
        title: "Our Work Process",
        href: "/our-team",
        description:
          "Meet the dedicated professionals driving Zypco Courier’s success and innovation.",
        icon: <BriefcaseBusiness className="size-5 shrink-0" />,
      },
      {
        title: "Our Team",
        href: "/our-team",
        description:
          "A passionate team committed to delivering excellence in logistics and customer care.",
        icon: <ShieldHalf className="size-5 shrink-0" />,
      },
    ],
  },
  {
    title: "Contact",
    href: "/contact",
    items:[]
  },

  {
    title:"Career",
    href:"/Career",
       items:[]
  },
  {
    title:"Zypco Corporate",
    href:"/",
    items:[]
  }
];


const NavBar = () => {
  return (
    <section className="w-full shadow-sm bg-white z-50">
      <div className="flex items-center justify-between px-4 py-2 z-30">
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
                    className="font-semibold color-1 hover:bg-1/10 hover:color-1"
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem className="font-semibold color-1 hover:bg-1/10 hover:color-1">
                <NavigationMenuTrigger className="font-semibold color-1 hover:bg-1/10 hover:color-1">
                  About Us
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.85fr_1fr] p-2">
                    <li className="row-span-4">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/"
                          className="flex h-full w-full flex-col justify-end rounded-md p-4 bg-muted/30 no-underline outline-none select-none focus:shadow-md"
                          style={{
                            backgroundImage: `url('/logo.jpg')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            height: "100%",
                            width: "100%",
                          }}
                        >
                          <div className="mb-2 text-lg font-semibold">
                            Zypco Courier
                          </div>
                          <p className="text-sm text-muted-foreground leading-tight">
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

              <NavigationMenuItem className="font-semibold color-1 hover:bg-1/10 hover:color-1">
                <NavigationMenuTrigger className="font-semibold color-1 hover:bg-1/10 hover:color-1">
                  {NavData?.[1]?.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
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

              <NavigationMenuItem className="font-semibold color-1 hover:bg-1/10 hover:color-1">
                <NavigationMenuTrigger className="font-semibold color-1 hover:bg-1/10 hover:color-1">
                  Logistics Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
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
                    href="/docs"
                    className="font-semibold color-1 hover:bg-1/10 hover:color-1"
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
                href="#career"
                className="color-2 font-semibold cursor-pointer"
              >
                Career
              </Link>
            </li>
            <li>
              <Link
                href="#corporate"
                className="color-2 font-semibold cursor-pointer"
              >
                Zypco Corporate
              </Link>
            </li>
          </ul>
          <Button className="bg-2 font-semibold hover:bg-2/70 px-6 py-6 rounded-4xl">
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
                    className="bg-2-10  px-6 py-6 hover:bg-2-90 hover:text-white color-2"
                  >
                    <Menu className="size-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader className="border-b py-2">
                    <SheetTitle>
                      <a
                        href={'/'}
                        className="flex items-center gap-2"
                      >
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
                    <Button className="px-3 py-6 w-[45%] bg-2 font-bold">Login</Button>
                    <Button className="px-3 py-6 w-[45%] bg-2 font-bold">SingUp</Button>

                  </div>

                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
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
          className="block rounded-sm px-3 py-2 hover:bg-muted transition text-sm font-medium leading-tight"
        >
          <div>{title}</div>
          <p className="text-muted-foreground text-xs">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="  hover:color-1 flex select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none hover:bg-1/10 group transition-all duration-250"
      href={item.href}
    >
      <div className="text-foreground group-hover:text-green-700 transition-all duration-250">{item.icon}</div>
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
      <AccordionItem key={item.title} value={item.title} className="border-b-0 ">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline cursor-pointer color-1">
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

  if(item.title == "Career" || item.title=="Zypco Corporate"){
    
  return (
    <a key={item.title} href={item.href} className="text-md font-semibold cursor-pointer color-2">
      {item.title}
    </a>
  );
  }

  return (
    <a key={item.title} href={item.href} className="text-md font-semibold cursor-pointer color-1">
      {item.title}
    </a>
  );
};

export default NavBar;
