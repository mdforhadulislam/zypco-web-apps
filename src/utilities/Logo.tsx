import Image from 'next/image'
import Link from 'next/link';
import React from 'react'

interface LogoProps {
  isFooter?: boolean;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({isFooter = false, width, height}) => {
  return (
    <Link href={"/"}>
        {isFooter ? 
            <Image
            src="/logo.jpg"
            alt="Zypco Logo"
            width={width}
            height={height}
            className="object-contain"
            priority 
        />:<Image
        src="/logo.jpg"
        alt="Zypco Logo"
        width={140}
        height={80}
        className={`object-contain w-[${width ? width :"120"}px] h-[${height ? height :"70"}px]`}
        priority 
    />}
        


    </Link>
  )
}

export default Logo