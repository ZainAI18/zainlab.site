import { useEffect, useRef, useState } from "react";
import { CircleDot } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ClothingScene from "./ClothingScene";
import { curatedLooks } from "./outfits";
import type { CuratedLook } from "./outfits";
import { navigateTo } from "../navigation";

gsap.registerPlugin(ScrollTrigger);

export default function ClothingShowroomPage() {
  const [selectedSet, setSelectedSet] = useState<CuratedLook | null>(null);
  const [dressSignal, setDressSignal] = useState(0);
  const [isDressed, setIsDressed] = useState(true);
  const [isFinaleActive, setIsFinaleActive] = useState(false);
  const [isReturnPromptVisible, setIsReturnPromptVisible] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const selectorRef = useRef<HTMLDivElement>(null);
  const selectedSetRef = useRef<CuratedLook | null>(null);
  const dressedStartedRef = useRef(false);
  const returnStartedRef = useRef(false);
  const returnTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    selectedSetRef.current = selectedSet;
  }, [selectedSet]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    return () => {
      if (returnTimeoutRef.current) {
        window.clearTimeout(returnTimeoutRef.current);
      }
      document.documentElement.classList.remove("is-clothing-returning");
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".clothing-reveal-trigger",
            start: "top 82%",
            end: "top 25%",
            scrub: 0.7,
          },
        })
        .to(".clothing-intro-copy", { autoAlpha: 0, y: -22, ease: "power2.out" }, 0)
        .to(".clothing-scroll-cue", { autoAlpha: 0, y: 18, ease: "power2.out" }, 0);

      if (selectorRef.current) {
        gsap.fromTo(
          selectorRef.current,
          { autoAlpha: 0, x: 32 },
          {
            autoAlpha: 1,
            x: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".clothing-selection-trigger",
              start: "top center",
              end: "bottom center",
              scrub: 0.7,
            },
          },
        );
      }

      ScrollTrigger.create({
        trigger: ".clothing-dressing-trigger",
        start: "top 48%",
        once: true,
        onEnter: () => {
          if (dressedStartedRef.current) return;
          dressedStartedRef.current = true;

          if (selectedSetRef.current) {
            setDressSignal((value) => value + 1);
          }
        },
      });

      ScrollTrigger.create({
        trigger: ".clothing-finale-trigger",
        start: "top 56%",
        onEnter: () => setIsFinaleActive(true),
        onLeaveBack: () => {
          setIsFinaleActive(false);
          setIsReturnPromptVisible(false);
          setIsReturning(false);
          returnStartedRef.current = false;
          document.documentElement.classList.remove("is-clothing-returning");
          if (returnTimeoutRef.current) {
            window.clearTimeout(returnTimeoutRef.current);
            returnTimeoutRef.current = null;
          }
        },
      });

      ScrollTrigger.create({
        trigger: ".clothing-return-trigger",
        start: "top 62%",
        onEnter: () => setIsReturnPromptVisible(true),
        onLeaveBack: () => setIsReturnPromptVisible(false),
      });

      ScrollTrigger.create({
        trigger: ".clothing-exit-trigger",
        start: "top 66%",
        onEnter: () => {
          if (returnStartedRef.current) return;
          returnStartedRef.current = true;
          setIsReturning(true);
          document.documentElement.classList.add("is-clothing-returning");

          returnTimeoutRef.current = window.setTimeout(() => {
            setSelectedSet(null);
            selectedSetRef.current = null;
            dressedStartedRef.current = false;
            setDressSignal(0);
            setIsDressed(true);
            setResetSignal((value) => value + 1);
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
            navigateTo("/website");
          }, 1450);
        },
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  const selectFashionSet = (set: CuratedLook) => {
    setSelectedSet(set);

    if (set.type === "full-model" || dressedStartedRef.current || isDressed) {
      dressedStartedRef.current = true;
      setIsDressed(false);
      setDressSignal((value) => value + 1);
    }
  };

  return (
    <main
      className={`clothing-showroom-page ${isFinaleActive ? "is-finale-active" : ""} ${isReturning ? "is-returning" : ""}`}
    >
      <ClothingScene
        selectedSet={selectedSet}
        dressSignal={dressSignal}
        isDressed={isDressed}
        setIsDressed={setIsDressed}
        mouseRef={mouseRef}
        isFinaleActive={isFinaleActive}
        isReturning={isReturning}
        resetSignal={resetSignal}
      />

      <section className="clothing-showroom-ui" aria-label="Fashion set selector">
        <a
          className="clothing-showroom-brand"
          href="/"
          aria-label="Back to ZainLab home"
          onClick={(event) => {
            event.preventDefault();
            navigateTo("/");
          }}
        >
          <span>ZAINLAB</span>
        </a>

        <div className="clothing-intro-copy">
          <p>Luxury Digital Fitting</p>
          <h1>Scroll into the atelier</h1>
        </div>

        <div className="clothing-set-selector" ref={selectorRef}>
          <p className="clothing-selector-kicker">Curated Looks</p>
          {curatedLooks.map((set) => (
            <button
              className={`clothing-set-option ${selectedSet?.id === set.id ? "is-active" : ""}`}
              key={set.id}
              type="button"
              onClick={() => selectFashionSet(set)}
              aria-pressed={selectedSet?.id === set.id}
            >
              <span className="clothing-set-number">{set.number}</span>
              <span>
                <strong>{set.name}</strong>
                <small>{set.description}</small>
              </span>
              <CircleDot size={15} strokeWidth={1.2} />
            </button>
          ))}
        </div>

        <div className={`clothing-rotate-hint ${isDressed ? "is-visible" : ""}`}>Hold and drag to rotate</div>

        <div className="clothing-scroll-cue">
          <span />
          Scroll
        </div>

        <div
          className={`clothing-finale-copy ${isFinaleActive && !isReturnPromptVisible ? "is-visible" : ""}`}
          aria-hidden={!isFinaleActive || isReturnPromptVisible}
        >
          <h2>COLLECTION COMPLETE</h2>
          <p>Thank you for exploring the collection.</p>
        </div>

        <div
          className={`clothing-return-copy ${isReturnPromptVisible ? "is-visible" : ""}`}
          aria-hidden={!isReturnPromptVisible}
        >
          <h2>RETURN TO SHOWROOM</h2>
          <p>Scroll to continue</p>
        </div>

        <div className={`clothing-exit-veil ${isReturning ? "is-visible" : ""}`} aria-hidden="true" />
      </section>

      <div className="clothing-scroll-space" aria-hidden="true">
        <div className="clothing-scroll-panel clothing-intro-trigger" />
        <div className="clothing-scroll-panel clothing-reveal-trigger" />
        <div className="clothing-scroll-panel clothing-selection-trigger" />
        <div className="clothing-scroll-panel clothing-dressing-trigger" />
        <div className="clothing-scroll-panel clothing-finale-trigger" />
        <div className="clothing-scroll-panel clothing-return-trigger" />
        <div className="clothing-scroll-panel clothing-exit-trigger" />
      </div>
    </main>
  );
}
