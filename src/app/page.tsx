import Navbar from "./_components/navbar";
import Hero from "./_components/hero";
import HowItWorks from "./_components/howItWorks";
import ProbSol from "./_components/probSol";
import Partners from "./_components/partners";

export default function Home() {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <HowItWorks/>
      <ProbSol/>
      <Partners/>
    </div>
  );
}
