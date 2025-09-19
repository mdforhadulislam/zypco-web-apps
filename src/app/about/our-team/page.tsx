import PageHeader from "@/utilities/PageHeader";
import {
  Award,
  Briefcase,
  GraduationCap,
  Heart,
  MapPin,
  Phone,
  Target,
  Users,
} from "lucide-react";

const ZypcoTeamMember = () => {
  const leadership = [
    {
      id: 1,
      name: "Alamin Hossain",
      position: "Marque Associate",
      image: "/alamin-hossin.jpg",
      bio: "Dedicated associate handling parcel pickup and ensuring on-time delivery.",
      education: "Training in Logistics & Customer Service",
      experience: "2+ years in courier operations",
      location: "Chittagong, Bangladesh",
      achievements: [
        "Successfully handled 1,500+ deliveries",
        "Ensured 95% on-time performance",
        "Recognized for customer-friendly service",
      ],
      social: {
        linkedin: "#",
        phone: "+8801622541719",
      },
    },
    {
      id: 2,
      name: "Sadia Rahman",
      position: "Marque Associate",
      image: "/marque-2.jpg",
      bio: "Focused on customer support and problem-solving to ensure smooth service.",
      education: "Diploma in Business Management",
      experience: "1+ years in customer support",
      location: "Dhaka, Bangladesh",
      achievements: [
        "Resolved 500+ customer queries",
        "Maintained 98% positive feedback",
        "Specialist in handling urgent deliveries",
      ],
      social: {
        email: "sadia@zypco.com",
        linkedin: "#",
        phone: "+880 1992222222",
      },
    },
    {
      id: 3,
      name: "Intesar Tanvin",
      position: "Marque Associate",
      image: "/imtesar-tanvine.jpg",
      bio: "Ensures seamless last-mile delivery and builds trust with clients.",
      education: "Training in Logistics Operations",
      experience: "3+ years in delivery & field operations",
      location: "Chittagong, Bangladesh",
      achievements: [
        "Delivered 2,000+ parcels successfully",
        "Awarded ‘Best Delivery Associate 2024’",
        "Built long-term client relationships",
      ],
      social: {
        linkedin: "#",
        phone: "+8801863468546",
      },
    },
  ];

  const departments = [
    {
      name: "Operations",
      icon: <Briefcase className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      count: 8,
      description:
        "Managing daily logistics operations and ensuring smooth delivery processes",
    },
    {
      name: "Customer Support",
      icon: <Users className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      count: 8,
      description: "Providing exceptional customer service and support 24/7",
    },
    {
      name: "Technology",
      icon: <Target className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      count: 2,
      description:
        "Developing and maintaining our digital platforms and tracking systems",
    },
    {
      name: "Business Development",
      icon: <Award className="w-8 h-8 text-[#FEF400]" strokeWidth={1.5} />,
      count: 2,
      description: "Expanding partnerships and growing our service network",
    },
  ];

  const values = [
    {
      icon: <Heart className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Customer First",
      description:
        "Every decision we make is focused on providing the best experience for our customers",
    },
    {
      icon: <Users className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Teamwork",
      description:
        "We achieve more together and support each other's growth and success",
    },
    {
      icon: <Target className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Excellence",
      description:
        "We strive for excellence in everything we do, from service to innovation",
    },
    {
      icon: <Award className="w-6 h-6 text-[#FEF400]" strokeWidth={1.5} />,
      title: "Integrity",
      description:
        "We conduct business with honesty, transparency, and ethical practices",
    },
  ];

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader
        title="ABOUT US"
        subtitle="OUR TEAM MEMBERS"
        mainLink="/about"
        subLink="/about/our-team"
      />

      {/* Hero Section */}
      <div className="w-full bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#241F21] mb-6">
              Meet Our Amazing Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Behind every successful delivery is a dedicated team of
              professionals who are passionate about connecting Bangladesh with
              the world. Get to know the people who make Zypco possible.
            </p>
          </div>

          {/* Team Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#241F21] mb-2">20+</div>
              <div className="text-gray-600">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#241F21] mb-2">4+</div>
              <div className="text-gray-600">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#241F21] mb-2">2+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#241F21] mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Marque Associates */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">
              Our Marque Associates
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the dedicated associates who represent Zypco on the ground
              and ensure smooth operations every day.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {leadership.map((leader, index) => (
              <div
                key={leader.id}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="lg:w-1/3">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full max-w-sm mx-auto rounded-lg shadow-lg object-cover aspect-square"
                  />
                </div>
                <div className="lg:w-2/3 lg:px-8">
                  <div className="bg-white rounded-lg p-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-[#241F21] mb-2">
                      {leader.name}
                    </h3>
                    <p className="text-[#FEF400] font-semibold mb-4">
                      {leader.position}
                    </p>
                    <p className="text-gray-700 mb-6">{leader.bio}</p>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        {leader.education}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        {leader.experience}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {leader.location}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-[#241F21] mb-3">
                        Key Achievements:
                      </h4>
                      <ul className="space-y-2">
                        {leader.achievements.map((achievement, achIndex) => (
                          <li
                            key={achIndex}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <Award className="w-4 h-4 text-[#FEF400] mt-0.5 flex-shrink-0" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-4">
                      <a
                        href={`tel:${leader.social.phone}`}
                        className="flex items-center gap-2 text-[#241F21] hover:text-[#FEF400] transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Our Departments
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Each department plays a crucial role in delivering exceptional
              courier services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="bg-[#2A2529] rounded-lg p-6 text-center hover:bg-[#323035] transition-colors"
              >
                <div className="bg-[#241F21] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {dept.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {dept.name}
                </h3>
                <div className="text-2xl font-bold text-[#FEF400] mb-3">
                  {dept.count}
                </div>
                <p className="text-gray-300 text-sm">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="w-full bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#241F21] mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide our team and shape our company culture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="bg-[#241F21] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#241F21] mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-[#241F21]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Want to Join Our Team?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            We{"'"}re always looking for talented individuals who share our
            passion for connecting Bangladesh with the world. Explore career
            opportunities with us.
          </p>
          <div className="space-x-4">
            <a
              href="/career"
              className="inline-block bg-[#FEF400] text-[#241F21] py-3 px-8 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
            >
              View Career Opportunities
            </a>
            <a
              href="/contact"
              className="inline-block border-2 border-white text-white py-3 px-8 rounded-lg hover:bg-white hover:text-[#241F21] transition-colors font-semibold"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZypcoTeamMember;
