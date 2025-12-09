const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateSlideImages() {
    console.log('Starting slide image generation...');
    
    // Launch browser
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to accommodate sidebar + slide (sidebar is 200px, slide is 1280px)
    await page.setViewport({
        width: 1480,
        height: 800
    });
    
    // Get the absolute path to index.html
    const htmlPath = path.resolve(__dirname, 'index.html');
    const fileUrl = `file://${htmlPath}`;
    
    console.log(`Loading: ${fileUrl}`);
    await page.goto(fileUrl, {
        waitUntil: 'load',
        timeout: 30000
    });
    
    // Wait for slides to load
    await page.waitForSelector('.slide', { timeout: 10000 });
    
    // Hide sidebar and navigation for clean screenshots
    await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar');
        const navBar = document.querySelector('.nav-bar');
        if (sidebar) sidebar.style.display = 'none';
        if (navBar) navBar.style.display = 'none';
        
        // Adjust viewer to center the slide
        const viewer = document.querySelector('.viewer');
        if (viewer) {
            viewer.style.justifyContent = 'center';
        }
    });
    
    // Get total number of slides
    const slideCount = await page.evaluate(() => {
        return document.querySelectorAll('.slide').length;
    });
    
    console.log(`Found ${slideCount} slides`);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'slide-images');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate images for each slide
    for (let i = 1; i <= slideCount; i++) {
        console.log(`Capturing slide ${i}...`);
        
        // Activate the slide
        await page.evaluate((slideIndex) => {
            // Remove active class from all slides
            document.querySelectorAll('.slide').forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Add active class to target slide
            const targetSlide = document.querySelector(`[data-slide="${slideIndex}"]`);
            if (targetSlide) {
                targetSlide.classList.add('active');
            }
        }, i);
        
        // Wait for slide to render and images to load
        await page.waitForTimeout(1000);
        
        // Wait for any images in the slide to load
        await page.evaluate((slideIndex) => {
            const slide = document.querySelector(`[data-slide="${slideIndex}"]`);
            if (slide) {
                const images = slide.querySelectorAll('img');
                return Promise.all(
                    Array.from(images).map(img => {
                        if (img.complete) return Promise.resolve();
                        return new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = resolve; // Continue even if image fails
                            setTimeout(resolve, 2000); // Timeout after 2s
                        });
                    })
                );
            }
        }, i);
        
        // Take screenshot of the slide
        const slideSelector = `.slide[data-slide="${i}"]`;
        const slideElement = await page.$(slideSelector);
        
        if (slideElement) {
            const outputPath = path.join(outputDir, `slide${i}.png`);
            await slideElement.screenshot({
                path: outputPath,
                type: 'png'
            });
            console.log(`✓ Saved: ${outputPath}`);
        } else {
            console.log(`✗ Slide ${i} not found`);
        }
    }
    
    await browser.close();
    console.log(`\n✓ Successfully generated ${slideCount} slide images in 'slide-images' folder`);
}

// Run the script
generateSlideImages().catch(error => {
    console.error('Error generating slide images:', error);
    process.exit(1);
});

