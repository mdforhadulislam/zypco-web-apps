import OurStorySection from "@/components/About/OurStorySection";
import OurWorkProcessSection from "@/components/About/OurWorkProcessSection";
import HeroHomeSection from "@/components/Home/HeroHomeSection";
import HomeCustomerReviewSection from "@/components/Home/HomeCustomerReviewSection";
import HomeCustomerServiceSection from "@/components/Home/HomeCustomerServiceSection";
import HomeSaliderSectation from "@/components/Home/HomeSaliderSectation";

export default function Home() {
  return (
    <>
      <HeroHomeSection />
      <OurStorySection />
      <HomeSaliderSectation />
      <OurWorkProcessSection/>
      <HomeCustomerServiceSection />
      <HomeCustomerReviewSection />
    </>
  );
}
