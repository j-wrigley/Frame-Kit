import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  AxisField,
  Button,
  ColorPicker,
  Frame,
  HistogramScope,
  Input,
  ResetIcon,
  SegmentedSwitch,
  Sidebar,
  SidebarSection,
  Slider,
  Stepper,
  Tag,
  VideoTimeline,
  type AxisFieldValue,
  type HistogramScopeAdjustments,
  type HistogramScopeMode,
  type VideoTimelineTrack,
} from '@presentstandards/framekit-ui';
import {
  CameraPathShowcase,
  NodeCanvasShowcase,
  ToneCurveShowcase,
} from './components/landing/CreativeShowcases';
import { FontPickerDemo } from './components/ready-made/FontPickerDemo';
import { MotionToolbarDemo } from './components/ready-made/MotionToolbarDemo';

type CardWidth = 'compact' | 'panel' | 'standard' | 'canvas' | 'wide' | 'timeline';

const COLOUR_PRESETS = [
  '#18181b',
  '#3f3f46',
  '#64748b',
  '#de3b3b',
  '#f97316',
  '#e29c35',
  '#eab308',
  '#84cc16',
  '#3f9c6a',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3478d4',
  '#5d5fef',
  '#8b5cf6',
  '#a655c2',
  '#d946ef',
  '#ec4899',
];

const HISTOGRAM_OPTIONS = [
  { value: 'luminance', label: 'Luma' },
  { value: 'rgb', label: 'RGB' },
];

const VIDEO_TRACKS: readonly VideoTimelineTrack[] = [
  {
    id: 'picture',
    label: 'Picture',
    clips: [
      { id: 'opening', start: 0, duration: 3200, label: 'Opening', meta: 'A001' },
      { id: 'detail', start: 3600, duration: 2800, label: 'Detail', meta: 'A004' },
      { id: 'closing', start: 6900, duration: 3100, label: 'Closing', meta: 'A007' },
    ],
  },
  {
    id: 'overlay',
    label: 'Overlay',
    clips: [
      {
        id: 'title',
        start: 900,
        duration: 2600,
        label: 'Title card',
        meta: 'TEXT',
        mediaType: 'title',
      },
      {
        id: 'grade',
        start: 4100,
        duration: 3900,
        label: 'Colour grade',
        meta: 'FX',
        mediaType: 'adjustment',
      },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    clips: [
      {
        id: 'dialogue',
        start: 0,
        duration: 6200,
        label: 'Dialogue',
        meta: 'WAV',
        mediaType: 'audio',
      },
      {
        id: 'music',
        start: 6500,
        duration: 3500,
        label: 'Music',
        meta: 'WAV',
        mediaType: 'audio',
      },
    ],
  },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

type TitleParticle = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  velocityX: number;
  velocityY: number;
  letterIndex: number;
  phase: number;
  size: number;
};

type TitleLetter = {
  index: number;
  left: number;
  right: number;
  target: number;
  activation: number;
  element: HTMLSpanElement;
};

const TITLE_TEXT = 'Frame Kit';
const TITLE_OVERSCAN_X = 72;
const TITLE_OVERSCAN_Y = 52;
const TITLE_INFLUENCE_RADIUS = 105;
const TITLE_PARTICLE_FORCE_RADIUS = 112;
const TITLE_PARTICLE_REVEAL_DISTANCE = 3.2;

function smoothstep(value: number) {
  const progress = clamp(value, 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function particleNoise(x: number, y: number, offset: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + offset * 37.719) * 43758.5453;
  return value - Math.floor(value);
}

function getParticleVisibility(activation: number, displacement: number) {
  const activationProgress = smoothstep(activation / 0.68);
  const movementProgress = smoothstep(displacement / TITLE_PARTICLE_REVEAL_DISTANCE);
  return activationProgress * movementProgress;
}

function ParticleTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TitleParticle[]>([]);
  const lettersRef = useRef<TitleLetter[]>([]);
  const cursorRef = useRef({ x: 0, y: 0 });
  const activeLetterRef = useRef<number | null>(null);
  const previousFrameRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const prepareRef = useRef<() => void>(() => undefined);
  const mountedRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const engagedRef = useRef(false);
  const [isEngaged, setIsEngaged] = useState(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const restoreLetters = () => {
    lettersRef.current.forEach((letter) => {
      letter.target = 0;
      letter.activation = 0;
      letter.element.style.opacity = '';
    });
  };

  const drawParticles = () => {
    const canvas = canvasRef.current;
    const title = titleRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !title || !context) return;

    const ratio = window.devicePixelRatio || 1;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    context.fillStyle = window.getComputedStyle(title).color;

    particlesRef.current.forEach((particle) => {
      const letter = lettersRef.current.find(({ index }) => index === particle.letterIndex);
      if (!letter || letter.activation <= 0.002) return;

      const displacement = Math.hypot(particle.originX - particle.x, particle.originY - particle.y);
      const visibility = getParticleVisibility(letter.activation, displacement);
      if (visibility <= 0.002) return;
      const particleSize = particle.size * (0.9 + visibility * 0.1);
      context.globalAlpha = visibility * (0.88 + particle.phase * 0.12);
      context.fillRect(
        particle.x - particleSize / 2,
        particle.y - particleSize / 2,
        particleSize,
        particleSize
      );
    });

    context.globalAlpha = 1;
  };

  const animateTitle = () => {
    if (animationFrameRef.current !== null) return;

    const animate = (timestamp: number) => {
      const previousTimestamp = previousFrameRef.current ?? timestamp;
      const frameScale = Math.min(2, Math.max(0.2, (timestamp - previousTimestamp) / 16.667));
      previousFrameRef.current = timestamp;
      let hasMotion = lettersRef.current.some((letter) => letter.target > 0.002);

      lettersRef.current.forEach((letter) => {
        const target = letter.target;
        const response =
          target > letter.activation
            ? 1 - Math.pow(0.66, frameScale)
            : 1 - Math.pow(0.82, frameScale);
        letter.activation += (target - letter.activation) * response;

        if (Math.abs(target - letter.activation) < 0.001) letter.activation = target;
        if (letter.activation > 0.002) hasMotion = true;
      });

      const particleMotion = new Map<number, { distance: number; count: number }>();
      particlesRef.current.forEach((particle) => {
        const letter = lettersRef.current.find(({ index }) => index === particle.letterIndex);
        const influenceStrength = letter?.target ?? 0;
        const isActive = influenceStrength > 0.002;

        if (isActive) {
          const deltaX = particle.x - cursorRef.current.x;
          const deltaY = particle.y - cursorRef.current.y;
          const distance = Math.max(0.75, Math.hypot(deltaX, deltaY));
          const influence = Math.max(0, 1 - distance / TITLE_PARTICLE_FORCE_RADIUS);
          const force = influence * influence * 0.24 * influenceStrength * frameScale;

          particle.velocityX += (deltaX / distance) * force;
          particle.velocityY += (deltaY / distance) * force;
          particle.velocityX += (particle.originX - particle.x) * 0.026 * frameScale;
          particle.velocityY += (particle.originY - particle.y) * 0.026 * frameScale;
          const damping = Math.pow(0.82, frameScale);
          particle.velocityX *= damping;
          particle.velocityY *= damping;
        } else {
          particle.velocityX += (particle.originX - particle.x) * 0.12 * frameScale;
          particle.velocityY += (particle.originY - particle.y) * 0.12 * frameScale;
          const damping = Math.pow(0.68, frameScale);
          particle.velocityX *= damping;
          particle.velocityY *= damping;
        }

        particle.x += particle.velocityX * frameScale;
        particle.y += particle.velocityY * frameScale;

        const displacement = Math.hypot(
          particle.originX - particle.x,
          particle.originY - particle.y
        );
        const speed = Math.hypot(particle.velocityX, particle.velocityY);
        const motion = particleMotion.get(particle.letterIndex) ?? { distance: 0, count: 0 };
        motion.distance += displacement;
        motion.count += 1;
        particleMotion.set(particle.letterIndex, motion);

        if (!isActive && displacement < 0.04 && speed < 0.04) {
          particle.x = particle.originX;
          particle.y = particle.originY;
          particle.velocityX = 0;
          particle.velocityY = 0;
        } else if (!isActive && (displacement >= 0.04 || speed >= 0.04)) {
          hasMotion = true;
        }
      });

      lettersRef.current.forEach((letter) => {
        const motion = particleMotion.get(letter.index);
        const averageDisplacement = motion ? motion.distance / motion.count : 0;
        const particleVisibility = getParticleVisibility(letter.activation, averageDisplacement);
        letter.element.style.opacity = String(1 - particleVisibility);
      });

      drawParticles();

      if (!hasMotion) {
        previousFrameRef.current = null;
        animationFrameRef.current = null;
        restoreLetters();
        clearCanvas();
        engagedRef.current = false;
        if (mountedRef.current) {
          setIsEngaged(false);
        }
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
  };

  useLayoutEffect(() => {
    mountedRef.current = true;
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const prepareParticles = () => {
      const canvas = canvasRef.current;
      const title = titleRef.current;
      if (!canvas || !title || reducedMotionRef.current) return;

      const titleBounds = title.getBoundingClientRect();
      const titleWidth = titleBounds.width;
      const titleHeight = titleBounds.height;
      if (titleWidth <= 0 || titleHeight <= 0) return;

      const width = Math.ceil(titleWidth + TITLE_OVERSCAN_X * 2);
      const height = Math.ceil(titleHeight + TITLE_OVERSCAN_Y * 2);
      const ratio = window.devicePixelRatio || 1;

      canvas.style.left = `${-TITLE_OVERSCAN_X}px`;
      canvas.style.top = `${-TITLE_OVERSCAN_Y}px`;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);

      const titleStyle = window.getComputedStyle(title);
      const source = document.createElement('canvas');
      source.width = width;
      source.height = height;
      const sourceContext = source.getContext('2d', { willReadFrequently: true });
      if (!sourceContext) return;

      sourceContext.font = `${titleStyle.fontWeight} ${titleStyle.fontSize} ${titleStyle.fontFamily}`;
      sourceContext.fillStyle = '#000';
      sourceContext.textAlign = 'center';
      sourceContext.textBaseline = 'alphabetic';
      sourceContext.fontKerning = 'normal';

      const fontMetrics = sourceContext.measureText('Mg');
      const fontBoxAscent =
        fontMetrics.fontBoundingBoxAscent || fontMetrics.actualBoundingBoxAscent;
      const letters: TitleLetter[] = [];
      const particles: TitleParticle[] = [];
      const sampleStep = 2;

      title.querySelectorAll<HTMLSpanElement>('[data-title-letter]').forEach((element) => {
        const index = Number(element.dataset.titleLetter);
        const character = TITLE_TEXT[index];
        if (!character || character === ' ') return;

        const bounds = element.getBoundingClientRect();
        const left = TITLE_OVERSCAN_X + bounds.left - titleBounds.left;
        const right = left + bounds.width;
        const glyphWidth = sourceContext.measureText(character).width;
        const centreX = left + glyphWidth / 2;
        const baseline = TITLE_OVERSCAN_Y + bounds.top - titleBounds.top + fontBoxAscent;
        const letter = { index, left, right, target: 0, activation: 0, element };
        letters.push(letter);

        sourceContext.clearRect(0, 0, source.width, source.height);
        sourceContext.fillText(character, centreX, baseline);
        const pixels = sourceContext.getImageData(0, 0, source.width, source.height).data;
        const sampleLeft = Math.max(0, Math.floor(left - 3));
        const sampleRight = Math.min(source.width, Math.ceil(right + 3));

        for (let y = 0; y < source.height; y += sampleStep) {
          for (let x = sampleLeft; x < sampleRight; x += sampleStep) {
            if (pixels[(y * source.width + x) * 4 + 3] <= 72) continue;
            particles.push({
              x: x + 0.5,
              y: y + 0.5,
              originX: x + 0.5,
              originY: y + 0.5,
              velocityX: 0,
              velocityY: 0,
              letterIndex: index,
              phase: particleNoise(x, y, 3),
              size: 1.35 + particleNoise(x, y, 4) * 0.45,
            });
          }
        }
      });

      lettersRef.current = letters;
      particlesRef.current = particles;
      if (engagedRef.current) drawParticles();
    };

    prepareRef.current = prepareParticles;
    prepareParticles();

    const resizeObserver = new ResizeObserver(prepareParticles);
    if (titleRef.current) resizeObserver.observe(titleRef.current);
    void document.fonts?.ready.then(prepareParticles);

    return () => {
      mountedRef.current = false;
      resizeObserver.disconnect();
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => {
      reducedMotionRef.current = motionPreference.matches;
      if (motionPreference.matches) {
        activeLetterRef.current = null;
        previousFrameRef.current = null;
        engagedRef.current = false;
        setIsEngaged(false);
        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        restoreLetters();
        clearCanvas();
      } else {
        prepareRef.current();
      }
    };

    motionPreference.addEventListener('change', updateMotionPreference);
    return () => motionPreference.removeEventListener('change', updateMotionPreference);
  }, []);

  const updateCursorPosition = (clientX: number, clientY: number, pointerType: string) => {
    if (reducedMotionRef.current || pointerType === 'touch') return;
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    cursorRef.current = {
      x: clientX - canvasBounds.left,
      y: clientY - canvasBounds.top,
    };

    const nearestLetter = lettersRef.current.reduce<TitleLetter | null>((nearest, letter) => {
      const distance =
        cursorRef.current.x < letter.left
          ? letter.left - cursorRef.current.x
          : cursorRef.current.x > letter.right
            ? cursorRef.current.x - letter.right
            : 0;
      if (distance > 7) return nearest;
      if (!nearest) return letter;
      const nearestCentre = (nearest.left + nearest.right) / 2;
      const letterCentre = (letter.left + letter.right) / 2;
      return Math.abs(cursorRef.current.x - letterCentre) <
        Math.abs(cursorRef.current.x - nearestCentre)
        ? letter
        : nearest;
    }, null);
    const nextIndex = nearestLetter?.index ?? null;
    const previousIndex = activeLetterRef.current;

    lettersRef.current.forEach((letter) => {
      if (letter.index === nextIndex) {
        letter.target = 1;
        return;
      }

      const letterCentre = (letter.left + letter.right) / 2;
      const distance = Math.abs(cursorRef.current.x - letterCentre);
      const falloff = smoothstep(1 - distance / TITLE_INFLUENCE_RADIUS);
      letter.target = nextIndex === null ? 0 : falloff * 0.82;
    });

    if (nextIndex !== previousIndex) {
      activeLetterRef.current = nextIndex;

      if (nextIndex !== null) {
        particlesRef.current.forEach((particle) => {
          const letter = lettersRef.current.find(({ index }) => index === particle.letterIndex);
          const influenceStrength = letter?.target ?? 0;
          if (influenceStrength <= 0.02) return;

          let deltaX = particle.x - cursorRef.current.x;
          let deltaY = particle.y - cursorRef.current.y;
          let distance = Math.hypot(deltaX, deltaY);

          if (distance < 0.75) {
            const angle = particle.phase * Math.PI * 2;
            deltaX = Math.cos(angle);
            deltaY = Math.sin(angle);
            distance = 1;
          }

          const falloff = Math.max(0, 1 - distance / TITLE_PARTICLE_FORCE_RADIUS);
          const impulse = (0.28 + falloff * falloff * 2.45) * influenceStrength;
          const jitter = (particle.phase - 0.5) * 0.38;
          particle.velocityX += (deltaX / distance) * impulse + jitter * influenceStrength;
          particle.velocityY += (deltaY / distance) * impulse + jitter * 0.65 * influenceStrength;
        });
      }
    }

    if (!engagedRef.current) {
      engagedRef.current = true;
      setIsEngaged(true);
    }
    animateTitle();
  };

  const clearActiveLetter = () => {
    activeLetterRef.current = null;
    lettersRef.current.forEach((letter) => {
      letter.target = 0;
    });
    animateTitle();
  };

  useEffect(() => {
    const handleWindowPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const titleBounds = titleRef.current?.getBoundingClientRect();
      if (!titleBounds) return;

      const isInside =
        event.clientX >= titleBounds.left &&
        event.clientX <= titleBounds.right &&
        event.clientY >= titleBounds.top &&
        event.clientY <= titleBounds.bottom;

      if (!isInside) {
        if (activeLetterRef.current !== null) clearActiveLetter();
        return;
      }

      updateCursorPosition(event.clientX, event.clientY, event.pointerType);
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('blur', clearActiveLetter);
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('blur', clearActiveLetter);
    };
  }, []);

  return (
    <h1
      ref={titleRef}
      id="landing-title"
      className="landing-particle-title"
      aria-label={TITLE_TEXT}
      data-engaged={isEngaged || undefined}
      onPointerLeave={clearActiveLetter}
    >
      <span className="landing-particle-title__text" aria-hidden="true">
        {Array.from(TITLE_TEXT).map((character, index) => (
          <span
            className="landing-particle-title__letter"
            data-title-letter={index}
            key={`${character}-${index}`}
          >
            {character}
          </span>
        ))}
      </span>
      <canvas className="landing-particle-title__canvas" ref={canvasRef} aria-hidden="true" />
      <span className="landing-particle-title__version" aria-hidden="true">
        v0.1
      </span>
    </h1>
  );
}

function ComponentCard({
  label,
  width = 'panel',
  className,
  children,
}: {
  label: string;
  width?: CardWidth;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={['landing-component-card', `landing-component-card--${width}`, className]
        .filter(Boolean)
        .join(' ')}
      aria-label={`${label} component preview`}
    >
      <Tag className="landing-component-card__label">{label}</Tag>
      <div className="landing-component-card__preview">{children}</div>
    </article>
  );
}

function InspectorRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="landing-inspector-row">
      <Tag as="span">{label}</Tag>
      {children}
    </div>
  );
}

