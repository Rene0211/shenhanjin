import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { PageTransitionLayer, type TransitionRequest } from "./components/PageTransitionLayer";
import { ProfileFlipGallery, type ProfileGalleryImage } from "./components/ProfileFlipGallery";
import RadialRevealButton from "./components/originkit/ui/radial-reveal-button";
import { education, experiences, profile, projects, type Project } from "./data/portfolio";
import { gsap, motionDuration, motionEase, motionValue, prefersReducedMotion, useGSAP } from "./lib/gsap";
import {
  getProfileCollisionMotion,
  getProfileRevealToggleActions,
  getMotionMultiplier,
  getTransitionOrigin,
  shouldShowBackToTop,
  type RectLike,
} from "./lib/motion";
import { getProfileCardTilt } from "./lib/flipGallery";
import { createGlassRainDrops, getGlassRainDensity } from "./lib/glassRain";
import { projectButtonTheme } from "./lib/projectButtonTheme";
import { splitTextForReveal } from "./lib/textReveal";

type Page = "home" | "detail";

type ProjectSlot = Project & {
  placeholder?: boolean;
};

const placeholderProject: ProjectSlot = {
  id: "project-placeholder",
  name: "项目名称",
  type: "领域/类型",
  time: "项目周期",
  summary: "",
  images: [],
  placeholder: true,
};

const navItems = [
  { label: "首页", page: "home" as const },
  { label: "介绍", anchor: "about" },
  { label: "作品", anchor: "featured-projects" },
  { label: "联系", anchor: "contact" },
];

const profileGalleryImages: ProfileGalleryImage[] = [
  { src: "/assets/profile-gallery-01.jpg", alt: "沈涵今在书店阅读", objectPosition: "66% 50%" },
  { src: "/assets/profile-gallery-02.jpg", alt: "沈涵今在海边", objectPosition: "54% 50%" },
  { src: "/assets/profile-gallery-03.jpg", alt: "沈涵今在公园", objectPosition: "50% 52%" },
  { src: "/assets/profile-gallery-04.jpg", alt: "沈涵今的个人照片", objectPosition: "50% 30%" },
];

const glassRainDrops = createGlassRainDrops(getGlassRainDensity(1280));
const glassRainPanes = [
  { pane: 0, side: "left", position: "outer" },
  { pane: 1, side: "left", position: "door" },
  { pane: 2, side: "right", position: "door" },
  { pane: 3, side: "right", position: "outer" },
] as const;

type RainDropStyle = CSSProperties & Record<`--rain-${string}`, string>;

const pushDetailImages = Array.from({ length: 17 }, (_, index) => {
  const order = String(index + 1).padStart(2, "0");
  return `/assets/project-push-detail-${order}.png`;
});

const gardenDetailImages = Array.from({ length: 4 }, (_, index) => {
  const order = String(index + 1).padStart(2, "0");
  return `/assets/project-garden-detail-${order}.png`;
});

const detailImagesByProjectId: Record<string, string[]> = {
  "project-01": pushDetailImages,
  "project-02": gardenDetailImages,
};

function normalizeSlots(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const project = projects[index];
    return project ? project : { ...placeholderProject, id: `project-placeholder-${index + 1}` };
  });
}

function getProjectProblem(project: ProjectSlot) {
  if (project.placeholder) return "核心问题";
  return project.summary.split("；")[0] || "核心问题";
}

function getProjectDecision(project: ProjectSlot) {
  if (project.placeholder) return "关键决策";
  return project.summary.split("；")[1] || "关键决策";
}

function getProjectOutcome(project: ProjectSlot) {
  if (project.placeholder) return "主要设计产出";
  return project.summary.split("；")[2] || project.summary;
}

