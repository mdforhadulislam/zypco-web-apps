import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { FaTwitter } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { IoLogoLinkedin } from "react-icons/io5";
import { LuInstagram } from "react-icons/lu";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "../ui/button";
import { FaYoutube } from "react-icons/fa";
import Logo from "@/utilities/Logo";

const solutionsFeatures = [
  {
    id: 1213,
    title: "Air Freight",
    link: "/about/our-services/",
    titleBn: "বাই এয়ার",
  },
  {
    id: 3568,
    title: "Sea Freight",
    link: "/about/our-services/",
    titleBn: "বাই সী",
  },
  {
    id: 4668,
    title: "Custom Clearnces",
    link: "/about/our-services/",
    titleBn: "কাস্টম ক্লিয়ারেঞ্ছ",
  },
  {
    id: 89865,
    title: "Export Shipments",
    link: "/about/our-services/",
    titleBn: "রপ্তানি চালান",
  },
  {
    id: 565465,
    title: "Courier Service",
    link: "/about/our-services/",
    titleBn: "কুরিয়ার সার্ভিস",
  },
  {
    id: 565465,
    title: "Shipment Tracking",
    link: "/track/",
    titleBn: "চালান ট্র্যাকিং",
  },
  {
    id: 565465,
    title: "Price Chart",
    link: "/price/",
    titleBn: "মূল্য চার্ট তালিকা",
  },
];

const ourCompany = [
  {
    id: 1234513,
    title: "About Us",
    link: "/about/why-finex/",
    titleBn: "আমাদের সম্পর্কে",
  },
  {
    id: 353468,
    title: "Our Blog",
    link: "/blog/",
    titleBn: "আমাদের ব্লগ",
  },
  {
    id: 4245668,
    title: "Our Team",
    link: "/about/our-team-member/",
    titleBn: "আমাদের দলের সদস্য",
  },
  {
    id: 565343465,
    title: "Help & Support",
    link: "/about/help-&-support/",
    titleBn: "সহযোগিতা এবং সমর্থন",
  },
  {
    id: 56543465,
    title: "Trust & Safety",
    link: "/about/trust&safety/",
    titleBn: "আস্থা ও নিরাপত্তা",
  },
  {
    id: 562354265,
    title: "Privacy Policy",
    link: "/about/privacy-policy/",
    titleBn: "গোপনীয়তা নীতি",
  },
  {
    id: 562354265,
    title: "Refund Policy",
    link: "/about/refund-policy/",
    titleBn: "ফেরত নীতি",
  },
];

const FooterBar = () => {
  return (
    <footer className="w-full h-auto bg-2">
      <div className="container h-auto m-auto p-5">
        <div className="w-full h-auto p-2 py-6">
          <div className="w-full h-auto grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-5">
            <div className="lg:border-r border-white border-dashed">
             
                <div className={"flex gap-4 pb-4"}>
                  <Logo
                    isFooter={true} width={200} height={100}
                  />
                </div>
                  
                  <div className="text-sm font-semibold pr-2 text-white py-1">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Perferendis ratione delectus quae consequatur officiis modi qui quasi quisquam aperiam quia cum cupiditate, consectetur ut magni omnis maxime consequuntur animi dignissimos blanditiis ab iste 
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
            <div className="group lg:border-r border-white border-dashed relative">
             <h3 className=" text-lg text-white ">Solutions</h3>
              
                <span className="group-hover:w-[200px] w-[120px] transition-all duration-600 h-[2px] bg-white block"></span>
            

              <ul className="w-full h-auto text-gray-300 py-2 pt-4 ">
                {solutionsFeatures.map((item, index) => (
                  <li
                    key={index}
                    className="py-1 flex justify-start items-center align-middle gap-2"
                  >
                    <IoIosArrowForward className="w-5 h-5 hover:text-white duration-300 transition-all" />
                      
                        <Link
                          href={item.link}
                          className=" text-base hover:text-white duration-300 transition-all"
                        >
                          {item.title}
                        </Link>
                  
                  </li>
                ))}


              </ul>
            </div>
            <div className="group ">
             <h3 className=" text-lg text-white ">Our Company</h3>
               

                <span className="group-hover:w-[200px] w-[120px] transition-all duration-600 h-[2px] bg-white block"></span>
           
              <ul className="w-full h-auto text-gray-300 py-2 pt-4">
                {ourCompany.map((item, index) => (
                  <li
                    key={index}
                    className="py-1 flex justify-start items-center align-middle gap-2"
                  >
                     <IoIosArrowForward className="w-5 h-5 hover:text-white duration-300 transition-all" />
                         <Link
                          href={item.link}
                          className=" text-base hover:text-white duration-300 transition-all"
                        >
                          {item.title}
                        </Link>
                     
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
          <div className="flex items-center justify-between align-middle py-4 pb-0 flex-row border-t border-white border-dashed">
            <div className={"text-sm w-full text-center text-white "}>
              ©<Link href="/">`Zypco Courier Solutation`</Link> All right
              reserved.
            </div>

          </div>
      </div>
    </footer>
  );
};

export default FooterBar