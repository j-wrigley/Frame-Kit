import { useState } from 'react';
import { DropZone, FileTextIcon, ImageIcon, LayersIcon } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

function describeTransfer(transfer: DataTransfer) {
  const files = transfer.files.length;
  if (files > 0) return `${files} item${files === 1 ? '' : 's'} added from the transfer.`;

  const types = Array.from(transfer.types).filter((type) => type !== 'Files');
  return types.length > 0
    ? `Added payload with ${types.join(', ')} data.`
    : 'Added a transferable payload.';
}

export function DropZonePage() {
  const [status, setStatus] = useState('Drop a payload here or choose any source.');

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Drop zone"
        lede="A calm, general-purpose transfer target for creative tools. It accepts the complete drag payload, so a host can handle files, URLs, text, layers, clips, or any future application data without changing the component."
      />

      <Section title="General transfer target">
        <p className="section-intro">
          <code>DropZone</code> deliberately does not assume a file type or a file picker. Wire{' '}
          <code>onDrop</code> to inspect the <code>DataTransfer</code> payload, and use{' '}
          <code>onAction</code> for whatever source chooser fits the tool.
        </p>
        <div className="demo">
          <div className="drop-zone-demo">
            <DropZone
              size="lg"
              label="Drop content to add"
              icon={<LayersIcon />}
              onDrop={(transfer) => setStatus(describeTransfer(transfer))}
              onAction={() => setStatus('Source chooser requested — the host application owns it.')}
            />
            <output className="drop-zone-status" aria-live="polite">
              {status}
            </output>
          </div>
        </div>
      </Section>

      <Section title="Sizes and states">
        <p className="section-intro">
          The three sizes keep the same hierarchy. Use <code>sm</code> for dense inspector rows,
          <code>md</code> for panels, and <code>lg</code> when transfer is the primary action.
        </p>
        <div className="demo">
          <div className="drop-zone-size-grid">
            <DropZone
              size="sm"
              label="Replace source"
              icon={<FileTextIcon />}
              onAction={() => setStatus('Replace source requested.')}
            />
            <DropZone
              label="Add reference"
              icon={<ImageIcon />}
              onAction={() => setStatus('Reference source requested.')}
            />
            <DropZone size="lg" busy label="Preparing content" />
          </div>
        </div>
        <p className="section-note">
          The busy and disabled states stop drag and action input. Keep the component general—the
          content and resulting action belong to the host tool.
        </p>
      </Section>

      <Section title="Accessibility">
        <p className="section-intro">
          When <code>onAction</code> is present, the whole zone is a keyboard-operable button: Enter
          and Space invoke the same host-owned chooser. Drag-only flows should always expose an
          equivalent source action for keyboard and touch users.
        </p>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { DropZone } from '@presentstandards/framekit-ui';

<DropZone
  label="Add to composition"
  onDrop={(transfer) => {
    // The full DataTransfer is available: files, items, text, URLs, custom MIME types.
    acceptTransfer(transfer);
  }}
  onAction={() => openSourceChooser()}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
