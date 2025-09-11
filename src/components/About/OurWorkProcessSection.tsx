import Image from "next/image";

const processStep = [
  {
    img: "/Choose Shipment.png",
    title: "Get a Quote",
    details:
      "With Zypco, you can instantly get clear and affordable shipping quotes for 220+ countries. Our system ensures you always find the most cost-effective and reliable option tailored to your needs.",
  },
  {
    img: "/pickup.png",
    title: "Pick",
    details:
      "Zypco offers hassle-free doorstep pickup from anywhere in Bangladesh. Our professional team ensures timely collection and safe handling of your shipments right from your home or office.",
  },
  {
    img: "/pack.png",
    title: "Pack",
    details:
      "At Zypco, we follow international packaging standards to keep your parcels safe. Whether fragile goods, important documents, or bulk items, Zypco ensures everything is packed securely for global transit.",
  },
  {
    img: "/Pack and ship.png",
    title: "Ship",
    details:
      "Your shipments are shipped smoothly through Zypco’s trusted global network, including DHL, FedEx, UPS, and Aramex. Zypco guarantees fast, stress-free, and reliable shipping every time.",
  },
  {
    img: "/Track.png",
    title: "Track",
    details:
      "Stay connected with Zypco’s advanced real-time tracking system. From pickup to delivery, Zypco keeps you informed at every stage, giving you complete peace of mind.",
  },
];

const featuresData = [
  {
    id: 14535,
    title: "Global Reach",
    icon: "/1.png",
    details:
      "Zypco connects Bangladesh to 220+ destinations worldwide through DHL, FedEx, UPS, Aramex, and DPD. Customers enjoy affordable rates, fast delivery, and reliable services for parcels, cargo, and documents with complete confidence.",
  },
  {
    id: 265553,
    title: "All-in-One",
    icon: "/2.png",
    details:
      "Zypco offers courier, freight, and customs clearance under one roof. With advanced systems and global tie-ups, we ensure smooth, affordable, and secure logistics for individuals and businesses across Bangladesh.",
  },
  {
    id: 3363432,
    title: "24/7 Support",
    icon: "/3.png",
    details:
      "Zypco’s customer care team provides instant help with booking, tracking, and customs queries. Our customer-first approach ensures every shipment is handled smoothly and professionally from start to finish.",
  },
  {
    id: 443536,
    title: "Smart Shipping",
    icon: "/4.png",
    details:
      "Zypco makes logistics easy with transparent pricing, clear timelines, and flexible shipping options. Customers save time and cost by letting our experts handle transportation efficiently and reliably.",
  },
  {
    id: 5435362,
    title: "Premium Quality",
    icon: "/5.png",
    details:
      "From pickup to delivery, Zypco maintains global standards. Businesses and individuals trust us for secure, timely, and high-quality shipping solutions that continuously evolve with modern technology.",
  },
  {
    id: 645645756,
    title: "Safe Delivery",
    icon: "/6.png",
    details:
      "Zypco ensures complete safety with quality packaging, trusted partners, and careful handling. Fragile, valuable, or important shipments are always protected against risks throughout the journey.",
  },
  {
    id: 75464654,
    title: "Pro Team",
    icon: "/7.png",
    details:
      "Zypco’s expert staff specialize in courier, freight, and customs. Their knowledge of global regulations ensures every shipment is handled smoothly, offering clients stress-free logistics support.",
  },
  {
    id: 8436456,
    title: "Global Partners",
    icon: "/8.png",
    details:
      "Zypco partners with DHL, FedEx, UPS, Aramex, and DPD to deliver fast, reliable, and cost-effective shipping. These tie-ups combine world-class networks with Zypco’s local support.",
  },
  {
    id: 956464,
    title: "Clear Process",
    icon: "/9.png",
    details:
      "Zypco values transparency with honest pricing, accurate timelines, and trustworthy updates. Our ethical operations ensure customers experience safe, reliable, and hassle-free international shipping.",
  },
];

const OurWorkProcessSection = () => {
  return (
    <section className="w-full h-auto p-4">
      <div className="container py-22 m-auto">
        <h1 className="text-2xl md:text-4xl sm:text-3xl lg:text-5xl text-center font-bold">
          Easy & Stress-Free Shipping with Zypco
        </h1>

        <div className="w-full h-auto p-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center align-top justify-start py-10 pt-16">
          {processStep.map((item) => (
            <div
              key={item.title}
              className="w-full h-full p-1 flex-col flex items-center gap-2 group"
            >
              <div className="w-[160px] h-[160px] p-6 rounded-full shadow-3xl flex flex-col items-center align-middle justify-center">
                <Image
                  width={110}
                  height={70}
                  className="w-[110px] h-[70px]"
                  src={item.img}
                  alt={item.title}
                />
              </div>
              <h1 className="sm:text-lg text-base text-center font-semibold text-gray-800 group-hover:text-defult transition-all duration-200">
                {item.title}
              </h1>
              <p className="text-[12px] sm:text-sm text-center text-gray-500 group-hover:text-gray-800 transition-all duration-200">
                {item.details}
              </p>
            </div>
          ))}
        </div>

        <div className="container h-auto m-auto py-8 pb-0">
          <div className="w-full h-auto text-center flex flex-col justify-center align-middle items-center py-12">
            <h1 className="text-2xl md:text-4xl sm:text-3xl lg:text-5xl text-center font-bold">
              ZYPCO ADVANTAGES
            </h1>
            <p className="md:w-[600px] w-full px-8 h-auto flex justify-center align-middle items-center text-base">
              Your needs drive our strategies—Zypco designs solutions that make
              global shipping easier, faster, and more reliable.
            </p>
          </div>

          <div className="w-full h-auto px-2 py-4 grid sm:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4 pb-5">
            {featuresData.map(({ title, icon, id, details }) => {
              return (
                <div key={id} className="w-full h-full p-2 pb-0">
                  <div className="w-full h-full p-4 pb-2 shadow-3xl rounded-lg border">
                    <div className="w-full h-auto flex justify-center align-middle items-center p-3 pt-2">
                      <Image width={100} height={100} src={icon} alt={title} />
                    </div>
                    <div className="w-full h-full p-2 ">
                      <h1
                        className={` mb-3 text-gray-900 text-xl font-semibold`}
                      >
                        {title}
                      </h1>
                      <p
                        className={`font-normal text-gray-800 text-justify text-base`}
                      >
                        {details}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurWorkProcessSection;
