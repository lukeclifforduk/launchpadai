# Assets Inventory

This file documents all design reference assets in the repository.

---

## Images

### PXP Logo Files

Located in `/assets/` folder:

#### `PXP_Logo_Black.png`
- **Size:** 16.4 KB
- **Format:** PNG
- **Purpose:** Black logo variant for light backgrounds
- **Contents:** Circular open ring + "x" mark + "pxp" text in black
- **Usage:** Reference only — logo will be recreated as inline SVG in `index.html`

#### `PXP_Logo_White.png`
- **Size:** 16.0 KB
- **Format:** PNG
- **Purpose:** White logo variant for dark backgrounds
- **Contents:** Circular open ring + "x" mark + "pxp" text in white
- **Usage:** Reference only — logo will be recreated as inline SVG in `index.html`

---

## Design References

These assets serve as **design reference materials** for the future developer/AI building `index.html`. They are not embedded in the final presentation but are essential for understanding:

1. **Logo Structure:** The exact proportions and layout of the ring, x mark, and text
2. **Logo Sizing:** How large the icon is relative to the text
3. **Color Variants:** How the logo appears on light vs. dark backgrounds

---

## How to Use These Assets

When building `index.html`:

1. **Study the PNGs** to understand the logo's exact structure
2. **Recreate as inline SVG** in the HTML using:
   - `<circle>` for the ring (open, not full)
   - `<line>` elements for the "x" mark
   - `<text>` for "pxp"
3. **Use `currentColor`** to make the SVG respond to CSS theme variables
4. **Test both variants** by toggling light/dark mode in the browser

---

## Future Asset Additions

If additional design assets are needed (e.g., mockups, wireframes, screenshots), add them to `/assets/` and document them here with:
- File name and location
- File size and format
- Purpose and usage context
- Where it's referenced in the code or documentation
