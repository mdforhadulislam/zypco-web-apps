import PageHeader from '@/utilities/PageHeader';
import Link from "next/link";
import { Building2, Users, Globe, Award, TrendingUp, Shield, CheckCircle, ArrowRight, Calendar, MapPin } from "lucide-react";

const ZypcoCorporate = () => {
  const stats = [
    { number: "500+", label: "Corporate Clients", icon: <Building2 className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} /> },
    { number: "50+", label: "Countries Served", icon: <Globe className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} /> },
    { number: "1M+", label: "Packages Delivered", icon: <TrendingUp className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} /> },
    { number: "99.5%", label: "On-Time Delivery", icon: <Award className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} /> }
  ];

  const services = [
    {
      title: "Enterprise Logistics",
      description: "Comprehensive supply chain solutions for large enterprises with global operations",
      features: ["Dedicated Account Management", "Volume Discounts", "Priority Support", "Custom Integration"]
    },
    {
      title: "B2B Shipping Solutions",
      description: "Specialized business-to-business shipping with flexible payment terms and bulk handling",
      features: ["Bulk Shipping Rates", "Credit Terms", "Advanced Reporting", "API Integration"]
    },
    {
      title: "Corporate Partnerships",
      description: "Strategic partnerships for businesses requiring regular international shipping services",
      features: ["Partnership Agreements", "Exclusive Rates", "Joint Marketing", "Co-branded Solutions"]
    }
  ];

  // const teamMembers = [
  //   {
  //     name: "Mohammad Rahman",
  //     position: "Chief Executive Officer",
  //     image: "/zypco-man.jpg",
  //     description: "15+ years in international logistics and supply chain management"
  //   },
  //   {
  //     name: "Fatima Khan",
  //     position: "Head of Corporate Relations",
  //     image: "/zypco-bussiness-support.jpg", 
  //     description: "Expert in building strategic partnerships and corporate solutions"
  //   },
  //   {
  //     name: "Ahmed Hassan",
  //     position: "Operations Director",
  //     image: "/zypco-man.jpg",
  //     description: "Oversees global operations and ensures service excellence"
  //   }
  // ];

  const milestones = [
    { year: "2024", title: "Company Founded", description: "Started with a vision to make international shipping affordable" },
    { year: "2024", title: "First 100 Clients", description: "Achieved our first milestone of 100 satisfied customers" },
    { year: "2024", title: "International Expansion", description: "Expanded services to 25+ countries worldwide" },
    { year: "2024", title: "Corporate Solutions Launch", description: "Launched dedicated corporate and B2B services" },
    { year: "2025", title: "Technology Integration", description: "Introduced API services and automated solutions" },
    { year: "2025", title: "500+ Corporate Clients", description: "Reached 500+ corporate clients across various industries" },
    { year: "2025", title: "Global Recognition", description: "Recognized as leading logistics provider in Bangladesh" }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Trust & Reliability",
      description: "Building lasting relationships through consistent, reliable service delivery"
    },
    {
      icon: <Users className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Customer First",
      description: "Putting our customers' needs at the center of everything we do"
    },
    {
      icon: <Globe className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Global Reach",
      description: "Connecting Bangladesh with the world through our extensive network"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Continuous Innovation",
      description: "Constantly improving our services through technology and innovation"
    }
  ];

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader 
        title="ZYPCO CORPORATE" 
        subtitle="ZYPCO CORPORATE" 
        mainLink="/zypco-corporate" 
        subLink="/zypco-corporate" 
      />

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#241F21] mb-6">
              Leading International Courier Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Zypco is Bangladesh{"'"}s trusted partner for international logistics solutions. 
              We connect businesses and individuals with the world through our comprehensive 
              courier and shipping services, backed by strategic partnerships with global leaders.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-[#241F21] rounded-lg p-8 text-center text-white">
                <div className="bg-[#2A2529] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-[#FEF400] mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* About Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-[#241F21] mb-6">About Zypco</h3>
              <p className="text-gray-600 mb-6">
                Founded with a clear vision to make international courier services more affordable, 
                reliable, and accessible in Bangladesh, Zypco has grown from a home-office model 
                to become one of the country{"'"}s leading logistics providers.
              </p>
              <p className="text-gray-600 mb-6">
                Through strategic partnerships with world-renowned courier services such as DHL, 
                FedEx, Aramex, UPS, along with selected local providers, we{"'"}ve created a unique 
                network that delivers premium services at discounted rates.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" strokeWidth={1.5} />
                  <span className="text-gray-700">Partnerships with leading global couriers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" strokeWidth={1.5} />
                  <span className="text-gray-700">Competitive rates with premium service quality</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" strokeWidth={1.5} />
                  <span className="text-gray-700">24/7 customer support and tracking</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" strokeWidth={1.5} />
                  <span className="text-gray-700">Doorstep pickup and delivery services</span>
                </div>
              </div>
            </div>
            <div className="bg-[#FEF400] rounded-lg p-8">
              <h4 className="text-2xl font-bold text-[#241F21] mb-4">Our Mission</h4>
              <p className="text-[#241F21] mb-6">
                To connect Bangladesh seamlessly with the world while providing reliable, 
                affordable, and customer-focused shipping solutions that exceed expectations.
              </p>
              <h4 className="text-2xl font-bold text-[#241F21] mb-4">Our Vision</h4>
              <p className="text-[#241F21]">
                To become the leading international courier company in Bangladesh, 
                recognized for innovation, reliability, and exceptional customer service.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">Corporate Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive corporate solutions designed to meet the unique needs of businesses
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-[#241F21] mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" strokeWidth={1.5} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href="/contact">
                    <button className="text-[#FEF400] font-semibold hover:text-yellow-600 transition-colors flex items-center">
                      Learn More <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      {/* <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">Leadership Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the experienced professionals leading Zypco{"'"}s growth and innovation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-[#241F21] mb-2">{member.name}</h3>
                <p className="text-[#FEF400] font-semibold mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Timeline Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Journey</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Key milestones in Zypco{"'"}s growth from startup to Bangladesh{"'"}s leading logistics provider
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-6">
                    <div className="bg-[#FEF400] rounded-full w-16 h-16 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#241F21]" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#2A2529] rounded-lg p-6">
                      <div className="flex items-center mb-3">
                        <span className="bg-[#FEF400] text-[#241F21] px-3 py-1 rounded-full text-sm font-bold mr-4">
                          {milestone.year}
                        </span>
                        <h3 className="text-lg font-bold text-white">{milestone.title}</h3>
                      </div>
                      <p className="text-gray-300">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide our operations and relationships with customers and partners
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#241F21] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#241F21] mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="w-full bg-[#FEF400]">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#241F21] mb-6">Get in Touch</h2>
              <p className="text-[#241F21] mb-8">
                Ready to partner with Zypco for your corporate logistics needs? 
                Contact our team to discuss customized solutions for your business.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-[#241F21] mr-3" strokeWidth={1.5} />
                  <span className="text-[#241F21]">Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-[#241F21] mr-3" strokeWidth={1.5} />
                  <span className="text-[#241F21]">Corporate Solutions Available</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-[#241F21] mr-3" strokeWidth={1.5} />
                  <span className="text-[#241F21]">Serving 50+ Countries Worldwide</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-bold text-[#241F21] mb-6">Corporate Inquiry</h3>
              <div className="space-y-4">
                <div>
                  <input type="text" placeholder="Company Name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent" />
                </div>
                <div>
                  <input type="text" placeholder="Contact Person" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent" />
                </div>
                <div>
                  <input type="email" placeholder="Email Address" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent" />
                </div>
                <div>
                  <input type="tel" placeholder="Phone Number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent" />
                </div>
                <div>
                  <textarea rows={4} placeholder="Tell us about your logistics requirements" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FEF400] focus:border-transparent"></textarea>
                </div>
                <button className="w-full bg-[#241F21] text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                  Submit Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Partner with Zypco Today
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied corporate clients who trust Zypco for their 
            international logistics needs. Experience the difference of working with 
            Bangladesh{"'"}s leading courier service provider.
          </p>
          <div className="space-x-4">
            <Link href="/contact">
              <button className="bg-[#FEF400] text-[#241F21] py-3 px-8 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                Start Partnership
              </button>
            </Link>
            <Link href="/logistics-solutions">
              <button className="border-2 border-white text-white py-3 px-8 rounded-lg hover:bg-white hover:text-[#241F21] transition-colors font-semibold">
                View Solutions
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZypcoCorporate;