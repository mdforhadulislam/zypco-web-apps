import PageHeader from "@/utilities/PageHeader";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const Contact = () => {
  const contactData = {
    title: "Contact Us",
    description: "Contact the support team at Zypco.",
    emailLabel: "Email",
    emailDescription: "We respond to all emails within 24 hours.",
    email: "zypcocourier@gmail.com",
    officeLabel: "Office",
    officeDescription: "Drop by our office for a chat.",
    officeAddress: "1 Eagle St, Brisbane, QLD, 4000",
    phoneLabel: "Phone",
    phoneDescription: "We're available Mon-Fri, 9am-5pm.",
    phone: ["+8801622541719", "+8801863468546"],
    chatLabel: "Live Chat",
    chatDescription: "Get instant help from our support team.",
    chatLink: "Start Chat",
  };

  return (
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader
        title="CONTACT US"
        subtitle="CONTACT US"
        mainLink="/contact"
        subLink="/contact"
      />

      <div className="w-full bg-white">
        <section className="bg-background container m-auto py-32 px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-muted rounded-lg p-6">
              <span className="bg-accent mb-3 flex size-12 flex-col items-center justify-center rounded-full">
                <Mail className="h-6 w-auto" />
              </span>
              <p className="mb-2 text-lg font-semibold">
                {contactData.emailLabel}
              </p>
              <p className="text-muted-foreground mb-3">
                {contactData.emailDescription}
              </p>
              <a
                href={`mailto:${contactData.email}`}
                className="font-semibold hover:underline"
              >
                {contactData.email}
              </a>
            </div>
            {/* <div className="bg-muted rounded-lg p-6">
              <span className="bg-accent mb-3 flex size-12 flex-col items-center justify-center rounded-full">
                <MapPin className="h-6 w-auto" />
              </span>
              <p className="mb-2 text-lg font-semibold">
                {contactData.officeLabel}
              </p>
              <p className="text-muted-foreground mb-3">
                {contactData.officeDescription}
              </p>
              <a href="#" className="font-semibold hover:underline">
                {contactData.officeAddress}
              </a>
            </div> */}
            <div className="bg-muted rounded-lg p-6">
              <span className="bg-accent mb-3 flex size-12 flex-col items-center justify-center rounded-full">
                <Phone className="h-6 w-auto" />
              </span>
              <p className="mb-2 text-lg font-semibold">
                {contactData.phoneLabel}
              </p>
              <p className="text-muted-foreground mb-3">
                {contactData.phoneDescription}
              </p>
              {contactData.phone.map((phone) => (
                <a
                  href={`tel:${phone}`}
                  className="font-semibold hover:underline"
                  key={phone}
                >
                  {phone}  {" "}
                </a>
              ))}
            </div>
            <div className="bg-muted rounded-lg p-6">
              <span className="bg-accent mb-3 flex size-12 flex-col items-center justify-center rounded-full">
                <MessageCircle className="h-6 w-auto" />
              </span>
              <p className="mb-2 text-lg font-semibold">
                {contactData.chatLabel}
              </p>
              <p className="text-muted-foreground mb-3">
                {contactData.chatDescription}
              </p>
              <a href="#" className="font-semibold hover:underline">
                {contactData.chatLink}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
