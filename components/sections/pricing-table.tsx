'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

import Noise from '@/components/noise';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FeatureSection {
  category: string;
  isNew?: boolean;
  features: {
    name: string;
    isNew?: boolean;
    free: string | boolean | null;
    pro: string | boolean | null;
    business: string | boolean | null;
    enterprise: string | boolean | null;
  }[];
}

const pricingPlans = [
  {
    name: 'Essential',
    price: '$79/month',
    yearlyPrice: '$777/year',
  },
  {
    name: 'Growth',
    price: '$249/month',
    yearlyPrice: '$2,450/year',
  },
  {
    name: 'Professional',
    price: '$749/month',
    yearlyPrice: '$7,370/year',
  },
  {
    name: 'Business',
    price: '$1,499/month',
    yearlyPrice: '$14,750/year',
  },
];

const comparisonFeatures: FeatureSection[] = [
  {
    category: 'Pricing',
    features: [
      {
        name: 'Monthly pricing',
        free: '$79/month',
        pro: '$249/month',
        business: '$749/month',
        enterprise: '$1,499/month',
      },
      {
        name: 'Annual pricing (save 18%)',
        free: '$777/year',
        pro: '$2,450/year',
        business: '$7,370/year',
        enterprise: '$14,750/year',
      },
    ],
  },
  {
    category: 'Core Features',
    features: [
      {
        name: 'AI-powered RFT analysis',
        free: true,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'Smart compliance tracking',
        free: true,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'Professional document export',
        free: true,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'Win strategy builder',
        free: null,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'Evidence & sources library',
        free: null,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'Answer library & reuse',
        free: null,
        pro: true,
        business: true,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Usage Limits',
    features: [
      {
        name: 'Tenders per month',
        free: '1',
        pro: '3',
        business: '7',
        enterprise: 'Unlimited',
      },
      {
        name: 'Document uploads per month',
        free: '10',
        pro: '20',
        business: '50',
        enterprise: 'Unlimited',
      },
      {
        name: 'Team members',
        free: '1',
        pro: '3',
        business: '10',
        enterprise: 'Unlimited',
      },
    ],
  },
  {
    category: 'Advanced Features',
    features: [
      {
        name: 'Pricing schedule assistant',
        free: null,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'Evaluation score predictor',
        free: null,
        pro: null,
        business: true,
        enterprise: true,
      },
      {
        name: 'Approvals & audit trail',
        free: null,
        pro: null,
        business: true,
        enterprise: true,
      },
      {
        name: 'Custom workflows & automation',
        free: null,
        pro: null,
        business: null,
        enterprise: true,
      },
      {
        name: 'API access for integrations',
        free: null,
        pro: null,
        business: null,
        enterprise: true,
      },
      {
        name: 'Custom branding & templates',
        free: null,
        pro: null,
        business: null,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Security & Compliance',
    features: [
      {
        name: 'Australian data hosting',
        free: true,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'ISO 27001 certified',
        free: true,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'Bank-level encryption',
        free: true,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'Role-based access control',
        free: null,
        pro: true,
        business: true,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Support',
    features: [
      {
        name: 'Email support',
        free: true,
        pro: true,
        business: true,
        enterprise: true,
      },
      {
        name: 'Response time',
        free: '< 3 days',
        pro: '< 1 day',
        business: '< 12 hours',
        enterprise: '< 4 hours',
      },
      {
        name: 'Dedicated account manager',
        free: null,
        pro: null,
        business: true,
        enterprise: true,
      },
      {
        name: 'Priority support & onboarding',
        free: null,
        pro: null,
        business: true,
        enterprise: true,
      },
      {
        name: 'Dedicated success manager',
        free: null,
        pro: null,
        business: null,
        enterprise: true,
      },
      {
        name: '24/7 priority support',
        free: null,
        pro: null,
        business: null,
        enterprise: true,
      },
    ],
  },
];

const PricingTable = () => {
  const [selectedPlan, setSelectedPlan] = useState(1);

  return (
    <section className="section-padding">
      <div className="bigger-container space-y-8 lg:space-y-12">
        <Noise />

        <h2 className="text-4xl leading-tight font-medium tracking-tight lg:text-5xl">
          Pricing Details
        </h2>
        <div>
          <PlanHeaders
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
          />
          <FeatureSections selectedPlan={selectedPlan} />
        </div>
      </div>
    </section>
  );
};

const PlanHeaders = ({
  selectedPlan,
  onPlanChange,
}: {
  selectedPlan: number;
  onPlanChange: (index: number) => void;
  prefersReducedMotion?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="">
      {/* Mobile View */}
      <div className="md:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="">
          <div className="flex items-center justify-between py-4">
            <CollapsibleTrigger className="flex items-center gap-2">
              <h3 className="text-2xl">{pricingPlans[selectedPlan].name}</h3>
              <ChevronsUpDown
                className={`size-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="flex flex-col space-y-2 p-2">
            {pricingPlans.map(
              (plan, index) =>
                index !== selectedPlan && (
                  <Button
                    variant="outline"
                    key={index}
                    onClick={() => {
                      onPlanChange(index);
                      setIsOpen(false);
                    }}
                  >
                    {plan.name}
                  </Button>
                ),
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop View */}
      <div className="grid grid-cols-6 gap-4 max-md:hidden">
        <div className="col-span-1 max-md:hidden md:col-span-2"></div>

        {pricingPlans.map((plan, index) => (
          <h3 key={index} className="mb-3 text-center text-2xl">
            {plan.name}
          </h3>
        ))}
      </div>
    </div>
  );
};

const FeatureSections = ({ selectedPlan }: { selectedPlan: number }) => {
  return (
    <>
      {comparisonFeatures.map((section, sectionIndex) => (
        <div key={sectionIndex} className="flex flex-col md:mt-4 md:gap-1">
          <div className="py-4">
            <h3 className="flex items-center gap-8 text-lg">
              {section.category}
              {section.isNew && <Badge variant="outline">NEW</Badge>}
            </h3>
          </div>
          {section.features.map((feature, featureIndex) => (
            <div
              key={featureIndex}
              className="text-primary grid grid-cols-2 items-center font-medium md:grid-cols-6"
            >
              <span className="me-8 inline-flex items-center gap-4 py-4 md:col-span-2">
                {feature.name}
                {feature.isNew && (
                  <Badge variant="default" className="rounded-sm">
                    NEW
                  </Badge>
                )}
              </span>
              {/* Mobile View - Only Selected Plan */}
              <div className="md:hidden">
                <div className="bg-border border-input flex items-center justify-center gap-1 rounded-md border py-3 text-sm">
                  {(() => {
                    const value = [
                      feature.free,
                      feature.pro,
                      feature.business,
                      feature.enterprise,
                    ][selectedPlan];
                    return renderFeatureValue(value);
                  })()}
                </div>
              </div>
              {/* Desktop View - All Plans */}
              <div className="hidden md:col-span-4 md:grid md:grid-cols-4 md:gap-1">
                {[
                  feature.free,
                  feature.pro,
                  feature.business,
                  feature.enterprise,
                ].map((value, i) => (
                  <div
                    key={i}
                    className="bg-border border-input flex items-center justify-center gap-1 rounded-md border py-3 text-sm"
                  >
                    {renderFeatureValue(value)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

const renderFeatureValue = (value: string | boolean | null) => {
  if (value === null) {
    return <span className="text-gray-400">-</span>;
  }

  if (typeof value === 'boolean') {
    return value ? (
      <Check className="size-5" />
    ) : (
      <span className="text-gray-400">-</span>
    );
  }

  return <span>{value}</span>;
};

export default PricingTable;
