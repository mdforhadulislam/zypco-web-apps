"use client"
import { Calculator, PackagePlus, PackageSearch } from 'lucide-react'
import React, { useState } from 'react'

const HeroHomeSectionBox = () => {
    const [activeBox, setActiveBox] = useState({
        calculatorBox : false,
        trackingBox:true,
        createBox: false
    })
  return (
    
        <div className="w-full h-auto grid lg:grid-cols-2 lg:grid-rows-1 grid-cols-1 grid-rows-2 justify-between pt-8">
          <div className=" lg:w-[95%] bg-white rounded-2xl p-3 shadow-2xl">
            <div className="w-full h-auto flex justify-evenly align-middle items-center">
              <div className={`w-full h-auto p-5  ${activeBox.calculatorBox && "bg-2 text-white hover:bg-2-90"} transition-all duration-300 rounded-tl-lg cursor-pointer flex justify-center align-middle items-center `} onClick={()=>{
                setActiveBox({
                    trackingBox:false,
                    createBox:false,
                    calculatorBox:true
                })
              }}>
                <Calculator  size={45}/>
              </div>
              <div className={`w-full p-5 ${activeBox.trackingBox && "bg-2 text-white hover:bg-2-90"} transition-all duration-300 cursor-pointer flex justify-center align-middle items-center`} 
              onClick={()=>{
                setActiveBox({
                    trackingBox:true,
                    createBox:false,
                    calculatorBox:false
                })
              }}>
                <PackageSearch size={45} />
              </div>
              <div className={`w-full p-5 ${activeBox.createBox && "bg-2 text-white hover:bg-2-90"} transition-all duration-300 cursor-pointer rounded-tr-lg flex justify-center align-middle items-center`} onClick={()=>{
                setActiveBox({
                    trackingBox:false,
                    createBox:true,
                    calculatorBox:false
                })
              }}>
                <PackagePlus size={45} />
              </div>
            </div>
            
{
    activeBox.calculatorBox && <div className='w-full h-auto bg-2 rounded-b-lg p-3'>
        <div>
            <input/>
        </div>
    </div>
}
{
    activeBox.trackingBox && <div></div>
}

{
    activeBox.createBox && <div></div>
}

          </div>

          <div></div>
        </div>
  )
}

export default HeroHomeSectionBox