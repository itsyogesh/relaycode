import { HeroSection } from "@/components/sections/hero-section";
import { WhyDevelopers } from "@/components/sections/why-developers";
import { ExtrinsicBuilderSection } from "@/components/sections/extrinsic-builder";
import { DappBuildersSection } from "@/components/sections/dapp-builders";
import { SubstrateUtilitiesSection } from "@/components/sections/substrate-utilities";
import { TestimonialsSection } from "@/components/sections/testimonials";

export default function Page() {
  return (
    <>
      <HeroSection />
      <WhyDevelopers />
      <ExtrinsicBuilderSection />
      <DappBuildersSection />
      <SubstrateUtilitiesSection />
      <TestimonialsSection />
    </>
  );
}
