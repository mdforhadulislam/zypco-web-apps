import HeroHomeSection from "@/components/Home/HeroHomeSection";
import HomeCustomerServiceSection from "@/components/Home/HomeCustomerServiceSection";
import HomeSaliderSectation from "@/components/Home/HomeSaliderSectation";

export default function Home() {
  return (
    <>
      <HeroHomeSection />
      <HomeSaliderSectation />
      <HomeCustomerServiceSection />
    </>
  );
}
