import Navbar from "@/components/global/Navbar";
import Hero from "@/components/landing/Hero";
import IntegrationGrid from "@/components/landing/IntegrationGrid";
import ProblemAccordion from "@/components/landing/Platfoms";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProblemAccordion />
      <IntegrationGrid />
    </>
  );
}
