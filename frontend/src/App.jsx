import CTA from './Homepage/CTA';
import Footer from './Homepage/footer';
import Hero from './Homepage/Hero';
import HowItWorks from './Homepage/HowItWorks';
import KeyFeatures from './Homepage/KeyFeatures';
import Navbar from './Homepage/Navbar';
import Specialties from './Homepage/Specialties';
import BackToTop from './Homepage/BackToTop';
import AIChatbot from "./components/AIChatbot";

function App() {
  return (
    <>
      <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
        <Navbar />
        <main>
          <Hero />
          <HowItWorks />
          <Specialties />
          <KeyFeatures />
          <CTA />
        </main>
        <Footer />
        <BackToTop />
        <AIChatbot />
      </div>
    </>
  );
}

export default App;
