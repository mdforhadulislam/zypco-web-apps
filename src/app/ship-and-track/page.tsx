import PageHeader from "@/utilities/PageHeader";
import Link from "next/link";
import { Calculator, Package, MapPin, Clock, Shield, Globe, ArrowRight, CheckCircle } from "lucide-react";

const ShipAndTrack = () => {
  const services = [
    {
      icon: <Calculator className="w-12 h-12 text-[#241F21]" strokeWidth={1.5} />,
      title: "Calculate Shipping Charge",
      description: "Get instant shipping quotes for domestic and international deliveries",
      link: "/ship-and-track/claculate-shipping-charge",
      features: ["Instant Quotes", "Multiple Carriers", "Transparent Pricing", "Bulk Discounts"]
    },
    {
      icon: <Package className="w-12 h-12 text-[#241F21]" strokeWidth={1.5} />,
      title: "Create Shipment",
      description: "Easy shipment creation with doorstep pickup and automated processing",
      link: "/ship-and-track/create-shipment",
      features: ["Online Booking", "Doorstep Pickup", "Label Generation", "Insurance Options"]
    },
    {
      icon: <MapPin className="w-12 h-12 text-[#241F21]" strokeWidth={1.5} />,
      title: "Track Shipment",
      description: "Real-time tracking with detailed status updates and delivery notifications",
      link: "/ship-and-track/track-shipment",
      features: ["Real-time Updates", "SMS Notifications", "Delivery Proof", "History Log"]
    }
  ];

  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Fast Processing",
      description: "Same-day pickup and next-day delivery options available"
    },
    {
      icon: <Shield className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Secure Handling",
      description: "Full insurance coverage and careful handling of all shipments"
    },
    {
      icon: <Globe className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Global Reach",
      description: "Partnerships with DHL, FedEx, Aramex, UPS for worldwide delivery"
    },
    {
      icon: <Package className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "All Package Types",
      description: "Documents, parcels, freight - we handle all types of shipments"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Calculate Rate",
      description: "Get instant shipping quotes for your package"
    },
    {
      number: "2", 
      title: "Create Shipment",
      description: "Book your shipment with pickup details"
    },
    {
      number: "3",
      title: "We Collect",
      description: "Our team picks up from your doorstep"
    },
    {
      number: "4",
      title: "Track Progress",
      description: "Monitor your shipment in real-time"
    }
  ];

  const features = [
    "Doorstep pickup and delivery service",
    "Competitive rates with transparent pricing",
    "Real-time tracking and notifications",
    "Insurance coverage up to declared value",
    "Express and economy shipping options",
    "International customs clearance support", 
    "Bulk shipping discounts for businesses"
  ];

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader 
        title="SHIP AND TRACK" 
        subtitle="SHIP AND TRACK"
        mainLink="/ship-and-track"
        subLink="/ship-and-track"
      />
      
      {/* Hero Content */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#241F21] mb-6">
              Ship Anywhere, Track Everything
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Complete shipping solutions from rate calculation to delivery tracking. 
              Send your packages domestically or internationally with confidence, speed, and reliability.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-[#FEF400] rounded-full w-20 h-20 flex items-center justify-center mb-6 mx-auto">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-[#241F21] mb-4 text-center">{service.title}</h3>
                <p className="text-gray-600 mb-6 text-center">{service.description}</p>
                
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" strokeWidth={1.5} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Link href={service.link}>
                    <button className="bg-[#241F21] text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-semibold w-full">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">How Shipping Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple, fast, and reliable shipping process from quote to delivery
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#FEF400] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#241F21]">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#241F21] mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mx-auto mt-4 hidden md:block" strokeWidth={1.5} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Ship with Zypco?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Experience the difference with our comprehensive shipping solutions
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

      {/* Features Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#241F21] mb-6">
                Complete Shipping Features
              </h2>
              <p className="text-gray-600 mb-8">
                Everything you need for domestic and international shipping, 
                from individual packages to bulk business shipments.
              </p>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#FEF400] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-[#241F21] mb-6">Quick Actions</h3>
              <div className="flex justify-center align-middle items-center gap-3 flex-col">
                <Link href="/ship-and-track/claculate-shipping-charge" className="w-full">
                  <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[#241F21]">Calculate Rates</h4>
                        <p className="text-sm text-gray-600">Get instant shipping quotes</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#241F21]" strokeWidth={1.5} />
                    </div>
                  </div>
                </Link>
                
                <Link href="/ship-and-track/create-shipment" className="w-full">
                  <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[#241F21]">Create Shipment</h4>
                        <p className="text-sm text-gray-600">Book your shipment now</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#241F21]" strokeWidth={1.5} />
                    </div>
                  </div>
                </Link>
                
                <Link href="/ship-and-track/track-shipment" className="w-full">
                  <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[#241F21]">Track Package</h4>
                        <p className="text-sm text-gray-600">Monitor your shipments</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#241F21]" strokeWidth={1.5} />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#241F21] mb-2">200+</div>
              <p className="text-gray-600">Countries Served</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#241F21] mb-2">50K+</div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#241F21] mb-2">99.5%</div>
              <p className="text-gray-600">On-Time Delivery</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#241F21] mb-2">24/7</div>
              <p className="text-gray-600">Customer Support</p>
            </div>
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
            Get started with Zypco{"'"}s reliable shipping services. Calculate rates, 
            create shipments, and track your packages all in one place.
          </p>
          <div className="space-x-4">
            <Link href="/ship-and-track/claculate-shipping-charge">
              <button className="bg-[#FEF400] text-[#241F21] py-3 px-8 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                Calculate Rates
              </button>
            </Link>
            <Link href="/ship-and-track/create-shipment">
              <button className="border-2 border-white text-white py-3 px-8 rounded-lg hover:bg-white hover:text-[#241F21] transition-colors font-semibold">
                Ship Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipAndTrack;