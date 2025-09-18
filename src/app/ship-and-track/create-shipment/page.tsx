import PageHeader from "@/utilities/PageHeader";
import { Clock, MapPin, Package, Shield, Truck, User } from "lucide-react";

const CreateShipment = () => {
  const serviceTypes = [
    {
      value: "express",
      label: "Express Delivery",
      time: "1-3 days",
      icon: "⚡",
    },
    {
      value: "standard",
      label: "Standard Delivery",
      time: "3-5 days",
      icon: "📦",
    },
    {
      value: "economy",
      label: "Economy Delivery",
      time: "5-7 days",
      icon: "🚛",
    },
  ];

  const packageTypes = [
    {
      value: "document",
      label: "Document",
      description: "Letters, papers, certificates",
      maxWeight: "0.5 kg",
    },
    {
      value: "parcel",
      label: "Parcel",
      description: "General packages and goods",
      maxWeight: "30 kg",
    },
    {
      value: "freight",
      label: "Freight",
      description: "Heavy or bulk items",
      maxWeight: "No limit",
    },
  ];

  const features = [
    {
      icon: <Truck className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Doorstep Pickup",
      description: "Free pickup from your location",
    },
    {
      icon: <Shield className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Insurance Coverage",
      description: "Full protection up to declared value",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Real-time Tracking",
      description: "Monitor your shipment 24/7",
    },
    {
      icon: <Package className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Professional Packaging",
      description: "Expert handling and packaging service",
    },
  ];

  const steps = [
    "Fill in shipment details",
    "Choose delivery service",
    "Schedule pickup time",
    "Make payment",
    "Track your shipment",
  ];

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader
        title="SHIP AND TRACK"
        subtitle="CREATE SHIPMENT"
        mainLink="/ship-and-track"
        subLink="/ship-and-track/create-shipment"
      />

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#241F21] mb-6">
              Create Your Shipment
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Send your package anywhere in the world with our reliable shipping
              service. Fill in the details below and we{"'"}ll handle the rest
              with doorstep pickup.
            </p>
          </div>

          {/* Shipment Form */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200">
              {/* Form Header */}
              <div className="bg-[#241F21] text-white p-6 rounded-t-lg">
                <div className="flex items-center">
                  <Package
                    className="w-8 h-8 text-[#FEF400] mr-3"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-2xl font-bold">Shipment Details</h3>
                </div>
              </div>

              <div className="p-8">
                {/* Sender Information */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <User
                      className="w-6 h-6 text-[#FEF400] mr-2"
                      strokeWidth={1.5}
                    />
                    <h4 className="text-xl font-semibold text-[#241F21]">
                      Sender Information
                    </h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter sender's name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="+880 1XXX XXXXXX"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="sender@example.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Company name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Address *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Enter complete pickup address with area, city, and postal code"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <MapPin
                      className="w-6 h-6 text-[#FEF400] mr-2"
                      strokeWidth={1.5}
                    />
                    <h4 className="text-xl font-semibold text-[#241F21]">
                      Recipient Information
                    </h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter recipient's name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="Recipient's phone number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="recipient@example.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Company name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent">
                        <option>Select destination country</option>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        placeholder="Postal/ZIP code"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Enter complete delivery address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Package Information */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Package
                      className="w-6 h-6 text-[#FEF400] mr-2"
                      strokeWidth={1.5}
                    />
                    <h4 className="text-xl font-semibold text-[#241F21]">
                      Package Information
                    </h4>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {packageTypes.map((type) => (
                      <div
                        key={type.value}
                        className="border border-gray-300 rounded-lg p-4 hover:border-[#FEF400] hover:bg-yellow-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center mb-2">
                          <input
                            type="radio"
                            name="packageType"
                            value={type.value}
                            className="mr-3"
                          />
                          <h5 className="font-semibold text-[#241F21]">
                            {type.label}
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {type.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Max: {type.maxWeight}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Length (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package Contents *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe the contents of your package"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Declared Value (৳) *
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        For insurance and customs purposes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Selection */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <Clock
                      className="w-6 h-6 text-[#FEF400] mr-2"
                      strokeWidth={1.5}
                    />
                    <h4 className="text-xl font-semibold text-[#241F21]">
                      Service Type
                    </h4>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {serviceTypes.map((service) => (
                      <div
                        key={service.value}
                        className="border border-gray-300 rounded-lg p-4 hover:border-[#FEF400] hover:bg-yellow-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center mb-2">
                          <input
                            type="radio"
                            name="serviceType"
                            value={service.value}
                            className="mr-3"
                          />
                          <span className="text-2xl mr-2">{service.icon}</span>
                          <h5 className="font-semibold text-[#241F21]">
                            {service.label}
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600">
                          Delivery: {service.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pickup Schedule */}
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-[#241F21] mb-4">
                    Pickup Schedule
                  </h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Date *
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Time *
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent">
                        <option>9:00 AM - 12:00 PM</option>
                        <option>12:00 PM - 3:00 PM</option>
                        <option>3:00 PM - 6:00 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="Any special pickup instructions"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-[#241F21] mb-4">
                    Additional Options
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <label className="text-gray-700">
                        SMS notifications for delivery updates
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <label className="text-gray-700">
                        Email notifications for delivery updates
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <label className="text-gray-700">
                        Signature required upon delivery
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <label className="text-gray-700">
                        COD (Cash on Delivery) - Collect payment from recipient
                      </label>
                    </div>
                  </div>
                </div>

                {/* Create Shipment Button */}
                <div className="text-center">
                  <button className="bg-[#FEF400] text-[#241F21] py-4 px-12 rounded-lg hover:bg-yellow-500 transition-colors font-bold text-lg">
                    Create Shipment & Calculate Cost
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    You{"'"}ll see the total cost and can make payment on the
                    next step
                  </p>
                </div>
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
              Why Ship with Zypco?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Experience hassle-free shipping with our comprehensive service
              features
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

      {/* Process Steps */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple 5-step process to get your package delivered anywhere in
              the world
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-[#FEF400] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-[#241F21]">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-[#241F21] mb-4">
            Need Help Creating Your Shipment?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our customer support team is available 24/7 to assist you with any
            questions or help you create your shipment.
          </p>
          <div className="space-x-4">
            <button className="bg-[#241F21] text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
              Contact Support
            </button>
            <button className="border-2 border-[#241F21] text-[#241F21] py-3 px-8 rounded-lg hover:bg-[#241F21] hover:text-white transition-colors font-semibold">
              Calculate Rates First
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;
