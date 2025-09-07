import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  title: string;
  description: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundColor?: string;
  textColor?: string;
}

export default function CTASection({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  backgroundColor = 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800',
  textColor = 'text-white'
}: CTASectionProps) {
  return (
    <section className={`py-24 ${backgroundColor}`}>
      <div className="container mx-auto px-6 text-center">
        <h2 className={`text-4xl lg:text-5xl font-bold mb-8 ${textColor}`}>
          {title}
        </h2>
        <p className={`text-xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90 ${textColor}`}>
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href={primaryCTA.href}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-12 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl">
              {primaryCTA.text} <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
          {secondaryCTA && (
            <Link href={secondaryCTA.href}>
              <Button size="lg" variant="outline" className={`border-white ${textColor} hover:bg-white hover:text-blue-600 px-12 py-6 text-xl transition-all duration-300 rounded-xl`}>
                {secondaryCTA.text}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}