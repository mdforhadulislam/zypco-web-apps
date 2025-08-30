import FooterBar from "@/components/Footer/FooterBar";
import NavBar from "@/components/Nav/NavBar";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zypco – Logistics Solutions",
    template: "%s | Zypco",
  },
  description:
    "Zypco builds modern, fast, and scalable web applications using Next.js 15, React 19, and Tailwind CSS v4.",
  metadataBase: new URL("https://zypco.com"),
  applicationName: "Zypco Web Apps",
  generator: "Next.js 15",
  keywords: [
    "Zypco",
    "Next.js",
    "React 19",
    "Tailwind CSS v4",
    "Web apps",
    "Frontend",
    "Turbopack",
    "Shadcn UI",
    "Modern UI",
    "Developer Tools",
    "Typescript",
    "Performance",
  ],
  authors: [{ name: "Forhadul I slam", url: "/" }],
  creator: "Zypco Team",
  publisher: "Zypco Inc.",
  themeColor: "#0F172A",
  colorScheme: "light",
  category: "technology",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Zypco – Logistics Solutions",
    description:
      "Build powerful and modern frontend apps with Next.js and Tailwind.",
    url: "https://zypco.com",
    siteName: "Zypco Web Apps",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Zypco Web App Preview",
        type: "image/jpeg",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@zypco",
    creator: "@zypco",
    title: "Zypco – Logistics Solutions",
    description:
      "Next.js 15 + React 19 + Tailwind CSS v4 = Lightning fast apps",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: "/fav.jpg",
    shortcut: "/fav.jpg",
    apple: "/fav.jpg",
    other: [
      {
        rel: "mask-icon",
        url: "/fav.jpg",
      },
    ],
  },
  alternates: {
    canonical: "https://zypco.com",
  },
};

export default function LogisticsSolutionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <div className="w-full h-[85px]"></div>
        {children}
        <FooterBar />
      </body>
    </html>
  );
}
