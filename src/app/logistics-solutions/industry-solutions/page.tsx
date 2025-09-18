import PageHeader from '@/utilities/PageHeader';
import Link from "next/link";
import { Heart, Car, Laptop, ShirtIcon, Factory, Pill, CheckCircle, ArrowRight, Shield } from "lucide-react";

const IndustrySolutions = () => {
  const industries = [
    {
      icon: <Heart className="w-10 h-10 text-[#241F21]" strokeWidth={1.5} />,
      title: "Healthcare & Pharmaceuticals",
      description: "Temperature-controlled shipping for medical supplies, pharmaceuticals, and healthcare equipment",
      features: ["Cold Chain Management", "Regulatory Compliance", "Priority Delivery", "Secure Handling"],
      color: "border-red-400"
    },
    {
      icon: <Car className="w-10 h-10 text-[#241F21]" strokeWidth={1.5} />,
      title: "Automotive Parts",
      description: "Specialized handling and delivery of automotive components, spare parts, and accessories",
      features: ["Parts Distribution", "JIT Delivery", "Warehouse Solutions", "Inventory Management"],
      color: "border-blue-400"
    },
    {
      icon: <Laptop className="w-10 h-10 text-[#241F21]" strokeWidth={1.5} />,
      title: "Electronics & Technology",
      description: "Secure shipping for electronics, IT equipment, and high-value technology products",
      features: ["Anti-Static Packaging", "Insurance Coverage", "Express Delivery", "Custom Clearance"],
      color: "border-purple-400"
    },
    {
      icon: <ShirtIcon className="w-10 h-10 text-[#241F21]" strokeWidth={1.5} />,
      title: "Fashion & Retail",
      description: "Fast fashion logistics with seasonal inventory management and retail distribution",
      features: ["Seasonal Shipping", "Retail Distribution", "Returns Processing", "Brand Protection"],
      color: "border-pink-400"
    },
    {
      icon: <Factory className="w-10 h-10 text-[#241F21]" strokeWidth={1.5} />,
      title: "Manufacturing",
      description: "Industrial logistics for raw materials, components, and finished manufacturing products",
      features: ["Heavy Cargo", "Industrial Packaging", "Supply Chain", "B2B Solutions"],
      color: "border-gray-400"
    },
    {
      icon: <Pill className="w-10 h-10 text-[#241F21]" strokeWidth={1.5} />,
      title: "Food & Beverages",
      description: "Specialized food-grade logistics with temperature control and regulatory compliance",
      features: ["Food Safety", "Temperature Control", "Perishable Goods", "HACCP Compliance"],
      color: "border-green-400"
    }
  ];

  const capabilities = [
    {
      title: "Specialized Packaging",
      description: "Industry-specific packaging solutions to ensure product safety and compliance"
    },
    {
      title: "Regulatory Compliance",
      description: "Full compliance with industry regulations and international shipping requirements"
    },
    {
      title: "Custom Solutions",
      description: "Tailored logistics solutions designed for your specific industry needs"
    },
    {
      title: "Expert Handling",
      description: "Trained professionals who understand the unique requirements of each industry"
    }
  ];

  const certifications = [
    "ISO 9001:2015 Quality Management",
    "IATA Dangerous Goods Regulations",
    "GDP (Good Distribution Practice)",
    "International Freight Forwarder License"
  ];

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader 
        title="LOGISTICS SOLUTIONS" 
        subtitle="OUR INDUSTRY SOLUTIONS" 
        mainLink="/logistics-solutions" 
        subLink="/logistics-solutions/industry-solutions" 
      />

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#241F21] mb-6">
              Industry-Specific Logistics Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every industry has unique logistics requirements. Our specialized solutions are designed 
              to meet the specific needs of your industry with expert knowledge, compliance, and 
              tailored service offerings.
            </p>
          </div>

          {/* Industries Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <div key={index} className={`bg-white border-l-4 ${industry.color} rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}>
                <div className="bg-[#FEF400] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  {industry.icon}
                </div>
                <h3 className="text-xl font-bold text-[#241F21] mb-3">{industry.title}</h3>
                <p className="text-gray-600 mb-4">{industry.description}</p>
                
                <div className="space-y-2 mb-6">
                  {industry.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" strokeWidth={1.5} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link href={"/"} className="flex items-center text-black">
                  <span className="text-sm font-medium mr-2">Learn More</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Industry Capabilities</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Specialized expertise and capabilities that set us apart in industry-specific logistics
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((capability, index) => (
              <div key={index} className="bg-[#2A2529] rounded-lg p-6 text-center hover:bg-[#323035] transition-colors">
                <Shield className="w-12 h-12 text-[#FEF400] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-white mb-3">{capability.title}</h3>
                <p className="text-gray-300 text-sm">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#241F21] mb-6">
                Certified & Compliant
              </h2>
              <p className="text-gray-600 mb-8">
                Our industry solutions are backed by comprehensive certifications and compliance 
                standards, ensuring your shipments meet all regulatory requirements across different industries.
              </p>
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#FEF400] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-[#241F21] mb-6">Why Choose Our Industry Solutions?</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#241F21] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">✓</div>
                  <div>
                    <h4 className="font-semibold text-[#241F21] mb-1">Expert Knowledge</h4>
                    <p className="text-[#241F21] text-sm">Deep understanding of industry-specific requirements</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#241F21] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">✓</div>
                  <div>
                    <h4 className="font-semibold text-[#241F21] mb-1">Compliance Assurance</h4>
                    <p className="text-[#241F21] text-sm">Full regulatory compliance and documentation</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#241F21] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">✓</div>
                  <div>
                    <h4 className="font-semibold text-[#241F21] mb-1">Specialized Equipment</h4>
                    <p className="text-[#241F21] text-sm">Industry-appropriate handling and transportation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Studies Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">Industry Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how our industry-specific solutions have helped businesses overcome logistics challenges
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <Heart className="w-8 h-8 text-red-500 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-[#241F21] mb-2">Healthcare Success</h3>
              <p className="text-gray-600 text-sm mb-4">
                Reduced delivery time for critical medical supplies by 60% while maintaining 
                100% cold chain compliance.
              </p>
              <div className="text-2xl font-bold text-red-500">60%</div>
              <div className="text-sm text-gray-600">Faster Delivery</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <Laptop className="w-8 h-8 text-purple-500 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-[#241F21] mb-2">Electronics Growth</h3>
              <p className="text-gray-600 text-sm mb-4">
                Helped electronics retailer scale internationally with zero damage claims 
                on high-value shipments.
              </p>
              <div className="text-2xl font-bold text-purple-500">0%</div>
              <div className="text-sm text-gray-600">Damage Claims</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <Car className="w-8 h-8 text-blue-500 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-[#241F21] mb-2">Automotive Efficiency</h3>
              <p className="text-gray-600 text-sm mb-4">
                Streamlined just-in-time delivery for automotive manufacturer, 
                reducing inventory costs by 35%.
              </p>
              <div className="text-2xl font-bold text-blue-500">35%</div>
              <div className="text-sm text-gray-600">Cost Reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready for Industry-Specific Solutions?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Get expert logistics solutions tailored to your industry{"'"}s unique requirements. 
            Contact our specialists for a customized consultation.
          </p>
          <div className="space-x-4">
            <Link href="/contact">
              <button className="bg-[#FEF400] text-[#241F21] py-3 px-8 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                Industry Consultation
              </button>
            </Link>
            <Link href="/logistics-solutions">
              <button className="border-2 border-white text-white py-3 px-8 rounded-lg hover:bg-white hover:text-[#241F21] transition-colors font-semibold">
                View All Solutions
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustrySolutions;