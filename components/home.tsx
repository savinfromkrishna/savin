
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { generatePortfolioInsight } from './services/geminiService';
import { Project, JournalPost, TimelineEvent, Page, GenerationStatus } from './types';

// --- IMAGES ---
const USER_PHOTOS = {
  HERO_GREEN: "https://res.cloudinary.com/dpqnfjpdw/image/upload/v1770693647/ChatGPT_Image_Dec_29__2025__07_39_12_AM-removebg-preview_w81waa.png", 
  ABOUT_SUIT: "https://res.cloudinary.com/dpqnfjpdw/image/upload/v1770692822/WhatsApp_Image_2026-02-10_at_6.54.16_AM_1_bbiwck.jpg", 
  JOURNAL_PLAID: "https://res.cloudinary.com/dpqnfjpdw/image/upload/v1770692822/WhatsApp_Image_2026-02-10_at_6.54.16_AM_2_hfhew8.jpg" 
};

// --- COMPONENTS ---

const TechScribbleSVG = () => (
  <svg className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path d="M0,10 L100,10 M0,30 L100,30 M0,50 L100,50 M0,70 L100,70 M0,90 L100,90" stroke="black" strokeWidth="0.5" />
    <path d="M10,0 L10,100 M30,0 L30,100 M50,0 L50,100 M70,0 L70,100 M90,0 L90,100" stroke="black" strokeWidth="0.5" />
    <circle cx="50" cy="50" r="40" stroke="black" fill="none" strokeWidth="0.2" />
  </svg>
);

const MarkerFrame: React.FC<{ children: React.ReactNode, className?: string, shapeType?: 1 | 2 | 3 }> = ({ children, className = "", shapeType = 1 }) => {
  const shapeClass = shapeType === 1 ? 'sketch-shape-1' : shapeType === 2 ? 'sketch-shape-2' : 'sketch-shape-3';
  return (
    <div className={`relative group ${className}`}>
      <svg className="absolute -inset-2 sm:-inset-3 w-[calc(100%+16px)] sm:w-[calc(100%+24px)] h-[calc(100%+16px)] sm:h-[calc(100%+24px)] pointer-events-none z-20 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
          d={shapeType === 1 ? "M2,5 L98,2 L95,98 L5,95 Z" : shapeType === 2 ? "M5,10 L92,5 L98,92 L8,98 Z" : "M8,2 L95,8 L92,95 L2,90 Z"} 
          fill="none" 
          stroke="black" 
          strokeWidth="2" 
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-300 group-hover:stroke-[4px]"
        />
      </svg>
      <div className={`relative z-10 overflow-hidden h-full w-full ${shapeClass} border-2 border-black bg-white`}>
        {children}
      </div>
    </div>
  );
};

const RevealOnScroll: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.10 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
};

