import Logo from "@/utilities/Logo";
import Link from "next/link";
import { FaTwitter, FaYoutube } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { IoLogoLinkedin } from "react-icons/io5";
import { LuInstagram } from "react-icons/lu";

const solutionsFeatures = [
  {
    id: 35681,
    title: "DHL Courier",
    link: "/about/our-services/",
  },

  {
    id: 35682,
    title: "FEDEX Courier",
    link: "/about/our-services/",
  },

  {
    id: 35683,
    title: "UPS Courier",
    link: "/about/our-services/",
  },

  {
    id: 35684,
    title: "ARAMEX Courier",
    link: "/about/our-services/",
  },
  {
    id: 35685,
    title: "DPD Courier",
    link: "/about/our-services/",
  },
  {
    id: 1213,
    title: "Air Freight",
    link: "/about/our-services/",
  },
  {
    id: 35686,
    title: "Sea Freight",
    link: "/about/our-services/",
  },
  {
    id: 4668,
    title: "Custom Clearnces",
    link: "/about/our-services/",
  },
  {
    id: 565465,
    title: "Shipment Tracking",
    link: "/ship-and-track/track-shipment",
  },
  {
    id: 5654658,
    title: "Courier Price Check",
    link: "/ship-and-track/claculate-shipping-charge",
  },
];

const ourCompany = [
  {
    id: 123451345,
    title: "About Zypco",
    link: "/about/",
  },
  {
    id: 1234513677,
    title: "Our Story",
    link: "/about/our-story",
  },

  {
    id: 1234513886,
    title: "Our Team",
    link: "/about/our-team",
  },
  {
    id: 12342457,
    title: "Our Services",
    link: "/about/oour-services",
  },
  {
    id: 12342457,
    title: "Our Work Process",
    link: "/about/our-work-process",
  },
  {
    id: 565343465,
    title: "Help & Support",
    link: "/about/help-and-support/",
  },
  {
    id: 565434654,
    title: "Trust & Safety",
    link: "/about/trust-and-safety/",
  },
  {
    id: 5623542653,
    title: "Privacy Policy",
    link: "/about/privacy-policy/",
  },
  {
    id: 5623542652,
    title: "Refund Policy",
    link: "/about/refund-policy/",
  },
];

const FooterBar = () => {
  return (
    <footer className="w-full h-auto bg-white">
      <div className="container h-auto m-auto p-5">
        <div className="w-full h-auto p-2 py-6">
          <div className="w-full h-auto grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-5">
            <div className="lg:border-r border-[#241F21] border-dashed">
              <div className={"flex gap-4 pb-4"}>
                <Logo isFooter={true} width={100} height={120} />
              </div>

              <div className="text-sm font-semibold pr-2 text-[#241F21] py-1">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Perferendis ratione delectus quae consequatur officiis modi qui
                quasi quisquam aperiam quia cum cupiditate, consectetur ut magni
                omnis maxime consequuntur animi dignissimos blanditiis ab iste
              </div>

              <div className="flex justify-start align-middle items-center gap-3 py-2">
                <Link
                  href={"#"}
                  target="_blank"
                  className="w-10 h-10 p-1 bg-white rounded-full shadow-3xl flex justify-center align-middle items-center "
                >
                  <FaFacebook className="w-8 h-8 text-blue-600 shadow-3xl" />
                </Link>
                <Link
                  href={"#"}
                  target="_blank"
                  className="w-10 h-10 p-[6px] bg-white rounded-full shadow-3xl  flex justify-center align-middle items-center"
                >
                  <LuInstagram className="w-8 h-8 text-red-600 shadow-3xl" />
                </Link>
                <Link
                  href={"#"}
                  target="_blank"
                  className="w-10 h-10 p-[6px] bg-white rounded-full shadow-3xl  flex justify-center align-middle items-center"
                >
                  <FaTwitter className="w-8 h-8 text-blue-600 shadow-3xl" />
                </Link>
                <Link
                  href={"#"}
                  target="_blank"
                  className="w-10 h-10 p-[7px] bg-white rounded-full shadow-3xl  flex justify-center align-middle items-center"
                >
                  <IoLogoLinkedin className="w-8 h-8 text-blue-600 shadow-3xl" />
                </Link>
                <Link
                  href={"#"}
                  target="_blank"
                  className="w-10 h-10 p-[4px] bg-white rounded-full shadow-3xl  flex justify-center align-middle items-center"
                >
                  <FaYoutube className="w-9 h-9 text-red-600 shadow-3xl" />
                </Link>
              </div>
            </div>
            <div className="group lg:border-r border-[#241F21] border-dashed relative">
              <h3 className=" text-lg text-[#241F21] font-semibold ">
                Solutions
              </h3>

              <span className="group-hover:w-[200px] w-[120px] transition-all duration-600 h-[2px] bg-[#241F21] block"></span>

              <ul className="w-full h-auto text-gray-600 py-2 pt-4 ">
                {solutionsFeatures.map((item, index) => (
                  <li
                    key={index}
                    className="py-1 flex justify-start items-center align-middle gap-2"
                  >
                    <IoIosArrowForward className="w-5 h-5 hover:text-[#241F21] duration-300 transition-all" />

                    <Link
                      href={item.link}
                      className=" text-base hover:text-[#241F21] duration-300 transition-all hover:underline"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="group ">
              <h3 className=" text-lg text-[#241F21] ">Our Company</h3>

              <span className="group-hover:w-[200px] w-[120px] transition-all duration-600 h-[2px] bg-[#241F21] block"></span>

              <ul className="w-full h-auto text-gray-600 py-2 pt-4">
                {ourCompany.map((item, index) => (
                  <li
                    key={index}
                    className="py-1 flex justify-start items-center align-middle gap-2"
                  >
                    <IoIosArrowForward className="w-5 h-5 hover:text-[#241F21] duration-300 transition-all" />
                    <Link
                      href={item.link}
                      className=" text-base hover:text-[#241F21] duration-300 transition-all hover:underline"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between align-middle py-4 pb-0 flex-row border-t border-[#241F21] border-dashed">
          <div className={"text-sm w-full text-center text-[#241F21] "}>
            ©<Link href="/">`Zypco Courier Solutation`</Link> All right
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterBar;
