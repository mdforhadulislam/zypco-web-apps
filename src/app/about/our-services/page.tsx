import OurServiceSection from '@/components/About/OurServiceSection';
import PageHeader from '@/utilities/PageHeader'
import React from 'react'

const ZypcoService = () => {
  return (
    <>
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader title="ABOUT US" subtitle="OUR SERVICES" />
    </div>

    <OurServiceSection />
    </>
  );
}

export default ZypcoService