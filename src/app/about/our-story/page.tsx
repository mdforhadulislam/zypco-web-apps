import AboutUsOurStorySection from '@/components/About/AboutUsOurStorySection';
import PageHeader from '@/utilities/PageHeader';
import React from 'react'

const ZypcoStory = () => {
  return (
    <div className="w-full h-auto bg-[#241F21]">
    <PageHeader title="ABOUT US" subtitle="OUR STORY" />
    <AboutUsOurStorySection />
  </div>
  )
}

export default ZypcoStory