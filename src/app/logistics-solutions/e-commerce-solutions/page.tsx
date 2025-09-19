import PageHeader from "@/utilities/PageHeader";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Package,
  RefreshCw,
  ShoppingCart,
  Smartphone,
  Zap,
} from "lucide-react";
import Link from "next/link";

const ECommerceSolutions = () => {
  const services = [
    {
      icon: <Package className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Order Fulfillment",
      description:
        "Automated order processing and fulfillment with same-day dispatch options",
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Returns Management",
      description:
        "Streamlined return process with easy returns portal and reverse logistics",
    },
    {
      icon: <Zap className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "API Integration",
      description:
        "Seamless integration with popular e-commerce platforms and marketplaces",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Analytics Dashboard",
      description:
        "Real-time shipping analytics and performance insights for your store",
    },
  ];

  const platforms = [
    { name: "Shopify", integration: "Native App Available" },
    { name: "WooCommerce", integration: "Plugin Available" },
    { name: "Magento", integration: "Extension Available" },
    { name: "Amazon", integration: "API Integration" },
    { name: "eBay", integration: "Direct Connection" },
    { name: "Custom Stores", integration: "REST API" },
  ];

  const features = [
    "Automated order import and processing",
    "Real-time inventory sync across channels",
    "Branded tracking pages and notifications",
    "Express and economy shipping options",
    "Bulk order processing capabilities",
    "Customer communication automation",
    "International shipping compliance",
  ];

  const benefits = [
    {
      title: "Faster Delivery",
      description: "Same-day and next-day delivery options in major cities",
      percentage: "95%",
    },
    {
      title: "Cost Savings",
      description:
        "Up to 40% savings on shipping costs with our negotiated rates",
      percentage: "40%",
    },
    {
      title: "Customer Satisfaction",
      description:
        "Improved customer experience with reliable tracking and delivery",
      percentage: "98%",
    },
  ];

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader
        title="LOGISTICS SOLUTIONS"
        subtitle="OUR E-COMMERCE SOLUTIONS"
        mainLink="/logistics-solutions"
        subLink="/logistics-solutions/e-commerce-solutions"
      />

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#241F21] mb-6">
                E-Commerce Shipping Made Simple
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Scale your online business with our comprehensive e-commerce
                logistics solutions. From order fulfillment to returns
                management, we handle every aspect of your shipping needs so you
                can focus on growing your business.
              </p>
              <div className="flex items-center space-x-4">
                <Link href="/contact">
                  <button className="bg-[#FEF400] text-[#241F21] py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                    Start Free Trial
                  </button>
                </Link>
                <Link href="/ship-and-track">
                  <button className="border-2 border-[#241F21] text-[#241F21] py-3 px-6 rounded-lg hover:bg-[#241F21] hover:text-white transition-colors font-semibold">
                    Calculate Rates
                  </button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#FEF400] to-yellow-300 rounded-lg p-8">
              <ShoppingCart
                className="w-24 h-24 text-[#241F21] mx-auto mb-4"
                strokeWidth={1}
              />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#241F21] mb-2">
                  E-Commerce Ready
                </h3>
                <p className="text-[#241F21]">
                  Integrated solutions for online retailers of all sizes
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
              Complete E-Commerce Logistics
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage your online store{"'"}s shipping and
              logistics operations
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

      {/* Platform Integration */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">
              Platform Integrations
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Seamlessly connect with your existing e-commerce platform or
              marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#FEF400]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#241F21]">
                    {platform.name}
                  </h3>
                  <Smartphone
                    className="w-5 h-5 text-[#FEF400]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  {platform.integration}
                </p>
                <div className="flex items-center mt-4 text-[#FEF400]">
                  <span className="text-sm font-medium mr-2">Connect Now</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </div>
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
                E-Commerce Features
              </h2>
              <p className="text-gray-600 mb-8">
                Our e-commerce solutions are designed to help online retailers
                streamline operations, reduce costs, and improve customer
                satisfaction.
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
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-[#FEF400] rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-[#241F21]">
                      {benefit.title}
                    </h3>
                    <span className="text-2xl font-bold text-[#241F21]">
                      {benefit.percentage}
                    </span>
                  </div>
                  <p className="text-[#241F21]">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              E-Commerce Success Stories
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              See how our e-commerce solutions have helped online retailers grow
              their business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#2A2529] rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-[#FEF400] mb-2">500+</div>
              <p className="text-white font-semibold mb-1">E-Commerce Stores</p>
              <p className="text-gray-300 text-sm">Using our platform</p>
            </div>
            <div className="bg-[#2A2529] rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-[#FEF400] mb-2">1M+</div>
              <p className="text-white font-semibold mb-1">Orders Processed</p>
              <p className="text-gray-300 text-sm">Monthly volume</p>
            </div>
            <div className="bg-[#2A2529] rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-[#FEF400] mb-2">
                99.5%
              </div>
              <p className="text-white font-semibold mb-1">Delivery Success</p>
              <p className="text-gray-300 text-sm">On-time delivery rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-[#FEF400]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-[#241F21] mb-4">
            Start Scaling Your E-Commerce Business
          </h2>
          <p className="text-[#241F21] mb-8 max-w-2xl mx-auto">
            Join thousands of online retailers who trust Zypco for their
            shipping needs. Get started with our e-commerce solutions today.
          </p>
          <div className="flex gap-3 flex-col justify-center align-middle items-center sm:flex-row">
            <Link href="/contact">
              <button className="bg-[#241F21] text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors font-semibold border-2 border-[#241F21]">
                Start Free Trial
              </button>
            </Link>
            <Link href="/ship-and-track/create-shipment">
              <button className="border-2 border-[#241F21] text-[#241F21] py-3 px-8 rounded-lg hover:bg-[#241F21] hover:text-white transition-colors font-semibold">
                Create Shipment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECommerceSolutions;