function SliderInspectorShowcase() {
  const defaults = { opacity: 84, threshold: 46, softness: 22, grain: 12 };
  const [values, setValues] = useState(defaults);
  const setValue = (key: keyof typeof values) => (value: number) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <Sidebar
      title="Adjustments"
      description="Mask refinement"
      density="compact"
      width="100%"
      footer={
        <Button variant="ghost" size="sm" fullWidth onClick={() => setValues(defaults)}>
          Reset adjustments
        </Button>
      }
    >
      <SidebarSection label="Surface">
        <Slider
          size="sm"
          label="Opacity"
          value={values.opacity}
          onValueChange={setValue('opacity')}
          formatValue={(value) => `${value}%`}
        />
        <Slider
          size="sm"
          label="Threshold"
          value={values.threshold}
          onValueChange={setValue('threshold')}
        />
        <Slider
          size="sm"
          label="Softness"
          value={values.softness}
          onValueChange={setValue('softness')}
          formatValue={(value) => `${value} px`}
        />
        <Slider
          size="sm"
          label="Grain"
          value={values.grain}
          onValueChange={setValue('grain')}
          formatValue={(value) => `${value}%`}
        />
      </SidebarSection>
    </Sidebar>
  );
}

function ColourPickerShowcase() {
  const [colour, setColour] = useState('#5d5fef');

  return (
    <div
      className="fk-popover__surface fk-popover__surface--auto fk-color-popover landing-colour-popup"
      role="dialog"
      aria-label="Open accent colour picker"
    >
      <Tag>Accent colour</Tag>
      <ColorPicker value={colour} onChange={setColour} presets={COLOUR_PRESETS} />
    </div>
  );
}

