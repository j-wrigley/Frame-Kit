# Component routing

Use this guide to find likely Frame Kit specs. Confirm current exports and read the relevant file under `FRAMEKIT_ROOT/docs/components/` before implementation.

## Selection method

Create a compact control map before composing a new sidebar:

| Field       | Record                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Parameter   | User-facing adjustment and useful unit or range.                                                            |
| Value model | Scalar, exact, discrete, paired, directional, spatial, tonal, temporal, physical, procedural, or connected. |
| Interaction | Click, type, drag, scrub, draw, select, play, reorder, or direct manipulation.                              |
| Candidates  | Relevant Frame Kit components considered after reading their specs.                                         |
| Choice      | Best-fit component or intentional composition.                                                              |
| Group       | User task or feature relationship that owns the control.                                                    |
| Reason      | One sentence explaining why the model improves clarity or efficiency.                                       |

Inventory the complete relevant component catalogue rather than reaching for the first familiar primitive. Choose the smallest control that exposes the underlying model clearly. Use expressive components only when their interaction model helps; never add them as decoration or to satisfy a variety quota.

| Need                                           | Start with                                                             | Notes                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Command or icon action                         | `Button`, `Toolbar`                                                    | Use a toolbar for related tool selection and roving focus.                     |
| Progress or processing feedback                | `Loader`                                                               | Match the loader to duration and context; do not replace determinate progress. |
| Text, search, rename, number, or compose input | `Input`, `SearchField`, `InlineRename`, `NumberInput`, `InputComposer` | Choose the semantic input role, not a visual approximation.                    |
| Bounded discrete number                        | `Stepper`                                                              | Use for explicit increment and decrement actions.                              |
| Familiar continuous range                      | `Slider`                                                               | Prefer when a native range model is sufficient.                                |
| Measured continuous range                      | `RulerSlider`, `RulerReadout`                                          | Use visible ticks only when the scale adds meaning.                            |
| Direct inspector value                         | `DragValue`, `Scrubber`                                                | DragValue is field-led; Scrubber is row-led with rail feedback.                |
| Short mutually exclusive choice                | `SegmentedSwitch`, `Tabs`, `RadioGroup`                                | Choose based on whether content, mode, or form choice changes.                 |
| Binary setting                                 | `Toggle`, `ToggleRow`, `Checkbox`                                      | Use the documented semantic distinction.                                       |
| Selection or item row                          | `LayerRow`                                                             | Keep actions accessible and metadata short.                                    |
| Inspector or navigation shell                  | `Sidebar`, `SidebarSection`                                            | Choose panel, docked, or bounded floating placement; group controls by task.   |
| Menu or optional settings                      | `Dropdown`, `NestedDropdown`, `Disclosure`                             | Do not use a dropdown as a general dialog.                                     |
| Anchored supporting surface                    | `Popover`, `Tooltip`, `HoverCard`, `ContextMenu`                       | Keep required information out of hover-only surfaces.                          |
| Colour or gradient                             | `ColorInput`, `ColorPicker`, `GradientPicker`, `GradientEditor`        | Preserve automatic contrast and controlled values.                             |
| Motion curve                                   | `EasingGraph`, `SpringResponse`                                        | Choose timing mapping versus physical response.                                |
| Spatial pair or direction                      | `AxisField`, `DirectionPad`, `OrbitDial`, `PerspectiveGrid`            | Match continuous, discrete, rotational, or perspective intent.                 |
| Image framing                                  | `FocusCrop`, `CameraPath`                                              | Separate framing/crop from ordered camera movement.                            |
| Tonal or colour distribution                   | `HistogramScope`, `ToneCurve`, `ColorBalanceWheels`                    | Histogram is readout; curve and wheels are editable.                           |
| Procedural modulation                          | `ModulationStrip`, `EnvelopeEditor`, `LoopComposer`                    | Match waveform, staged envelope, or repeat behaviour.                          |
| Temporal editing                               | `KeyframeLane`, `VideoTimeline`, `ValueGraph`                          | Match events, editorial clips, or continuous value animation.                  |
| Connected processing                           | `NodeCanvas`                                                           | Application owns the node schema and domain execution.                         |
| Frame or workspace composition                 | `Frame`, `Sidebar`, Ready Made examples, Sidebar builder               | Reuse complete patterns when they already match the tool.                      |
| Transfer target                                | `DropZone`                                                             | Keep payload semantics application-owned and label the action clearly.         |

## Common upgrades from a generic slider

| Adjustment                 | Consider                                            | Use when                                                                  |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| Direct inspector number    | `DragValue`, `Scrubber`                             | The value is adjusted frequently and compact direct manipulation matters. |
| Measured scalar            | `RulerSlider`, `RulerReadout`                       | Scale position or measurement context helps interpretation.               |
| Linked X/Y or amount/scale | `AxisField`                                         | The relationship between two continuous values is meaningful.             |
| Discrete direction         | `DirectionPad`                                      | Direction is a finite semantic choice rather than an angle.               |
| Orientation or orbit       | `OrbitDial`                                         | Yaw and elevation should be understood spatially.                         |
| Perspective or corners     | `PerspectiveGrid`, `FocusCrop`                      | The adjustment directly changes a spatial frame.                          |
| Timing mapping             | `EasingGraph`                                       | Curve shape is the adjustment.                                            |
| Physical settling          | `SpringResponse`                                    | Mass, stiffness, damping, and velocity form one response model.           |
| Procedural variation       | `ModulationStrip`, `EnvelopeEditor`, `LoopComposer` | Waveform, staged response, or repeat structure matters.                   |
| Tonal relationship         | `ToneCurve`, `ColorBalanceWheels`                   | The edit is graphical or channel-related rather than a standalone number. |
| Time-varying value         | `KeyframeLane`, `ValueGraph`, `VideoTimeline`       | Events, continuous automation, or editorial clips are the real model.     |
| Processing relationship    | `NodeCanvas`                                        | Users connect ordered or branching operations.                            |

## Professional sidebar composition

- Group by the user's task or feature: Appearance, Transform, Motion, Input, Output, or a product-specific workflow.
- Keep controls that affect one another in the same section; separate unrelated stages even when they use the same component.
- Order groups by workflow and controls within a group by frequency and consequence.
- Keep primary controls visible. Put advanced, conditional, or rarely used settings in `Disclosure`, `Popover`, or an appropriate secondary view.
- Pair visual controls with `NumberInput` or another exact field only when precision is genuinely useful.
- Use `Tabs` or `SegmentedSwitch` for real modes, not to conceal an overgrown sidebar.
- When a high-frequency tool benefits from staying close to the canvas, let its section pop into a compact draggable `Sidebar`. Keep the tool value and floating position controlled by the application, render only one live instance, and provide an explicit dock action.
- Treat three or more consecutive generic sliders as a review trigger. Re-evaluate the value models, but retain each Slider that remains the clearest choice.
- Avoid a component sampler. Variety is the result of semantic fit, not the goal.

When no component fits, explain the gap before adding a new primitive. First decide whether it is a private product-specific component or a reusable Frame Kit primitive. In either case, build from the foundation rules rather than an unrelated visual style: semantic tokens, Inter/Office Code Pro roles, 4px spacing, radius vocabulary, restrained elevation, accessible semantics, visible focus, keyboard behaviour, and light/dark support. Complete the public component contract when the primitive belongs in the package.

For a small requested adjustment, prefer documented component props and composition. Then use a scoped semantic-token override or theme/accent API. Do not override private descendant classes to force a divergent component design; create a documented variant when the adjustment becomes a recurring need.
