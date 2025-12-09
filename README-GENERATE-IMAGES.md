# Generate Slide Images

This script generates PNG images of each slide from the HTML presentation.

## Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)

## Installation

1. Install dependencies:
```bash
npm install
```

This will install Puppeteer, which is used to capture screenshots of each slide.

## Usage

Run the image generation script:

```bash
npm run generate
```

Or directly:

```bash
node generate-slide-images.js
```

## Output

The script will:
- Create a `slide-images` folder (if it doesn't exist)
- Generate PNG images for each slide (slide1.png, slide2.png, etc.)
- Each image will be 1280x720 pixels (matching the slide dimensions)

## Notes

- The script automatically hides the sidebar and navigation bar for clean screenshots
- Each slide is captured at its full resolution
- The script waits for content to load before capturing
- If a slide fails to capture, an error message will be displayed

## Troubleshooting

If you encounter issues:

1. **Puppeteer installation fails**: Try installing with:
   ```bash
   npm install puppeteer --legacy-peer-deps
   ```

2. **Slides not loading**: Make sure `index.html` is in the same directory as the script

3. **Permission errors**: Ensure you have write permissions in the project directory

