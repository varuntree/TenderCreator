import Noise from '@/components/noise';

const stats = [
  { number: '70%', label: 'Time Reduction in Tender Preparation' },
  { number: '2025', label: 'Year Launched' },
  { number: '100%', label: 'Australian Data Hosting' },
  { number: 'AI', label: 'Powered Intelligence Engine' },
  { number: '24/7', label: 'Platform Availability' },
  { number: 'ISO', label: '27001 Certified Infrastructure' },
];

export default function AboutHero() {
  return (
    <section className="section-padding relative">
      <Noise />
      <div className="bigger-container">
        {/* Hero Content */}
        <div className="text-center">
          <h1 className="text-center text-4xl font-medium tracking-tighter md:text-6xl md:leading-none lg:text-7xl">
            Built to Win. Powered by AI. Designed for You.
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-3xl text-lg leading-relaxed lg:mt-4">
            Empowering Australian businesses to respond to government and corporate tenders faster, with AI-powered automation that reduces preparation time by 70% while ensuring compliance and quality.
          </p>
        </div>

        <h2 className="mt-8 max-w-3xl text-4xl leading-none font-medium tracking-tight md:mt-12 lg:mt-16 lg:text-5xl">
          Transforming tender responses from weeks of work into days of strategic advantage.
        </h2>

        {/* Stats Grid - Left Aligned */}
        <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:mt-12 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="border-input border-b">
              <div className="text-3xl font-medium md:text-4xl lg:text-5xl">
                {stat.number}
              </div>
              <div className="text-muted-foreground my-6 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
