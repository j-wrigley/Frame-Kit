import { useState } from 'react';
import {
  Button,
  NumberInput,
  OrbitDial,
  ResetIcon,
  Tag,
  type OrbitDialValue,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const CAMERA_DEFAULT: OrbitDialValue = { yaw: 42, elevation: 18 };
const LIGHT_DEFAULT: OrbitDialValue = { yaw: 128, elevation: 36 };

function wrapYaw(value: number) {
  const wrapped = value % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

function clampElevation(value: number) {
  return Math.min(90, Math.max(-90, value));
}

function degrees(value: number, signed = false) {
  return `${signed && value > 0 ? '+' : ''}${Math.round(value)}°`;
}

export function OrbitDialPage() {
  const [camera, setCamera] = useState<OrbitDialValue>(CAMERA_DEFAULT);
  const [light, setLight] = useState<OrbitDialValue>(LIGHT_DEFAULT);

  const updateCameraYaw = (yaw: number) => {
    if (!Number.isFinite(yaw)) return;
    setCamera((current) => ({ ...current, yaw: wrapYaw(yaw) }));
  };

  const updateCameraPitch = (elevation: number) => {
    if (!Number.isFinite(elevation)) return;
    setCamera((current) => ({ ...current, elevation: clampElevation(elevation) }));
  };

  const resetCamera = () => setCamera(CAMERA_DEFAULT);

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Orbit dial"
        lede="A compass-based control for camera yaw and pitch, light direction, and other spatial decisions. One precise ring keeps orientation visible while the central readout makes elevation immediate."
      />

      <Section title="Camera orbit inspector">
        <p className="section-intro">
          Use the ring to set a camera heading directly, then refine pitch with the same focused
          control or the nearby values. The current elevation remains visible at the centre instead
          of becoming a detached field.
        </p>
        <div className="demo">
          <div className="orbit-dial-inspector" aria-label="Camera orbit inspector">
            <div className="orbit-dial-inspector__heading">
              <div>
                <Tag>Camera</Tag>
                <strong>Orbit</strong>
              </div>
              <span className="orbit-dial-inspector__state">Perspective</span>
            </div>

            <div className="orbit-dial-inspector__field">
              <OrbitDial
                size="lg"
                value={camera}
                onValueChange={setCamera}
                yawLabel="Yaw"
                elevationLabel="Pitch"
                label="Camera orbit"
              />
              <div className="orbit-dial-inspector__readout">
                <Tag>View</Tag>
                <strong>Yaw {degrees(camera.yaw)}</strong>
                <output>Pitch {degrees(camera.elevation, true)}</output>
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<ResetIcon />}
                  aria-label="Reset camera orbit"
                  title="Reset camera orbit"
                  onClick={resetCamera}
                />
              </div>
            </div>

            <div className="orbit-dial-inspector__values">
              <NumberInput
                size="sm"
                label="Yaw"
                value={String(Math.round(camera.yaw))}
                decrementLabel="Decrease camera yaw"
                incrementLabel="Increase camera yaw"
                onChange={(event) => updateCameraYaw(Number.parseFloat(event.target.value))}
                onDecrement={() => updateCameraYaw(camera.yaw - 1)}
                onIncrement={() => updateCameraYaw(camera.yaw + 1)}
              />
              <NumberInput
                size="sm"
                label="Pitch"
                value={String(Math.round(camera.elevation))}
                decrementLabel="Decrease camera pitch"
                incrementLabel="Increase camera pitch"
                onChange={(event) => updateCameraPitch(Number.parseFloat(event.target.value))}
                onDecrement={() => updateCameraPitch(camera.elevation - 1)}
                onIncrement={() => updateCameraPitch(camera.elevation + 1)}
              />
            </div>
          </div>
        </div>
        <p className="section-note">
          Click or drag around the compass ring to set yaw. With the dial focused, use <kbd>←</kbd>{' '}
          and <kbd>→</kbd> for yaw, <kbd>↑</kbd> and <kbd>↓</kbd> for elevation, or hold{' '}
          <kbd>Shift</kbd> for larger keyboard adjustments and 15° compass ticks while dragging.
        </p>
      </Section>

      <Section title="Use the same orientation language">
        <div className="orbit-dial-variants">
          <article className="orbit-dial-variants__light">
            <Tag>Light</Tag>
            <OrbitDial
              value={light}
              onValueChange={setLight}
              variant="light"
              yawLabel="Azimuth"
              elevationLabel="Elevation"
              label="Key light direction"
            />
            <strong>Key light direction</strong>
            <p>
              Reuse the compass for lighting: the same controls express azimuth and elevation
              without introducing a different spatial pattern.
            </p>
          </article>
          <article className="orbit-dial-variants__camera">
            <Tag>Camera</Tag>
            <OrbitDial
              size="sm"
              defaultValue={{ yaw: 224, elevation: -12 }}
              yawLabel="Yaw"
              elevationLabel="Pitch"
              label="Rear camera orbit"
            />
            <strong>Rear camera angle</strong>
            <p>Use a clear heading marker to make an off-axis viewpoint legible at a glance.</p>
          </article>
          <article className="orbit-dial-variants__locked">
            <Tag>Locked</Tag>
            <OrbitDial
              size="sm"
              defaultValue={{ yaw: 310, elevation: 52 }}
              editable={false}
              yawLabel="Azimuth"
              elevationLabel="Elevation"
              label="Locked fill light direction"
            />
            <strong>Saved fill light</strong>
            <p>
              Use a muted, read-only dial to show a saved direction without implying it can change.
            </p>
          </article>
        </div>
      </Section>

      <Section title="Keep spatial controls coherent">
        <div className="orbit-dial-guidance">
          <div>
            <Tag>Heading</Tag>
            <strong>Use the ring for direction</strong>
            <p>Cardinal markers make yaw scannable without requiring a separate compass legend.</p>
          </div>
          <div>
            <Tag>Elevation</Tag>
            <strong>Keep vertical angle in view</strong>
            <p>The central readout gives pitch or elevation a stable home beside the heading.</p>
          </div>
          <div>
            <Tag>Pairing</Tag>
            <strong>Connect it to camera path</strong>
            <p>
              Use Camera Path for movement through a scene and Orbit Dial for how the view faces.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { OrbitDial, type OrbitDialValue } from '@presentstandards/framekit-ui';

const [orbit, setOrbit] = useState<OrbitDialValue>({
  yaw: 42,
  elevation: 18,
});

<OrbitDial
  value={orbit}
  onValueChange={setOrbit}
  yawLabel="Yaw"
  elevationLabel="Pitch"
  label="Camera orbit"
/>;

// Use yawLabel="Azimuth" for lighting and other directional tools.`}</code>
        </pre>
      </Section>
    </>
  );
}
