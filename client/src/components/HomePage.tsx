import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".home-section");
      const scrollPos = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    const section = document.querySelectorAll(".home-section")[index];
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: "🚗",
      title: "Real-Time Availability",
      description: "See live parking slot availability updated every minute",
      color: "from-[#1B42CB] to-[#1B42CB]/80",
    },
    {
      icon: "📍",
      title: "Smart Navigation",
      description: "Get turn-by-turn directions to your booked parking spot",
      color: "from-[#FF2F6C] to-[#FF2F6C]/80",
    },
    {
      icon: "💰",
      title: "Best Price Guarantee",
      description: "We guarantee the best parking rates in your area",
      color: "from-[#1B42CB] to-[#FF2F6C]",
    },
    {
      icon: "🛡️",
      title: "Secure Parking",
      description: "24/7 surveillance and security at all our locations",
      color: "from-[#FF2F6C] to-[#1B42CB]",
    },
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Daily Commuter",
      content:
        "Saves me 15 minutes every morning finding parking near my office!",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      role: "Event Planner",
      content: "Perfect for finding parking during crowded city events.",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "Business Traveler",
      content: "The real-time updates make business trips so much smoother.",
      rating: 4,
    },
  ];

  const stats = [
    { value: "5,000+", label: "Parking Slots" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Support Available" },
    { value: "50+", label: "Cities" },
  ];

  return (
    <div className="relative bg-linear-to-br from-[#191919] via-[#0f0f0f] to-[#191919]">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1B42CB]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF2F6C]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-linear-to-r from-[#1B42CB]/5 to-[#FF2F6C]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation Dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === index
                ? "bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] scale-125"
                : "bg-[#EEECF6]/30 hover:bg-[#EEECF6]/50"
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="home-section min-h-screen flex items-center justify-center relative px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#1B42CB]/10 border border-[#1B42CB]/30 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#FF2F6C] animate-pulse"></span>
                <span className="text-sm font-medium text-[#EEECF6]">
                  Smart Parking Solution
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-linear-to-r from-[#EEECF6] via-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent">
                  Park Smarter,
                </span>
                <br />
                <span className="bg-linear-to-r from-[#FF2F6C] via-[#1B42CB] to-[#EEECF6] bg-clip-text text-transparent">
                  Live Better
                </span>
              </h1>

              <p className="text-xl text-[#EEECF6]/80 mb-8 max-w-2xl">
                Find, book, and manage parking spots in real-time with our
                intelligent parking platform. Never circle the block again!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/"
                  className="px-8 py-4 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-bold rounded-xl text-lg hover:shadow-2xl hover:shadow-[#FF2F6C]/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Find Parking Now
                </Link>
                <button className="px-8 py-4 bg-[#191919]/50 border border-[#1B42CB]/30 text-[#EEECF6] font-bold rounded-xl text-lg hover:bg-[#1B42CB]/10 transition-all duration-300">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-[#EEECF6]/60">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <div className="relative">
                <div className="backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-3xl p-8 shadow-2xl shadow-[#1B42CB]/10">
                  <div className="space-y-6">
                    <div className="bg-linear-to-r from-[#1B42CB]/20 to-[#FF2F6C]/20 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-[#EEECF6]">
                            Downtown Plaza
                          </div>
                          <div className="text-[#EEECF6]/60">
                            24 slots available
                          </div>
                        </div>
                        <div className="text-3xl">🅿️</div>
                      </div>
                      <div className="h-2 bg-[#191919] rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] w-3/4"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#191919]/50 rounded-xl p-4">
                        <div className="text-sm text-[#EEECF6]/60 mb-2">
                          Price
                        </div>
                        <div className="text-xl font-bold text-[#EEECF6]">
                          ₹50/hour
                        </div>
                      </div>
                      <div className="bg-[#191919]/50 rounded-xl p-4">
                        <div className="text-sm text-[#EEECF6]/60 mb-2">
                          Distance
                        </div>
                        <div className="text-xl font-bold text-[#EEECF6]">
                          0.5km
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-4 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#FF2F6C]/20 transition-all duration-300">
                      Book This Spot
                    </button>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 backdrop-blur-xl bg-[#FF2F6C]/10 border border-[#FF2F6C]/30 rounded-2xl flex items-center justify-center animate-float">
                  <span className="text-2xl">📍</span>
                </div>
                <div className="absolute -bottom-6 -right-6 w-20 h-20 backdrop-blur-xl bg-[#1B42CB]/10 border border-[#1B42CB]/30 rounded-2xl flex items-center justify-center animate-float delay-1000">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-section min-h-screen flex items-center relative px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1B42CB]/10 border border-[#1B42CB]/30 mb-4">
              <span className="text-sm font-medium text-[#EEECF6]">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] bg-clip-text text-transparent">
                Features That Make
              </span>
              <br />
              <span className="text-[#EEECF6]">Parking Effortless</span>
            </h2>
            <p className="text-lg text-[#EEECF6]/70 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with user-friendly
              design to transform your parking experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-2xl p-6 hover:border-[#FF2F6C]/40 hover:shadow-2xl hover:shadow-[#FF2F6C]/10 transition-all duration-500 transform hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-[#EEECF6] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#EEECF6]/70">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-[#EEECF6] mb-4">
                  How It Works
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Search & Filter",
                      desc: "Find parking spots by location, price, and availability",
                    },
                    {
                      step: "2",
                      title: "Book Instantly",
                      desc: "Reserve your spot with one click, no waiting required",
                    },
                    {
                      step: "3",
                      title: "Navigate & Park",
                      desc: "Get directions and park in your reserved spot",
                    },
                    {
                      step: "4",
                      title: "Pay Securely",
                      desc: "Automatic payment with multiple secure options",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center shrink-0">
                        <span className="font-bold text-white">
                          {item.step}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-[#EEECF6] mb-1">
                          {item.title}
                        </div>
                        <div className="text-[#EEECF6]/70">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="backdrop-blur-xl bg-linear-to-br from-[#1B42CB]/20 to-[#FF2F6C]/20 border border-[#1B42CB]/30 rounded-2xl p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-[#EEECF6]">
                          Live Map
                        </div>
                        <div className="text-xs px-3 py-1 bg-[#191919]/50 rounded-full text-[#EEECF6]">
                          Real-time
                        </div>
                      </div>
                      <div className="h-48 bg-[#191919]/50 rounded-xl flex items-center justify-center">
                        <span className="text-4xl">🗺️</span>
                      </div>
                      <div className="text-sm text-[#EEECF6]/60">
                        Interactive map showing available parking spots near you
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-section min-h-screen flex items-center relative px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF2F6C]/10 border border-[#FF2F6C]/30 mb-4">
              <span className="text-sm font-medium text-[#EEECF6]">
                User Stories
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="text-[#EEECF6]">Loved by</span>
              <span className="bg-linear-to-r from-[#FF2F6C] to-[#1B42CB] bg-clip-text text-transparent">
                {" "}
                Thousands
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-2xl p-6 hover:border-[#FF2F6C]/40 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < testimonial.rating
                          ? "text-[#FF2F6C]"
                          : "text-[#EEECF6]/30"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-[#EEECF6]/80 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <div className="font-bold text-[#EEECF6]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[#EEECF6]/60">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="backdrop-blur-xl bg-linear-to-r from-[#1B42CB]/10 to-[#FF2F6C]/10 border border-[#1B42CB]/20 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-[#EEECF6] mb-4">
              Ready to Transform Your Parking Experience?
            </h3>
            <p className="text-lg text-[#EEECF6]/70 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users who have made parking
              stress-free with our intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-8 py-4 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-[#FF2F6C]/20 transition-all duration-300"
              >
                Get Started Free
              </Link>
              <Link
                to="/bookings"
                className="px-8 py-4 bg-[#191919]/50 border border-[#1B42CB]/30 text-[#EEECF6] font-bold rounded-xl hover:bg-[#1B42CB]/10 transition-all duration-300"
              >
                View Bookings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="home-section min-h-screen flex items-center relative px-4 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="backdrop-blur-xl bg-[#191919]/40 border border-[#1B42CB]/20 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#1B42CB] to-[#FF2F6C] flex items-center justify-center">
                    <span className="text-xl">🚗</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#EEECF6]">
                      SmartPark
                    </h2>
                    <p className="text-[#EEECF6]/60">
                      Intelligent Parking Solutions
                    </p>
                  </div>
                </div>
                <p className="text-[#EEECF6]/70 mb-8">
                  We're on a mission to make urban parking stress-free,
                  efficient, and accessible for everyone. Our technology
                  connects drivers with available parking spots in real-time.
                </p>
                <div className="flex gap-4">
                  <button className="w-10 h-10 rounded-lg bg-[#191919]/50 border border-[#1B42CB]/30 flex items-center justify-center hover:border-[#FF2F6C]/30 transition-colors">
                    <span className="text-lg">📱</span>
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-[#191919]/50 border border-[#1B42CB]/30 flex items-center justify-center hover:border-[#FF2F6C]/30 transition-colors">
                    <span className="text-lg">📧</span>
                  </button>
                  <button className="w-10 h-10 rounded-lg bg-[#191919]/50 border border-[#1B42CB]/30 flex items-center justify-center hover:border-[#FF2F6C]/30 transition-colors">
                    <span className="text-lg">📘</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-[#EEECF6] mb-4">Quick Links</h3>
                  <ul className="space-y-3">
                    {[
                      "Parking Slots",
                      "Bookings",
                      "How It Works",
                      "Pricing",
                    ].map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-[#EEECF6]/70 hover:text-[#EEECF6] transition-colors"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-[#EEECF6] mb-4">Contact</h3>
                  <ul className="space-y-3 text-[#EEECF6]/70">
                    <li>support@smartpark.com</li>
                    <li>+91 98765 43210</li>
                    <li>24/7 Support Available</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#1B42CB]/20 text-center">
              <p className="text-[#EEECF6]/60">
                © {new Date().getFullYear()} SmartPark. All rights reserved.
              </p>
              <p className="text-sm text-[#EEECF6]/40 mt-2">
                Making parking better, one spot at a time.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <p className="text-lg text-[#EEECF6]/70 mb-6">
              Start your stress-free parking journey today
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-[#1B42CB] to-[#FF2F6C] text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-[#FF2F6C]/20 transition-all duration-300 group"
            >
              Find Your Perfect Parking Spot
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Animation */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
