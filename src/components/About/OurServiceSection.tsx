import Image from "next/image";

const searvices = [
  {
    title: "DHL Courier",
    description:
      "Zypco offers premium DHL courier services, providing fast, reliable, and secure international shipping. Whether sending personal parcels, important documents, or business consignments, DHL ensures your shipments reach their destination quickly. With door-to-door pickup, real-time tracking, and careful handling, customers can trust that their packages are safe at every step. Zypco’s partnership with DHL allows us to offer these top-tier services at competitive rates, making global shipping accessible to everyone in Bangladesh.",
    logo: "/dhl-logo.png",
  },
  {
    title: "FedEx Courier",
    description:
      "Through Zypco, FedEx courier services are made convenient and affordable for individuals and businesses alike. FedEx specializes in express delivery solutions, ensuring urgent parcels reach their destination on time. Zypco provides full support including door-to-door pickup, tracking updates, and assistance with customs clearance. From sending gifts to exporting commercial goods, FedEx through Zypco guarantees reliability, efficiency, and security for every shipment.",
    logo: "/fedex-logo.png",
  },
  {
    title: "UPS Courier",
    description:
      "UPS is a globally trusted courier known for timely and dependable delivery. Zypco brings UPS services to Bangladesh with the convenience of doorstep pickup, real-time parcel tracking, and secure handling of fragile or valuable items. Businesses and individuals benefit from UPS’s extensive international network, ensuring shipments reach over 220 countries. With Zypco, UPS shipping becomes more cost-effective while maintaining the same high-quality service.",
    logo: "/ups-logo.png",
  },
  {
    title: "Aramex Courier",
    description:
      "Zypco offers Aramex courier services for customers seeking flexible, cost-effective international shipping solutions. Aramex is ideal for medium-sized parcels and regular shipments to multiple countries. Zypco handles the entire process, from pickup to delivery, including customs documentation. With competitive rates and a reliable international network, Aramex via Zypco ensures your shipments are handled efficiently, safely, and affordably.",
    logo: "/aramex-logo.png",
  },
  {
    title: "DPD Courier",
    description:
      "DPD specializes in fast, efficient shipping across Europe, and Zypco provides access to this service for Bangladeshi customers. DPD offers real-time tracking, delivery notifications, and secure handling to ensure packages arrive on time. Whether for e-commerce orders or personal parcels, DPD through Zypco guarantees reliability and ease of shipping to European destinations, making international deliveries simpler and faster.",
    logo: "/dpd-logo.png",
  },
  {
    title: "Air Freight",
    description:
      "Zypco’s air freight service provides a fast, reliable solution for large or urgent shipments. Businesses and individuals can ship bulk or oversized cargo internationally with confidence. Zypco handles the logistics from pickup to delivery, including all necessary documentation and customs requirements. Air freight ensures time-sensitive shipments reach their destination quickly, making it ideal for high-priority goods that cannot wait for sea transport.",
    logo: "/dpd-logo.png",
  },
  {
    title: "Sea Freight",
    description:
      "For heavy or bulk shipments, Zypco offers sea freight services, the most cost-effective option for large-scale international shipping. Perfect for commercial consignments, machinery, or personal goods, sea freight allows customers to ship large volumes safely. Zypco manages container booking, port handling, documentation, and customs clearance, providing a smooth end-to-end solution for importers and exporters looking for affordable and reliable shipping.",
    logo: "/dpd-logo.png",
  },
  {
    title: "Customs Clearance",
    description:
      "Zypco ensures smooth customs processing for all international shipments, minimizing delays and avoiding unnecessary charges. Our team handles all duties, taxes, and regulatory compliance, so customers don’t have to worry about complicated procedures. Integrated with our courier and freight services, Zypco’s customs clearance ensures packages pass borders efficiently, safely, and legally, providing peace of mind for every shipment.",
    logo: "/custom-clearance.png",
  },
];

const OurServiceSection = () => {
  return (
    <section className="w-full h-auto p-4">
      <div className="container py-20 m-auto">
        <div className="w-full h-auto flex justify-center align-middle">
          <h1 className="text-4xl sm:text-5xl font-bold">OUR SERVICES</h1>
        </div>

        <div className="w-full h-auto flex flex-col gap-4 mt-14">
          {searvices.map((service, index) => (
            <div
              key={index}
              className="w-full h-auto p-4 border-b border-gray-200"
            >
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-65 h-40">
                  {" "}
                  <Image
                    width={200}
                    height={200}
                    alt={service.title}
                    src={service.logo}
                    className="w-70 h-36 object-contain"
                  />
                </div>
                <div className="w-auto">
                  <h2 className="text-xl font-semibold">{service.title}</h2>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurServiceSection;
