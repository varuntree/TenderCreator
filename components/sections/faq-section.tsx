'use client';

import Noise from '@/components/noise';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqData = [
  {
    id: 'what-is-tendercreator',
    question: 'What is TenderCreator and who should use it?',
    answer:
      'TenderCreator is an AI-powered platform that automates tender response creation for Australian businesses. It\'s designed for companies responding to government and corporate RFTs—from small consultancies to large enterprises bidding on complex infrastructure projects. If you\'re spending weeks writing tender responses, TenderCreator reduces that time by 70%.',
  },
  {
    id: 'how-ai-works',
    question: 'How does the AI analyze RFT requirements?',
    answer:
      'Our AI engine reads your uploaded RFT documents and automatically extracts mandatory requirements, weighted evaluation criteria, compliance checkpoints, and submission deadlines. It identifies what evaluators are looking for and maps these requirements to your company profile, generating a strategic response framework in minutes instead of days.',
  },
  {
    id: 'data-security',
    question: 'Is my tender data secure and kept in Australia?',
    answer:
      'Absolutely. All data is hosted exclusively in Australian data centres with ISO 27001 certification and IRAP alignment. We use bank-level encryption, and your commercial-in-confidence information is never used to train external AI models. Your tender data stays private, secure, and onshore.',
  },
  {
    id: 'pricing-model',
    question: 'How does TenderCreator pricing work?',
    answer:
      'We offer flexible subscription plans based on the number of active tenders and team members. All plans include unlimited RFT uploads, AI-powered analysis, compliance tracking, and professional document export. Start with a free trial to test the platform with your next tender, then choose the plan that fits your tender volume.',
  },
  {
    id: 'integration-workflow',
    question: 'Can TenderCreator integrate with our existing workflow?',
    answer:
      'Yes. TenderCreator works alongside your existing processes—upload RFT documents, manage your company profile, generate responses, and export submission-ready documents in Word, PDF, or Excel formats. Teams can collaborate in real-time with role-based permissions, approvals, and audit trails that meet government probity requirements.',
  },
];

export default function FAQSection() {
  return (
    <section className="section-padding relative px-[5px]">
      <Noise />
      <div className="container">
        {/* Section Header */}
        <h2 className="text-4xl leading-tight tracking-tight lg:text-5xl">
          Frequently <br className="hidden md:block" />
          asked questions:
        </h2>

        {/* FAQ Content */}
        <div className="mt-8 lg:mt-12">
          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-input hover:shadow-primary/5 rounded-lg !border px-6 py-2 transition-all duration-300 hover:shadow-md"
              >
                <AccordionTrigger className="cursor-pointer text-base font-medium hover:no-underline md:text-lg lg:text-xl">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
