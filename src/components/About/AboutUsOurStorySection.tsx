const AboutUsOurStorySection = () => {
  return (
    <div className="w-full h-auto bg-white">
      <section className="container mx-auto px-4 py-20">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className=" text-4xl sm:text-6xl font-extrabold mb-4 text-[#241F21]">Our Story</h2>
          <p className="text-[#241F21]  mx-auto">
            From humble beginnings in Bangladesh to becoming a trusted partner in international logistics — this is our journey.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-[#241F21] ml-6">
          {/* Foundation */}
          <div className="mb-10 ml-6">
            <div className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-[#FEF400] rounded-full"></div>
            <h3 className="text-xl font-semibold">2024 – Foundation</h3>
            <p className="text-[#241F21] mt-2">
              In 2024, Zypco Courier was founded with the mission to make international courier services affordable, reliable, and accessible for all in Bangladesh. At that time, sending parcels abroad through companies like DHL, FedEx, UPS, and Aramex was expensive, complex, and often confusing for small businesses, students, and individuals. Our founder, realized this gap and envisioned a solution that would bridge local customers with world-class courier networks at lower costs. Starting from scratch, we focused on transparency, customer-first service, and building trust. Early days involved extensive research on logistics, customs procedures, and market needs, ensuring every parcel shipped met high standards. This foundation established the core values of affordability, accessibility, and accountability that continue to guide us today.
            </p>
          </div>

          {/* Partnerships */}
          <div className="mb-10 ml-6">
            <div className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-[#FEF400] rounded-full"></div>
            <h3 className="text-xl font-semibold">2025 – Partnerships</h3>
            <p className="text-[#241F21] mt-2">
              In 2025, Zypco Courier became official agents of DHL, FedEx, UPS, Aramex, and DPD, allowing us to offer the same premium international courier services at lower rates. Securing these partnerships required demonstrating our operational reliability and high-quality customer service. By partnering with these global leaders, we provided door-to-door delivery, customs-compliant shipments, and real-time tracking. These strategic alliances enabled small businesses, e-commerce sellers, and individuals to ship internationally without the financial burden of direct high-cost rates. Our agent-based approach also allowed us to introduce Europe-wide tax-paid delivery services via DPD, along with API-based integrations for B2B and e-commerce platforms, further simplifying international logistics.
            </p>
          </div>

          {/* Growth */}
          <div className="mb-10 ml-6">
            <div className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-[#FEF400] rounded-full"></div>
            <h3 className="text-xl font-semibold">2025 – Growth</h3>
            <p className="text-[#241F21] mt-2">
              After establishing trusted partnerships, Zypco Courier expanded operations across Europe, introducing tax-paid shipment solutions that eliminate hidden customs charges for customers. We also developed robust e-commerce and B2B solutions, offering tracking APIs, automated order creation, and real-time status updates online. These innovations enabled businesses to scale globally while maintaining control over shipments. The growth phase strengthened our presence in the international logistics industry, attracted new corporate clients, and solidified our reputation as a reliable and affordable courier service provider from Bangladesh.
            </p>
          </div>

          {/* Today */}
          <div className="mb-10 ml-6">
            <div className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-[#FEF400] rounded-full"></div>
            <h3 className="text-xl font-semibold">Today</h3>
            <p className="text-[#241F21] mt-2">
              Today, Zypco Courier is recognized as a leading courier solution provider in Bangladesh, offering premium international services at competitive rates. We continue to empower businesses, students, and individuals with seamless global shipping, API-enabled tracking, and end-to-end logistics solutions. Our vision is to simplify international shipping, provide transparency, and ensure every parcel reaches its destination safely and on time. With a growing team of experts and a customer-focused approach, Zypco Courier bridges Bangladesh with the world, making global logistics accessible for everyone.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsOurStorySection;