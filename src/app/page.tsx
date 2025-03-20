import Navbar from "../components/navbar";
import Hero from "../components/hero";
import HowItWorks from "../components/howItWorks";
import ProbSol from "../components/probSol";
import Partners from "../components/partners";
import ContactForm from "../components/contactForm";

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
