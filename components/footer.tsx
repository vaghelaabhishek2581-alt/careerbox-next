import Link from "next/link";
import Logo from "./logo";

const navigation = {
  platform: [
    { name: "For Professionals", href: "/services" },
    { name: "For Businesses", href: "/business" },
    { name: "For Institutes", href: "/institutes" },
    { name: "About Us", href: "/about" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Case Studies", href: "/case-studies" },
    { name: "Help Center", href: "/help" },
    { name: "API Documentation", href: "/api/doc" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
  ],
};

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com/careerbox", icon: "twitter" },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/careerbox",
    icon: "linkedin",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/careerbox",
    icon: "facebook",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/careerbox",
    icon: "instagram",
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-6 gap-8 mb-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Empowering careers, transforming lives. Your pathway to
              professional excellence starts here.
            </p>
            <div className="text-blue-400 font-medium text-lg">
              &quot;Your Pathway to Professional Excellence&quot;
            </div>
          </div>

          {/* Navigation sections */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Platform</h4>
            <ul className="space-y-3">
              {navigation.platform.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Company</h4>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Legal</h4>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2024 CareerBox. All rights reserved.
            </div>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${item.name}`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
