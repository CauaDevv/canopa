import { motion, useReducedMotion } from "motion/react";

/*
  TextoRevelado: revela um texto animando seus pedaços em sequência (efeito de
  entrada dos títulos do site). Adaptado de TSX para JSX (projeto sem TypeScript).

  - children: o texto (precisa ser uma string)
  - as:       tag renderizada — ex.: "h1", "h2" (padrão <p>)
  - per:      o que é animado por vez: "word" | "char" | "line"
  - preset:   "fade-in-blur" | "blur" | "fade" | "scale" | "slide"
  - inView:   anima quando a seção entra na tela (use nos títulos abaixo da dobra)
  - delay / speedReveal / speedSegment: ritmo da animação

  Acessibilidade: os pedaços são aria-hidden e o texto completo vai num
  <span class="sr-only"> para o leitor de tela. Quem usa "reduzir movimento"
  no sistema recebe o texto direto, sem animação.
*/

const staggerPerUnit = { char: 0.03, line: 0.1, word: 0.05 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const presets = {
  blur: {
    hidden: { filter: "blur(12px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "fade-in-blur": {
    hidden: { filter: "blur(12px)", opacity: 0, y: 20 },
    visible: { filter: "blur(0px)", opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1 },
  },
  slide: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
};

// "line" quebra por quebra de linha; o resto separa palavras mantendo os espaços.
const splitText = (text, per) =>
  per === "line" ? text.split("\n") : text.split(/(\s+)/);

function Segment({ segment, variants, per }) {
  if (per === "line") {
    return (
      <motion.span className="block" variants={variants}>
        {segment}
      </motion.span>
    );
  }
  if (per === "word") {
    return (
      <motion.span
        aria-hidden="true"
        className="inline-block whitespace-pre"
        variants={variants}
      >
        {segment}
      </motion.span>
    );
  }
  return (
    <motion.span className="inline-block whitespace-pre">
      {segment.split("").map((char, i) => (
        <motion.span
          aria-hidden="true"
          className="inline-block whitespace-pre"
          key={i}
          variants={variants}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function TextoRevelado({
  children,
  per = "word",
  as = "p",
  className,
  preset = "fade",
  delay = 0,
  speedReveal = 1,
  speedSegment = 1,
  trigger = true,
  inView = false,
  style,
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as];
  const Tag = as;

  // Quem pediu menos movimento no sistema recebe o texto pronto, sem animação.
  if (reduceMotion) {
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  const container = {
    ...containerVariants,
    visible: {
      ...containerVariants.visible,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerPerUnit[per] / speedReveal,
      },
    },
  };

  const item = {
    ...presets[preset],
    visible: {
      ...presets[preset].visible,
      transition: { duration: 0.3 / speedSegment },
    },
  };

  if (!trigger) return null;

  return (
    <MotionTag
      animate={inView ? undefined : "visible"}
      whileInView={inView ? "visible" : undefined}
      viewport={inView ? { once: true, amount: 0.3 } : undefined}
      className={className}
      initial="hidden"
      style={style}
      variants={container}
    >
      {per !== "line" && <span className="sr-only">{children}</span>}
      {splitText(children, per).map((segment, index) => (
        <Segment
          key={`${per}-${index}-${segment}`}
          per={per}
          segment={segment}
          variants={item}
        />
      ))}
    </MotionTag>
  );
}
