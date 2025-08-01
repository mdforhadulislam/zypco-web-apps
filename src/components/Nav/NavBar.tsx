
import Link from "next/link";
import Logo from "@/utilities/Logo";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react";
import { Button } from "../ui/button";

const components = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description: "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description: "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description: "Displays a progress indicator, usually as a bar.",
  },
  {
    title: "Scroll Area",
    href: "/docs/primitives/scroll-area",
    description: "A scrollable area for content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description: "Layered content panels shown one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description: "A popup that shows info on hover or focus.",
  },
];

const NavBar = () => {
  return (
    <section className="w-full shadow-sm bg-white z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Logo />

          {/* NavigationMenu */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="space-x-2">

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/" className="font-semibold color-1 hover:bg-1/10 hover:color-1">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>



              <NavigationMenuItem className="font-semibold color-1 hover:bg-1/10 hover:color-1">
                <NavigationMenuTrigger className="font-semibold color-1 hover:bg-1/10 hover:color-1">Ship & Track</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[600px] gap-2 p-2 grid-cols-2">
                    {components.map((component) => (
                      <ListItem key={component.title} href={component.href} title={component.title}>
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>


              
              <NavigationMenuItem className="font-semibold color-1 hover:bg-1/10 hover:color-1">
                <NavigationMenuTrigger className="font-semibold color-1 hover:bg-1/10 hover:color-1">Logistics Solutions</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[600px] gap-2 p-2 grid-cols-2">
                    {components.map((component) => (
                      <ListItem key={component.title} href={component.href} title={component.title}>
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>



              <NavigationMenuItem className="font-semibold color-1 hover:bg-1/10 hover:color-1">
                <NavigationMenuTrigger className="font-semibold color-1 hover:bg-1/10 hover:color-1">About Us</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] p-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/"
                          className="flex h-full w-full flex-col justify-end rounded-md p-4 bg-muted/30 no-underline outline-none select-none focus:shadow-md"
                        >
                          <div className="mb-2 text-lg font-semibold">shadcn/ui</div>
                          <p className="text-sm text-muted-foreground leading-tight">
                            Beautifully designed components built with Tailwind CSS.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/docs" title="Introduction">
                      Reusable components built using Radix UI and Tailwind CSS.
                    </ListItem>
                    <ListItem href="/docs/installation" title="Installation">
                      How to install and structure your app.
                    </ListItem>
                    <ListItem href="/docs/primitives/typography" title="Typography">
                      Styles for text elements.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>


              
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/docs" className="font-semibold color-1 hover:bg-1/10 hover:color-1">Our Service</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>


              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/docs" className="font-semibold color-1 hover:bg-1/10 hover:color-1">Contact</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-6">
          <ul className="hidden lg:flex space-x-4 text-sm font-medium text-gray-700">
            <li>
              <Link href="#career" className="color-2 font-semibold cursor-pointer">Career</Link>
            </li>
            <li>
              <Link href="#corporate"  className="color-2 font-semibold cursor-pointer">Zypco Corporate</Link>
            </li>
          </ul>
          <Button className="bg-2 font-semibold hover:bg-2/70 px-8 py-6 rounded-4xl">Login</Button>
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

export default NavBar;