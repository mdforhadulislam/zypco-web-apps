import HeroHomeSection from "@/components/Home/HeroHomeSection";
import HomeCustomerReviewSection from "@/components/Home/HomeCustomerReviewSection";
import HomeCustomerServiceSection from "@/components/Home/HomeCustomerServiceSection";
import HomeSaliderSectation from "@/components/Home/HomeSaliderSectation";

export default function Home() {
  return (
    <>
      <HeroHomeSection />
      <HomeSaliderSectation />
      <HomeCustomerServiceSection />
      <HomeCustomerReviewSection />
    </>
  );
}
