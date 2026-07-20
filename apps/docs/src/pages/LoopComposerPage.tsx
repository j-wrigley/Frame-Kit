import { useEffect, useState } from 'react';
import {
  Button,
  LoopComposer,
  ModulationStrip,
  ResetIcon,
  Tag,
  type LoopComposerValue,
  type ModulationStripValue,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const DEFAULT_LOOP: LoopComposerValue = {
  mode: 'repeat',
  repeats: 3,
  hold: 0.16,
  offset: 0.12,
  seamless: true,
};
const PREVIEW_DURATION = 2800;

function loopPosition(loop: LoopComposerValue, elapsed: number) {
  const progress = (((elapsed / PREVIEW_DURATION + loop.offset) % 1) + 1) % 1;
  const iteration = progress * loop.repeats;
  const iterationIndex = Math.min(loop.repeats - 1, Math.floor(iteration));
  const iterationProgress = iteration - Math.floor(iteration);
  const travel = loop.hold >= 0.99 ? 1 : Math.min(1, iterationProgress / (1 - loop.hold));
  const reverses = loop.mode === 'ping-pong' && iterationIndex % 2 === 1;
  return reverses ? 1 - travel : travel;
}

function modulationForLoop(loop: LoopComposerValue): ModulationStripValue {
  return {
    waveform: loop.mode === 'ping-pong' ? 'triangle' : 'saw',
    phase: loop.offset,
    rate: Math.min(4, Math.max(0.25, loop.repeats / 2)),
    intensity: Math.max(0.24, 1 - loop.hold * 0.7),
  };
}

export function LoopComposerPage() {
  const [loop, setLoop] = useState<LoopComposerValue>(DEFAULT_LOOP);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);
  const [previewElapsed, setPreviewElapsed] = useState(0);
  const modulation = modulationForLoop(loop);
  const previewPosition = loopPosition(loop, previewElapsed);

  useEffect(() => {
    if (!isPreviewPlaying) return;
    let frame = 0;
    let previous = performance.now();
    const advance = (now: number) => {
      setPreviewElapsed((elapsed) => (elapsed + now - previous) % PREVIEW_DURATION);
      previous = now;
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [isPreviewPlaying]);

  const resetLoop = () => {
    setLoop(DEFAULT_LOOP);
    setPreviewElapsed(0);
  };

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Loop composer"
        lede="A compact playback editor for building repeatable motion. Set the iteration behaviour, terminal hold, start offset, and seam together so a loop remains predictable wherever it is used."
      />

      <Section title="Playback loop">
        <p className="section-intro">
          The loop rail makes direction and timing legible at a glance. Choose repeat or ping-pong,
          set the cycle count and terminal hold, then drag the offset marker or use the compact
          controls for exact values.
        </p>
        <div className="demo">
          <div className="loop-composer-inspector" aria-label="Camera move loop inspector">
            <div className="loop-composer-inspector__heading">
              <div>
                <Tag>Playback</Tag>
                <strong>Camera drift</strong>
              </div>
              <Button
                size="sm"
                variant="ghost"
                iconStart={<ResetIcon />}
                aria-label="Reset camera drift loop"
                title="Reset camera drift loop"
                onClick={resetLoop}
              />
            </div>

            <div className="loop-composer-inspector__preview">
              <div
                className="loop-composer-inspector__motion-stage"
                role="img"
                aria-label={`Motion preview: ${loop.mode}, ${loop.repeats} cycles, ${Math.round(loop.hold * 100)} percent hold, ${Math.round(loop.offset * 100)} percent offset, ${loop.seamless ? 'seamless' : 'open'} loop`}
              >
                <span className="loop-composer-inspector__motion-rail" aria-hidden="true" />
                <span className="loop-composer-inspector__motion-start" aria-hidden="true" />
                <span className="loop-composer-inspector__motion-end" aria-hidden="true" />
                <span
                  className="loop-composer-inspector__motion-block"
                  aria-hidden="true"
                  style={{ left: `${5 + previewPosition * 90}%` }}
                />
              </div>
              <div className="loop-composer-inspector__preview-bar">
                <div>
                  <Tag>Preview</Tag>
                  <output>
                    {isPreviewPlaying ? 'Playing' : 'Paused'} · {loop.repeats} cycles / 2.8 s ·{' '}
                    {loop.seamless ? 'Seamless' : 'Open seam'}
                  </output>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPreviewPlaying((playing) => !playing)}
                >
                  {isPreviewPlaying ? 'Pause' : 'Play'}
                </Button>
              </div>
            </div>

            <LoopComposer value={loop} onValueChange={setLoop} label="Camera drift loop composer" />
          </div>
        </div>
        <p className="section-note">
          Focus the offset timeline and use <code>←</code>/<code>→</code> for fine timing; hold{' '}
          <code>Shift</code> for larger steps. Home and End jump to the first and final possible
          start positions.
        </p>
      </Section>

      <Section title="Pair with modulation">
        <p className="section-intro">
          Loop Composer owns playback structure; Modulation Strip can own the value moving through
          that structure. This read-only pairing maps repeat direction to wave shape and shares the
          loop offset, making the handoff visible without duplicating controls.
        </p>
        <div className="demo">
          <div className="loop-composer-pair" aria-label="Loop and modulation pairing">
            <div className="loop-composer-pair__heading">
              <div>
                <Tag>Signal</Tag>
                <strong>Derived modulation</strong>
              </div>
              <output>
                {modulation.waveform === 'triangle' ? 'Triangle' : 'Saw'} ·{' '}
                {modulation.rate.toFixed(2)} Hz
              </output>
            </div>
            <ModulationStrip
              value={modulation}
              editable={false}
              label="Derived loop modulation preview"
            />
          </div>
        </div>
      </Section>

      <Section title="Use the right loop contract">
        <div className="loop-composer-guidance">
          <div>
            <Tag>Repeat</Tag>
            <strong>Restart with intent</strong>
            <p>Use repeat when each cycle should return to the same starting direction and pose.</p>
          </div>
          <div>
            <Tag>Ping-pong</Tag>
            <strong>Reverse without a jump</strong>
            <p>
              Alternate direction when an object should travel out and back through the same path.
            </p>
          </div>
          <div>
            <Tag>Seam</Tag>
            <strong>Make closure explicit</strong>
            <p>
              Keep seamless enabled for a closed cycle; expose an open endpoint when a handoff is
              required.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { LoopComposer, type LoopComposerValue } from '@presentstandards/framekit-ui';

const [loop, setLoop] = useState<LoopComposerValue>({
  mode: 'repeat',
  repeats: 3,
  hold: 0.16,
  offset: 0.12,
  seamless: true,
});

<LoopComposer
  value={loop}
  onValueChange={setLoop}
  label="Camera drift loop composer"
/>;`}</code>
        </pre>
      </Section>
    </>
  );
}
