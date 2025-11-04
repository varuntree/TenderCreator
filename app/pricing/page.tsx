import { Metadata } from 'next';

import Pricing from '@/components/sections/pricing';
import PricingTable from '@/components/sections/pricing-table';

export const metadata: Metadata = {
  title: 'Pricing - TenderCreator',
  description:
    'Choose the perfect TenderCreator plan for your tender volume. Compare features and pricing from Essential to Business plans with 70% time savings.',
};

export default function PricingPage() {
  return (
    <>
      <Pricing />
      <PricingTable />
    </>
  );
}
