import PageHeader from "@/utilities/PageHeader";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  Globe,
  TruckIcon,
  Users,
} from "lucide-react";
import Link from "next/link";

function BussinessSolution() {
  const services = [
    {
      icon: <TruckIcon className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Supply Chain Management",
      description:
        "End-to-end supply chain optimization with real-time visibility and control",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Volume Discounts",
      description:
        "Competitive pricing tiers based on shipping volume with transparent cost structure",
    },
    {
      icon: <Users className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Dedicated Account Manager",
      description:
        "Personal account manager to handle your business logistics needs",
    },
    {
      icon: <Globe className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Global Network Access",
      description:
        "Access to our international network of trusted courier partners",
    },
  ];

  const features = [
    "Customized shipping solutions for your business needs",
    "Bulk shipping discounts for high-volume clients",
    "Priority customer support and dedicated account management",
    "Advanced tracking and reporting dashboards",
    "Flexible pickup and delivery scheduling",
    "Integration with your existing business systems",
    "Comprehensive insurance coverage options",
    "Multi-currency billing and invoicing",
  ];

  const industries = [
    {
      name: "Manufacturing",
      description: "Raw materials and finished goods distribution",
    },
    {
      name: "Retail",
      description: "Store replenishment and customer deliveries",
    },
    {
      name: "Technology",
      description: "Electronics and IT equipment shipping",
    },
    {
      name: "Healthcare",
      description: "Medical supplies and pharmaceutical logistics",
    },
    {
      name: "Automotive",
      description: "Parts distribution and spare components",
    },
    { name: "Fashion", description: "Apparel and accessories supply chain" },
  ];

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader
        title="LOGISTICS SOLUTIONS"
        subtitle="OUR BUSINESS SOLUTIONS"
        mainLink="/logistics-solutions"
        subLink="/logistics-solutions/bussiness-solution"
      />

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#241F21] mb-6">
                Streamline Your Business Logistics
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our business solutions are designed to optimize your supply
                chain, reduce costs, and improve delivery efficiency. From small
                businesses to large enterprises, we provide scalable logistics
                solutions that grow with your business.
              </p>
              <div className="flex items-center space-x-4">
                <Link href="/contact">
                  <button className="bg-[#FEF400] text-[#241F21] py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                    Get Business Quote
                  </button>
                </Link>
                <Link href="/ship-and-track">
                  <button className="border-2 border-[#241F21] text-[#241F21] py-3 px-6 rounded-lg hover:bg-[#241F21] hover:text-white transition-colors font-semibold">
                    Start Shipping
                  </button>
                </Link>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <Building2
                className="w-24 h-24 text-[#241F21] mx-auto mb-4"
                strokeWidth={1}
              />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#241F21] mb-2">
                  Enterprise Ready
                </h3>
                <p className="text-gray-600">
                  Trusted by businesses worldwide for reliable logistics
                  solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Business-Focused Services
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Comprehensive logistics services designed specifically for
              business operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-[#2A2529] rounded-lg p-6 text-center hover:bg-[#323035] transition-colors"
              >
                <div className="bg-[#241F21] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-300 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-[#241F21] mb-6">
                Why Businesses Choose Zypco
              </h2>
              <p className="text-gray-600 mb-8">
                We understand the unique challenges businesses face in logistics
                and supply chain management. Our solutions are designed to
                address these challenges while providing exceptional value.
              </p>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#FEF400] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-[#241F21] mb-6">
                Get Started Today
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-[#241F21] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                    1
                  </div>
                  <span className="text-[#241F21]">
                    Contact our business solutions team
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#241F21] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                    2
                  </div>
                  <span className="text-[#241F21]">
                    Receive customized logistics proposal
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#241F21] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                    3
                  </div>
                  <span className="text-[#241F21]">
                    Start optimizing your supply chain
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industries Section */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">
              Industries We Serve
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our business solutions cater to diverse industries with
              specialized requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-[#241F21] mb-2">
                  {industry.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {industry.description}
                </p>
                <div className="flex items-center text-[#FEF400]">
                  <span className="text-sm font-medium mr-2">Learn More</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business Logistics?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust Zypco for their logistics
            needs. Get a customized solution tailored to your specific
            requirements.
          </p>
          <div className="space-x-4">
            <Link href="/contact">
              <button className="bg-[#FEF400] text-[#241F21] py-3 px-8 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                Request Consultation
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
}

export default BussinessSolution;
