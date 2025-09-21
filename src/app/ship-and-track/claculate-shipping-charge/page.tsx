import PageHeader from "@/utilities/PageHeader";
import { Calculator, Clock, DollarSign, Globe } from "lucide-react";

const CalculateShippingCharge = () => {
  const carriers = [
    {
      name: "DHL Express",
      logo: "/dhl-logo.png",
      deliveryTime: "1-3 business days",
    },
    {
      name: "FedEx",
      logo: "/fedex-logo.png",
      deliveryTime: "3-5 business days",
    },
    {
      name: "Aramex",
      logo: "/aramex-logo.png",
      deliveryTime: "5-7 business days",
    },
    { name: "UPS", logo: "/ups-logo.png", deliveryTime: "1-3 business days" },
    {
      name: "Local Partner",
      logo: "/logo.jpg",
      deliveryTime: "1-3 business days",
    },
  ];

  const features = [
    {
      icon: <Calculator className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Instant Quotes",
      description: "Get real-time shipping rates from multiple carriers",
    },
    {
      icon: <Globe className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Global Coverage",
      description: "Compare rates for 200+ countries worldwide",
    },
    {
      icon: <DollarSign className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Best Prices",
      description: "Access to negotiated rates with major carriers",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Delivery Options",
      description: "Choose from express, standard, or economy options",
    },
  ];

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader
        title="SHIP AND TRACK"
        subtitle="CALCULATE SHIPPING CHARGE"
        mainLink="/ship-and-track"
        subLink="/ship-and-track/claculate-shipping-charge"
      />

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#241F21] mb-6">
              Calculate Shipping Charges
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Select destination country and shipment type (B2B or B2C) to get
              instant shipping quotes.
            </p>
          </div>

          {/* Calculator Form */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <Calculator
                  className="w-8 h-8 text-[#FEF400] mr-3"
                  strokeWidth={1.5}
                />
                <h3 className="text-2xl font-bold text-[#241F21]">
                  Shipping Calculator
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* From Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Country
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent">
                    <option>Bangladesh</option>
                  </select>
                </div>

                {/* To Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Country
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent">
                    <option>Select Country</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>India</option>
                    <option>Singapore</option>
                  </select>
                </div>
              </div>

              {/* Shipment Type */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipment Type
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent">
                  <option value="b2b">B2B (Business to Business)</option>
                  <option value="b2c">B2C (Business to Customer)</option>
                </select>
              </div>

              {/* Calculate Button */}
              <div className="mt-8 text-center">
                <button className="bg-[#FEF400] text-[#241F21] py-4 px-12 rounded-lg hover:bg-yellow-500 transition-colors font-bold text-lg">
                  Calculate Shipping Rates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Use Our Calculator?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Get the most accurate shipping quotes with our advanced calculator
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#2A2529] rounded-lg p-6 text-center hover:bg-[#323035] transition-colors"
              >
                <div className="bg-[#241F21] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carriers Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">
              Our Carrier Partners
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Compare rates from leading international and local courier
              services
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {carriers.map((carrier, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <img
                  src={carrier.logo}
                  alt={carrier.name}
                  className="h-12 mx-auto mb-4 object-contain"
                />
                <h3 className="font-semibold text-[#241F21] mb-2">
                  {carrier.name}
                </h3>
                <p className="text-sm text-gray-600">{carrier.deliveryTime}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Ship Your Package?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Found the perfect rate? Create your shipment now and enjoy doorstep
            pickup service.
          </p>
          <div className="flex justify-center align-middle items-center gap-3 flex-col sm:flex-row">
            <button className="bg-[#FEF400] text-[#241F21] py-2.5 px-7 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
              Create Shipment
            </button>
            <button className="border-2 border-white text-white py-2 px-8 rounded-lg hover:bg-white hover:text-[#241F21] transition-colors font-semibold">
              Get Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculateShippingCharge;
