import React from "react";
import {
  Package,
  Truck,
  ShoppingCart,
  Globe,
  Airplay,
  Archive,
  MapPin,
} from "lucide-react";

const AboutUsOurServiceSection = () => {
  const services = [
    {
      title: "DHL Courier",
      description:
        "We provide DHL international shipping at competitive rates through our official agent partnership. Send documents and parcels worldwide with reliable door-to-door service, customs compliance, and real-time tracking. Our approach makes DHL affordable for individuals, e-commerce, and businesses in Bangladesh while ensuring fast and secure deliveries.",
      icon: <Package className="w-8 h-8 text-red-500" />,
    },
    {
      title: "FEDEX Courier",
      description:
        "Our FedEx service offers secure, timely international delivery for urgent documents, parcels, and e-commerce shipments. With agent-based lower rates, you enjoy premium service with tracking and customs-compliant deliveries, making global shipping convenient and cost-effective.",
      icon: <Package className="w-8 h-8 text-blue-500" />,
    },
    {
      title: "UPS Courier",
      description:
        "UPS courier services provide reliable international shipping with end-to-end tracking. Businesses and individuals benefit from affordable rates, secure parcel handling, and seamless customs support, making global logistics stress-free and transparent.",
      icon: <Package className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: "ARAMEX Courier",
      description:
        "Aramex shipping is ideal for B2B, e-commerce, and personal parcels. Our agent partnership allows lower rates, full tracking, and hassle-free customs clearance, ensuring reliable and timely international delivery for all customers.",
      icon: <Package className="w-8 h-8 text-green-500" />,
    },
    {
      title: "DPD Courier",
      description:
        "DPD offers Europe-wide tax-paid shipments. Our service ensures cost-effective, tracked delivery for e-commerce and B2B clients, eliminating hidden customs fees. Expand your reach across Europe with transparent and reliable shipping solutions.",
      icon: <Globe className="w-8 h-8 text-purple-500" />,
    },
    {
      title: "Air Freight",
      description:
        "Fast and secure air freight solutions for high-value or urgent shipments. Ideal for businesses needing rapid international transit, with professional handling, customs compliance, and full tracking to ensure parcels arrive safely and on schedule.",
      icon: <Airplay className="w-8 h-8 text-indigo-500" />,
    },
    {
      title: "Sea Freight",
      description:
        "Cost-effective sea freight for heavy or bulk shipments. We provide scheduled deliveries with customs compliance and tracking, making international cargo transport reliable, transparent, and efficient for businesses.",
      icon: <Archive className="w-8 h-8 text-teal-500" />,
    },
    {
      title: "Custom Clearances",
      description:
        "Our customs clearance service ensures hassle-free international shipping. We handle all duties and documentation, preventing delays and ensuring smooth, compliant deliveries. This simplifies global logistics for businesses and individuals alike.",
      icon: <MapPin className="w-8 h-8 text-orange-500" />,
    },
  ];

  return (
    <section className="w-full bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore our courier and logistics solutions for businesses, e-commerce, and individuals. Fast, affordable, and hassle-free international shipping is just a click away.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition duration-300"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm md:text-base">{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/ship-and-track"
            className="inline-block px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
          >
            Start Shipping Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutUsOurServiceSection;