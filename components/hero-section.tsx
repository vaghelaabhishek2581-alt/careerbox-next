import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { HeroSectionProps } from '@/lib/types';

interface ExtendedHeroProps extends HeroSectionProps {
  badge?: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  backgroundGradient = 'from-slate-50 via-blue-50 to-purple-50',
  badge,
  stats
}: ExtendedHeroProps) {
  return (
    <section className={`py-20 bg-gradient-to-br ${backgroundGradient}`}>
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          {badge && (
            <Badge className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 text-base font-medium">
              {badge}
            </Badge>
          )}
          
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight">
            {title}
          </h1>
          
          {subtitle && (
            <h2 className="text-3xl lg:text-4xl font-semibold text-gray-700 mb-6">
              {subtitle}
            </h2>
          )}
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href={primaryCTA.href}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl">
                {primaryCTA.text} <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            {secondaryCTA && (
              <Link href={secondaryCTA.href}>
                <Button size="lg" variant="outline" className="px-10 py-6 text-xl border-2 hover:bg-gray-50 transition-all duration-300 rounded-xl">
                  {secondaryCTA.text}
                </Button>
              </Link>
            )}
          </div>

          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}