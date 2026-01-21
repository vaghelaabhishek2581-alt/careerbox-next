"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/footer";
import { MapPin, Briefcase, Clock, Users, Award, Heart, Compass, Building2, GraduationCap, Sparkles, ArrowRight, Star, CheckCircle2, Mail, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

const openings = [
  { id: "se-frontend", title: "Senior Frontend Engineer", dept: "Engineering", location: "Ahmedabad", type: "Full-time", experience: "5+ years", tags: ["React", "TypeScript", "TailwindCSS"] },
  { id: "se-backend", title: "Senior Backend Engineer", dept: "Engineering", location: "Ahmedabad", type: "Full-time", experience: "6+ years", tags: ["Node.js", "MongoDB", "Microservices"] },
  { id: "pm", title: "Product Manager", dept: "Product", location: "Remote", type: "Full-time", experience: "4+ years", tags: ["Roadmaps", "User Research", "Agile"] },
  { id: "uiux", title: "UI/UX Designer", dept: "Design", location: "Remote", type: "Contract", experience: "3+ years", tags: ["Figma", "Design Systems", "Prototyping"] },
  { id: "bd", title: "Business Development Manager", dept: "Business", location: "Ahmedabad", type: "Full-time", experience: "4+ years", tags: ["Sales", "Partnerships", "CRM"] },
  { id: "cs", title: "Customer Success Specialist", dept: "Operations", location: "Remote", type: "Full-time", experience: "2+ years", tags: ["Support", "Onboarding", "Documentation"] },
];

const departments = ["All", "Engineering", "Product", "Design", "Business", "Operations"];
const locations = ["All", "Ahmedabad", "Remote"];

export default function CareersClient() {
  const [dept, setDept] = useState("All");
  const [loc, setLoc] = useState("All");
  const [query, setQuery] = useState("");
  const [activeDeptChip, setActiveDeptChip] = useState("All");
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedOpening, setSelectedOpening] = useState<typeof openings[0] | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantNote, setApplicantNote] = useState("");
  const CAREERS_EMAIL = "careers@careerbox.in";

  const filteredOpenings = useMemo(() => {
    return openings.filter((o) => {
      const effectiveDept = activeDeptChip !== "All" ? activeDeptChip : dept;
      const matchesDept = effectiveDept === "All" || o.dept === effectiveDept;
      const matchesLoc = loc === "All" || o.location === loc;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.dept.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q));
      return matchesDept && matchesLoc && matchesQuery;
    });
  }, [dept, loc, query, activeDeptChip]);

  const mailtoHref = useMemo(() => {
    const subject = `Application: ${selectedOpening?.title || "CareerBox Role"}`;
    const body = `Name: ${applicantName}\nEmail: ${applicantEmail}\nRole: ${selectedOpening?.title || ""}\nLocation: ${selectedOpening?.location || ""}\nExperience: ${selectedOpening?.experience || ""}\n\n${applicantNote}\n\nPlease find my resume attached.`;
    return `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [selectedOpening, applicantName, applicantEmail, applicantNote]);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-[28rem] h-[28rem] rounded-full bg-white/70 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-sm">
                <Star className="h-4 w-4" />
                We’re hiring across engineering, product, and design
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight">Build Careers That Matter</h1>
              <p className="mt-4 text-lg md:text-xl text-blue-100">
                Join us to transform how learners discover institutes and programs. Help build products used across India.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#openings">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-6 text-lg">
                    View Open Positions
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="#culture">
                  <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white px-8 py-6 text-lg">
                    Life at CareerBox
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="culture" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Culture</h2>
          <p className="text-lg text-gray-600">We value impact, craftsmanship, and empathy. You’ll own problems end-to-end, collaborate across roles, and ship outcomes that help learners and institutes thrive.</p>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-blue-600" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="mt-3 text-lg">Craft Over Hype</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">We ship thoughtful experiences with attention to detail, prioritizing usability and reliability over buzzwords.</CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Compass className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="mt-3 text-lg">Ownership & Autonomy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">You’ll own problems end-to-end, with space to make decisions and accountability to deliver outcomes.</CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Heart className="h-5 w-5 text-rose-600" />
              </div>
              <CardTitle className="mt-3 text-lg">Empathy For Users</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">We build for learners, institutes, and partners. Every decision optimizes their experience and success.</CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="mt-3 text-lg">Transparent Communication</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">We share context early, document decisions, and prefer clarity over complexity.</CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="mt-3 text-lg">Collaborative By Default</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">Designers, engineers, and PMs work closely to validate ideas and iterate quickly.</CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle className="mt-3 text-lg">Continuous Learning</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">We invest in growth: courses, mentorship, and time to sharpen skills.</CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 md:p-12 shadow-2xl">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">Why CareerBox</div>
              <div className="text-blue-100">Impact-focused work, supportive team, and products used by learners and institutes nationwide.</div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-xl font-semibold">300+</div>
                <div className="text-sm text-blue-100">Partner Institutes</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-xl font-semibold">50k+</div>
                <div className="text-sm text-blue-100">Student Connections</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-xl font-semibold">95%</div>
                <div className="text-sm text-blue-100">Placement Rate</div>
              </div>
            </div>
            <div className="flex gap-3 justify-end md:justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">Talk to Us</Button>
              </Link>
              <a href="#openings">
                <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white">See Openings</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="openings" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Current Openings</h2>
          <p className="text-gray-600">Find your next role. Apply to positions that match your skills and ambition.</p>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-blue-600" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 mb-8 sticky top-20 z-20">
          <div className="grid lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-700 mb-2">Department</div>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-700 mb-2">Location</div>
              <Select value={loc} onValueChange={setLoc}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col lg:col-span-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Search</div>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills or titles" className="h-10" />
              <div className="mt-3 flex flex-wrap gap-2">
                {departments.map((d) => (
                  <Button
                    key={d}
                    variant={activeDeptChip === d ? "default" : "outline"}
                    size="sm"
                    className={activeDeptChip === d ? "bg-blue-600 text-white" : ""}
                    onClick={() => setActiveDeptChip(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpenings.map((o) => (
            <Card key={o.id} className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{o.title}</CardTitle>
                    <div className="text-sm text-gray-500">{o.dept}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">{o.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{o.location}</span>
                  <Briefcase className="h-4 w-4 text-gray-400 ml-4" />
                  <span>{o.experience}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {o.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setSelectedOpening(o);
                      setApplyOpen(true);
                    }}
                  >
                    Apply
                  </Button>
                  <Link href={`/contact?role=${encodeURIComponent(o.title)}`}>
                    <Button variant="outline" className="w-full">
                      Ask a Question
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOpenings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-lg font-semibold text-gray-900 mb-2">No openings match your filters</div>
            <div className="text-gray-600 mb-6">Try changing department, location, or keywords.</div>
            <Link href="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700">Contact HR</Button>
            </Link>
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="mt-3 text-lg">Benefits</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Competitive compensation and growth-aligned reviews</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Flexible work with supportive collaboration</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Learning budget for courses and conferences</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Health coverage and wellness support</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="mt-3 text-lg">Hiring Process</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Intro call to align on role and expectations</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Skill assessment or portfolio walkthrough</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Panel interviews with cross-functional peers</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Final round and offer discussion</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Heart className="h-5 w-5 text-rose-600" />
              </div>
              <CardTitle className="mt-3 text-lg">Life at CareerBox</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Supportive team culture and regular knowledge-sharing</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Ship fast, iterate thoughtfully, and celebrate wins</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Mentorship and clear growth paths</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Community impact through education partnerships</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for {selectedOpening?.title || "Role"}</DialogTitle>
            <DialogDescription>Send your resume to the email below. Use the form to prefill your details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{CAREERS_EMAIL}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(CAREERS_EMAIL)}
                className="gap-1"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="text-sm">Your Name</Label>
                <Input
                  placeholder="Enter your full name"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm">Your Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm">Short Note</Label>
                <Textarea
                  placeholder="Brief summary of experience and interest"
                  value={applicantNote}
                  onChange={(e) => setApplicantNote(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href={mailtoHref}>
                  Open Email Client
                </a>
              </Button>
              <Link href={`/contact?role=${encodeURIComponent(selectedOpening?.title || "")}`}>
                <Button variant="outline" className="w-full">
                  Request Callback
                </Button>
              </Link>
            </div>
            <div className="text-xs text-gray-500">
              Attach your resume in the email. Supported formats: PDF or DOCX.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
