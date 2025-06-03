import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import ProductCard from '../components/ProductCard'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import Footer from '../components/Footer'
import ChatWidget from "../components/ChatWidget";

import AdBanner from "../AdBanner.js/AdBanner";
      
      

const Home = () => {
  return (
    <div className='mt-10'>
        <MainBanner />
        <Categories />
        <BestSeller />
        <AdBanner />
        <ProductCard />
        <BottomBanner />
        <NewsLetter />
        <ChatWidget />
    </div>
  )
}

export default Home