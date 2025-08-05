import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import MembersMarquee from './components/MembersMarquee';
import WhatWeDo from './components/WhatWeDo';
import Gallery from './components/Gallery';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <MembersMarquee />
        <WhatWeDo />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}