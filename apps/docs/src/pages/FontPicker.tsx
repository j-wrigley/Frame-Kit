import { PageHeader, Section } from '../components/Page';
import { FontPickerDemo } from '../components/ready-made/FontPickerDemo';

export function FontPicker() {
  return (
    <>
      <PageHeader
        eyebrow="Ready Made"
        title="Font picker"
        lede="A compact inspector disclosure for choosing a family and tuning type without introducing a separate typography-control pattern."
      />

      <Section title="Font picker disclosure">
        <p className="section-intro">
          Keep type controls in one narrow, expandable surface. The selected family stays visible at
          rest, while browsing and fine tuning open inline when they are needed.
        </p>
        <div className="demo ready-font-picker-demo">
          <FontPickerDemo />
        </div>
        <p className="section-note">
          Family selection is intentionally a single, scannable list. Inputs handle precise type
          values, while compact sliders are reserved for bounded adjustments.
        </p>
      </Section>
    </>
  );
}
