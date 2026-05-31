import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Icosahedron, Stars } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Clock3,
  Film,
  Grid2X2,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  Mouse,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: "01",
    title: "AI Video",
    description: "From concept to stunning AI powered videos.",
    icon: Film,
    path: "/ai-video",
  },
  {
    id: "02",
    title: "AI Catalog",
    description: "Professional product catalogs that sell and impress.",
    icon: BookOpen,
    path: "/catalog",
  },
  {
    id: "03",
    title: "AI Website",
    description: "High performance websites that convert and scale.",
    icon: Grid2X2,
    path: "/website",
  },
];

const projects = [
  ["01", "AI Product Video", "Video Production", "portrait"],
  ["02", "Luxury Catalog", "Catalog Design", "bottle"],
  ["03", "Corporate Website", "Web Design", "rings"],
  ["04", "Automotive Video", "Video Production", "car"],
  ["05", "Furniture Catalog", "Catalog Design", "chair"],
];

const benefits = [
  ["AI Powered", "Smart AI tools to accelerate creativity and production.", Sparkles],
  ["Premium Quality", "High-end design and attention to every single detail.", ShieldCheck],
  ["Fast Delivery", "On-time delivery without compromising quality.", Clock3],
  ["Results Driven", "We focus on results that drive your business forward.", Target],
];

const footerGroups = [
  ["Studio", ["About Us", "Our Process", "Careers"]],
  ["Services", ["AI Video", "AI Catalog", "AI Website"]],
  ["Links", ["Work", "Blog", "Contact"]],
];

function getServicePosition(index: number, activeIndex: number) {
  const offset = (index - activeIndex + services.length) % services.length;
  return offset === 0 ? "front" : offset === 1 ? "right" : "left";
}

function App() {
  const workRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const revealItems = gsap.utils.toArray<HTMLElement>(".reveal");
    revealItems.forEach((item) => {
      gsap.fromTo(
        item,
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
          },
        },
      );
    });

    const media = gsap.matchMedia();

    media.add("(min-width: 1021px)", () => {
      if (!workRef.current || !trackRef.current) return undefined;

      const getWorkOverflow = () => {
        if (!workRef.current || !trackRef.current) return 0;
        const leftInset = trackRef.current.getBoundingClientRect().left;
        const visibleWidth = window.innerWidth - leftInset;
        return Math.max(0, trackRef.current.scrollWidth - visibleWidth);
      };

      const tween = gsap.to(trackRef.current, {
        x: () => -getWorkOverflow(),
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: workRef.current,
          start: "top top",
          end: () => `+=${Math.max(window.innerHeight, getWorkOverflow() + 180)}`,
          scrub: 0.45,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.kill();
      };
    });

    return () => {
      media.revert();
      lenis.destroy();
      gsap.ticker.remove(tick);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <main>
      <Header />
      <Hero />
      <Intro />
      <Services />
      <Work workRef={workRef} trackRef={trackRef} />
      <WhyChoose />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#hero" aria-label="ZainLab home">
        ZAINLAB
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#work">Work</a>
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <button className="icon-button" aria-label="Open menu">
        <Menu size={18} />
      </button>
    </header>
  );
}

