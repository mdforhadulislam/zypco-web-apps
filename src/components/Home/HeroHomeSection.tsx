import { Package } from 'lucide-react'
import React from 'react'

const HeroHomeSection = () => {
  return (
    <div className='w-full h-auto bg-1'>
        <div className='container m-auto md:h-[40vh] p-4'>

        <div className='w-full h-auto pt-16 pb-5'>

            <h1 className='text-4xl sm:text-5xl  font-extrabold text-white'>ZYPCO COURIER SOLUTATIONS</h1>
            <h3 className='text-base sm:text-xl md:text-3xl font-semibold text-white '>ZIP IT SHIP IT ZYPCO</h3>
        </div>

        <div className='w-full h-auto grid grid-cols-2 grid-rows-2 justify-between'>
          <div className=' bg-white rounded-2xl p-4 shadow-2xl'>
            <div className='w-full h-auto flex justify-center align-middle items-center'>
              <div className='w-full h-auto bg-red-600 p-2 rounded-2xl'>
                <Package  />
              </div>




            </div>


          </div>







<div></div>
        </div>



        </div>


    </div>
  )
}

export default HeroHomeSection