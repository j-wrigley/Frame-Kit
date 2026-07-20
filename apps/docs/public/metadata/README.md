# Frame Kit metadata assets

Add the final metadata images to this folder using these exact filenames:

- `frame-kit-social.png` — 1200 × 630 px PNG, used by Open Graph and large social cards.
- `apple-touch-icon.png` — 180 × 180 px PNG for saved shortcuts and Apple devices.
- `favicon.svg` — already supplied as the black rounded-square fallback. Replace it only if the
  fallback artwork changes; the documentation site changes this favicon to the selected accent at
  runtime.

Keep important artwork and text away from the outside 60 px of the social image so different share
surfaces can crop it safely. Export in sRGB and keep the file reasonably small without making text
or interface details soft.

The HTML metadata already points to these filenames using the production domain at
`https://framekit.presentstandards.studio/`. Keep the filenames unchanged when replacing the image
assets so Open Graph, social cards, and saved shortcuts continue to resolve without another code
change.
