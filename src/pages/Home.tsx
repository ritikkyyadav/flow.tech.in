import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation, useInView, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, DollarSign, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";

// New immersive landing page (kept filename Home.tsx to preserve existing routing export)
// Focus: High-quality visuals, smooth motion, simple & clear value props.

// Small counter component that animates when visible
const AnimatedCounter: React.FC<{ target: number; suffix?: string; duration?: number; className?: string; }> = ({ target, suffix = "", duration = 1600, className }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);
  const inView = useInView(ref, { once: true, margin: "-40% 0px" });

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return <span ref={ref} className={className}>{display.toLocaleString()}{progressColor(display, target)}{suffix}</span>;
};

// subtle color flash as numbers count up (returns empty string once finished)
function progressColor(current: number, target: number) {
  if (current === target) return "";
  return ""; // placeholder for potential future effect
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * i,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] // cubic-bezier for easeOut
    }
  })
};

const Index = () => {
  const navigate = useNavigate();
  const heroControls = useAnimation();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-10% 0px" });

  useEffect(() => { if (heroInView) heroControls.start("show"); }, [heroInView, heroControls]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0d1117] text-white selection:bg-blue-600 selection:text-white">
      {/* Animated gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.65] animated-gradient-bg" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-orange-500/30 blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/f270ce25-b700-4c54-b8a9-489a6d7cf9d3.png" alt="Flow Logo" className="h-12 w-12 rounded-xl bg-white/80 p-1 shadow-lg backdrop-blur" />
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-blue-200 to-orange-300 bg-clip-text text-transparent">Flow</span>
        </div>
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          {['Features','Analytics','Security','Pricing'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="relative text-white/70 transition hover:text-white">
              {link}
              <span className="absolute inset-x-0 -bottom-1 h-px scale-x-0 bg-gradient-to-r from-blue-400 to-orange-400 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white/80 hover:text-white" onClick={() => navigate('/dashboard')}>Login</Button>
          <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-blue-600 via-indigo-500 to-orange-500 hover:brightness-110 shadow-lg shadow-blue-600/20">Get Started <ArrowRight className="size-4" /></Button>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={heroControls}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-10 pb-24 md:px-12 lg:px-20"
      >
        <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs backdrop-blur-md">
          <Sparkles className="size-4 text-yellow-300" /> <span className="uppercase tracking-wider text-white/70">AI Finance Assistant</span>
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-center font-bold leading-tight tracking-tight text-4xl sm:text-5xl md:text-[4rem] md:leading-[1.05]">
          Master your money with <span className="relative inline-block"><span className="animated-gradient-text">clarity</span></span> & AI precision
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-center text-base text-white/70 md:text-lg">
          Track income, optimize spending, and unlock forward-looking insights—all inside one elegant, blazing-fast workspace built for modern finances.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" onClick={() => navigate('/dashboard')} className="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500 px-10 text-base font-semibold shadow-xl shadow-indigo-600/25">
            <span className="relative z-10 flex items-center gap-2">Launch Dashboard <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
            <span className="absolute inset-0 animate-shine bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.25),transparent)]" />
          </Button>
          <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Explore Features</Button>
        </motion.div>

        {/* Floating preview panel */}
        <motion.div
          variants={fadeUp}
          className="mt-20 grid w-full gap-8 md:grid-cols-2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
            <h3 className="mb-3 text-lg font-semibold text-white/80">Live Cash Flow Pulse</h3>
            <p className="mb-6 text-sm leading-relaxed text-white/60">Real‑time sync turns raw transactions into intuitive trend lines. Understand burn, runway & saving velocity instantly.</p>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="rounded-lg bg-white/5 p-4">
                <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/40">Monthly Inflow</p>
                <AnimatedCounter target={128000} suffix="" className="text-xl font-semibold text-emerald-300" />
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/40">Avg Spend</p>
                <AnimatedCounter target={52000} className="text-xl font-semibold text-rose-300" />
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/40">Forecast ▲</p>
                <AnimatedCounter target={18} suffix="%" className="text-xl font-semibold text-blue-300" />
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 hidden h-40 w-40 rounded-full bg-blue-400/30 blur-2xl md:block" />
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/30 via-indigo-500/20 to-transparent p-6 backdrop-blur-xl">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white/85"><Zap className="size-4 text-orange-300" /> Smart Insight Example</h3>
            <ul className="mb-6 space-y-3 text-sm text-white/70">
              <li className="flex gap-2"><span className="mt-1.5 size-2 rounded-full bg-emerald-400" />You can save <strong className="text-white">$450/mo</strong> by consolidating 3 overlapping SaaS tools.</li>
              <li className="flex gap-2"><span className="mt-1.5 size-2 rounded-full bg-blue-400" />Spending on dining spiked 22% vs last month—review weekly limits?</li>
              <li className="flex gap-2"><span className="mt-1.5 size-2 rounded-full bg-orange-400" />Upcoming tax reserve shortfall projected in 7 weeks.</li>
            </ul>
            <p className="text-xs text-white/45">These predictive insights are generated automatically from your secure, tokenized transaction data.</p>
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-orange-400/20 blur-3xl" />
          </div>
        </motion.div>
      </motion.section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 pb-28 md:px-12 lg:px-20">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl md:text-5xl"><span className="animated-gradient-text">Everything</span> in one unified financial hub</h2>
          <p className="mx-auto max-w-2xl text-sm text-white/60 md:text-base">We blend automation, granular control & predictive intelligence—without overwhelming you.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featureData.map((f,i) => (
            <motion.div
              key={f.title}
              initial={{ opacity:0, y:24 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:"-10%" }}
              transition={{ duration:0.6, delay: i*0.05, ease:[0.22,1,0.36,1] }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 text-white shadow-inner shadow-white/10 ring-1 ring-white/10">
                {f.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="text-sm leading-relaxed text-white/60">{f.desc}</p>
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-400/10 via-indigo-500/10 to-orange-400/10" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust / Security */}
      <section id="security" className="relative mx-auto max-w-7xl px-6 pb-28 md:px-12 lg:px-20">
        <div className="grid gap-14 md:grid-cols-2 md:items-center">
          <motion.div initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7,ease:[0.22,1,0.36,1]}} className="relative order-2 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent p-8 backdrop-blur-xl md:order-1">
            <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold"><ShieldCheck className="size-6 text-emerald-300" /> Enterprise‑grade security</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>End‑to‑end encrypted data pipelines</li>
              <li>Granular permission & role framework</li>
              <li>Zero-knowledge architecture for sensitive fields</li>
              <li>Continuous anomaly detection for account activity</li>
            </ul>
            <div className="pointer-events-none absolute -right-16 -top-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 -left-10 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
          </motion.div>
          <motion.div initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7,delay:0.1,ease:[0.22,1,0.36,1]}} className="order-1 flex flex-col justify-center md:pl-4 md:order-2">
            <p className="mb-4 text-sm font-medium tracking-wide text-blue-300/80">TRUST & CONTROL</p>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Your data. <span className="animated-gradient-text">Protected.</span></h2>
            <p className="mb-8 max-w-md text-white/70">Finance is personal. We build with a security‑first mindset so you can confidently centralize accounts & workflows without compromise.</p>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110">Start Free</Button>
              <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/15" onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>View Pricing</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="relative mx-auto max-w-6xl px-6 pb-32 md:px-10">
        <motion.div initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.75,ease:[0.22,1,0.36,1]}} className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-700/40 via-indigo-600/30 to-indigo-500/20 p-10 text-center backdrop-blur-xl">
          <div className="pointer-events-none absolute -left-10 top-0 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl" />
          <h2 className="mx-auto mb-4 max-w-3xl text-3xl font-semibold md:text-4xl">Ready to take control of your financial future?</h2>
            <p className="mx-auto mb-10 max-w-2xl text-sm text-white/70 md:text-base">Join early adopters leveraging Flow to transform raw numbers into daily momentum. Start in under 60 seconds—no credit card required.</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/dashboard')} className="group relative overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500 px-10 font-semibold shadow-xl shadow-indigo-600/25">
                <span className="relative z-10 flex items-center gap-2">Get Started Free <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                <span className="absolute inset-0 animate-shine bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.25),transparent)]" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>Back to Top</Button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"><p className="text-xs uppercase tracking-wide text-white/40 mb-1">Active Users</p><AnimatedCounter target={3400} className="text-2xl font-semibold text-emerald-300" /></div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"><p className="text-xs uppercase tracking-wide text-white/40 mb-1">Avg Monthly Savings Identified</p><AnimatedCounter target={760} suffix="+" className="text-2xl font-semibold text-orange-300" /></div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"><p className="text-xs uppercase tracking-wide text-white/40 mb-1">Data Points Processed</p><AnimatedCounter target={1250000} className="text-2xl font-semibold text-blue-300" /></div>
            </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 px-6 py-10 text-center text-xs text-white/50 backdrop-blur">
        <p>© {new Date().getFullYear()} Flow. All rights reserved.</p>
      </footer>
    </div>
  );
};

const featureData = [
  { title: 'Income Tracking', desc: 'Unify multiple inflow sources & visualize trends instantly.', icon: <DollarSign className="size-5" /> },
  { title: 'Expense Intelligence', desc: 'Smart categorization & anomaly flags to prevent overspend.', icon: <TrendingUp className="size-5" /> },
  { title: 'Predictive Analytics', desc: 'Forecast runway, cash surplus & seasonal variance.', icon: <BarChart3 className="size-5" /> },
  { title: 'Adaptive Automation', desc: 'Rules that learn & optimize with every new transaction.', icon: <Zap className="size-5" /> },
];

export default Index;
