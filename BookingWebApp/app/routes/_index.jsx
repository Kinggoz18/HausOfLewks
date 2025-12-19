import React, { useEffect, useState } from "react";
import CustomButton from "../Components/CustomButton";

import LeafBanner from "../images/leaf_banner_background.png";
import ValueStars from "../images/value-stars.png";
import ValueCheck from "../images/value-check.png";
import ValueTarget from "../images/value-target.png";
import { useNavigate, Link } from "@remix-run/react";

export const meta = () => {
  const title = "Haus of Lewks | Braids, Locs & Protective Styles in Peterborough";
  const description =
    "Professional braids, locs, retwists and protective styles in Peterborough, Ontario. Discover Haus of Lewks and book your next appointment online.";

  return [
    { title },
    { name: "description", content: description },
  ];
};

export const links = () => [
  { rel: "canonical", href: "https://hausoflewks.com/" },
];

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 }
    );
    
    const element = document.getElementById(`counter-${end}`);
    if (element) observer.observe(element);
    
    return () => observer.disconnect();
  }, [end]);

  return (
    <span id={`counter-${end}`} className="tabular-nums">
      {count}{suffix}
    </span>
  );
};

// Value proposition with staggered animation
const ValueProposition = ({ index, imgrSrc, title, text, isLast }) => {
  return (
    <div 
      className="opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 200}ms`, animationFillMode: 'forwards' }}
    >
      <div className="w-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-y-4 sm:gap-y-5 py-8 sm:py-10 px-6 sm:px-8 md:px-12 relative rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col items-center gap-y-4 sm:gap-y-5 max-w-2xl text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-primary-purple/20 to-secondary-green/20 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <img 
              src={imgrSrc} 
              alt={title} 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain" 
            />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">{title}</h2>
          <p className="text-base sm:text-lg text-black/70 leading-relaxed max-w-xl">{text}</p>
        </div>
      </div>
      {!isLast && (
        <div className="w-full flex justify-center py-4">
          <div className="w-16 h-1 bg-linear-to-r from-primary-purple to-secondary-green rounded-full opacity-30"></div>
        </div>
      )}
    </div>
  );
};