function SiteHeader({
  activePage,
  activeAnchor,
  onNavigate,
}: {
  activePage: Page;
  activeAnchor?: string;
  onNavigate: (page: Page, anchor?: string) => void;
}) {
  return (
    <header className="site-header">
      <button
        type="button"
        className="logo-mark"
        onClick={(event) => {
          event.currentTarget.blur();
          onNavigate("home");
        }}
        aria-label="返回首页"
      >
        <span>UX设计作品集</span>
      </button>
      <nav className="site-nav" aria-label="主要导航">
        {navItems.map((item) => {
          const isActive = activePage === "detail"
            ? item.label === "作品"
            : item.page === "home"
              ? !activeAnchor
              : item.anchor === activeAnchor;
          return (
            <button
              key={item.label}
              type="button"
              className={`nav-link ${isActive ? "is-active" : ""}`}
              onClick={(event) => {
                event.currentTarget.blur();
                onNavigate(item.page ?? "home", item.anchor);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

function MediaFrame({ label, src, large = false }: { label: string; src?: string; large?: boolean }) {
  return (
    <figure className={`media-frame ${large ? "media-frame-large" : ""}`}>
      {src ? <img src={src} alt={label} loading="lazy" /> : null}
      {!src ? <figcaption>{label}</figcaption> : null}
    </figure>
  );
}

function Button({
  children,
  variant = "secondary",
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`ui-button ui-button-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {action ? (
        <button type="button" className="text-action" onClick={action.onClick}>
          {action.label}
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      ) : null}
    </div>
  );
}

function HomeSectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id?: string }) {
  return (
    <header className="home-section-heading">
      <p>{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </header>
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: ProjectSlot;
  index: number;
  onOpen?: (project: ProjectSlot, sourceRect: RectLike) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);

  useGSAP((_, contextSafeInside) => {
    const card = cardRef.current;
    const image = card?.querySelector<HTMLElement>(".project-card-media img");
    const action = card?.querySelector<HTMLElement>(".project-card .ui-button");
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (!card || prefersReducedMotion() || isCoarsePointer) {
      return;
    }

    const makeContextSafe = contextSafeInside ?? (<T extends (...args: never[]) => unknown>(callback: T) => callback);
    const moveImageX = image
      ? gsap.quickTo(image, "x", { duration: 0.34, ease: motionEase.soft, overwrite: false })
      : undefined;
    const moveImageY = image
      ? gsap.quickTo(image, "y", { duration: 0.34, ease: motionEase.soft, overwrite: false })
      : undefined;
    const handlePointerEnter = makeContextSafe(() => {
      gsap.to(card, { y: -7, duration: 0.42, ease: "power3.out", overwrite: "auto" });
      if (image) gsap.to(image, { scale: motionValue.projectHoverScale, duration: 0.8, ease: "power3.out", overwrite: "auto" });
      if (action) gsap.to(action, { x: 4, duration: 0.36, ease: "power3.out", overwrite: "auto" });
    });

    const handlePointerMove = makeContextSafe((event: PointerEvent) => {
      const bounds = card.getBoundingClientRect();
      const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;
      moveImageX?.(gsap.utils.clamp(-motionValue.projectPointerShift, motionValue.projectPointerShift, normalizedX * 10));
      moveImageY?.(gsap.utils.clamp(-motionValue.projectPointerShift, motionValue.projectPointerShift, normalizedY * 10));
    });

    const handlePointerLeave = makeContextSafe(() => {
      gsap.to(card, { y: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      if (image) gsap.to(image, { x: 0, y: 0, scale: 1, duration: 0.72, ease: "power3.out", overwrite: "auto" });
      if (action) gsap.to(action, { x: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" });
    });

    card.addEventListener("pointerenter", handlePointerEnter);
    card.addEventListener("pointermove", handlePointerMove);
    card.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      card.removeEventListener("pointerenter", handlePointerEnter);
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, { scope: cardRef });

  return (
    <article ref={cardRef} className={`project-card ${project.placeholder ? "is-placeholder" : ""}`}>
      <figure className="project-card-media">
        {project.images[0] ? <img src={project.images[0]} alt={`${project.name} 项目封面`} /> : null}
      </figure>
      <div className="project-card-copy">
        <p className="project-card-eyebrow">SELECTED WORK / {String(index + 1).padStart(2, "0")}</p>
        <h3>{project.name}</h3>
        <p className="project-role">担任角色：{project.type}</p>
        {project.placeholder ? (
          <div className="copy-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <p className="project-summary">{project.summary}</p>
        )}
        <div className="project-card-footer">
          <span>{project.time}</span>
          {onOpen ? (
            <RadialRevealButton
              className="ui-button ui-button-ghost radial-project-button"
              label="查看详情"
              disabled={project.placeholder}
              onClick={() => {
                if (!cardRef.current) return;
                onOpen(project, cardRef.current.getBoundingClientRect());
              }}
              padding="0 20px"
              rounded={100}
              colors={{
                fill: projectButtonTheme.fill,
                textColor: projectButtonTheme.textColor,
                hoverFill: projectButtonTheme.hoverFill,
                hoverTextColor: projectButtonTheme.hoverTextColor,
              }}
              addIcon
              icon={{
                type: "symbol",
                symbol: "→",
                side: "right",
                size: 20,
                color: projectButtonTheme.iconColor,
                hoverColor: projectButtonTheme.iconHoverColor,
              }}
              gap={10}
              border={{
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "rgba(143, 232, 255, 0.52)",
              }}
              font={{
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 650,
                lineHeight: 1,
                letterSpacing: "0.04em",
              }}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ContactSection() {
  return (
    <section className="contact-block" id="contact" aria-labelledby="contact-title">
      <HomeSectionHeading eyebrow="CONTACT / CONNECT" title="联系方式" id="contact-title" />
      <div className="contact-section" aria-label="联系方式视觉区域">
        <img className="contact-section-bg" src="/assets/portfolio-cover-bg-v2.png" alt="" aria-hidden="true" />
        <div className="contact-section-shade" aria-hidden="true" />
        <div className="contact-section-content">
          <ContactRows />
        </div>
      </div>
    </section>
  );
}

function ExperienceCard({
  index,
  variant,
  image,
  imageAlt,
  eyebrow,
  title,
  meta,
  time,
  detail,
}: {
  index: number;
  variant: "work" | "education";
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  meta?: string;
  time?: string;
  detail?: string;
}) {
  return (
    <article className={`experience-card experience-card--${variant}`}>
      <div className="experience-card-art">
        <span className="experience-card-index">{String(index + 1).padStart(2, "0")}</span>
        <img className="experience-card-cover-image" src={image} alt={imageAlt} />
      </div>
      <div className="experience-card-copy">
        <p className="experience-card-eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        {meta || time ? (
          <div className="experience-card-meta">
            {meta ? <span>{meta}</span> : null}
            {time ? <span>{time}</span> : null}
          </div>
        ) : null}
        {detail ? <p className="experience-card-detail">{detail}</p> : null}
      </div>
    </article>
  );
}

function ContactRows() {
  const [copied, setCopied] = useState<string | null>(null);
  const rows = [
    { icon: Mail, label: "邮箱", value: profile.contact.email, copyValue: profile.contact.email },
    { icon: Phone, label: "电话", value: `${profile.contact.phone}（同微信）`, copyValue: profile.contact.phone },
    { icon: MapPin, label: "所在地", value: profile.city },
  ];

  const copyContact = async (label: string, value?: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="contact-rows">
      {rows.map(({ icon: Icon, label, value, copyValue }) => {
        const content = (
          <>
            <Icon aria-hidden="true" size={18} />
            <span>{value}</span>
            {copied === label ? <em>已复制</em> : null}
          </>
        );
        return copyValue ? (
          <button
            key={label}
            type="button"
            onClick={() => copyContact(label, copyValue)}
            aria-label={`复制${label}：${value}`}
          >
            {content}
          </button>
        ) : (
          <p key={label} aria-label={`${label}：${value}`}>
            {content}
          </p>
        );
      })}
    </div>
  );
}

function CoverPage({
  isEntered,
  onIntroReady,
  onEnterContent,
}: {
  isEntered: boolean;
  onIntroReady: () => void;
  onEnterContent: () => void;
}) {
  const coverRef = useRef<HTMLElement>(null);
  const isOpeningRef = useRef(false);
  const isIntroReadyRef = useRef(false);
  const hasIntroPlayedRef = useRef(false);
  const gestureTouchStartYRef = useRef<number | null>(null);

  const { contextSafe } = useGSAP((_, contextSafeInside) => {
    if (prefersReducedMotion()) {
      gsap.set(".cover-bg, .cover-door, .cover-glass-rain, .cover-open-light, .cover-kicker, .cover-title, .cover-subtitle, .cover-scroll", {
        autoAlpha: 1,
        clearProps: "all",
      });
      isIntroReadyRef.current = true;
      onIntroReady();
      return;
    }

    isIntroReadyRef.current = false;
    const arrowBounce = gsap.to(".cover-scroll-arrow", {
      y: 8,
      duration: 0.9,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      paused: true,
    });

    gsap
      .timeline({
        defaults: {
          ease: motionEase.standard,
          overwrite: "auto",
        },
        onComplete: () => {
          isIntroReadyRef.current = true;
          hasIntroPlayedRef.current = true;
          arrowBounce.play();
          onIntroReady();
        },
      })
      .from(".cover-bg", {
        autoAlpha: 0,
        scale: 1.05,
        duration: 0.58,
        clearProps: "opacity,visibility,transform",
      })
      .from(
        ".cover-door",
        {
          autoAlpha: 0,
          scale: 1.025,
          duration: 0.58,
          clearProps: "opacity,visibility,transform",
        },
        "<",
      )
      .fromTo(
        ".cover-kicker",
        {
          autoAlpha: 0,
          y: 14,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.34,
        },
        "-=0.06",
      )
      .fromTo(
        ".cover-title",
        {
          autoAlpha: 0,
          y: 24,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.46,
        },
        "-=0.08",
      )
      .fromTo(
        ".cover-subtitle, .cover-scroll",
        {
          autoAlpha: 0,
          y: 10,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.36,
          stagger: 0.05,
        },
        "-=0.04",
      );

    gsap.to(".cover-bg", {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: coverRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
      },
    });

    const makeContextSafe = contextSafeInside ?? (<T extends (...args: never[]) => unknown>(callback: T) => callback);
    const handleLetterHover = makeContextSafe((event: PointerEvent) => {
      const letter = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>(".cover-title-letter") : null;
      if (!isIntroReadyRef.current || !letter || letter.dataset.space === "true") return;

      gsap.killTweensOf(letter);
      gsap
        .timeline({
          defaults: {
            ease: "power3.out",
            overwrite: "auto",
          },
        })
        .to(letter, {
          y: -12,
          rotation: gsap.utils.random(-5, 5),
          scale: 1.05,
          duration: 0.16,
        })
        .to(letter, {
          y: 4,
          rotation: gsap.utils.random(-3, 3),
          scale: 0.98,
          duration: 0.12,
        })
        .to(letter, {
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.28,
          ease: "elastic.out(1, 0.45)",
          clearProps: "transform",
        });
    });

    coverRef.current?.addEventListener("pointerover", handleLetterHover);

    return () => {
      coverRef.current?.removeEventListener("pointerover", handleLetterHover);
    };
  }, { scope: coverRef });

  useEffect(() => {
    if (isEntered) return;

    isOpeningRef.current = false;
    isIntroReadyRef.current = hasIntroPlayedRef.current;
    gsap.set(".cover-door-left, .cover-door-right, .cover-rain-half, .cover-glass-rain, .cover-shade", { clearProps: "all" });
    gsap.set(".cover-open-light", { autoAlpha: 0, scaleX: 0.04 });
    if (hasIntroPlayedRef.current) {
      gsap.set(".cover-kicker, .cover-title, .cover-subtitle, .cover-scroll", { autoAlpha: 1, y: 0 });
      onIntroReady();
    }
  }, [isEntered]);

  const scrollToContent = contextSafe(() => {
    if (isOpeningRef.current || !isIntroReadyRef.current) return;
    isOpeningRef.current = true;

    if (prefersReducedMotion()) {
      onEnterContent();
      return;
    }

    gsap
      .timeline({
        defaults: {
          ease: "power3.inOut",
          overwrite: "auto",
        },
      })
      .addLabel("cue")
      .to(".cover-scroll", {
        autoAlpha: 0,
        y: 18,
        duration: 0.24,
      }, "cue")
      .addLabel("identity", "cue+=0.12")
      .to(
        ".cover-kicker, .cover-title, .cover-subtitle",
        {
          autoAlpha: 0,
          y: -18,
          scale: 0.985,
          duration: 0.46,
          stagger: 0.035,
        },
        "identity",
      )
      .addLabel("doors", "identity+=0.28")
      .to(
        ".cover-door-left",
        {
          xPercent: -104,
          duration: 1.05,
        },
        "doors",
      )
      .to(
        ".cover-door-right",
        {
          xPercent: 104,
          duration: 1.05,
        },
        "<",
      )
      .to(
        ".cover-rain-half-left",
        {
          xPercent: -104,
          duration: 1.05,
        },
        "doors",
      )
      .to(
        ".cover-rain-half-right",
        {
          xPercent: 104,
          duration: 1.05,
        },
        "doors",
      )
      .addLabel("light", "doors+=0.19")
      .fromTo(
        ".cover-open-light",
        {
          autoAlpha: 0,
          scaleX: 0.04,
        },
        {
          autoAlpha: 0.92,
          scaleX: 1,
          duration: 0.34,
        },
        "light",
      )
      .call(onEnterContent, [], "<+=0.08")
      .to(".cover-open-light", {
        autoAlpha: 0,
        scaleX: 1.12,
        duration: 0.42,
        ease: "power2.out",
      }, "<")
      .to(
        ".cover-glass-rain",
        {
          autoAlpha: 0,
          duration: 0.62,
        },
        "<",
      )
      .to(
        ".cover-shade",
        {
          autoAlpha: 0.28,
          duration: 0.7,
        },
        "<",
      );
  });

  useEffect(() => {
    if (isEntered) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        scrollToContent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEntered, scrollToContent]);

  return (
    <section
      ref={coverRef}
      className="cover-section"
      aria-label="作品集视觉封面"
      onWheel={(event) => {
        if (event.deltaY > 16) scrollToContent();
      }}
      onTouchStart={(event) => {
        gestureTouchStartYRef.current = event.touches[0]?.clientY ?? null;
      }}
      onTouchMove={(event) => {
        const startY = gestureTouchStartYRef.current;
        const currentY = event.touches[0]?.clientY;
        if (startY !== null && currentY !== undefined && startY - currentY > 24) {
          gestureTouchStartYRef.current = null;
          scrollToContent();
        }
      }}
      onTouchEnd={() => {
        gestureTouchStartYRef.current = null;
      }}
    >
      <div className="cover-bg" />
      <div className="cover-door cover-door-left" />
      <div className="cover-door cover-door-right" />
      <div className="cover-shade" />
      <div className="cover-glass-rain" aria-hidden="true">
        {(["left", "right"] as const).map((side) => (
          <div className={`cover-rain-half cover-rain-half-${side}`} key={side}>
            {glassRainPanes.filter((pane) => pane.side === side).map((pane) => (
              <div className={`cover-rain-pane cover-rain-pane-${pane.position}`} key={`${pane.side}-${pane.position}`}>
                {glassRainDrops.filter((drop) => drop.pane === pane.pane).map((drop, index) => {
                  const style: RainDropStyle = {
                    "--rain-x": `${drop.x}%`,
                    "--rain-y": `${drop.y}%`,
                    "--rain-size": `${drop.size}px`,
                    "--rain-length": `${drop.length}px`,
                    "--rain-duration": `${drop.duration}s`,
                    "--rain-delay": `${drop.delay}s`,
                    "--rain-drift": `${drop.drift}px`,
                    "--rain-opacity": `${drop.opacity}`,
                  };
                  return <span className={`cover-rain-drop is-${drop.kind}`} style={style} key={`${pane.pane}-${index}`} />;
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="cover-open-light" aria-hidden="true" />
      <div className="cover-content">
        <p className="cover-kicker">UX / INTERACTION DESIGN PORTFOLIO</p>
        <h1 className="cover-title" aria-label="SHEN HANJIN">
          {"SHEN HANJIN".split("").map((letter, index) => (
            <span
              className="cover-title-letter"
              data-space={letter === " "}
              key={`${letter}-${index}`}
              aria-hidden="true"
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </h1>
        <p className="cover-subtitle">Design with clarity, emotion and product thinking.</p>
      </div>
      <button type="button" className="cover-scroll" onClick={scrollToContent} aria-label="滚动到首页内容">
        <span>SCROLL</span>
        <span className="cover-scroll-arrow" aria-hidden="true">↓</span>
      </button>
    </section>
  );
}

function CursorTrail() {
  const trailRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion() || isCoarsePointer) {
      gsap.set(".cursor-trail-dot, .cursor-trail-core", { autoAlpha: 0 });
      return;
    }

    const dots = gsap.utils.toArray<HTMLElement>(".cursor-trail-dot");
    const core = trailRef.current?.querySelector<HTMLElement>(".cursor-trail-core");
    const coreX = core ? gsap.quickTo(core, "x", { duration: 0.16, ease: "power3.out" }) : undefined;
    const coreY = core ? gsap.quickTo(core, "y", { duration: 0.16, ease: "power3.out" }) : undefined;

    let dotIndex = 0;
    let previousX = 0;
    let previousY = 0;
    let hasPreviousPoint = false;
    let lastEmission = 0;

    gsap.set([...dots, core].filter(Boolean), {
      autoAlpha: 0,
      xPercent: -50,
      yPercent: -50,
    });

    const hideTrail = () => {
      hasPreviousPoint = false;
      gsap.to(".cursor-trail-dot, .cursor-trail-core", {
        autoAlpha: 0,
        scale: 0.4,
        duration: 0.3,
      });
    };

    const moveTrail = (event: PointerEvent) => {
      const currentX = event.clientX;
      const currentY = event.clientY;

      coreX?.(currentX);
      coreY?.(currentY);
      if (core) {
        gsap.to(core, {
          autoAlpha: 0.9,
          scale: 1,
          duration: 0.16,
        });
      }

      const distance = hasPreviousPoint ? Math.hypot(currentX - previousX, currentY - previousY) : 999;
      const now = performance.now();
      if (distance < 10 || now - lastEmission < 18) return;

      const angle = Math.atan2(currentY - previousY, currentX - previousX) * (180 / Math.PI);
      const dot = dots[dotIndex % dots.length];
      dotIndex += 1;
      lastEmission = now;
      previousX = currentX;
      previousY = currentY;
      hasPreviousPoint = true;

      gsap.killTweensOf(dot);
      gsap.fromTo(
        dot,
        {
          x: currentX,
          y: currentY,
          xPercent: -50,
          yPercent: -50,
          rotation: angle,
          scaleX: 1,
          scaleY: 1,
          autoAlpha: 0.82,
        },
        {
          x: currentX - Math.cos((angle * Math.PI) / 180) * 34,
          y: currentY - Math.sin((angle * Math.PI) / 180) * 34,
          scaleX: 0.24,
          scaleY: 0.62,
          autoAlpha: 0,
          duration: 0.72,
          ease: "power3.out",
        },
      );
    };

    window.addEventListener("pointerleave", hideTrail);
    window.addEventListener("pointermove", moveTrail, { passive: true });

    return () => {
      window.removeEventListener("pointerleave", hideTrail);
      window.removeEventListener("pointermove", moveTrail);
    };
  }, { scope: trailRef });

  return (
    <div ref={trailRef} className="cursor-trail" aria-hidden="true">
      <span className="cursor-trail-core" />
      {Array.from({ length: 14 }, (_, index) => (
        <span className="cursor-trail-dot" key={index} />
      ))}
    </div>
  );
}

function HomePage({ onOpenProject }: { onOpenProject: (project: ProjectSlot, sourceRect: RectLike) => void }) {
  const featured = useMemo(() => normalizeSlots(2), []);
  const homeRef = useRef<HTMLElement>(null);
  const profileVisualRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const card = profileVisualRef.current;
    if (!card) return;

    const media = gsap.matchMedia();
    media.add(
      {
        finePointer: "(hover: hover) and (pointer: fine)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { finePointer, reduceMotion } = context.conditions as {
          finePointer: boolean;
          reduceMotion: boolean;
        };
        if (!finePointer || reduceMotion) return;

        const rotateXTo = gsap.quickTo(card, "rotationX", { duration: 0.24, ease: "power3.out" });
        const rotateYTo = gsap.quickTo(card, "rotationY", { duration: 0.24, ease: "power3.out" });
        let cardBounds = card.getBoundingClientRect();

        const handlePointerMove = (event: PointerEvent) => {
          const tilt = getProfileCardTilt(cardBounds, event, 8);
          rotateXTo(tilt.rotationX);
          rotateYTo(tilt.rotationY);
        };
        const handlePointerEnter = () => {
          cardBounds = card.getBoundingClientRect();
        };
        const handlePointerLeave = () => {
          rotateXTo(0);
          rotateYTo(0);
        };

        card.addEventListener("pointerenter", handlePointerEnter);
        card.addEventListener("pointermove", handlePointerMove);
        card.addEventListener("pointerleave", handlePointerLeave);

        return () => {
          card.removeEventListener("pointerenter", handlePointerEnter);
          card.removeEventListener("pointermove", handlePointerMove);
          card.removeEventListener("pointerleave", handlePointerLeave);
        };
      },
    );

    return () => media.revert();
  }, { scope: homeRef });

  useGSAP(() => {
    const revealTargets =
      "#about .profile-intro-kicker, #about .profile-intro-title, #about .profile-intro-pane, #about .profile-intro-about-char, #experience .home-section-heading > *, #experience .experience-card, #featured-projects .home-section-heading > *, #featured-projects .project-card, #contact .home-section-heading > *, #contact .contact-section";

    if (prefersReducedMotion()) {
      gsap.set(revealTargets, {
        autoAlpha: 1,
        clearProps: "all",
      });
      gsap.set(".profile-intro-impact", { autoAlpha: 0 });
      return;
    }

    const profileCopy = homeRef.current?.querySelector<HTMLElement>(".profile-intro-copy");
    const profileVisual = profileVisualRef.current;
    const profileImpact = homeRef.current?.querySelector<HTMLElement>(".profile-intro-impact");
    const introText = homeRef.current?.querySelector<HTMLElement>(".profile-intro-about");
    const introCharacters = gsap.utils.toArray<HTMLElement>(".profile-intro-about-char");

    if (profileCopy && profileVisual && profileImpact && introText) {
      const collision = getProfileCollisionMotion(window.innerWidth);
      const [copyContact, visualContact] = collision.contact;
      const [copyRebound, visualRebound] = collision.rebound;
      const impactScale = collision.impactScale;
      const resetProfileCollision = () => {
        gsap.set(profileCopy, { ...collision.first, autoAlpha: 0, scale: 0.96 });
        gsap.set(profileVisual, { ...collision.second, autoAlpha: 0, scale: 0.96 });
        gsap.set(profileImpact, { autoAlpha: 0, [impactScale]: 0.08 });
      };
      const profileTimeline = gsap.timeline({
        defaults: { overwrite: "auto" },
        scrollTrigger: {
          trigger: "#about",
          start: "top 78%",
          toggleActions: getProfileRevealToggleActions(),
          onLeaveBack: resetProfileCollision,
        },
      });

      profileTimeline
        .addLabel("approach")
        .fromTo(
          profileCopy,
          { ...collision.first, autoAlpha: 0, scale: 0.96 },
          { ...copyContact, autoAlpha: 1, scale: 1, duration: 0.78, ease: "power3.inOut" },
          "approach",
        )
        .fromTo(
          profileVisual,
          { ...collision.second, autoAlpha: 0, scale: 0.96 },
          { ...visualContact, autoAlpha: 1, scale: 1, duration: 0.78, ease: "power3.inOut" },
          "approach",
        )
        .addLabel("impact", "approach+=0.68")
        .to(profileCopy, {
          ...copyRebound,
          scale: 0.985,
          duration: 0.14,
          ease: "power2.out",
        }, "impact")
        .to(profileVisual, {
          ...visualRebound,
          scale: 0.985,
          duration: 0.14,
          ease: "power2.out",
        }, "impact")
        .fromTo(
          profileImpact,
          { autoAlpha: 0, [impactScale]: 0.08 },
          { autoAlpha: 0.92, [impactScale]: 1, duration: 0.16, ease: "power2.out" },
          "impact",
        )
        .to(profileImpact, {
          autoAlpha: 0,
          [impactScale]: 1.42,
          duration: 0.3,
          ease: "power2.out",
        }, "impact+=0.14")
        .to(profileCopy, {
          xPercent: 0,
          yPercent: 0,
          rotation: 0,
          scale: 1,
          duration: 0.44,
          ease: "back.out(2.1)",
          clearProps: "opacity,visibility,transform",
        }, "impact+=0.11")
        .to(profileVisual, {
          xPercent: 0,
          yPercent: 0,
          rotation: 0,
          scale: 1,
          duration: 0.44,
          ease: "back.out(2.1)",
          clearProps: "opacity,visibility,transform",
        }, "impact+=0.11")
        .addLabel("content", "impact+=0.3")
        .from("#about .profile-intro-kicker", {
          autoAlpha: 0,
          y: 10,
          duration: 0.34,
          clearProps: "opacity,visibility,transform",
        }, "content")
        .from("#about .profile-intro-title", {
          autoAlpha: 0,
          y: 24,
          clipPath: "inset(0 0 100% 0)",
          duration: 0.62,
          ease: motionEase.standard,
          clearProps: "opacity,visibility,transform,clip-path",
        }, "content+=0.06")
        .from(introText, {
          autoAlpha: 0,
          y: 12,
          duration: 0.38,
          clearProps: "opacity,visibility,transform",
        }, "content+=0.16")
        .from("#about .profile-intro-tags", {
          autoAlpha: 0,
          y: 12,
          duration: 0.38,
          clearProps: "opacity,visibility,transform",
        }, "content+=0.3")
        .from("#about .profile-photo-gallery", {
          autoAlpha: 0,
          scale: 1.035,
          duration: 0.58,
          ease: motionEase.standard,
          clearProps: "opacity,visibility,transform",
        }, "content")
        .from("#about .profile-intro-facts", {
          autoAlpha: 0,
          y: 14,
          duration: 0.42,
          clearProps: "opacity,visibility,transform",
        }, "content+=0.2")
        .to(introCharacters, {
          opacity: 1,
          duration: 0.42,
          ease: "power1.out",
          stagger: { each: 0.028, from: "start" },
        }, "content+=0.26");
    }

    const revealSections = [
      {
        trigger: "#experience",
        eyebrow: "#experience .home-section-heading p",
        title: "#experience .home-section-heading h2",
        media: "#experience .experience-card-art",
        copy: "#experience .experience-card-copy",
        stagger: 0.1,
      },
      {
        trigger: "#featured-projects",
        eyebrow: "#featured-projects .home-section-heading p",
        title: "#featured-projects .home-section-heading h2",
        media: "#featured-projects .project-card-media",
        copy: "#featured-projects .project-card-copy",
        stagger: 0.12,
      },
      {
        trigger: "#contact",
        eyebrow: "#contact .home-section-heading p",
        title: "#contact .home-section-heading h2",
        media: "#contact .contact-section",
        copy: "#contact .contact-rows > *",
        stagger: 0.06,
      },
    ];

    revealSections.forEach(({ trigger, eyebrow, title, media, copy, stagger }) => {
      const timeline = gsap.timeline({
          defaults: {
            duration: motionDuration.slow,
            ease: motionEase.standard,
            overwrite: "auto",
          },
          scrollTrigger: {
            trigger,
            start: "top 78%",
            once: true,
          },
        });

      timeline
        .from(eyebrow, {
          autoAlpha: 0,
          y: 12,
          duration: 0.38,
          clearProps: "opacity,visibility,transform",
        })
        .from(title, {
          autoAlpha: 0,
          y: 28,
          clipPath: "inset(0 0 100% 0)",
          duration: motionDuration.headingReveal,
          clearProps: "opacity,visibility,transform,clip-path",
        }, "-=0.18")
        .from(
          media,
          {
            autoAlpha: 0,
            scale: motionValue.mediaEntranceScale,
            duration: 0.82,
            clearProps: "opacity,visibility,transform",
          },
          "-=0.38",
        )
        .from(
          copy,
          {
            autoAlpha: 0,
            y: 18,
            stagger,
            clearProps: "opacity,visibility,transform",
          },
          "-=0.44",
        );
    });

    const parallaxTargets = [
      ["#experience .experience-card-art", "#experience"],
      ["#featured-projects .project-card-media", "#featured-projects"],
      ["#contact .contact-section-bg", "#contact"],
    ] as const;

    parallaxTargets.forEach(([targets, trigger]) => {
      gsap.fromTo(targets, { yPercent: -motionValue.scrollParallax }, {
        yPercent: motionValue.scrollParallax,
        ease: "none",
        scrollTrigger: {
          trigger,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    });
  }, { scope: homeRef });

  return (
    <main ref={homeRef}>
      <section className="profile-intro-section" id="about" aria-labelledby="about-title">
        <div className="profile-intro-layout">
          <span className="profile-intro-impact" aria-hidden="true" />
          <article className="profile-intro-pane profile-intro-copy">
            <p className="profile-intro-kicker">ABOUT ME / UX DESIGNER</p>
            <h2 className="profile-intro-title" id="about-title">
              <span>{profile.name}</span>
              <span>{profile.role}</span>
            </h2>
            <p className="profile-intro-about" aria-label={profile.about}>
              {splitTextForReveal(profile.about).map((character, index) => (
                <span className="profile-intro-about-char" aria-hidden="true" key={`${character}-${index}`}>
                  {character}
                </span>
              ))}
            </p>
            <div className="profile-intro-tags" aria-label="个人标签">
              {profile.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </article>

          <article ref={profileVisualRef} className="profile-intro-pane profile-intro-visual">
            <div className="profile-intro-orbit" aria-hidden="true">
              <span />
              <span />
            </div>
            <ProfileFlipGallery images={profileGalleryImages} />
            <div className="profile-intro-facts">
              <div><span>工作年限</span><strong>{profile.experience}</strong></div>
              <div><span>所在地</span><strong>{profile.city}</strong></div>
              <div><span>生日</span><strong>{profile.birthday}</strong></div>
            </div>
          </article>
        </div>
      </section>

      <section className="experience-section" id="experience" aria-labelledby="experience-title">
        <HomeSectionHeading eyebrow="EXPERIENCE / CAPABILITY" title="个人经历" id="experience-title" />
        <div className="experience-card-grid">
          <ExperienceCard
            index={0}
            variant="education"
            image="/assets/experience-nua.png"
            imageAlt="南京艺术学院校园入口"
            eyebrow="EDUCATION"
            title={education[0].title}
            meta={education[0].org}
            time={education[0].time}
            detail={education[0].detail}
          />
          <ExperienceCard
            index={1}
            variant="work"
            image="/assets/experience-pinduoduo.png"
            imageAlt="拼多多品牌与移动端应用"
            eyebrow="WORK EXPERIENCE"
            title={experiences[0].title}
            meta={experiences[0].org}
            time={experiences[0].time}
            detail={experiences[0].detail}
          />
        </div>
      </section>

      <section className="page-section" id="featured-projects" aria-label="代表项目">
        <HomeSectionHeading eyebrow="SELECTED / WORKS" title="代表项目" />
        <div className="project-grid">
          {featured.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onOpen={onOpenProject} />
          ))}
        </div>
      </section>

      <ContactSection />
    </main>
  );
}

function PlaceholderText({ lines = 2 }: { lines?: number }) {
  return (
    <span className="text-placeholder" aria-label="内容待补充">
      {Array.from({ length: lines }, (_, index) => (
        <i key={index} />
      ))}
    </span>
  );
}

function DetailFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="detail-fact">
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
  );
}

function DetailPage({
  project,
  onBack,
  onNext,
}: {
  project: ProjectSlot;
  onBack: () => void;
  onNext: () => void;
}) {
  const detailRef = useRef<HTMLElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const detailTitle = project.id === "project-01" ? "小红书晒单活动" : project.name;
  const detailType =
    project.id === "project-01" ? "用户增长、内容转化" : project.id === "project-02" ? "游戏化设计" : project.type;
  const detailTime =
    project.id === "project-01" ? "2026.01——至今" : project.id === "project-02" ? "2023-2024" : project.time;
  const detailHighlight =
    project.id === "project-01"
      ? "从0-1全链路设计、AI工具辅助、数据追踪分析"
      : project.id === "project-02"
        ? "自研需求、数据分析、产品思维、用户心理"
        : <PlaceholderText />;
  const detailImages = detailImagesByProjectId[project.id] ?? [];

  useEffect(() => {
    let frameId = 0;
    const updateVisibility = () => {
      frameId = 0;
      const shouldShow = shouldShowBackToTop(window.scrollY, window.innerHeight);
      setShowBackToTop((current) => current === shouldShow ? current : shouldShow);
    };
    const scheduleUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateVisibility);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [project.id]);

  useGSAP(() => {
    const button = backToTopRef.current;
    if (!button) return;
    if (prefersReducedMotion()) {
      gsap.set(button, {
        autoAlpha: showBackToTop ? 1 : 0,
        y: 0,
        scale: 1,
        pointerEvents: showBackToTop ? "auto" : "none",
      });
      return;
    }
    gsap.to(button, {
      autoAlpha: showBackToTop ? 1 : 0,
      y: showBackToTop ? 0 : 14,
      scale: showBackToTop ? 1 : 0.88,
      pointerEvents: showBackToTop ? "auto" : "none",
      duration: showBackToTop ? 0.34 : 0.22,
      ease: motionEase.standard,
    });
  }, { scope: detailRef, dependencies: [showBackToTop] });

  useGSAP(() => {
    const detailTargets =
      ".detail-toolbar, .detail-overview .section-header, .overview-copy h1, .overview-grid .media-frame, .detail-fact, .page-section-tight .section-header, .detail-showcase-image";

    if (prefersReducedMotion()) {
      gsap.set(detailTargets, {
        autoAlpha: 1,
        clearProps: "all",
      });
      return;
    }

    const multiplier = getMotionMultiplier(window.innerWidth);
    gsap
      .timeline({
        defaults: {
          duration: motionDuration.slow * multiplier,
          ease: motionEase.standard,
          overwrite: "auto",
        },
      })
      .from(".detail-toolbar", {
        autoAlpha: 0,
        y: 12,
        clearProps: "opacity,visibility,transform",
      })
      .from(
        ".detail-overview .section-header",
        {
          autoAlpha: 0,
          y: 18,
          clearProps: "opacity,visibility,transform",
        },
        "-=0.38",
      )
      .from(".overview-copy h1", {
        autoAlpha: 0,
        y: 28,
        clipPath: "inset(0 0 100% 0)",
        clearProps: "opacity,visibility,transform,clip-path",
      }, "-=0.34")
      .from(".overview-grid .media-frame", {
        autoAlpha: 0,
        scale: motionValue.mediaEntranceScale,
        duration: 0.82 * multiplier,
        clearProps: "opacity,visibility,transform",
      }, "-=0.38")
      .from(".detail-fact", {
        autoAlpha: 0,
        y: 18,
        stagger: 0.065 * multiplier,
        clearProps: "opacity,visibility,transform",
      }, "-=0.42");

    gsap.from(".page-section-tight .section-header", {
      autoAlpha: 0,
      y: 24,
      duration: motionDuration.headingReveal * multiplier,
      ease: motionEase.standard,
      overwrite: "auto",
      clearProps: "opacity,visibility,transform",
      scrollTrigger: {
        trigger: ".page-section-tight",
        start: "top 78%",
        once: true,
      },
    });

    gsap.utils.toArray<HTMLElement>(".detail-showcase-image").forEach((figure) => {
      const image = figure.querySelector<HTMLElement>("img");
      gsap.from(figure, {
        autoAlpha: 0,
        y: 26,
        scale: 1.018,
        duration: 0.72 * multiplier,
        ease: motionEase.standard,
        clearProps: "opacity,visibility,transform",
        scrollTrigger: {
          trigger: figure,
          start: "top 82%",
          once: true,
        },
      });
      if (!image) return;
      gsap.fromTo(
        image,
        {
          yPercent: -1.8,
          scale: 1.025,
        },
        {
          yPercent: 1.8,
          scale: 1.025,
          ease: "none",
          overwrite: "auto",
          scrollTrigger: {
            trigger: figure,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    });
  }, { scope: detailRef, dependencies: [project.id], revertOnUpdate: true });

  return (
    <main ref={detailRef} className="detail-page">
      <div className="detail-toolbar">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={18} />
          返回
        </Button>
      </div>

      <section className="detail-overview" aria-labelledby="detail-title">
        <SectionHeader title="项目概览" action={{ label: "查看下一个作品", onClick: onNext }} />
        <div className="overview-grid">
          <MediaFrame label={`${project.name} 图片区域`} src={project.images[0]} large />
          <div className="overview-copy">
            <h1 id="detail-title">{detailTitle}</h1>
            <div className="detail-facts">
              <DetailFact label="项目类型" value={detailType} />
              <DetailFact label="个人角色" value={profile.role} />
              <DetailFact label="项目周期" value={detailTime} />
              <DetailFact label="项目亮点" value={detailHighlight} />
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section-tight" aria-labelledby="project-chain">
        <SectionHeader title="项目详情展示" />
        {detailImages.length > 0 ? (
          <div className="detail-showcase-list" id="project-chain">
            {detailImages.map((src, index) => (
              <figure className="detail-showcase-image" key={src}>
                <img src={src} alt={`${detailTitle}项目详情展示 ${index + 1}`} loading="lazy" />
              </figure>
            ))}
          </div>
        ) : null}
      </section>

      <button
        ref={backToTopRef}
        type="button"
        className="back-to-top-button"
        aria-label="返回顶部"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        onClick={() => window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        })}
      >
        <ArrowUp aria-hidden="true" size={21} />
      </button>
    </main>
  );
}

export function App() {
  const [page, setPage] = useState<Page>("home");
  const [activeAnchor, setActiveAnchor] = useState<string>();
  const [activeProject, setActiveProject] = useState<ProjectSlot>(projects[0]);
  const [scrollRequest, setScrollRequest] = useState<{ anchor?: string; key: number }>({ key: 0 });
  const [coverEntered, setCoverEntered] = useState(false);
  const [coverIntroReady, setCoverIntroReady] = useState(false);
  const [transitionRequest, setTransitionRequest] = useState<TransitionRequest | null>(null);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const transitionLockedRef = useRef(false);
  const returnAttemptRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  const jumpToTop = () => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousBehavior;
    });
  };

  const jumpToElement = (element: HTMLElement) => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    element.scrollIntoView({ behavior: "auto", block: "start" });
    window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousBehavior;
    });
  };

  const applyNavigation = (nextPage: Page, anchor?: string) => {
    if (nextPage !== "home" || anchor) {
      setCoverEntered(true);
    }
    setActiveAnchor(nextPage === "home" ? anchor : undefined);
    setScrollRequest({ anchor, key: Date.now() });
    setPage(nextPage);
  };

  const startTransition = (action: () => void, sourceRect: RectLike | null = null) => {
    if (transitionLockedRef.current) return;
    if (prefersReducedMotion()) {
      action();
      return;
    }

    transitionLockedRef.current = true;
    pendingNavigationRef.current = action;
    setTransitionRequest({
      id: Date.now(),
      origin: getTransitionOrigin(sourceRect, { width: window.innerWidth, height: window.innerHeight }),
    });
  };

  const navigate = (nextPage: Page, anchor?: string) => {
    if (page === "detail") {
      startTransition(() => applyNavigation(nextPage, anchor));
      return;
    }
    applyNavigation(nextPage, anchor);
  };

  useEffect(() => {
    let settleFrame = 0;
    let settleTimer = 0;
    const frame = window.requestAnimationFrame(() => {
      if (scrollRequest.anchor) {
        const target = document.getElementById(scrollRequest.anchor);
        if (target) {
          if (transitionLockedRef.current) jumpToElement(target);
          else target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        jumpToTop();
        settleFrame = window.requestAnimationFrame(jumpToTop);
        settleTimer = window.setTimeout(jumpToTop, 120);
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (settleFrame) window.cancelAnimationFrame(settleFrame);
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, [page, scrollRequest]);

  useEffect(() => {
    if (page !== "home") return;

    if (!coverEntered) {
      setActiveAnchor(undefined);
      return;
    }

    let frameId = 0;

    const updateActiveAnchor = () => {
      frameId = 0;
      const aboutSection = document.getElementById("about");
      const projectsSection = document.getElementById("featured-projects");
      const contactSection = document.getElementById("contact");

      if (!aboutSection || !projectsSection || !contactSection) return;

      const probePosition = window.scrollY + Math.min(window.innerHeight * 0.32, 280);
      const getDocumentTop = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;
      const aboutTop = getDocumentTop(aboutSection);
      const projectsTop = getDocumentTop(projectsSection);
      const contactTop = getDocumentTop(contactSection);
      let nextAnchor: string | undefined;

      if (probePosition >= contactTop) {
        nextAnchor = "contact";
      } else if (probePosition >= projectsTop) {
        nextAnchor = "featured-projects";
      } else if (probePosition >= aboutTop) {
        nextAnchor = "about";
      }

      setActiveAnchor((currentAnchor) => currentAnchor === nextAnchor ? currentAnchor : nextAnchor);
    };

    const scheduleActiveAnchorUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateActiveAnchor);
    };

    window.addEventListener("scroll", scheduleActiveAnchorUpdate, { passive: true });
    window.addEventListener("resize", scheduleActiveAnchorUpdate);
    scheduleActiveAnchorUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleActiveAnchorUpdate);
      window.removeEventListener("resize", scheduleActiveAnchorUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [coverEntered, page]);

  useEffect(() => {
    const shouldLockScroll = page === "home" && !coverEntered;
    if (!shouldLockScroll) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "auto" });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [coverEntered, page]);

  useEffect(() => {
    if (page !== "home" || !coverEntered) return;

    const snapToContentStart = () => {
      document.querySelector(".home-content-frame")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const returnToCover = () => {
      returnAttemptRef.current = 0;
      setCoverIntroReady(false);
      setCoverEntered(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleReturnIntent = (event: WheelEvent | TouchEvent, deltaY: number) => {
      const contentFrame = document.querySelector<HTMLElement>(".home-content-frame");
      if (!contentFrame || deltaY >= 0) {
        if (deltaY > 0) returnAttemptRef.current = 0;
        return;
      }

      const contentTop = contentFrame.getBoundingClientRect().top + window.scrollY;
      const isAtContentStart = window.scrollY <= contentTop + 36;
      if (!isAtContentStart) {
        returnAttemptRef.current = 0;
        return;
      }

      event.preventDefault();
      returnAttemptRef.current += 1;

      if (returnAttemptRef.current >= 2) {
        returnToCover();
        return;
      }

      snapToContentStart();
    };

    const handleWheel = (event: WheelEvent) => {
      handleReturnIntent(event, event.deltaY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartYRef.current === null) return;
      const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
      handleReturnIntent(event, touchStartYRef.current - currentY);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [coverEntered, page]);

  const enterHomeContent = () => {
    returnAttemptRef.current = 0;
    setCoverEntered(true);
    window.requestAnimationFrame(() => {
      document.querySelector(".home-content-frame")?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const openProject = (project: ProjectSlot, sourceRect: RectLike) => {
    if (project.placeholder) return;
    startTransition(() => {
      setActiveProject(project);
      applyNavigation("detail");
    }, sourceRect);
  };

  const openNextProject = () => {
    const currentIndex = projects.findIndex((project) => project.id === activeProject.id);
    const nextProject = projects[(currentIndex + 1) % projects.length];
    startTransition(() => {
      setActiveProject(nextProject);
      applyNavigation("detail");
    });
  };

  return (
    <div className="app-shell">
      <CursorTrail />
      <PageTransitionLayer
        request={transitionRequest}
        onCovered={() => {
          const action = pendingNavigationRef.current;
          pendingNavigationRef.current = null;
          action?.();
        }}
        onComplete={() => {
          transitionLockedRef.current = false;
          setTransitionRequest(null);
        }}
      />
      <div className={`page-frame cover-nav-frame global-nav-frame ${page === "detail" || coverIntroReady ? "is-ready" : ""}`}>
        <SiteHeader activePage={page} activeAnchor={activeAnchor} onNavigate={navigate} />
      </div>
      {page === "home" ? (
        <>
          <CoverPage
            isEntered={coverEntered}
            onIntroReady={() => setCoverIntroReady(true)}
            onEnterContent={enterHomeContent}
          />
          <div className="page-frame home-content-frame">
            <HomePage onOpenProject={openProject} />
          </div>
        </>
      ) : null}
      {page === "detail" ? (
        <div className="page-frame">
          <DetailPage
            project={activeProject}
            onBack={() => navigate("home", "featured-projects")}
            onNext={openNextProject}
          />
        </div>
      ) : null}
    </div>
  );
}