function AxisShowcase() {
  const defaultAxis: AxisFieldValue = { x: 0.62, y: 0.44 };
  const [axis, setAxis] = useState<AxisFieldValue>(defaultAxis);
  const [influence, setInfluence] = useState(68);
  const [scale, setScale] = useState(100);

  const reset = () => {
    setAxis(defaultAxis);
    setInfluence(68);
    setScale(100);
  };

  return (
    <Sidebar
      title="Spatial response"
      description="Pan + tilt field"
      density="compact"
      width="100%"
      actions={
        <Button
          variant="ghost"
          size="sm"
          iconStart={<ResetIcon />}
          aria-label="Reset spatial values"
          title="Reset spatial values"
          onClick={reset}
        />
      }
    >
      <SidebarSection label="Field">
        <AxisField
          value={axis}
          onValueChange={setAxis}
          xLabel="Pan"
          yLabel="Tilt"
          label="Spatial pan and tilt"
        />
        <Slider
          size="sm"
          label="Influence"
          value={influence}
          onValueChange={setInfluence}
          formatValue={(value) => `${value}%`}
        />
        <InspectorRow label="Scale">
          <Stepper
            editable={false}
            size="sm"
            label="Spatial scale"
            value={scale}
            suffix="%"
            decrementDisabled={scale <= 25}
            incrementDisabled={scale >= 200}
            onDecrement={() => setScale((value) => Math.max(25, value - 5))}
            onIncrement={() => setScale((value) => Math.min(200, value + 5))}
          />
        </InspectorRow>
      </SidebarSection>
    </Sidebar>
  );
}

