import Navbar from "../_components/navbar";
import Hero from "../_components/hero";
import HowItWorks from "../_components/howItWorks";
import ProbSol from "../_components/probSol";
import Partners from "../_components/partners";
import ContactForm from "../_components/contactForm";

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
