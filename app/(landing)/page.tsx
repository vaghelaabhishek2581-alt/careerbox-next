'use client';

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Briefcase, Users, TrendingUp, Award, Target, BookOpen, Building2, GraduationCap, Video, Star } from 'lucide-react';
import Footer from '@/components/footer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

// Mentors data for Verified Experts carousel (module-scope)
const mentors = [
  { name: 'Mahesh Patel', role: 'Sr. Mentor(MD)', qualification: 'MA', experience: '20 Year Experience', image: '/counsellor1.png', id: 'mbpatel', rating: 4.9, reviews: 150, counsellingCount: 20000 },
  { name: 'Mahesh Patel', role: 'Sr. Mentor(Founder)', qualification: 'MSc.Tech', experience: '6 Year Experience', image: '/counsellor2.png', id: 'mkpatel', rating: 4.6, reviews: 130, counsellingCount: 4500 },
  { name: 'Abhishek Vaghela', role: 'Counsellor', qualification: 'B.Tech CE', experience: '4 Year Experience', image: '/counsellor3.png', id: 'abhishekvaghela', rating: 4.5, reviews: 140, counsellingCount: 1200 },
  { name: 'Vatsal Zinzuwadiya', role: 'Cousellor', qualification: 'B.Tech CE', experience: '3 Year Experience', image: '/counsellor4.png', id: 'vatsalzinzuvadiya', rating: 4.2, reviews: 90, counsellingCount: 480 },
];

// Students band profiles (placeholder avatars; replace with real student images when available)
const studentsBand = [
  { name: 'Aarav Singh', img: 'https://i.pravatar.cc/150?u=aarav.singh' },
  { name: 'Diya Sharma', img: 'https://i.pravatar.cc/150?u=diya.sharma' },
  { name: 'Kabir Mehta', img: 'https://i.pravatar.cc/150?u=kabir.mehta' },
  { name: 'Riya Patel', img: 'https://i.pravatar.cc/150?u=riya.patel' },
  { name: 'Ayush Verma', img: 'https://i.pravatar.cc/150?u=ayush.verma' },
  { name: 'Sara Khan', img: 'https://i.pravatar.cc/150?u=sara.khan' },
  { name: 'Ishaan Gupta', img: 'https://i.pravatar.cc/150?u=ishaan.gupta' },
  { name: 'Meera Joshi', img: 'https://i.pravatar.cc/150?u=meera.joshi' },
  { name: 'Vivaan Desai', img: 'https://i.pravatar.cc/150?u=vivaan.desai' },
  { name: 'Naina Rao', img: 'https://i.pravatar.cc/150?u=naina.rao' },
];

