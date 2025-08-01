import Image from 'next/image'
import React from 'react'

interface LogoProps {
  isFooter?: boolean;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({isFooter = false, width, height}) => {
  return (
    <div>
        {isFooter ? 
            <Image
            src="/footer-logo.jpg"
            alt="Zypco Logo"
            width={width}
            height={height}
            className="object-contain"
            priority 
        />:<Image
        src="/logo.jpg"
        alt="Zypco Logo"
        width={80}
        height={80}
        className="object-contain w-[60px] h-[60px]"
        priority 
    />}
        


    </div>
  )
}

export default Logo