// Stats section
const StatsSection = () => {
  const stats = [
    { number: 500, suffix: "+", label: "Happy Clients" },
    { number: 5, suffix: "+", label: "Years Experience" },
    { number: 100, suffix: "+", label: "Styles Created" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-8 py-8 sm:py-12">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="text-center opacity-0 animate-fade-in"
          style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
        >
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-primary-purple to-secondary-green bg-clip-text text-transparent">
            <AnimatedCounter end={stat.number} suffix={stat.suffix} />
          </div>
          <div className="text-sm sm:text-base text-black/60 mt-2">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

// Services preview
const ServicesPreview = () => {
  const services = [
    { name: "Box Braids", description: "Classic protective styling" },
    { name: "Loc Retwists", description: "Maintain your locs" },
    { name: "Feed-in Braids", description: "Seamless, natural look" },
    { name: "Passion Twists", description: "Bohemian elegance" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {services.map((service, index) => (
        <div 
          key={index}
          className="group bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer opacity-0 animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-linear-to-br from-primary-purple/10 to-secondary-green/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-black">{service.name}</h3>
          <p className="text-xs sm:text-sm text-black/60 mt-1">{service.description}</p>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();

  const onBookClick = () => {
    navigate("/booking/create");
  };

  const valuePropositions = [
    {
      img: ValueStars,
      title: "Satisfaction Guaranteed",
      text: "Love your look or we'll make it right. Your confidence is our priority.",
    },
    {
      img: ValueTarget,
      title: "Precision Styling",
      text: "From feed-ins to loc retwists, each look is crafted with expert technique and close attention to detail.",
    },
    {
      img: ValueCheck,
      title: "Reliable Service",
      text: "We respect your time. Expect prompt appointments, focused sessions, and no rushed results.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] w-full flex items-center overflow-hidden">
        {/* Background with parallax effect */}
        <div className="absolute inset-0 z-0">
          <img
            src={LeafBanner}
            alt="Decorative background"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-b from-white/30 via-transparent to-white/80"></div>
        </div>
        
        {/* Hero content */}
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 py-12 sm:py-16 md:py-20">
          <div className="max-w-4xl">
            {/* Structured data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Haus of Lewks",
                url: "https://hausoflewks.com",
                logo: "https://hausoflewks.com/haus_of_lewks_logo.png",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Peterborough",
                  addressRegion: "ON",
                  addressCountry: "CA",
                },
              }),
            }}
          />
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight animate-fade-in-up">
            Professional braids, flawless dreads, and timeless styles.
              <span className="block mt-2 bg-linear-to-r from-primary-purple to-secondary-green bg-clip-text text-transparent">
              Crafted with care, shaped with skill.
            </span>
          </h1>

            <p className="text-base sm:text-lg md:text-xl text-black/70 mt-4 sm:mt-6 max-w-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Don't wait to look your best. Book now and secure your spot with Peterborough's premier hair styling studio.
            </p>
            
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CustomButton
            onClick={onBookClick}
                label="Book Now"
                className="bg-primary-purple hover:bg-primary-purple/90 text-white py-3 px-6 sm:py-4 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              />
              <Link
                to="/showroom"
                className="inline-flex items-center justify-center py-3 px-6 sm:py-4 sm:px-8 text-sm sm:text-base font-semibold border-2 border-primary-purple text-primary-purple rounded-lg hover:bg-primary-purple/10 transition-all duration-300"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-white py-8 sm:py-12 px-4 sm:px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <StatsSection />
        </div>
      </section>

      {/* Value Propositions */}
      <section className="w-full primary-gradient py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 animate-fade-in">
            Why Choose <span className="text-primary-purple">Haus of Lewks</span>?
          </h2>
          <div className="flex flex-col gap-4 sm:gap-6">
            {valuePropositions.map((prop, index) => (
              <ValueProposition
                key={index}
                index={index}
                imgrSrc={prop.img}
                title={prop.title}
                text={prop.text}
                isLast={index === valuePropositions.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="w-full bg-linear-to-b from-transparent to-white/50 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 primary-gradient">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 animate-fade-in">
              Our Popular Services
            </h2>
            <p className="text-base sm:text-lg text-black/70 max-w-2xl mx-auto">
              From classic braids to intricate loc styles, we've got you covered.
            </p>
      </div>
          <ServicesPreview />
          <div className="text-center mt-8 sm:mt-12">
            <CustomButton
              onClick={onBookClick}
              label="View All Services"
              className="bg-secondary-green hover:bg-secondary-green/90 text-white py-3 px-6 sm:py-4 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-linear-to-br from-primary-purple/5 to-secondary-green/5 rounded-3xl p-6 sm:p-10 md:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">
              About <span className="text-primary-purple">Haus of Lewks</span>
            </h2>
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-black/70 leading-relaxed">
            <p>
              At Haus of Lewks, we believe that great hair is more than just a
                look—it's a statement. Founded by a passionate and highly skilled
              hairstylist with years of experience in braids, locs, and creative
              hair transformations, our studio is where beauty meets precision.
              </p>
              <p>
              From intricate protective styles to bold dreadlock artistry, we
              specialize in making every client feel confident, radiant, and
                uniquely themselves. Located in Peterborough, Ontario, we're proud 
                to serve a growing community of loyal clients who trust us for 
                consistent quality and unmatched results.
              </p>
              <p className="font-semibold text-black text-center text-lg sm:text-xl pt-4">
                Let your hair speak volumes. Book your appointment today!
              </p>
          </div>

            <div className="flex justify-center mt-8">
          <CustomButton
            onClick={onBookClick}
                label="Book An Appointment"
                className="bg-secondary-green hover:bg-secondary-green/90 text-white py-3 px-6 sm:py-4 sm:px-8 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
