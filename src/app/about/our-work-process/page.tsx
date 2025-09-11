import OurWorkProcessSection from '@/components/About/OurWorkProcessSection';
import PageHeader from '@/utilities/PageHeader';
import React from 'react'

const ZypcoWorkProcess = () => {
  return (
    <>
    <div className="w-full h-auto bg-[#241F21]">
      <PageHeader title="ABOUT US" subtitle="OUR WORK PROCESS" mainLink='/about' subLink='/about/our-work-process' />
    </div>
    <OurWorkProcessSection />
    </>
  );
}

export default ZypcoWorkProcess