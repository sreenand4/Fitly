import Navbar from "../components/navbar";
import Hero from "../components/landingPage/hero";
import HowItWorks from "../components/landingPage/howItWorks";
import ProbSol from "../components/landingPage/probSol";
import Partners from "../components/landingPage/partners";
import ContactForm from "../components/landingPage/contactForm";

export default function Home() {
  return (
    <div>
      <Hero/>
      <HowItWorks/>
      <ProbSol/>
      <Partners/>
      <ContactForm/>
    </div>
  );
}