// --- DATA ---
const PROJECTS: Project[] = [
  { id: 'case_1', title: 'ScrapeFlow', year: '2025', description: 'SaaS Web Scraping Platform', tech: ['Next.js', 'TS', 'React Flow', 'Prisma', 'Stripe'], outcome: 'Automated complex visual scraping workflows with zero manual coding.', longDescription: 'A production-grade SaaS platform for visual web-scraping automation. Features a drag-and-drop workflow designer using React Flow, encrypted credential management, and AI-assisted form interactions.', imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda536ad0a?q=80&w=1200' },
  { id: 'case_2', title: 'ARENA GD', year: '2025', description: 'AI Discussion Analytics', tech: ['AI Agents', 'Real-time', 'Node.js'], outcome: 'Achieved 95% realism in AI-to-human debate simulations.', longDescription: 'An AI-driven Group Discussion and Debate platform. Features a real-time orchestration engine supporting human participants and multiple AI agents with distinct personalities.', imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200' },
  { id: 'case_3', title: 'ShopDots', year: '2023', description: 'Multivendor Ecom', tech: ['Microservices', 'Kafka', 'Docker'], outcome: 'Scaled to handle 10k concurrent sessions via event-driven analytics.', longDescription: 'Scalable e-commerce SaaS platform utilizing a Microservice Architecture with Kafka for high-volume analytics processing and Docker for deployment.', imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200' },
  { id: 'case_4', title: 'Enterprise ERP', year: '2024', description: 'Modular Workflow Engine', tech: ['Next.js', 'Postgres', 'Tailwind'], outcome: 'Improved internal operational efficiency by 30% for industrial manufacturing.', longDescription: 'Scalable ERP platform with no-code drag-and-drop builders for modules and forms, implementing complex lookup relationships and formula fields.', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200' },
  { id: 'case_5', title: 'AI Card Reader', year: '2024', description: 'Lead Extraction Tool', tech: ['Node.js', 'OCR', 'Jobs'], outcome: 'Processed over 50k leads with 98% extraction accuracy.', longDescription: 'AI-based card reader tool for sales teams. Processes image uploads via background jobs for accurate lead data extraction and CRM integration.', imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1200' },
];

const JOURNAL: JournalPost[] = [
  { id: 'post_1', date: 'Oct 24', title: 'The Future of AI Agents', excerpt: 'How Arena GD is shaping placement prep.', content: 'Exploring the intersection of LLMs and group dynamics. We realized that AI isn\'t just in answers, but in simulating the friction of human collaboration.' },
  { id: 'post_2', date: 'Sep 24', title: 'Scaling with Kafka', excerpt: 'Architecting ShopDots for high volume.', content: 'Microservices often die at the network layer. We discuss how we implemented Apache Kafka in the ShopDots ecosystem to handle event-driven analytics.' },
  { id: 'post_3', date: 'Aug 24', title: 'No-Code for Enterprises', excerpt: 'Building the Nessco ERP builder.', content: 'The shift towards configurable enterprise software. Detailing the engineering behind our drag-and-drop form builder, allowing non-technical admins to create schemas.' },
];

const CAREER: TimelineEvent[] = [
  { year: '2024-Pres', title: 'Full Stack Developer', company: 'NESSCO INDUSTRIES', description: 'Leading the architecture of high-performance Next.js ecosystems. Specialized in multi-tenant ERP solutions and distributed systems optimization.', tags: ['Next.js', 'Prisma', 'PostgreSQL', 'Architecture'] },
  { year: '2023-2023', title: 'MERN Intern', company: 'CodeCluse', description: 'Engineered secure auth protocols and inventory management modules using the full MERN stack.', tags: ['MongoDB', 'Express', 'React', 'Node'] },
];

const SECONDARY_SKILLS = ['PostgreSQL', 'Prisma', 'Docker', 'Kafka', 'Redis', 'Nginx', 'VPS', 'Drizzle', 'MongoDB', 'Socket.io', 'Git', 'Agile', 'i18n', 'Microservices', 'OOP', 'REST APIs'];

// --- HELPERS ---
const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-8 md:mb-12 border-b-4 border-black pb-4 md:pb-8 scroll-mt-28 md:scroll-mt-32">
    <h2 className="text-3xl sm:text-5xl md:text-7xl font-heading uppercase leading-none text-black break-words">{title}</h2>
    {subtitle && <p className="text-[10px] md:text-sm font-bold opacity-60 uppercase tracking-widest mt-2 text-black">{subtitle}</p>}
  </div>
);

// --- NAVIGATION ---
const MegaMenu = ({ isOpen, onClose, setPage, onProjectSelect }: { 
  isOpen: boolean, 
  onClose: () => void, 
  setPage: (p: Page) => void,
  onProjectSelect: (p: Project) => void 
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const btnClass = "text-xl sm:text-3xl md:text-4xl font-heading uppercase text-left transition-all leading-none text-black p-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-black focus-visible:bg-black focus-visible:text-white hover:translate-x-2 sm:hover:translate-x-4";
  const smallBtnClass = "text-base sm:text-xl md:text-2xl font-oswald uppercase text-left transition-all text-black p-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-black focus-visible:bg-black focus-visible:text-white hover:translate-x-2 sm:hover:translate-x-4";

  return (
    <>
      <div className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="fixed inset-2 sm:inset-4 md:inset-8 z-[200] bg-[#e9ff4e] p-6 sm:p-10 md:p-16 animate-in slide-in-from-top-full duration-500 overflow-y-auto border-4 sm:border-8 md:border-[12px] border-black rounded-[40px] md:rounded-[60px] shadow-2xl" role="dialog" aria-modal="true" aria-label="Navigation Menu">
        <div className="flex justify-between items-center mb-8 md:mb-16">
          <span className="text-2xl sm:text-3xl md:text-5xl font-heading uppercase text-black">Navigation</span>
          <button onClick={onClose} className="w-10 h-10 md:w-16 md:h-16 bg-black text-white rounded-full text-lg md:text-2xl hover:rotate-90 transition-transform flex items-center justify-center focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black" aria-label="Close menu">✕</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16">
          <nav className="flex flex-col gap-2 md:gap-4">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-[.3em] mb-2 text-black">Core</span>
            {[Page.HOME, Page.ABOUT, Page.WORKS, Page.NOW, Page.CONTACT, Page.RESUME].map(p => (
              <button key={p} onClick={() => { setPage(p); onClose(); }} className={btnClass}>{p.replace('_', ' ')}</button>
            ))}
          </nav>
          <nav className="flex flex-col gap-2 md:gap-4">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-[.3em] mb-2 text-black">Projects</span>
            {PROJECTS.map((p, idx) => (
              <button key={p.id} onClick={() => { onProjectSelect(p); onClose(); }} className={smallBtnClass}>0{idx+1} {p.title}</button>
            ))}
          </nav>
          <nav className="flex flex-col gap-2 md:gap-4">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-[.3em] mb-2 text-black">Philosophy</span>
            {[Page.PHILOSOPHY, Page.JOURNAL, Page.LAB].map(p => (
              <button key={p} onClick={() => { setPage(p); onClose(); }} className={btnClass}>{p}</button>
            ))}
          </nav>
          <nav className="flex flex-col gap-2 md:gap-4">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-[.3em] mb-2 text-black">Services</span>
            {[Page.SERVICES, Page.EXPERIENCE, Page.TECH_STACK, Page.CLIENTS, Page.MENTORSHIP, Page.FAQ, Page.LEGAL].map(p => (
              <button key={p} onClick={() => { setPage(p); onClose(); }} className={smallBtnClass}>{p}</button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [currentPage, setPage] = useState<Page>(Page.HOME);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [expandedJournalId, setExpandedJournalId] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [status, setStatus] = useState(GenerationStatus.IDLE);

  const [contactForm, setContactForm] = useState({ subject: '', email: '', message: '' });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const mainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => { if (mainScrollRef.current) mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage]);

  const handleGetInsight = async () => {
    if (status === GenerationStatus.GENERATING) return;
    setStatus(GenerationStatus.GENERATING);
    const res = await generatePortfolioInsight(`Engineering context for ${currentPage} by Akash Vishwakarma.`);
    setInsight(res);
    setStatus(GenerationStatus.SUCCESS);
  };

  const handleProjectClick = (p: Project) => {
    setSelectedProject(p);
    setPage(Page.PROJECT_DETAILS);
  };

  const validateContact = () => {
    const errors: Record<string, string> = {};
    if (!contactForm.subject.trim()) errors.subject = 'Subject is required';
    if (!contactForm.email.trim()) { errors.email = 'Email is required'; } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) { errors.email = 'Invalid email'; }
    if (!contactForm.message.trim()) errors.message = 'Message is required';
    return errors;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateContact();
    if (Object.keys(errors).length > 0) { setContactErrors(errors); return; }
    setContactErrors({});
    setIsContactSubmitting(true);
    setTimeout(() => { setIsContactSubmitting(false); setContactSuccess(true); setContactForm({ subject: '', email: '', message: '' }); setTimeout(() => setContactSuccess(false), 5000); }, 1500);
  };

  const PageContent = useMemo(() => {
    switch(currentPage) {
      case Page.HOME: return (
        <div className="h-full min-h-[50vh] flex flex-col justify-center animate-in slide-in-from-left duration-700">
          <RevealOnScroll>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-8 md:mb-12">
               <MarkerFrame className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72" shapeType={1}>
                  <img src={USER_PHOTOS.HERO_GREEN} alt="Akash" className="w-full h-full object-fill grayscale group-hover:grayscale-0 transition-all duration-700" />
               </MarkerFrame>
               <div className="flex-grow text-center md:text-left">
                 <h1 className="text-[18vw] sm:text-[15vw] md:text-[11vw] leading-[0.8] font-heading uppercase text-black break-words">AKASH.V</h1>
                 <p className="text-xl sm:text-2xl md:text-4xl font-bold uppercase text-black mt-2 md:mt-4 tracking-tighter">Full Stack Architect</p>
               </div>
            </div>
          </RevealOnScroll>
          <p className="text-lg sm:text-2xl md:text-3xl font-medium max-w-3xl text-black leading-tight mb-8 md:mb-10 text-center md:text-left">Engineering robust Next.js ecosystems with extreme precision and modularity.</p>
          <div className="flex justify-center md:justify-start">
            <button onClick={() => setPage(Page.WORKS)} className="w-full sm:w-auto bg-black text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-heading text-xl md:text-2xl uppercase hover:bg-[#e9ff4e] hover:text-black transition-all hover:scale-105 shadow-xl">Launch Gallery →</button>
          </div>
        </div>
      );
      case Page.WORKS: return (
        <div>
          <SectionHeader title="Works" subtitle="Interactive Case Studies" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {PROJECTS.map((p, idx) => (
              <RevealOnScroll key={p.id} delay={idx * 100}>
                <div className="flex flex-col gap-4 md:gap-6">
                  <MarkerFrame className="h-[240px] md:h-[300px] cursor-pointer" shapeType={((idx % 3) + 1) as 1 | 2 | 3}>
                    <button onClick={() => handleProjectClick(p)} className="w-full h-full relative group">
                      <img src={p.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={p.title} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-[#e9ff4e] text-black px-4 md:px-6 py-2 rounded-full font-bold uppercase text-xs md:text-sm">View Case Study</span>
                      </div>
                    </button>
                  </MarkerFrame>
                  <div className="px-2">
                    <h3 className="text-2xl md:text-3xl font-heading uppercase text-black leading-none">{p.title}</h3>
                    <p className="text-black/60 font-bold uppercase text-[10px] md:text-xs mt-1 md:mt-2">{p.description}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      );
      case Page.PROJECT_DETAILS: return selectedProject ? (
        <div className="animate-in fade-in duration-700">
          <button onClick={() => setPage(Page.WORKS)} className="mb-8 md:mb-12 flex items-center gap-3 md:gap-4 group font-heading text-lg md:text-xl uppercase text-black hover:text-[#e9ff4e] transition-colors">
            <span className="w-8 h-8 md:w-10 md:h-10 bg-black text-white rounded-full flex items-center justify-center group-hover:bg-[#e9ff4e] group-hover:text-black transition-all">←</span>
            Back to Base
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 lg:gap-32 items-start">
            <MarkerFrame className="aspect-square w-full" shapeType={1}>
              <img src={selectedProject.imageUrl} alt={selectedProject.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
            </MarkerFrame>
            <div className="space-y-8 md:space-y-12">
              <div>
                <span className="bg-black text-[#e9ff4e] px-6 md:px-8 py-1 md:py-2 rounded-full font-bold uppercase tracking-widest text-xs md:text-sm">{selectedProject.year}</span>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading uppercase text-black mt-6 md:mt-10 leading-none">{selectedProject.title}</h2>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold uppercase text-black/40 mt-4 md:mt-6">{selectedProject.description}</p>
              </div>

              <div className="bg-white border-4 md:border-8 border-black p-6 md:p-10 rounded-[30px] md:rounded-[60px] shadow-2xl relative overflow-hidden">
                <TechScribbleSVG />
                <h4 className="text-lg md:text-2xl font-heading uppercase mb-4 tracking-widest text-black border-b-2 md:border-b-4 border-black inline-block">Architecture</h4>
                <p className="text-base md:text-xl lg:text-2xl font-medium leading-relaxed text-black/80 relative z-10">{selectedProject.longDescription}</p>
              </div>

              <div className="bg-black text-[#e9ff4e] p-6 md:p-10 rounded-[30px] md:rounded-[60px] shadow-2xl border-l-[12px] md:border-l-[20px] border-[#e9ff4e]">
                <h4 className="text-sm md:text-xl font-heading uppercase mb-2 tracking-widest opacity-60">Outcome</h4>
                <p className="text-xl md:text-3xl font-bold leading-tight">{selectedProject.outcome}</p>
              </div>

              <div>
                <h4 className="text-lg md:text-2xl font-heading uppercase mb-4 text-black">Arsenal</h4>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {selectedProject.tech.map(t => <span key={t} className="bg-black text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-bold uppercase text-sm md:text-lg border-2 border-transparent hover:border-[#e9ff4e] transition-all cursor-default">{t}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null;
      case Page.RESUME: return (
        <div className="animate-in slide-in-from-bottom duration-1000 max-w-7xl mx-auto px-1">
          {/* CLASSIC DOSSIER HEADER */}
          <div className="relative mb-8 md:mb-16">
            <div className="bg-black text-white p-6 md:p-12 rounded-[20px] md:rounded-[30px] border-4 md:border-8 border-black flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-[#e9ff4e] text-black px-4 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest">Architect Core Log</span>
                  <div className="h-0.5 flex-grow bg-white/20"></div>
                </div>
                <h2 className="text-5xl sm:text-7xl md:text-[8rem] font-heading uppercase leading-[0.8] mb-4 md:mb-6 tracking-tighter">Akash.V</h2>
                <div className="flex flex-wrap gap-4 font-bold uppercase text-[10px] md:text-sm tracking-widest opacity-60">
                  <span>Sr. Full Stack Developer</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Jaipur, India</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Systems Specialist</span>
                </div>
              </div>
              <div className="shrink-0">
                 <button className="bg-[#e9ff4e] text-black px-8 md:px-12 py-4 md:py-6 rounded-full font-heading text-xl md:text-2xl uppercase hover:scale-105 transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">Download CV</button>
              </div>
            </div>
          </div>

          {/* MAIN DOSSIER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            
            {/* LEFT COLUMN: VITAL DATA (3Cols) */}
            <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
              {/* CONTACT CARD */}
              <div className="bg-white border-4 border-black p-8 rounded-[25px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="text-xl font-heading uppercase mb-6 border-b-2 border-black inline-block">Vital Signals</h4>
                <div className="space-y-6">
                  <div>
                    <span className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Electronic Mail</span>
                    <a href="mailto:jobforakash9770@gmail.com" className="text-sm md:text-base font-bold break-all hover:bg-black hover:text-[#e9ff4e] p-1 transition-all">jobforakash9770@gmail.com</a>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Direct Uplink</span>
                    <p className="text-sm md:text-base font-bold">+91 8305838352</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                     <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs">GH</div>
                     <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs">LI</div>
                     <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs">X</div>
                  </div>
                </div>
              </div>

              {/* TECHNICAL ARSENAL CARD */}
              <div className="bg-[#e9ff4e] border-4 border-black p-8 rounded-[25px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="text-xl font-heading uppercase mb-8 border-b-2 border-black inline-block">The Arsenal</h4>
                <div className="space-y-8">
                   <div>
                      <span className="block text-[10px] font-bold opacity-60 uppercase mb-4 tracking-tighter">Core Engineering</span>
                      <div className="flex flex-wrap gap-2">
                        {['Next.js', 'TypeScript', 'Node.js', 'React'].map(s => (
                          <span key={s} className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase">{s}</span>
                        ))}
                      </div>
                   </div>
                   <div>
                      <span className="block text-[10px] font-bold opacity-60 uppercase mb-4 tracking-tighter">Data & Scale</span>
                      <div className="flex flex-wrap gap-2">
                        {['PostgreSQL', 'Prisma', 'Redis', 'Kafka', 'Docker'].map(s => (
                          <span key={s} className="bg-white border-2 border-black px-3 py-1 text-[10px] font-bold uppercase">{s}</span>
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              {/* EDUCATION LOG */}
              <div className="bg-black text-white p-8 rounded-[25px] rotate-[-1deg]">
                <h4 className="text-xl font-heading uppercase mb-4 text-[#e9ff4e]">Registry</h4>
                <p className="font-heading text-lg">B.Tech / Computer Science</p>
                <p className="text-xs font-bold opacity-60 uppercase mt-2">Specialized in Distributed Systems</p>
              </div>
            </div>

            {/* RIGHT COLUMN: CAREER LOG (8Cols) */}
            <div className="lg:col-span-8 space-y-12 order-1 lg:order-2">
               <div className="flex items-center gap-6 mb-4">
                 <h3 className="text-3xl md:text-5xl font-heading uppercase text-black">Career Log</h3>
                 <div className="h-1 flex-grow bg-black/10"></div>
               </div>

               <div className="relative pl-8 md:pl-16">
                  {/* Timeline Rail */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10 hidden md:block"></div>
                  
                  <div className="space-y-16">
                    {CAREER.map((c, idx) => (
                      <RevealOnScroll key={idx} delay={idx * 150}>
                        <div className="relative group">
                          {/* Timeline Dot */}
                          <div className="absolute left-[-42px] top-2 w-6 h-6 bg-black rounded-full hidden md:block group-hover:bg-[#e9ff4e] border-4 border-[#e9e7da] transition-colors"></div>
                          
                          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-4">
                            <div>
                               <h4 className="text-2xl md:text-4xl font-heading uppercase leading-none mb-2">{c.company}</h4>
                               <p className="bg-black text-[#e9ff4e] inline-block px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest">{c.title}</p>
                            </div>
                            <span className="font-heading text-xl md:text-2xl opacity-20 uppercase mt-2 sm:mt-0">{c.year}</span>
                          </div>
                          
                          <div className="bg-white border-2 border-black/10 p-6 md:p-8 rounded-[20px] hover:border-black transition-all">
                            <p className="text-lg md:text-xl font-medium leading-relaxed opacity-70 mb-6 italic">"{c.description}"</p>
                            <div className="flex flex-wrap gap-2">
                              {c.tags.map(t => (
                                <span key={t} className="bg-black/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </RevealOnScroll>
                    ))}
                  </div>
               </div>

               {/* METRICS STRIP */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
                  {[
                    { label: "Performance Boost", value: "40%" },
                    { label: "Concurrency Cap", value: "10K+" },
                    { label: "Uptime Protocol", value: "99.9%" },
                    { label: "Scale Factor", value: "GLOBAL" }
                  ].map((m, idx) => (
                    <div key={idx} className="border-2 border-black/10 p-6 text-center rounded-[20px]">
                      <span className="block text-2xl md:text-3xl font-heading text-black mb-1">{m.value}</span>
                      <span className="block text-[8px] font-bold opacity-40 uppercase tracking-widest">{m.label}</span>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        </div>
      );
      case Page.PHILOSOPHY: return (
        <div className="animate-in zoom-in duration-700">
          <SectionHeader title="Philosophy" subtitle="The Engineering Manifesto" />
          <div className="bg-black text-white p-8 md:p-24 rounded-[30px] md:rounded-[60px] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 sketch-shape-2 overflow-hidden pointer-events-none">
                <img src={USER_PHOTOS.HERO_GREEN} className="w-full h-full object-cover grayscale" alt="" />
             </div>
             <div className="relative z-10 max-w-4xl">
               <span className="text-[#e9ff4e] font-heading text-lg md:text-xl uppercase tracking-[0.3em] block mb-8 md:mb-12">Core Values</span>
               <h2 className="text-4xl sm:text-6xl md:text-9xl font-heading uppercase leading-[0.85] text-[#e9ff4e] mb-8 md:mb-12">SCALABILITY.<br />EFFICIENCY.<br />INTEGRITY.</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mt-12 md:mt-20">
                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-2xl md:text-3xl font-heading uppercase text-white border-b-2 border-white/20 pb-4">01. Precision</h4>
                    <p className="text-base md:text-xl opacity-70 leading-relaxed">Code is architecture. Every byte must serve a purpose. I build systems that don't just work—they endure.</p>
                  </div>
                  <div className="space-y-4 md:space-y-6">
                    <h4 className="text-2xl md:text-3xl font-heading uppercase text-white border-b-2 border-white/20 pb-4">02. Automation</h4>
                    <p className="text-base md:text-xl opacity-70 leading-relaxed">Human error is a bug. I leverage AI and event-driven automation to eliminate manual friction from business logic.</p>
                  </div>
               </div>
             </div>
          </div>
        </div>
      );
      case Page.JOURNAL: return (
        <div className="animate-in fade-in duration-700">
          <SectionHeader title="Logbook" subtitle="Technical Transmissions" />
          <div className="flex flex-col gap-12 md:gap-20">
            {JOURNAL.map((j, idx) => (
              <div key={j.id} className="group border-b-4 border-black/10 pb-12 md:pb-20 relative">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-10 z-10 relative">
                  <div className="flex-grow w-full">
                    <span className="text-xs md:text-base font-bold opacity-60 uppercase text-black block mb-2 md:mb-4 tracking-widest">{j.date}</span>
                    <h3 className="text-3xl sm:text-5xl md:text-8xl font-heading uppercase cursor-pointer text-black leading-none mb-4 md:mb-8 hover:translate-x-2 md:hover:translate-x-6 transition-transform break-words" onClick={() => setExpandedJournalId(expandedJournalId === j.id ? null : j.id)}>{j.title}</h3>
                    <p className="text-lg md:text-3xl opacity-60 text-black max-w-3xl font-medium leading-tight">{j.excerpt}</p>
                  </div>
                </div>
                {expandedJournalId === j.id && (
                  <div className="mt-8 md:mt-12 p-6 md:p-20 bg-black text-white rounded-[30px] md:rounded-[60px] border-l-[12px] md:border-l-[24px] border-[#e9ff4e] shadow-2xl animate-in slide-in-from-top-12">
                    <p className="text-lg md:text-4xl font-medium leading-tight mb-8 md:mb-10">{j.content}</p>
                    <span className="text-[#e9ff4e] font-bold uppercase tracking-widest text-sm md:text-base">End of Log</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
      case Page.LAB: return (
        <div className="relative animate-in zoom-in duration-700 overflow-hidden min-h-[60vh]">
          <TechScribbleSVG />
          <SectionHeader title="The Lab" subtitle="R&D Prototypes" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 relative z-10">
            {[
              { title: "Neural Discussion Engine", status: "Active", progress: "85%" },
              { title: "Distributed Scraping Swarm", status: "Deploying", progress: "60%" },
              { title: "Brutalist Design Tokens", status: "Testing", progress: "99%" },
              { title: "Kafka Event Visualizer", status: "Planning", progress: "15%" },
            ].map(l => (
              <div key={l.title} className="bg-black text-white p-8 md:p-10 border-l-[12px] md:border-l-[16px] border-[#e9ff4e] shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <span className="text-[#e9ff4e] font-bold uppercase text-[10px] md:text-xs tracking-widest">{l.status}</span>
                    <span className="font-heading text-lg md:text-xl">{l.progress}</span>
                  </div>
                  <h3 className="text-xl md:text-3xl font-heading uppercase mb-4">{l.title}</h3>
                </div>
                <div className="w-full bg-white/10 h-1 mt-4 md:mt-6">
                  <div className="bg-[#e9ff4e] h-full" style={{ width: l.progress }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      case Page.ABOUT: return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-24 animate-in fade-in">
          <MarkerFrame className="h-[320px] sm:h-[500px] lg:h-[700px]" shapeType={2}>
             <img src={USER_PHOTOS.ABOUT_SUIT} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="Akash Vishwakarma" />
          </MarkerFrame>
          <div className="flex flex-col justify-center">
            <SectionHeader title="Expertise" />
            <p className="text-2xl md:text-4xl font-medium leading-tight mb-6 md:mb-10 text-black">Mastering the stack: Next.js, Node.js, and Distributed Systems.</p>
            <p className="text-base md:text-2xl opacity-80 leading-relaxed mb-8 md:mb-10 text-black font-medium">I architect multilingual, SEO-optimized platforms serving users across 200+ countries.</p>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <button onClick={() => setPage(Page.RESUME)} className="flex-1 sm:flex-none bg-black text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-bold uppercase text-base md:text-lg hover:bg-[#e9ff4e] hover:text-black transition-all">Full Resume</button>
              <button onClick={() => setPage(Page.CONTACT)} className="flex-1 sm:flex-none border-4 border-black px-8 md:px-10 py-4 md:py-5 rounded-full font-bold uppercase text-base md:text-lg hover:bg-black hover:text-white transition-all">Connect</button>
            </div>
          </div>
        </div>
      );
      case Page.SERVICES: return (
        <div className="animate-in slide-in-from-bottom duration-700">
          <SectionHeader title="Offerings" subtitle="Technical Capabilities" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: "SaaS Product Design", icon: "⚙️", desc: "End-to-end development of scalable SaaS products using Next.js and Microservices." },
              { title: "Enterprise Systems", icon: "🏢", desc: "Modular ERP solutions with complex RBAC and custom workflow builders." },
              { title: "AI Strategy", icon: "🧠", desc: "Integrating Gemini and OpenAI into business workflows for automation." },
              { title: "Infrastructure", icon: "☁️", desc: "Containerized deployments using Docker, Kafka for events, and Nginx." },
            ].map((s, idx) => (
              <RevealOnScroll key={s.title} delay={idx * 50}>
                <div className="bg-white border-4 border-black p-6 md:p-12 h-full hover:bg-[#e9ff4e] transition-colors group cursor-default shadow-xl">
                  <span className="text-4xl md:text-5xl mb-4 md:mb-6 block group-hover:scale-125 transition-transform origin-left">{s.icon}</span>
                  <h3 className="text-xl md:text-3xl font-heading uppercase mb-3 md:mb-4 text-black">{s.title}</h3>
                  <p className="text-sm md:text-lg font-medium text-black/70 leading-relaxed">{s.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      );
      case Page.CONTACT: return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20">
          <div>
            <h2 className="text-[18vw] sm:text-[15vw] lg:text-[12vw] leading-[0.8] font-heading uppercase text-black">SAY<br />HELLO</h2>
            <div className="mt-10 md:mt-20 space-y-8 md:space-y-12">
              <div className="flex items-center gap-4 md:gap-8 group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center text-white text-xl md:text-2xl group-hover:scale-125 transition-transform">↗</div>
                <a href="mailto:jobforakash9770@gmail.com" className="text-2xl sm:text-3xl md:text-5xl font-heading uppercase text-black hover:text-[#e9ff4e] transition-colors break-all">Email</a>
              </div>
              <p className="text-lg md:text-2xl font-bold uppercase text-black/40">+91 8305838352 • JAIPUR, RJ</p>
            </div>
          </div>
          <div className="bg-white border-4 md:border-8 border-black p-8 md:p-20 rounded-[40px] md:rounded-[80px] shadow-2xl">
            {contactSuccess ? (
              <div className="text-center py-10 md:py-20 animate-in zoom-in">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-[#e9ff4e] rounded-full border-4 border-black flex items-center justify-center mx-auto mb-6 md:mb-10"><span className="text-4xl md:text-6xl">✓</span></div>
                <h3 className="text-3xl md:text-5xl font-heading uppercase text-black mb-4 md:mb-6">Success</h3>
                <p className="text-lg md:text-2xl font-medium text-black opacity-60">Transmission received.</p>
                <button onClick={() => setContactSuccess(false)} className="mt-6 md:mt-12 bg-black text-white px-8 md:px-12 py-3 md:py-5 rounded-full font-bold uppercase">Back</button>
              </div>
            ) : (
              <form className="flex flex-col gap-8 md:gap-12" onSubmit={handleContactSubmit}>
                <div>
                  <input type="text" placeholder="SUBJECT" value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} className={`w-full border-b-4 md:border-b-8 py-3 md:py-6 text-xl md:text-3xl font-heading outline-none uppercase placeholder:opacity-20 ${contactErrors.subject ? 'border-red-500' : 'border-black focus:border-[#e9ff4e]'}`} />
                </div>
                <div>
                  <input type="email" placeholder="YOUR EMAIL" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className={`w-full border-b-4 md:border-b-8 py-3 md:py-6 text-xl md:text-3xl font-heading outline-none uppercase placeholder:opacity-20 ${contactErrors.email ? 'border-red-500' : 'border-black focus:border-[#e9ff4e]'}`} />
                </div>
                <div>
                  <textarea rows={1} placeholder="THE MESSAGE" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className={`w-full border-b-4 md:border-b-8 py-3 md:py-6 text-xl md:text-3xl font-heading outline-none uppercase resize-none placeholder:opacity-20 ${contactErrors.message ? 'border-red-500' : 'border-black focus:border-[#e9ff4e]'}`} />
                </div>
                <button disabled={isContactSubmitting} className="bg-black text-white py-5 md:py-8 rounded-full font-heading text-2xl md:text-3xl uppercase hover:bg-[#e9ff4e] hover:text-black transition-all shadow-xl">{isContactSubmitting ? 'SENDING...' : 'DISPATCH'}</button>
              </form>
            )}
          </div>
        </div>
      );
      default: return (
        <div className="h-full flex flex-col justify-center items-center text-center py-20 md:py-40">
          <SectionHeader title={currentPage.replace('_', ' ')} />
          <p className="text-xl md:text-2xl font-medium opacity-60">Module under deployment...</p>
        </div>
      );
    }
  }, [currentPage, expandedJournalId, contactForm, contactErrors, isContactSubmitting, contactSuccess, selectedProject]);

  return (
    <div className="bg-[#e9e7da] min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)] rounded-[30px] md:rounded-[50px] border-[6px] md:border-[12px] border-black relative flex flex-col transition-all duration-500 overflow-hidden" role="main">
      <MegaMenu 
        isOpen={isMenuOpen} 
        onClose={() => setMenuOpen(false)} 
        setPage={setPage} 
        onProjectSelect={handleProjectClick}
      />
      
      <main ref={mainScrollRef} className="flex-grow overflow-y-auto relative bg-[#e9e7da] flex flex-col scroll-smooth">
        <header className="sticky top-0 z-[100] h-20 md:h-28 flex items-center justify-between px-6 md:px-12 border-b-[6px] md:border-b-8 border-black bg-[#e9e7da]/80 backdrop-blur-md">
           <button onClick={() => setPage(Page.HOME)} className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase text-black hover:tracking-tighter transition-all">AKASH.V</button>
           <button onClick={() => setMenuOpen(true)} className="flex items-center gap-4 md:gap-8 bg-black text-white px-6 md:px-12 py-2 md:py-4 rounded-full hover:bg-[#e9ff4e] hover:text-black transition-all shadow-xl">
              <span className="font-bold text-sm md:text-lg uppercase tracking-widest">Menu</span>
              <div className="grid grid-cols-2 gap-1.5 md:gap-2"><div className="w-2 h-2 md:w-3 md:h-3 bg-current"></div><div className="w-2 h-2 md:w-3 md:h-3 bg-current"></div><div className="w-2 h-2 md:w-3 md:h-3 bg-current"></div><div className="w-2 h-2 md:w-3 md:h-3 bg-current"></div></div>
           </button>
        </header>

        <div className="flex-grow p-6 md:p-12 lg:p-24">{PageContent}</div>

        <footer className="px-6 md:px-12 py-8 md:py-12 border-t-[6px] md:border-t-8 border-black/10 mt-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-black/5">
           <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-black/40 text-center md:text-left">© 2025 AKASH VISHWAKARMA / SYSTEM ARCHITECT</span>
           <div className="flex gap-8 md:gap-16">
             <button onClick={() => setPage(Page.LEGAL)} className="text-[10px] md:text-sm font-bold uppercase text-black/40 hover:text-black focus:outline-none">Legal</button>
             <button onClick={() => setPage(Page.CONTACT)} className="text-[10px] md:text-sm font-bold uppercase text-black/40 hover:text-black focus:outline-none">Contact</button>
           </div>
        </footer>
      </main>

      {/* AI Insight UI */}
      <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-40 flex flex-col items-end pointer-events-auto">
          {insight && (
            <div className="mb-4 md:mb-8 w-64 md:w-96 bg-black text-white p-6 md:p-12 rounded-[40px] md:rounded-[80px] rounded-br-none border-4 md:border-8 border-[#e9ff4e] shadow-2xl animate-in fade-in slide-in-from-bottom-6" role="status">
               <button onClick={() => setInsight(null)} className="absolute -top-4 -right-4 md:-top-8 md:-right-8 bg-[#e9ff4e] text-black w-10 h-10 md:w-16 md:h-16 rounded-full font-bold text-lg md:text-3xl border-4 md:border-8 border-black hover:scale-110 shadow-xl flex items-center justify-center">✕</button>
               <div className="text-[8px] md:text-sm uppercase font-bold text-[#e9ff4e] tracking-[0.4em] mb-4 md:mb-8">ENGINEER_CORE</div>
               <p className="text-base md:text-2xl italic font-medium leading-tight">"{insight}"</p>
            </div>
          )}
          <button onClick={handleGetInsight} className="w-24 h-24 md:w-48 md:h-48 relative cursor-pointer group focus-visible:outline-none">
             <svg className={`absolute inset-0 w-full h-full ${status === GenerationStatus.GENERATING ? 'animate-spin' : 'animate-spin-slow'}`} viewBox="0 0 100 100">
               <defs><path id="badgePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" /></defs>
               <text className="text-[7.5px] font-bold tracking-widest uppercase fill-black"><textPath href="#badgePath">SCALABILITY • EFFICIENCY • INTEGRITY • OPTIMIZATION •</textPath></text>
             </svg>
             <div className="absolute inset-6 md:inset-10 bg-black rounded-full flex flex-col items-center justify-center text-white group-hover:scale-110 transition-transform border-[6px] md:border-[10px] border-[#e9ff4e] shadow-2xl"><span className="text-[10px] md:text-lg font-heading leading-none text-center">AI<br />CORE</span></div>
          </button>
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]"></div>
    </div>
  );
};

export default App;