function HistogramShowcase() {
  const defaults: HistogramScopeAdjustments = {
    blacks: 0,
    shadows: -8,
    exposure: 0.35,
    highlights: 12,
    whites: 0,
  };
  const [mode, setMode] = useState<HistogramScopeMode>('rgb');
  const [adjustments, setAdjustments] = useState(defaults);

  return (
    <Sidebar
      title="Exposure"
      description="Tonal distribution"
      density="compact"
      width="100%"
      actions={
        <Button
          variant="ghost"
          size="sm"
          iconStart={<ResetIcon />}
          aria-label="Reset exposure"
          title="Reset exposure"
          onClick={() => {
            setMode('rgb');
            setAdjustments(defaults);
          }}
        />
      }
    >
      <SidebarSection label="Distribution">
        <SegmentedSwitch
          size="sm"
          fullWidth
          aria-label="Histogram channel mode"
          options={HISTOGRAM_OPTIONS}
          value={mode}
          onValueChange={(value) => setMode(value as HistogramScopeMode)}
        />
        <HistogramScope
          mode={mode}
          value={adjustments}
          onValueChange={setAdjustments}
          interactive
          shadowClipped
          highlightClipped
          showExposureRange={false}
          label="Interactive exposure histogram"
        />
        <Slider
          size="sm"
          label="Exposure"
          min={-5}
          max={5}
          step={0.05}
          value={adjustments.exposure}
          onValueChange={(exposure) => setAdjustments((value) => ({ ...value, exposure }))}
          formatValue={(value) => `${value > 0 ? '+' : ''}${value.toFixed(2)} EV`}
        />
      </SidebarSection>
    </Sidebar>
  );
}

function VideoTimelineShowcase() {
  const [playhead, setPlayhead] = useState(4200);

  return (
    <div className="landing-timeline-shell">
      <header className="landing-timeline-shell__header">
        <div>
          <Tag>Sequence 01</Tag>
          <strong>Opening cut</strong>
        </div>
        <output>{(playhead / 1000).toFixed(1)} S</output>
      </header>
      <VideoTimeline
        density="compact"
        defaultValue={VIDEO_TRACKS}
        defaultActiveClipId="detail"
        playhead={playhead}
        onPlayheadChange={setPlayhead}
        duration={10000}
        snap={250}
        label="Opening cut video timeline"
      />
    </div>
  );
}

function SimpleSidebarShowcase() {
  const defaults = { x: '128', y: '96', width: '640', opacity: 84, radius: 24 };
  const [values, setValues] = useState(defaults);

  return (
    <Sidebar
      title="Hero card"
      description="Shape · Main composition"
      density="compact"
      width="100%"
      footer={
        <Button variant="ghost" size="sm" fullWidth onClick={() => setValues(defaults)}>
          Reset properties
        </Button>
      }
    >
      <SidebarSection label="Layout">
        <div className="landing-input-grid">
          <Input
            size="sm"
            label="X"
            suffix="PX"
            font="mono"
            align="end"
            value={values.x}
            onChange={(event) => setValues((value) => ({ ...value, x: event.target.value }))}
          />
          <Input
            size="sm"
            label="Y"
            suffix="PX"
            font="mono"
            align="end"
            value={values.y}
            onChange={(event) => setValues((value) => ({ ...value, y: event.target.value }))}
          />
          <Input
            className="landing-input-grid__wide"
            size="sm"
            label="Width"
            suffix="PX"
            font="mono"
            align="end"
            value={values.width}
            onChange={(event) => setValues((value) => ({ ...value, width: event.target.value }))}
          />
        </div>
      </SidebarSection>
      <SidebarSection label="Appearance">
        <Slider
          size="sm"
          label="Opacity"
          value={values.opacity}
          onValueChange={(opacity) => setValues((value) => ({ ...value, opacity }))}
          formatValue={(value) => `${value}%`}
        />
        <Slider
          size="sm"
          label="Corner radius"
          max={64}
          value={values.radius}
          onValueChange={(radius) => setValues((value) => ({ ...value, radius }))}
          formatValue={(value) => `${value} px`}
        />
      </SidebarSection>
    </Sidebar>
  );
}

type FrameResizeCorner = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';
type FrameOperation =
  | { kind: 'move'; offsetX: number; offsetY: number }
  | {
      kind: 'resize';
      corner: FrameResizeCorner;
      startX: number;
      startY: number;
      position: { x: number; y: number };
      size: { width: number; height: number };
    };

function resizeCornerAt(event: ReactPointerEvent<HTMLDivElement>): FrameResizeCorner | null {
  const bounds = event.currentTarget.getBoundingClientRect();
  const hitArea = 18;
  const fromLeft = event.clientX - bounds.left <= hitArea;
  const fromRight = bounds.right - event.clientX <= hitArea;
  const fromTop = event.clientY - bounds.top <= hitArea;
  const fromBottom = bounds.bottom - event.clientY <= hitArea;

  if (fromTop && fromLeft) return 'top-left';
  if (fromTop && fromRight) return 'top-right';
  if (fromBottom && fromRight) return 'bottom-right';
  if (fromBottom && fromLeft) return 'bottom-left';
  return null;
}

function DraggableFrameShowcase() {
  const initialPosition = { x: 124, y: 96 };
  const initialSize = { width: 220, height: 136 };
  const stageRef = useRef<HTMLDivElement>(null);
  const operationRef = useRef<FrameOperation | null>(null);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);

  const moveFrame = (x: number, y: number) => {
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setPosition({
      x: clamp(x, 12, bounds.width - size.width - 12),
      y: clamp(y, 30, bounds.height - size.height - 12),
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const corner = resizeCornerAt(event);
    operationRef.current = corner
      ? {
          kind: 'resize',
          corner,
          startX: event.clientX,
          startY: event.clientY,
          position: { ...position },
          size: { ...size },
        }
      : {
          kind: 'move',
          offsetX: event.clientX - bounds.left,
          offsetY: event.clientY - bounds.top,
        };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const operation = operationRef.current;
    const stage = stageRef.current?.getBoundingClientRect();
    if (!operation || !stage) return;

    if (operation.kind === 'move') {
      moveFrame(
        event.clientX - stage.left - operation.offsetX,
        event.clientY - stage.top - operation.offsetY
      );
      return;
    }

    const minimumWidth = 120;
    const minimumHeight = 80;
    const deltaX = event.clientX - operation.startX;
    const deltaY = event.clientY - operation.startY;
    let left = operation.position.x;
    let top = operation.position.y;
    let right = operation.position.x + operation.size.width;
    let bottom = operation.position.y + operation.size.height;

    if (operation.corner.includes('left')) {
      left = clamp(operation.position.x + deltaX, 12, right - minimumWidth);
    } else {
      right = clamp(
        operation.position.x + operation.size.width + deltaX,
        left + minimumWidth,
        stage.width - 12
      );
    }

    if (operation.corner.includes('top')) {
      top = clamp(operation.position.y + deltaY, 30, bottom - minimumHeight);
    } else {
      bottom = clamp(
        operation.position.y + operation.size.height + deltaY,
        top + minimumHeight,
        stage.height - 12
      );
    }

    setPosition({ x: left, y: top });
    setSize({ width: right - left, height: bottom - top });
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    operationRef.current = null;
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const distance = event.shiftKey ? 10 : 1;

    if (event.altKey) {
      const bounds = stageRef.current?.getBoundingClientRect();
      if (!bounds) return;
      let width = size.width;
      let height = size.height;
      if (event.key === 'ArrowLeft') width -= distance;
      else if (event.key === 'ArrowRight') width += distance;
      else if (event.key === 'ArrowUp') height -= distance;
      else if (event.key === 'ArrowDown') height += distance;
      else return;
      event.preventDefault();
      setSize({
        width: clamp(width, 120, bounds.width - position.x - 12),
        height: clamp(height, 80, bounds.height - position.y - 12),
      });
      return;
    }

    let x = position.x;
    let y = position.y;
    if (event.key === 'ArrowLeft') x -= distance;
    else if (event.key === 'ArrowRight') x += distance;
    else if (event.key === 'ArrowUp') y -= distance;
    else if (event.key === 'ArrowDown') y += distance;
    else return;
    event.preventDefault();
    moveFrame(x, y);
  };

  return (
    <div className="landing-frame-stage" ref={stageRef}>
      <div className="landing-frame-stage__meta">
        <Tag>Empty canvas</Tag>
        <output>
          {Math.round(position.x)}, {Math.round(position.y)} · {Math.round(size.width)} ×{' '}
          {Math.round(size.height)}
        </output>
      </div>
      <Frame
        className="landing-draggable-frame"
        name="Untitled frame"
        selected
        width={size.width}
        height={size.height}
        tabIndex={0}
        aria-label="Move or resize untitled frame"
        style={{ left: position.x, top: position.y }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onKeyDown={handleKeyDown}
      />
      <Button
        className="landing-frame-stage__reset"
        variant="ghost"
        size="sm"
        onClick={() => {
          setPosition(initialPosition);
          setSize(initialSize);
        }}
      >
        Reset frame
      </Button>
    </div>
  );
}

export function Landing() {
  return (
    <main className="landing" aria-labelledby="landing-title">
      <section className="landing-hero">
        <ParticleTitle />
      </section>

      <section className="landing-showcase" aria-label="Frame Kit component previews">
        <div className="landing-component-rail">
          <ComponentCard label="Sliders" width="panel">
            <SliderInspectorShowcase />
          </ComponentCard>

          <ComponentCard label="Colour picker" width="compact">
            <ColourPickerShowcase />
          </ComponentCard>

          <ComponentCard label="Tone curve" width="panel">
            <ToneCurveShowcase />
          </ComponentCard>

          <ComponentCard label="Font picker" width="panel">
            <FontPickerDemo className="landing-font-picker" />
          </ComponentCard>

          <ComponentCard label="Axis field" width="panel">
            <AxisShowcase />
          </ComponentCard>

          <ComponentCard label="Histogram" width="standard">
            <HistogramShowcase />
          </ComponentCard>

          <ComponentCard label="Node canvas" width="wide">
            <NodeCanvasShowcase />
          </ComponentCard>

          <ComponentCard label="Camera path" width="panel">
            <CameraPathShowcase />
          </ComponentCard>

          <ComponentCard label="Video timeline" width="timeline">
            <VideoTimelineShowcase />
          </ComponentCard>

          <ComponentCard label="Simple sidebar" width="panel">
            <SimpleSidebarShowcase />
          </ComponentCard>

          <ComponentCard label="Draggable frames" width="canvas">
            <DraggableFrameShowcase />
          </ComponentCard>

          <ComponentCard label="Motion toolbar" width="timeline">
            <MotionToolbarDemo className="landing-motion-toolbar" />
          </ComponentCard>

          <a className="landing-docs-card" href="#/introduction">
            <span className="landing-docs-card__eyebrow">Documentation</span>
            <span className="landing-docs-card__title">View the docs</span>
            <span className="landing-docs-card__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}
