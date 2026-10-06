import { useState, type CSSProperties } from 'react';
import {
  NodeSocket,
  SegmentedSwitch,
  type NodeSocketLane,
  type NodeSocketState,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const LANES: readonly { lane: NodeSocketLane; name: string; carries: string }[] = [
  { lane: 'value', name: 'Value', carries: 'Numbers, text, on/off, colour, media' },
  { lane: 'pixels', name: 'Pixels', carries: 'Image flow' },
  { lane: 'element', name: 'Element', carries: 'A target element' },
  { lane: 'mask', name: 'Mask', carries: 'A matte' },
];

const STATES: readonly {
  id: string;
  label: string;
  connected?: boolean;
  state?: NodeSocketState;
}[] = [
  { id: 'open', label: 'Open' },
  { id: 'connected', label: 'Connected', connected: true },
  { id: 'compatible', label: 'Compatible', state: 'compatible' },
  { id: 'hint', label: 'Hint', state: 'hint' },
  { id: 'source', label: 'Source', state: 'source' },
  { id: 'incompatible', label: 'Incompatible', state: 'incompatible' },
];

const SCALES = [
  { value: '1', label: '1×' },
  { value: '3', label: '3×' },
];

const ZOOMS = [
  { value: '0.4', label: '40%' },
  { value: '1', label: '100%' },
  { value: '2', label: '200%' },
];

export function NodeSocketPage() {
  const [scale, setScale] = useState('3');
  const [zoom, setZoom] = useState('0.4');
  const [wired, setWired] = useState<Record<NodeSocketLane, boolean>>({
    value: false,
    pixels: true,
    element: false,
    mask: true,
  });
  const zoomFactor = Number(zoom);
  // The kit's rule, mirrored for the readout: 8px, grown to 7px on screen.
  const glyph = 8 * Math.min(2.5, Math.max(1, 0.875 / zoomFactor));

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Node socket"
        lede="The place a wire attaches. Four glyph shapes name the kind of signal a socket carries; colour shows its state. The socket is visual only — your application owns wiring, legality, and pointer behaviour."
      />

      <Section title="Shape is the lane, colour is the state">
        <p className="section-intro">
          Connected Value and Pixels sockets fill solid. A connected Element tints the gap in its
          ring and a connected Mask tints its empty half, so the inner mark still shows and neither
          can be mistaken for a connected Value or Pixels socket, even under a grey accent. Patching
          states layer over the connected state rather than replacing it.
        </p>
        <div className="demo">
          <div className="node-socket-matrix__toolbar">
            <span className="fk-tag">Glyph scale</span>
            <SegmentedSwitch
              size="sm"
              aria-label="Glyph scale"
              options={SCALES}
              value={scale}
              onValueChange={setScale}
            />
          </div>
          <div className="node-socket-matrix" data-scale={scale}>
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="fk-tag">Lane</span>
                  </th>
                  {STATES.map((column) => (
                    <th scope="col" key={column.id}>
                      <span className="fk-tag">{column.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LANES.map((row) => (
                  <tr key={row.lane}>
                    <th scope="row">
                      <span className="node-socket-matrix__lane">
                        <strong>{row.name}</strong>
                        <span>{row.carries}</span>
                      </span>
                    </th>
                    {STATES.map((column) => (
                      <td key={column.id}>
                        <span className="node-socket-matrix__cell">
                          <NodeSocket
                            lane={row.lane}
                            connected={column.connected}
                            state={column.state}
                            aria-label={`${row.name} socket, ${column.label.toLowerCase()}`}
                            role="img"
                          />
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="section-note">
          Hint previews a legal partner while the pointer rests on another socket, before any drag
          starts. Compatible marks a legal target once the drag is under way.
        </p>
      </Section>

      <Section title="As a press target">
        <p className="section-intro">
          Render the socket as a button when the socket itself starts a wire. It keeps the kit focus
          outline and an accent ring on hover. Here, clicking toggles a wire so you can compare each
          lane open and connected.
        </p>
        <div className="demo">
          <div className="node-socket-buttons">
            {LANES.map((row) => (
              <div className="node-socket-buttons__item" key={row.lane}>
                <NodeSocket
                  as="button"
                  lane={row.lane}
                  connected={wired[row.lane]}
                  aria-label={`${wired[row.lane] ? 'Disconnect' : 'Connect'} ${row.name}`}
                  aria-pressed={wired[row.lane]}
                  onClick={() =>
                    setWired((current) => ({ ...current, [row.lane]: !current[row.lane] }))
                  }
                />
                <span>{row.name}</span>
                <span className="node-socket-buttons__state">
                  {wired[row.lane] ? 'Connected' : 'Open'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Readable and easy to hit at any zoom">
        <p className="section-intro">
          A zoomable canvas sets <code>--fk-node-socket-zoom</code> and the hit pad rule
          <code> --fk-node-socket-hit</code> once on its workspace. Zoomed out, the glyph grows on
          the card so it never draws below 7px on screen, and the four lane shapes stay readable at
          40%. The hit pad grows too, so a socket stays easy to hit. The dashed box shows the pad at
          each zoom level.
        </p>
        <div className="demo">
          <div className="node-socket-matrix__toolbar">
            <span className="fk-tag">Canvas zoom</span>
            <SegmentedSwitch
              size="sm"
              aria-label="Canvas zoom"
              options={ZOOMS}
              value={zoom}
              onValueChange={setZoom}
            />
          </div>
          <div className="node-socket-zoom">
            <div
              className="node-socket-zoom__workspace"
              style={
                {
                  transform: `scale(${zoomFactor})`,
                  '--fk-node-socket-zoom': zoomFactor,
                  '--fk-node-socket-hit': `max(12px, calc(16px / ${zoomFactor}))`,
                } as CSSProperties
              }
            >
              {LANES.map((row) => (
                <NodeSocket
                  key={row.lane}
                  as="button"
                  lane={row.lane}
                  connected={wired[row.lane]}
                  className="node-socket-zoom__socket"
                  aria-label={`${row.name} socket at ${Math.round(zoomFactor * 100)}% zoom`}
                />
              ))}
            </div>
          </div>
          <p className="node-socket-zoom__readout">
            Glyph {glyph.toFixed(1)}px on the card · {(glyph * zoomFactor).toFixed(1)}px on screen ·
            pad {Math.max(12, 16 / zoomFactor).toFixed(0)}px on the card ·{' '}
            {(Math.max(12, 16 / zoomFactor) * zoomFactor).toFixed(1)}px on screen
          </p>
        </div>
        <p className="section-note">
          Sockets are centred by layout, never by transform, so an application can measure a
          socket&apos;s centre with offsetTop and offsetHeight even inside a scaled workspace. In a
          NodeRow a grown socket moves outward by what it grew ((grow − 1) × 5.5px), so its glyph
          and ring never reach further into the card than at 100% and the row&apos;s label keeps its
          clearance.
        </p>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { NodeSocket } from '@presentstandards/framekit-ui';

// A press target on a node card edge — your app supplies the behaviour.
<NodeSocket
  as="button"
  lane="pixels"
  connected={hasWire}
  state={dragState} // 'compatible' | 'hint' | 'source' | 'incompatible'
  aria-label="Connect In"
  onPointerDown={startWireDrag}
  onClick={openChooser}
/>

// Zoom compensation, once, on the canvas workspace: the glyph keeps a
// 7px on-screen minimum and the hit pad grows as you zoom out.
.workspace {
  --fk-node-socket-zoom: var(--zoom);
  --fk-node-socket-hit: max(12px, calc(16px / var(--zoom)));
}`}</code>
        </pre>
      </Section>
    </>
  );
}
