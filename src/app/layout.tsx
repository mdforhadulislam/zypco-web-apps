import { AuthProvider } from "@/hooks/AuthContext";
import { ReFreshTokenProvider } from "@/hooks/ReFreshTokenContext";
import SiteLayout from "@/utilities/SiteLayout";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zypco – International Courier Solutations",
    template: "%s | Zypco",
  },
  description: `Zypco is more than just a courier service — we are your trusted partner for international delivery solutions. Our vision is simple: to make global shipping easier, faster, and more affordable for everyone.
Through our strong network and agency partnerships with leading international couriers like DHL, FedEx, Aramex, UPS, as well as selected local courier companies, Zypco ensures that our customers enjoy premium delivery services at competitive, discounted rates. This unique model allows us to save you money while keeping your parcels safe and on time.

We also provide assistance with GPO (General Post Office) services, giving you even more flexibility and convenience for your shipments.

From the very beginning, Zypco has been committed to customer convenience. Operating with a home-office model, we offer hassle-free pickup from your doorstep and ensure your package is securely delivered to the right courier hub for international dispatch.

At Zypco, we believe shipping should be simple, transparent, and stress-free. Whether you’re sending documents, gifts, or commercial shipments, our mission is to connect Bangladesh with the world — one parcel at a time


Zypco was founded with a clear vision: to make international courier services more affordable, reliable, and accessible in Bangladesh.

We noticed that many people were paying high fees for global shipping without realizing that smarter, cost-saving options existed. With this in mind, Zypco began as a home-office model, built on trust, dedication, and customer convenience.

By partnering with world-renowned courier services such as DHL, FedEx, Aramex, UPS, along with selected local providers, we created a unique network that allows us to deliver the same premium services at discounted rates.

From the very beginning, our focus has been on customer-first solutions: offering doorstep pickup, seamless processing, and safe delivery to the right courier hub. Whether it’s important documents, personal gifts, or commercial shipments, Zypco ensures every package is handled with care.

Today, Zypco continues to grow — but our foundation remains the same: a commitment to connecting Bangladesh with the world, one parcel at a time.


To become a leading international courier company, connecting Bangladesh seamlessly with the world while providing reliable, affordable, and customer-focused shipping solutions.`,
  metadataBase: new URL("https://zypco.com"),
  applicationName: "Zypco – International Courier Solutations",
  generator: "Next.js 15",
  keywords: [
    "Zypco",
    "International",
    "Courier",
    "Solutations",
    "Zypco – International Courier Solutations",
    "DHL Express",
    "FEDEX Express",
    "ARAMEX Express",
    "UPS Express",
  ],
  authors: [{ name: "Forhadul Islam", url: "/" }],
  creator: "Zypco Team",
  publisher: "Zypco – International Courier Solutations",
  category: "International Courier",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Zypco – International Courier Solutations",
    description: `Zypco is more than just a courier service — we are your trusted partner for international delivery solutions. Our vision is simple: to make global shipping easier, faster, and more affordable for everyone.
Through our strong network and agency partnerships with leading international couriers like DHL, FedEx, Aramex, UPS, as well as selected local courier companies, Zypco ensures that our customers enjoy premium delivery services at competitive, discounted rates. This unique model allows us to save you money while keeping your parcels safe and on time.

We also provide assistance with GPO (General Post Office) services, giving you even more flexibility and convenience for your shipments.

From the very beginning, Zypco has been committed to customer convenience. Operating with a home-office model, we offer hassle-free pickup from your doorstep and ensure your package is securely delivered to the right courier hub for international dispatch.

At Zypco, we believe shipping should be simple, transparent, and stress-free. Whether you’re sending documents, gifts, or commercial shipments, our mission is to connect Bangladesh with the world — one parcel at a time


Zypco was founded with a clear vision: to make international courier services more affordable, reliable, and accessible in Bangladesh.

We noticed that many people were paying high fees for global shipping without realizing that smarter, cost-saving options existed. With this in mind, Zypco began as a home-office model, built on trust, dedication, and customer convenience.

By partnering with world-renowned courier services such as DHL, FedEx, Aramex, UPS, along with selected local providers, we created a unique network that allows us to deliver the same premium services at discounted rates.

From the very beginning, our focus has been on customer-first solutions: offering doorstep pickup, seamless processing, and safe delivery to the right courier hub. Whether it’s important documents, personal gifts, or commercial shipments, Zypco ensures every package is handled with care.

Today, Zypco continues to grow — but our foundation remains the same: a commitment to connecting Bangladesh with the world, one parcel at a time.


To become a leading international courier company, connecting Bangladesh seamlessly with the world while providing reliable, affordable, and customer-focused shipping solutions.`,
    url: "https://zypco.com",
    siteName: "Zypco – International Courier Solutations",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Zypco – International Courier Solutations",
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
    title: "Zypco – International Courier Solutations",
    description: `Zypco is more than just a courier service — we are your trusted partner for international delivery solutions. Our vision is simple: to make global shipping easier, faster, and more affordable for everyone.
Through our strong network and agency partnerships with leading international couriers like DHL, FedEx, Aramex, UPS, as well as selected local courier companies, Zypco ensures that our customers enjoy premium delivery services at competitive, discounted rates. This unique model allows us to save you money while keeping your parcels safe and on time.

We also provide assistance with GPO (General Post Office) services, giving you even more flexibility and convenience for your shipments.

From the very beginning, Zypco has been committed to customer convenience. Operating with a home-office model, we offer hassle-free pickup from your doorstep and ensure your package is securely delivered to the right courier hub for international dispatch.

At Zypco, we believe shipping should be simple, transparent, and stress-free. Whether you’re sending documents, gifts, or commercial shipments, our mission is to connect Bangladesh with the world — one parcel at a time


Zypco was founded with a clear vision: to make international courier services more affordable, reliable, and accessible in Bangladesh.

We noticed that many people were paying high fees for global shipping without realizing that smarter, cost-saving options existed. With this in mind, Zypco began as a home-office model, built on trust, dedication, and customer convenience.

By partnering with world-renowned courier services such as DHL, FedEx, Aramex, UPS, along with selected local providers, we created a unique network that allows us to deliver the same premium services at discounted rates.

From the very beginning, our focus has been on customer-first solutions: offering doorstep pickup, seamless processing, and safe delivery to the right courier hub. Whether it’s important documents, personal gifts, or commercial shipments, Zypco ensures every package is handled with care.

Today, Zypco continues to grow — but our foundation remains the same: a commitment to connecting Bangladesh with the world, one parcel at a time.


To become a leading international courier company, connecting Bangladesh seamlessly with the world while providing reliable, affordable, and customer-focused shipping solutions.`,
    images: ["/logo.jpg"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/icon.png",
      },
    ],
  },
  alternates: {
    canonical: "https://zypco.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ReFreshTokenProvider>
            <SiteLayout>{children}</SiteLayout>
          </ReFreshTokenProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
