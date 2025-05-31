import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const MainBanner = () => {

  const banners = [
    {
      desktop: assets.main_banner_bg,
      mobile: assets.main_banner_bg_sm,
    },
    {
      desktop: assets.main_banner_bg_2,     // <-- Add these to your assets
      mobile: assets.main_banner_bg_2,
    },
    {
      desktop: assets.main_banner_bg_3,
      mobile: assets.main_banner_bg_3,
    },
  ];

  const [index, setIndex] = useState(0);

  // Step 3: Auto-slide logic
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 2000); // 2 seconds

    return () => clearInterval(interval); // Cleanup
  }, []);


  return (
    <div className='relative w-full h-[300px] md:h-[450px] overflow-hidden'>
       <img src={banners[index].desktop} alt="banner" className='hidden md:block w-full h-full object-cover transition duration-500 ease-in-out' />
       <img src={banners[index].mobile} alt="banner" className='w-full md:hidden' />
      
       <div className='absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-24 md:pb-0 px-4 md:pl-18 lg:pl-24'>
        {index === 0 && (<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left
         maz-w-72 md:max-w-80 lg:max-w-105 leading-tight lg:leading-15'> Freshness You Can Trust, Savings You Will Love ! </h1> )}
       
       <div className='flex items-center mt-6 font-medium'>
       <Link to={"/products"} className='group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover: bg-primary-dull transition rounded text-white cursor-pointer' >
       Shop now 
       <img className="md:hidden transition group-focus:translate-x-1" src={assets.white_arrow_icon} alt="arrow"/>
       </Link>
       <Link  to={"/products"} className={`group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer transition 
    ${index === 0 ? 'text-black' : 'text-white'}`} >
       Explore Details 
       <img className="transition group-hover:translate-x-1" src={index === 0 ? assets.black_arrow_icon : assets.white_arrow_icon} alt="arrow"/>
       </Link>
       
       </div></div>
    </div>
  )
}

export default MainBanner