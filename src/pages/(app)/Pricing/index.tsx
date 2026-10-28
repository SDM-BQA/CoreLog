import Navbar from "../Navigation/Navbar";
import { PricingSection } from "./PricingSection";

export const Pricing = () => {
  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <PricingSection />
      </main>
    </div>
  );
};