export default function LandingPage() {
  useEffect(() => {
    // Animate hero content
    gsap.fromTo('.hero-content',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power2.out' }
    );

    // Animate feature cards
    gsap.fromTo('.feature-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
    );
  }, []);

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  // autoplay for hero
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    onSelect();
    setSlideCount(carouselApi?.scrollSnapList().length ?? 0);
    carouselApi.on('select', onSelect);
    const timer = setInterval(() => carouselApi?.scrollNext(), 5000);
    return () => {
      carouselApi.off('select', onSelect);
      clearInterval(timer);
    };
  }, [carouselApi]);

  // Define hero slides used by the hero carousel
  const slides = [
    {
      title: 'Find Your Perfect Course',
      subtitle: 'Connect with Leading Institutes',
      description:
        'Explore top institutes, compare courses, and take the next step in your academic or professional journey.',
      primaryCta: { href: '/recommendation-collections', label: 'Explore Institutes' },
      secondaryCta: { href: '/auth/signup', label: 'Get Started Free' },
      tags: ['Diploma', 'Degree', 'Masters', 'M.phil', 'Ph.D', 'Certificate Courses', 'Study Abroad', 'Skill Programs', 'Top Institutes'],
      image: '/hero1.jpg',
    },
    { 
      title: 'Upgrade skills. Unlock opportunities.',
      subtitle: 'Learn in-demand skills from experts',
      description:
        'Discover verified courses curated by industry mentors. Get real-time guidance and job-ready training.',
      primaryCta: { href: '/recommendation-collections', label: 'Explore Courses' },
      secondaryCta: { href: '/career-counselling', label: 'Connect Live' },
      tags: ['Data Science', 'AI/ML', 'Design', 'Marketing', 'Cloud', 'Cybersecurity'],
      image: '/hero2.jpg',
    },
    {
      title: 'Connect with Student Admission Inquiries',
      subtitle: 'For Colleges & Educational Institutes',
      description:
        'Reach high-intent candidates and manage verified applications with transparent selection processes.',
      primaryCta: { href: '/institutes-service', label: 'Partner with CareerBox' },
      secondaryCta: { href: '/contact', label: 'Contact Us' },
      tags: ['Verified Applications', 'High-Intent Leads', 'Placement & Outreach'],
      image: '/hero3.jpg',
    },
  ];

  // partners carousel api & autoplay (continuous)
  const [partnersApi, setPartnersApi] = useState<CarouselApi | null>(null);
  useEffect(() => {
    if (!partnersApi) return;
    const timer = setInterval(() => partnersApi?.scrollNext(), 2000);
    return () => clearInterval(timer);
  }, [partnersApi]);

  // Students band slider autoplay
  const [studentsApi, setStudentsApi] = useState<CarouselApi | null>(null);
  useEffect(() => {
    if (!studentsApi) return;
    const timer = setInterval(() => studentsApi?.scrollNext(), 2000);
    return () => clearInterval(timer);
  }, [studentsApi]);

  // Animated student flyers: 100+ concurrent timelines with randomized paths
  useEffect(() => {
    const section = document.getElementById('students-band');
    if (!section) return;

    // Respect reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const flyers = Array.from(section.querySelectorAll('.student-tile')) as HTMLElement[];
      gsap.set(flyers, { opacity: 0.7 });
      return;
    }

    const flyers = Array.from(section.querySelectorAll('.student-tile')) as HTMLElement[];
    const rect = section.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    const pickSide = () => ['top', 'right', 'bottom', 'left'][Math.floor(Math.random() * 4)] as 'top'|'right'|'bottom'|'left';
    const startPos = () => {
      const side = pickSide();
      if (side === 'top') return { x: rand(0, W), y: -rand(120, 240) };
      if (side === 'bottom') return { x: rand(0, W), y: H + rand(120, 240) };
      if (side === 'left') return { x: -rand(120, 240), y: rand(0, H) };
      return { x: W + rand(120, 240), y: rand(0, H) };
    };
    const endPos = () => {
      const side = pickSide();
      if (side === 'top') return { x: rand(0, W), y: -rand(140, 260) };
      if (side === 'bottom') return { x: rand(0, W), y: H + rand(140, 260) };
      if (side === 'left') return { x: -rand(140, 260), y: rand(0, H) };
      return { x: W + rand(140, 260), y: rand(0, H) };
    };

    const makePath = (i: number) => {
      const s = startPos();
      const m = { x: rand(W * 0.1, W * 0.9), y: rand(H * 0.15, H * 0.85) };
      const e = endPos();
      return {
        s, m, e,
        // Slow-motion: longer durations for smoother, calmer flight
        dur1: rand(3.0, 4.0),
        dur2: rand(3.0, 4.0),
        // Slight stagger to avoid simultaneous starts
        delay: rand(0, 2.0) + i * 0.01,
        // Pause between loops still gentle
        repeatDelay: rand(0.9, 3.0),
      };
    };

    const timelines: gsap.core.Timeline[] = [];

    flyers.forEach((el, i) => {
      const p = makePath(i);
      gsap.set(el, { x: p.s.x, y: p.s.y, opacity: 0, rotate: rand(-8, 8), scale: rand(0.9, 1.1) });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: p.repeatDelay });
      tl.to(el, { x: p.m.x, y: p.m.y, opacity: 1, duration: p.dur1, ease: 'power3.out', delay: p.delay })
        .to(el, { x: p.e.x, y: p.e.y, opacity: 0, duration: p.dur2, ease: 'power2.in' });
      tl.eventCallback('onRepeat', () => {
        const np = makePath(i);
        gsap.set(el, { x: np.s.x, y: np.s.y, opacity: 0, rotate: rand(-8, 8), scale: rand(0.9, 1.1) });
        tl.clear();
        tl.to(el, { x: np.m.x, y: np.m.y, opacity: 1, duration: np.dur1, ease: 'power3.out' })
          .to(el, { x: np.e.x, y: np.e.y, opacity: 0, duration: np.dur2, ease: 'power2.in' });
      });
      timelines.push(tl);
    });

    return () => timelines.forEach((t) => t.kill());
  }, []);

  // Institutional partners list (replace with real logos when available)
  
  const partners = [
     { name: 'Adani University', img: '/uni1.jpg' },
     { name: 'Ahmedabad University', img: '/uni2.jpg' },
     { name: 'GLS University', img: '/uni3.jpg' },
     { name: 'Gandhinagar University', img: '/uni4.jpg' },
     { name: 'Institute of Advance Research', img: '/uni5.jpg' },
     { name: 'JG University', img: '/uni6.jpg' },
     { name: 'Karnavati University', img: '/uni7.jpg' },
     { name: 'Nirma University', img: '/uni8.jpg' },
     { name: 'PD Energy University', img: '/uni9.jpg' },
     { name: 'SVGU', img: '/uni10.jpg' },
     { name: 'Silver Oak University', img: '/uni11.jpg' },
  ];

  // Explore Courses program chips with eligibility lines
  const programCategories = [
    { title: 'UG Courses', sub: 'After 12th' },
    { title: 'PG Courses', sub: 'After Graduation' },
    { title: 'Doctorate / Ph.D', sub: 'After UG or PG + Work Ex' },
    { title: 'Executive Education', sub: 'For Working Professionals & CXOs' },
    { title: 'Advanced Diploma', sub: 'After 10th or 12th' },
    { title: 'Diploma Courses', sub: 'After 10th or 12th' },
    { title: 'Skilling & Certificate', sub: 'After 10th or 12th' },
    { title: 'Study Abroad', sub: 'Pathway / Hybrid mode' },
    { title: 'Job Guarantee', sub: '100% Placement *' },
  ];

  return (
    <div className="min-h-screen">
      {/* Add top padding to account for fixed header */}
      <div>
        {/* Hero Section (Slider) */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-10 lg:pt-20 min-h-[calc(90vh)] relative">
           <Carousel
             opts={{ align: 'start', loop: true }}
            setApi={setCarouselApi}
           >
             <CarouselContent>
               {slides.map((slide, idx) => (
                 <CarouselItem key={idx}>
                   <div className="mx-[20px] sm:mx-[70px] mt-8 sm:mt-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-stretch">
                       {/* Left side content */}
                       <div className="space-y-4 sm:space-y-5 md:space-y-6 pt-6 sm:pt-8 md:pt-12 lg:pt-16 pb-8 sm:pb-12 md:pb-16">
                         <h1 className="hero-content text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                           {slide.title}
                         </h1>
                         <h2 className="hero-content text-xl sm:text-2xl md:text-3xl text-gray-800 font-semibold leading-snug">
                           {slide.subtitle}
                         </h2>
                         <p className="hero-content text-gray-600 text-base sm:text-lg md:text-xl max-w-prose md:max-w-xl">
                           {slide.description}
                         </p>
                         <div className="hero-content flex flex-wrap gap-3">
                           <Link href={slide.primaryCta.href}>
                             <Button size="lg" variant="outline" className="px-6 w-full sm:w-auto">
                               {slide.primaryCta.label}
                             </Button>
                           </Link>
                           <Link href={slide.secondaryCta.href}>
                             <Button size="lg" className="px-6 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                               {slide.secondaryCta.label}
                             </Button>
                           </Link>
                         </div>
                       </div>

                       {/* Right visual with overlay badges */} 
                      <div className="relative flex justify-center md:justify-end h-full">
                        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-[240px] sm:h-[380px] md:h-[520px] lg:h-[620px] xl:h-[720px] md:-my-16 lg:-my-20 xl:-my-24" />
                         <img
                           src={slide.image}
                           alt={slide.title}
                          className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-auto max-h-full"
                         />
                         {/* floating tags per mock */}
                         {/* top-right program */}
                         {/* <Badge className="absolute -top-4 sm:-top-6 right-2 sm:right-6 rounded-lg bg-pink-100 text-gray-800 text-xs sm:text-sm">JOIN YOUR PROGRAM</Badge> */}
                         {/* category chips */}
                         {/* <Badge variant="outline" className="absolute top-3 sm:top-6 left-1/2 -translate-x-1/2 bg-white text-xs sm:text-sm">{slide.tags[0]}</Badge>
                         <Badge variant="outline" className="absolute top-8 sm:top-14 right-2 sm:right-10 bg-white text-xs sm:text-sm">{slide.tags[1]}</Badge>
                         <Badge variant="outline" className="absolute top-8 sm:top-14 left-2 sm:left-10 bg-white text-xs sm:text-sm">{slide.tags[2]}</Badge>
                         <Badge variant="outline" className="absolute top-12 sm:top-24 left-4 sm:left-20 bg-white text-xs sm:text-sm">{slide.tags[3] ?? ''}</Badge> */}
                         {/* explore label */}
                         {/* <Badge className="absolute -right-2 sm:-right-6 top-12 sm:top-24 bg-white text-gray-900 border text-xs sm:text-sm">Explore TOP</Badge> */}
                         {/* create profile */}
                         {/* <Badge className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs sm:text-sm">+ Create profile</Badge> */}
                       </div>
                     </div>
                  </div>
                   </CarouselItem>
               ))}
             </CarouselContent>

            <CarouselPrevious className="hidden md:flex absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="hidden md:flex absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-10" />
             {/* Dots */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6 md:bottom-8 z-30 flex items-center justify-center gap-2">
               {Array.from({ length: slideCount }).map((_, i) => (
                 <button
                   key={i}
                   aria-label={`Go to slide ${i + 1}`}
                   onClick={() => carouselApi?.scrollTo(i)}
                   className={
                     i === selectedIndex
                       ? 'h-2.5 w-2.5 rounded-full bg-gray-800'
                       : 'h-2.5 w-2.5 rounded-full bg-gray-300'
                   }
                 />
               ))}
             </div>
           </Carousel>
         </section>

        {/* Stats + Institutional partners band */}
        <section className="bg-[#1f1f1f] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 text-center items-start justify-items-center">
              {/* <div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">1M+</div>
                <div className="mt-2 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">Learners Joined</div>
              </div> */}
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">300+</div>
                <div className="mt-2 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">Popular Institutions</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">700+</div>
                <div className="mt-2 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">Specialization Courses</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">100+</div>
                <div className="mt-2 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">Expert Mentors</div>
              </div>
            </div>

            <div className="my-10 md:my-16 lg:my-20 border-t border-white/20 mx-auto w-full max-w-xl md:max-w-2xl" />

            <div className="mt-10">
              <Carousel opts={{ align: 'start', loop: true }} setApi={setPartnersApi}>
                <CarouselContent>               
                 {partners.map((p) => (
                    <CarouselItem
                     key={p.name}
                      className="basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-1/6 xl:basis-1/6 2xl:basis-1/7"
                    >
                      <div className="flex justify-center">
                       {/* <div className="h-16 md:h-20 w-36 sm:w-40 md:w-44 rounded-xl bg-white text-gray-900 flex items-center justify-center shadow-sm">
                         <span className="font-semibold text-xs sm:text-sm md:text-base text-center px-3">{p.name}</span>
                       </div> */}
                       <div className="h-16 md:h-20 w-36 sm:w-40 md:w-44 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden">
                         <img src={p.img} alt={p.name} className="h-10 md:h-12 w-auto object-contain" />
                       </div>
                      </div>
                    </CarouselItem>
                 ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-block text-gray-300 text-sm md:text-base tracking-wide">
                Popular Institutes
                <div className="mt-1 h-[2px] w-full bg-white/30" />
              </div>
            </div>
          </div>
        </section>

        {/* Explore Courses section with category pills */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Explore Courses</h2>
            <div className="mt-2 flex justify-center">
              <div className="h-1 w-28 rounded-full bg-blue-600" />
            </div>
            <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600">Course programs that you are dreaming for bright career</p>
          </div>

          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mx-[70px]">
            {programCategories.map((item) => (
              <Link key={item.title} href={`/recommendation-collections`} className="block" aria-label={item.title}>
                {/* href={`/courses?category=${encodeURIComponent(item.title)}`} */}
                <div className="mx-auto w-full max-w-[340px] sm:max-w-[400px] md:max-w-[460px] rounded-full bg-blue-600 text-white px-6 sm:px-8 lg:px-10 py-4 sm:py-5 shadow-sm transition-colors hover:bg-blue-700">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-semibold leading-tight">{item.title}</div>
                    <div className="mt-1 text-xs sm:text-sm opacity-90">{item.sub}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 sm:mt-14 flex justify-center">
            <Link href="/career-counselling">
              <Button className="rounded-full px-8 py-5 md:py-6 text-base md:text-xl bg-black text-white">
                Get Free Counselling <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Connect Live card */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <Card className="rounded-3xl overflow-hidden bg-black text-white mx-auto max-w-6xl shadow-lg">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8 sm:gap-10 items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md border border-white/20 flex items-center justify-center">
                      <Video className="h-5 w-5" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">Connect Live</h3>
                  </div>

                  <div className="mt-3 text-sm sm:text-base font-semibold">
                    Get 1-on-1 Guidance from Our Expert Career Advisors
                  </div>

                  <p className="mt-3 text-gray-300 text-sm sm:text-base">
                    Talk directly with an expert via live video call for personalized career counselling.
                  </p>

                  <div className="mt-6 border-t border-white/15 max-w-sm" />

                  <div className="mt-6 text-xs sm:text-sm md:text-base text-gray-300">
                    Ready to Connect? Book Your Appointment Today.
                  </div>

                  <div className="mt-6">
                    <Link href="/career-counselling">
                      <Button className="rounded-full bg-white text-black hover:bg-gray-100 px-6 py-4 text-base font-semibold">
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-end">
                  <div className="w-[220px] sm:w-[260px] md:w-[320px] lg:w-[360px] aspect-square rounded-full overflow-hidden border-4 border-white/15">
                    <img src="/connect.png" alt="Connect Live Call" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Verified Experts grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="text-[11px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider">Say Hello to Personalized Guidance</div>
            <div className="text-[10px] sm:text-[11px] md:text-xs text-gray-500 uppercase mt-1">Goodbye to Faceless Calls</div>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">Unlock Your Potential</h2>
            <div className="mt-1 text-xl sm:text-2xl md:text-3xl font-semibold">
              Expert Advisor for <span className="underline decoration-blue-600 decoration-4 underline-offset-6 md:underline-offset-8">Right Guidance</span>
            </div>
            <p className="mt-6 text-gray-600 max-w-3xl md:max-w-4xl mx-auto text-sm sm:text-base">
              Our team of 100+ Senior Mentors have been delivering personalized, data-backed career success since 2019.
              Get the strategic insight you need for your successful future.
            </p>
          </div>

          <div className="mt-10 mx-[70px]">
            <Carousel opts={{ align: 'start', loop: true }}>
              <CarouselContent>
                {mentors.map((m, idx) => (
                  <CarouselItem key={idx} className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="group relative mx-auto w-full max-w-[240px] sm:max-w-[260px] md:max-w-[280px]">
                      <div className="rounded-2xl bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200 h-[280px] sm:h-[300px]">
                        <img src={`${m.image}`} alt={`${m.name} portrait`} className="absolute inset-0 w-full h-full object-cover rounded-2xl border-2 border-white/10" />
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                          <div className="flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 shadow-sm">
                            <Star className="h-3.5 w-3.5 text-yellow-500" />
                            <span className="text-[11px] sm:text-xs font-semibold">{m.rating ?? '4.5'}</span>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <div className="flex items-center gap-1.5 rounded-xl bg-green-100 text-green-800 px-2.5 py-1.5 shadow-sm">
                            <span className="text-[11px] sm:text-xs font-bold">{m.counsellingCount ?? '1724+'}</span>
                            <span className="text-[10px] sm:text-xs font-medium">Counselling</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-[80%] bg-black/60 text-white rounded-xl shadow-lg p-3 sm:p-4 text-center">
                        <div className="font-semibold text-sm sm:text-base">{m.name}</div>
                        <div className="mt-1 text-[11px] sm:text-xs text-white-500">
                          {m.role} <span className="ml-1">{m.qualification}</span>
                        </div>
                        <div className="mt-1 text-[11px] sm:text-xs text-white-500">{m.experience}</div>
                        <div className="mt-2">
                          <Link href="/career-counselling">
                            <Button size="sm" className="rounded-full px-4 bg-white text-black hover:bg-gray-100">Consult Now</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="mx-[20px] sm:mx-[40px]" />
              <CarouselNext className="mx-[20px] sm:mx-[40px]" />
            </Carousel>
          </div>

          <div className="mt-12 sm:mt-14 flex justify-center">
            <Link href="/career-counselling">
              <Button className="rounded-full px-8 py-5 md:py-6 text-base md:text-lg bg-blue-600 text-white">
                Explore <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Students already joined band */}
        <section id="students-band" className="relative w-full bg-[#11867B] mt-16 sm:mt-20 py-14 sm:py-16 md:py-20 min-h-[420px] sm:min-h-[560px] md:min-h-[700px] overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="mx-auto inline-flex flex-col items-center bg-black/50 rounded-2xl px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 shadow-sm">
                <div className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">MILLIONS OF STUDENT</div>
                <div className="mt-1 sm:mt-2 text-white/90 text-base sm:text-lg md:text-xl">needs better career counselling</div>
              </div>
            </div>
          </div>  

          <div className="absolute inset-0 z-0 pointer-events-none">
            {Array.from({ length: 120 }).map((_, i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/100?u=recent-${i + 1}`}
                alt="students need counselling"
                className="student-tile absolute w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover shadow-md"
                style={{ willChange: 'transform, opacity' }}
              />
            ))}
          </div>
        </section>
        
        {/* Institutes features + Partner CTA */}
        <section className="mx-[70px] py-16">
          {/* Header + subtitle */}
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">For Educational Institutes</h2>
            <p className="mt-3 text-base md:text-lg text-gray-700">Partner with CareerBox and Reach Thousands of Future Students</p>
            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
            <p className="mt-6 text-sm md:text-base text-gray-700">Are you an educational institution looking to connect with motivated students seeking personalized career guidance?</p>
            <p className="mt-1 text-sm md:text-base text-gray-700">Join the CareerBox network to showcase your programs and drive enrollment.</p>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Expand Your Reach', desc: "Get your institute's profile and programs in front of a highly targeted audience actively searching for their next career step." },
              { title: 'Targeted Enrollment', desc: 'Connect directly with students whose career goals align perfectly with your course offerings.' },
              { title: 'Seamless Integration', desc: "Easily manage your institute's profile, update course details, and track inquiries through our dedicated partner portal." },
            ].map((card) => (
              <Card key={card.title} className="rounded-2xl bg-rose-50 shadow-sm">
                <CardContent className="p-8">
                  <div className="text-lg md:text-xl font-semibold text-gray-900 mb-3 text-center">{card.title}</div>
                  <p className="text-sm md:text-base text-gray-700 text-center leading-relaxed">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gradient CTA band */}
          <div className="mt-12">
            <Link href="/institutes-service" className="block">
              <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-12 md:py-14 text-center shadow-lg">
                <div className="text-2xl md:text-3xl font-bold">Join Our Institute Partner Program</div>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <div className="text-base md:text-lg font-semibold">Call Us: <span className="font-normal">+91 99096 75185</span></div>
                  <div className="text-base md:text-lg font-semibold">Email: <span className="font-normal">partner@careerbox.in</span></div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Business Partnerships hero (Coming Soon) */}
        {/* <section className="bg-blue-600 text-white">
          <div className="mx-[70px] py-24 md:py-32 text-center">
            <div className="text-3xl md:text-4xl font-bold tracking-tight">Business Partnerships</div>
            <div className="mt-2 text-sm md:text-base opacity-90">Exciting Opportunities on the Horizon</div>
            <div className="mt-8 text-lg md:text-2xl font-medium opacity-95">For Employers & Service Providers</div>

            <h2 className="mt-10 md:mt-12 text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight">Coming Soon..</h2>

            <div className="mt-12 md:mt-14 max-w-2xl mx-auto">
              <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-8 md:px-12 py-8 md:py-10 inline-block shadow-lg">
                <div className="text-2xl md:text-3xl font-bold">Stay Updated!</div>
                <div className="mt-4 text-base md:text-lg">Email: <span className="font-semibold">business@careerbox.in</span></div>
                <div className="mt-3 text-sm md:text-base opacity-90">Visit this page again soon for launch details.</div>
              </div>
            </div>
          </div>
        </section> */}

        {/* Connect With the CareerBox Team */}

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
           {/* Header */}
           <div className="text-center">

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Connect With the CareerBox Team</h2>
             <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-blue-600" />

            <p className="mt-6 max-w-3xl md:max-w-4xl mx-auto text-sm sm:text-base text-gray-700">
               We are here to help you take the next step in your career journey. Whether you have questions about our services,
               need technical support, or want to book your personalized counseling session, reach out to us!
             </p>
           </div>

           {/* Content */}

          <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mx-[20px] sm:mx-[200px]">
             {/* Left copy */}
             <div className="text-gray-900">


              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold">Talk to Our Support Team</h3>
              <div className="mt-6 space-y-4 text-gray-800">
                 <p className="text-base">
                   <span className="font-semibold">For Admission Counselling:</span>
                   <span className="ml-2">+91 99096 75185</span>
                 </p>
                 <p className="text-base">
                   <span className="font-semibold">For Technical Support:</span>
                   <span className="ml-2">+91 98984 36995</span>
                 </p>

                <div className="text-base">
                   <span className="font-semibold">Hours of Operation:</span>
                   <span className="ml-2">Monday to Saturday</span>

                  <div className="mt-1">9:00 AM to 6:00 PM IST</div>
                 </div>
               </div>


              <h3 className="mt-8 sm:mt-10 text-xl sm:text-2xl md:text-3xl font-semibold">Drop Us an Email</h3>
               <div className="mt-6 space-y-3 text-gray-800">
                 <p className="text-base">
                   <span className="font-semibold">General Inquiries:</span>
                   <span className="ml-2">info@careerbox.in</span>
                 </p>
                 <p className="text-base">
                   <span className="font-semibold">Support & Feedback:</span>
                   <span className="ml-2">support@careerbox.in</span>
                 </p>
               </div>
             </div>

             {/* Right image */}
             <div className="relative flex justify-center md:justify-end">
              <div className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[360px] md:h-[360px] rounded-full bg-gray-100" />
               <img
                 src="/contact.png"
                 alt="Headphones"
                 className="absolute inset-0 m-auto w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[320px] md:h-[320px] lg:w-[360px] lg:h-[360px] object-contain"
                 loading="lazy"
               />
             </div>
           </div>
         </section>

        <Footer/>
      </div>
    </div>
  );
}

// Mentors data for Verified Experts carousel (moved above to avoid TDZ)
// mentors data moved above