function Hero() {
  return (
    <section className="screen hero" id="hero" aria-label="ZainLab hero">
      <SceneCanvas variant="hero" />
      <div className="hero-content">
        <h1 className="hero-title">ZAINLAB</h1>
        <p className="hero-kicker">AI · DESIGN · MOTION</p>
        <a className="scroll-cue" href="#intro" aria-label="Scroll to intro">
          <span>Scroll to explore</span>
          <Mouse size={25} />
        </a>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section className="screen intro" id="intro">
      <SceneCanvas variant="dust" />
      <div className="section-grid">
        <div className="section-copy reveal">
          <h2>
            Your Ideas.
            <br />
            Become <span>Extraordinary.</span>
          </h2>
          <p>
            We combine AI, creativity and cutting-edge technology to craft digital
            experiences that inspire and perform.
          </p>
          <TextButton>Discover our story</TextButton>
        </div>
        <div className="floating-cards" aria-label="ZainLab capabilities">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <article className={`glass-card card-${index + 1} reveal`} key={service.title}>
                <Icon size={28} />
                <h3>{service.title}</h3>
                <p>{index === 0 ? "Bring ideas to life" : index === 1 ? "Showcase products beautifully" : "Build powerful digital presence"}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const [activeService, setActiveService] = useState(1);
  const [isAttentionActive, setIsAttentionActive] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const resumeAttentionTimeoutRef = useRef<number | null>(null);

  const rotateServices = (direction: "left" | "right") => {
    pauseAttention();
    setActiveService((current) => {
      if (direction === "left") return (current + services.length - 1) % services.length;
      return (current + 1) % services.length;
    });
  };

  const pauseAttention = () => {
    isInteractingRef.current = true;
    setIsAttentionActive(false);

    if (resumeAttentionTimeoutRef.current) {
      window.clearTimeout(resumeAttentionTimeoutRef.current);
    }

    resumeAttentionTimeoutRef.current = window.setTimeout(() => {
      isInteractingRef.current = false;
    }, 2000);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isInteractingRef.current) return;

      setIsAttentionActive(true);
      window.setTimeout(() => {
        setIsAttentionActive(false);
      }, 1150);
    }, 3000);

    return () => {
      window.clearInterval(interval);
      if (resumeAttentionTimeoutRef.current) {
        window.clearTimeout(resumeAttentionTimeoutRef.current);
      }
    };
  }, []);

  const setCarouselTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    pauseAttention();
    const node = carouselRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    node.style.setProperty("--service-tilt-x", `${(-y * 5).toFixed(2)}deg`);
    node.style.setProperty("--service-tilt-y", `${(x * 7).toFixed(2)}deg`);
    node.style.setProperty("--service-side-tilt-x", `${(-y * 2).toFixed(2)}deg`);
    node.style.setProperty("--service-side-tilt-y", `${(x * 3).toFixed(2)}deg`);
  };

  const resetCarouselTilt = () => {
    const node = carouselRef.current;
    if (!node) return;

    node.style.setProperty("--service-tilt-x", "0deg");
    node.style.setProperty("--service-tilt-y", "0deg");
    node.style.setProperty("--service-side-tilt-x", "0deg");
    node.style.setProperty("--service-side-tilt-y", "0deg");
    if (resumeAttentionTimeoutRef.current) {
      window.clearTimeout(resumeAttentionTimeoutRef.current);
    }

    resumeAttentionTimeoutRef.current = window.setTimeout(() => {
      isInteractingRef.current = false;
    }, 2000);
  };

  return (
    <section className="screen services" id="services">
      <div className="service-stage-glow" />
      <div className="services-layout">
        <div className="section-copy reveal">
          <span className="eyebrow">What we do</span>
          <h2>Our Services</h2>
          <p>End-to-end AI powered solutions designed to elevate your brand and drive results.</p>
          <TextButton>View all services</TextButton>
        </div>
        <div
          ref={carouselRef}
          className="service-carousel"
          aria-label="Services carousel"
          onPointerMove={setCarouselTilt}
          onPointerLeave={resetCarouselTilt}
          onClick={(event) => {
            const stage = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - stage.left;
            const leftZone = stage.width * 0.36;
            const rightZone = stage.width * 0.64;

            if (x < leftZone) rotateServices("left");
            if (x > rightZone) rotateServices("right");
          }}
        >
          <div className="service-carousel-title">Drag • Rotate • Explore</div>
          <div className="service-carousel-stage">
            {services.map((service, index) => {
              const position = getServicePosition(index, activeService);
              const direction = position === "left" ? "left" : position === "right" ? "right" : null;

              return (
                <a
                  className={`service-panel service-panel-${position}`}
                  href={service.path}
                  key={service.title}
                  data-direction={direction ?? undefined}
                  data-attention={isAttentionActive && direction ? "true" : undefined}
                  onPointerEnter={pauseAttention}
                  onFocus={pauseAttention}
                  onClick={(event) => event.stopPropagation()}
                  role={direction ? "button" : undefined}
                  tabIndex={direction ? 0 : undefined}
                  onKeyDown={(event) => {
                    if (direction && (event.key === "Enter" || event.key === " ")) {
                      rotateServices(direction);
                    }
                  }}
                  aria-label={`Enter ${service.title}`}
                >
                  <span className="service-number">{service.id}</span>
                  <h3>{service.title.replace("AI ", "")}</h3>
                  <span className="service-arrow" aria-hidden="true">
                    →
                  </span>
                  <p>{service.description}</p>
                  <span className="service-hint">Click to Enter</span>
                </a>
              );
            })}
          </div>
          <div className="carousel-dots" aria-hidden="true">
            {services.map((service, index) => (
              <span className={index === activeService ? "active" : ""} key={service.title} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Work({
  workRef,
  trackRef,
}: {
  workRef: React.RefObject<HTMLElement | null>;
  trackRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className="screen work" id="work" ref={workRef}>
      <div className="work-layout">
        <div className="work-copy reveal">
          <span className="eyebrow">Our work</span>
          <h2>Selected Projects</h2>
          <TextButton>Explore all work</TextButton>
        </div>
        <div className="project-track" ref={trackRef}>
          {projects.map(([id, title, type, visual]) => (
            <article className={`project-card ${visual}`} key={title}>
              <div className="project-visual">
                <span className="visual-orbit" />
                <span className="visual-core" />
              </div>
              <div className="project-meta">
                <span>{id}</span>
                <h3>{title}</h3>
                <p>{type}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChoose() {
  return (
    <section className="screen why" id="about">
      <SceneCanvas variant="crystal" />
      <div className="why-layout">
        <div className="section-copy reveal">
          <h2>
            We don&apos;t just create.
            <br />
            We create <span>impact.</span>
          </h2>
          <p>
            We leverage the power of AI and design to deliver solutions that are
            fast, smart, and effective.
          </p>
          <TextButton>Let&apos;s work together</TextButton>
        </div>
        <div className="benefit-grid">
          {benefits.map(([title, description, Icon]) => (
            <article className="benefit reveal" key={title as string}>
              <Icon size={28} />
              <div>
                <h3>{title as string}</h3>
                <p>{description as string}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="screen footer" id="contact">
      <SceneCanvas variant="wave" />
      <div className="footer-layout">
        <div className="footer-cta reveal">
          <h2>
            Let&apos;s create
            <br />
            something <span>amazing together.</span>
          </h2>
          <TextButton>Get in touch</TextButton>
        </div>
        <div className="footer-brand reveal">
          <h3>ZAINLAB</h3>
          <p>AI Creative Studio crafting digital experiences that inspire and perform.</p>
          <div className="socials">
            <a href="https://instagram.com" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="mailto:hello@zainlab.site" aria-label="Email ZainLab">
              <Mail size={16} />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href="#work" aria-label="Projects">
              <Boxes size={16} />
            </a>
          </div>
        </div>
        <div className="footer-links">
          {footerGroups.map(([title, links]) => (
            <div className="footer-column reveal" key={title as string}>
              <h4>{title as string}</h4>
              {(links as string[]).map((link) => (
                <a href="#contact" key={link}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 ZainLab. All rights reserved.</span>
        <a href="#contact">Privacy Policy</a>
      </div>
    </footer>
  );
}

function TextButton({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <a className={`text-button ${compact ? "compact" : ""}`} href="#contact">
      <span>{children}</span>
      <ArrowRight size={16} />
    </a>
  );
}

function SceneCanvas({ variant }: { variant: "hero" | "dust" | "crystal" | "wave" }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(variant === "hero");

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "220px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`scene scene-${variant}`} aria-hidden="true" ref={wrapperRef}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 48 }}
        dpr={[1, 1.25]}
        frameloop={isVisible ? "always" : "never"}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#030305"]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[4, 3, 5]} intensity={variant === "crystal" ? 8 : 4} color="#8b5cf6" />
        <pointLight position={[-5, -2, 3]} intensity={2.8} color="#4f8cff" />
        {variant === "hero" && <HeroObjects />}
        {variant === "dust" && <DustField />}
        {variant === "crystal" && <CrystalCore />}
        {variant === "wave" && <WaveField />}
      </Canvas>
    </div>
  );
}

function HeroObjects() {
  const group = useRef<Group>(null);
  const particles = useMemo(() => makeParticles(900, 9, 2.6), []);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = pointer.x * 0.12 + clock.elapsedTime * 0.025;
    group.current.rotation.x = pointer.y * 0.08;
  });

  return (
    <group ref={group}>
      <Stars radius={60} depth={24} count={360} factor={3} fade speed={0.35} />
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.018} color="#8b8cff" transparent opacity={0.92} depthWrite={false} />
      </points>
      {[-3.8, -1.8, 2.1, 4].map((x, index) => (
        <Float key={x} speed={1 + index * 0.18} rotationIntensity={0.8} floatIntensity={0.5}>
          <Icosahedron args={[index === 0 ? 0.68 : 0.46, 1]} position={[x, index % 2 ? 1.4 : -1.1, -0.6 - index * 0.2]}>
            <meshStandardMaterial color="#1d2336" roughness={0.32} metalness={0.45} emissive="#172050" emissiveIntensity={0.35} />
          </Icosahedron>
        </Float>
      ))}
    </group>
  );
}

function DustField() {
  const particles = useMemo(() => makeParticles(480, 8, 2.2), []);
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.035;
  });

  return (
    <group ref={ref}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.014} color="#a5b4fc" transparent opacity={0.48} />
      </points>
    </group>
  );
}

function CrystalCore() {
  const mesh = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = clock.elapsedTime * 0.22;
    mesh.current.rotation.y = clock.elapsedTime * 0.34;
    mesh.current.position.y = Math.sin(clock.elapsedTime * 1.4) * 0.16;
  });

  return (
    <group>
      <Float speed={1.4} floatIntensity={0.65} rotationIntensity={0.4}>
        <Icosahedron ref={mesh} args={[1.45, 2]} position={[0, 0.2, 0]}>
          <meshPhysicalMaterial
            color="#9d8cff"
            roughness={0.18}
            metalness={0.2}
            transparent
            opacity={0.72}
            emissive="#43208f"
            emissiveIntensity={0.46}
            clearcoat={0.8}
            clearcoatRoughness={0.25}
          />
        </Icosahedron>
      </Float>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
        <torusGeometry args={[1.9, 0.018, 12, 120]} />
        <meshBasicMaterial color="#9b8cff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function WaveField() {
  const ref = useRef<THREE.Points>(null);
  const points = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const x = (i / count) * 12 - 6;
      const z = (Math.random() - 0.5) * 2.8;
      positions[i * 3] = x;
      positions[i * 3 + 1] = Math.sin(x * 1.7) * 0.35 + (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] = Math.sin(positions[i] * 1.6 + clock.elapsedTime * 0.65) * 0.32;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={[0, -1.2, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#7c8cff" transparent opacity={0.72} />
    </points>
  );
}

function makeParticles(count: number, width: number, height: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = Math.random() * width;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * height + Math.sin(angle * 2) * 0.8;
    positions[i * 3 + 2] = Math.sin(angle) * radius - 2.5;
  }
  return positions;
}

export default App;
