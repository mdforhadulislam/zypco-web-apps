import PageHeader from "@/utilities/PageHeader";
import Link from "next/link";
import { Truck, Globe, Shield, Clock, Users, CheckCircle } from "lucide-react";

const LogisticsSolutions = () => {
  const solutions = [
    {
      title: "Business Solutions",
      description: "Comprehensive logistics solutions tailored for businesses of all sizes",
      icon: <Users className="w-12 h-12 text-[#241F21]" strokeWidth={1.5} />,
      link: "/logistics-solutions/bussiness-solution",
      features: ["Supply Chain Management", "B2B Shipping", "Corporate Accounts", "Volume Discounts"]
    },
    {
      title: "E-Commerce Solutions", 
      description: "Specialized shipping solutions for online retailers and e-commerce platforms",
      icon: <Globe className="w-12 h-12 text-[#241F21]" strokeWidth={1.5} />,
      link: "/logistics-solutions/e-commerce-solutions",
      features: ["Order Fulfillment", "Return Management", "API Integration", "Multi-Channel Support"]
    },
    {
      title: "Industry Solutions",
      description: "Industry-specific logistics solutions for specialized requirements",
      icon: <Truck className="w-12 h-12 text-[#241F21]" strokeWidth={1.5} />,
      link: "/logistics-solutions/industry-solutions", 
      features: ["Healthcare", "Automotive", "Electronics", "Fashion & Retail"]
    }
  ];

  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Secure & Reliable",
      description: "Advanced tracking and security measures for all shipments"
    },
    {
      icon: <Clock className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "On-Time Delivery",
      description: "Guaranteed delivery times with real-time tracking updates"
    },
    {
      icon: <Globe className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Global Network",
      description: "Partnerships with DHL, FedEx, Aramex, UPS for worldwide coverage"
    },
    {
      icon: <Users className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your logistics needs"
    }
  ];

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader 
        title="LOGISTICS SOLUTIONS" 
        subtitle="LOGISTICS SOLUTIONS" 
        mainLink="/logistics-solutions" 
        subLink="/logistics-solutions" 
      />
      
      {/* Hero Content */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#241F21] mb-6">
              Comprehensive Logistics Solutions for Every Need
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From small businesses to large enterprises, we provide tailored logistics solutions 
              that streamline your operations and reduce costs while ensuring reliable delivery worldwide.
            </p>
          </div>

          {/* Solutions Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-[#FEF400] rounded-full w-20 h-20 flex items-center justify-center mb-6 mx-auto">
                  {solution.icon}
                </div>
                <h3 className="text-xl font-bold text-[#241F21] mb-4 text-center">{solution.title}</h3>
                <p className="text-gray-600 mb-6 text-center">{solution.description}</p>
                
                <div className="space-y-2 mb-6">
                  {solution.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" strokeWidth={1.5} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Link href={solution.link}>
                    <button className="bg-[#241F21] text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                      Learn More
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Zypco Logistics?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our comprehensive logistics solutions are designed to meet the diverse needs of modern businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#2A2529] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-300 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-[#FEF400]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-[#241F21] mb-4">
            Ready to Optimize Your Logistics?
          </h2>
          <p className="text-[#241F21] mb-8 max-w-2xl mx-auto">
            Get started with Zypco{"'"}s comprehensive logistics solutions today. 
            Contact our experts for a customized quote.
          </p>
          <div className="space-x-4">
            <Link href="/contact">
              <button className="bg-[#241F21] text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                Get Quote
              </button>
            </Link>
            <Link href="/ship-and-track">
              <button className="border-2 border-[#241F21] text-[#241F21] py-3 px-8 rounded-lg hover:bg-[#241F21] hover:text-white transition-colors font-semibold">
                Start Shipping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsSolutions;