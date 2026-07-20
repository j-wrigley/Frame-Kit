import { useState } from 'react';
import {
  Button,
  EnvelopeEditor,
  ResetIcon,
  Tag,
  type EnvelopeValue,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const AMP_ENVELOPE: EnvelopeValue = {
  attack: 0.1,
  hold: 0.12,
  decay: 0.18,
  sustain: 0.62,
  release: 0.2,
};

const MOTION_ENVELOPE: EnvelopeValue = {
  attack: 0.05,
  hold: 0.08,
  decay: 0.24,
  sustain: 0.34,
  release: 0.16,
};

const EFFECT_ENVELOPE: EnvelopeValue = {
  attack: 0.18,
  hold: 0.06,
  decay: 0.14,
  sustain: 0.78,
  release: 0.1,
};

function formatDuration(value: number) {
  return `${Math.round(value * 1200)} ms`;
}

export function EnvelopeEditorPage() {
  const [amplitude, setAmplitude] = useState<EnvelopeValue>(AMP_ENVELOPE);

  const resetAmplitude = () => setAmplitude(AMP_ENVELOPE);

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Envelope editor"
        lede="A direct ADSR-style editor for shaping how sound, effects, and generative motion begin, settle, sustain, and release. The entire temporal curve stays visible while each stage remains precisely adjustable."
      />

      <Section title="Amplitude envelope">
        <p className="section-intro">
          This audio example keeps the complete response in one compact view. Attack, hold, decay,
          and release move as timeline boundaries, while the decay handle also sets the sustained
          level.
        </p>
        <div className="demo">
          <div className="envelope-inspector" aria-label="Amplitude envelope inspector">
            <div className="envelope-inspector__heading">
              <div>
                <Tag>Audio</Tag>
                <strong>Amplitude</strong>
              </div>
              <span>Synth voice</span>
            </div>

            <EnvelopeEditor
              value={amplitude}
              onValueChange={setAmplitude}
              variant="audio"
              label="Synth amplitude envelope"
            />

            <div className="envelope-inspector__readouts">
              <div>
                <Tag>Attack</Tag>
                <output>{formatDuration(amplitude.attack)}</output>
              </div>
              <div>
                <Tag>Hold</Tag>
                <output>{formatDuration(amplitude.hold)}</output>
              </div>
              <div>
                <Tag>Decay</Tag>
                <output>{formatDuration(amplitude.decay)}</output>
              </div>
              <div>
                <Tag>Sustain</Tag>
                <output>{Math.round(amplitude.sustain * 100)}%</output>
              </div>
              <div>
                <Tag>Release</Tag>
                <output>{formatDuration(amplitude.release)}</output>
              </div>
              <Button
                size="sm"
                variant="ghost"
                iconStart={<ResetIcon />}
                aria-label="Reset amplitude envelope"
                title="Reset amplitude envelope"
                onClick={resetAmplitude}
              />
            </div>
          </div>
        </div>
        <p className="section-note">
          Drag any stage handle horizontally to change timing. The decay handle also moves
          vertically to set sustain; hold <kbd>Shift</kbd> while dragging to align timing to the
          five-percent grid. Arrow keys offer the same precision when a handle is focused.
        </p>
      </Section>

      <Section title="Shape more than audio">
        <div className="envelope-editor-variants">
          <article className="envelope-editor-variants__audio">
            <Tag>Audio</Tag>
            <EnvelopeEditor
              variant="audio"
              density="compact"
              defaultValue={{ attack: 0.04, hold: 0.06, decay: 0.12, sustain: 0.48, release: 0.3 }}
              label="Percussive sound envelope"
            />
            <strong>Percussive response</strong>
            <p>A fast attack and long release make a plucked or struck sound feel responsive.</p>
          </article>
          <article className="envelope-editor-variants__motion">
            <Tag>Motion</Tag>
            <EnvelopeEditor
              variant="motion"
              density="compact"
              defaultValue={MOTION_ENVELOPE}
              label="Generative motion envelope"
            />
            <strong>Generative motion</strong>
            <p>Map the same stages to a reveal, pulse, or procedural force over its lifetime.</p>
          </article>
          <article className="envelope-editor-variants__effect">
            <Tag>Effect</Tag>
            <EnvelopeEditor
              editable={false}
              density="compact"
              defaultValue={EFFECT_ENVELOPE}
              label="Locked glow effect envelope"
            />
            <strong>Saved glow profile</strong>
            <p>
              A quiet read-only curve communicates the stored effect response without false
              affordance.
            </p>
          </article>
        </div>
      </Section>

      <Section title="Keep response shaping legible">
        <div className="envelope-editor-guidance">
          <div>
            <Tag>Stages</Tag>
            <strong>Name the temporal decision</strong>
            <p>
              Use the same A/H/D/R language across sound, animation, particles, and visual effects.
            </p>
          </div>
          <div>
            <Tag>Level</Tag>
            <strong>Attach sustain to decay</strong>
            <p>
              The sustain target belongs on the decay handle, rather than as a disconnected value.
            </p>
          </div>
          <div>
            <Tag>Precision</Tag>
            <strong>Use the grid only when needed</strong>
            <p>
              Free drag is expressive; Shift alignment makes repeatable timings easy without a
              persistent snap mode.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { EnvelopeEditor, type EnvelopeValue } from '@presentstandards/framekit-ui';

const [envelope, setEnvelope] = useState<EnvelopeValue>({
  attack: 0.1,
  hold: 0.12,
  decay: 0.18,
  sustain: 0.62,
  release: 0.2,
});

<EnvelopeEditor
  value={envelope}
  onValueChange={setEnvelope}
  variant="audio"
  label="Synth amplitude envelope"
/>;

// Use variant="motion" for generative animation and effects.`}</code>
        </pre>
      </Section>
    </>
  );
}
