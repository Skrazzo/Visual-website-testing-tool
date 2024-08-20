const puppeteer = require("puppeteer");
const config = require("./config.json");
const fs = require("fs");
const { sanitizeUrl } = require("./utils/sanitizeUrl");
const { sleep } = require("./utils/sleep");
const { error } = require("./utils/throwError");
const { overlayAndCompareImages } = require("./utils/overylayImage");
const { deleteFiles } = require("./utils/deleteFiles");

/**
 * Sitemap can be single url to the actual website sitemap, or just array of links
 */
// TODO: read sitemap url
const sitemap = config.sitemap;
let urls = sitemap;

// Create output dir if doesn't exist
if (!fs.existsSync(config.outputFoler)) fs.mkdirSync(config.outputFoler);

// Check if previous results exist
const newPath = `${config.outputFoler}/new`;
const oldPath = `${config.outputFoler}/old`;

const resultPath = `${config.outputFoler}/result`;
if (!fs.existsSync(resultPath)) fs.mkdirSync(resultPath);

if (fs.existsSync(newPath)) {
    // Move previous results to the old folder, so that new result folder is empty
    if (fs.existsSync(oldPath)) {
        fs.rmdirSync(oldPath, { recursive: true, force: true });
    }

    fs.renameSync(newPath, oldPath);
}

fs.mkdirSync(newPath);

// Check urls
if (urls.length === 0) {
    error("Please add urls to the sitemap, or create custom array of links");
}

async function run(width, imagePrefix) {
    log("Starting browser for " + imagePrefix);
    const browser = await puppeteer.launch({
        headless: config.headless,
        timeout: 100000,
        args: [`--window-size=${width},1080`],
        defaultViewport: {
            width: width,
            height: 1080,
        },
    });

    const page = await browser.newPage();

    // Register localStorage and cookies
    await page.goto(urls[0]);
    log("Setting cookies and localstorage");
    await page.setCookie(...config.cookies);
    await page.evaluate((storage) => {
        storage.forEach((x) => localStorage.setItem(x.name, x.value));
    }, config.localStorage);

    log("Reloading site and starting page capture");

    for (let i = 0; i < urls.length; i++) {
        await page.goto(urls[i], {
            waitUntil: "networkidle2",
        });
        await sleep(config.sleep);
        log(`${await page.url()} loaded`);

        // Save screenshot to the new directory
        let fileName = `${imagePrefix}_${sanitizeUrl(await page.url())}.png`;
        await page.screenshot({
            path: `${config.outputFoler}/new/${fileName}`,
            fullPage: true,
        });
        log(`${fileName} saved`);
    }

    browser.close();
}

// These are helper functions
function log(msg) {
    if (!config.verbose) return;
    const d = new Date();
    console.log(`[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}] ${msg}`);
}

(async () => {
    if (config.runTests.desktop) {
        await run(config.width.desktop, "desktop");
    }

    if (config.runTests.mobile) {
        await run(config.width.mobile, "mobile");
    }

    if (!fs.existsSync(oldPath)) {
        error(
            "The script needs to be run again, so we can compare results to previous results"
        );
    }

    let newFiles = fs.readdirSync(newPath);
    let oldFiles = fs.readdirSync(oldPath);

    if (newFiles.length !== oldFiles.length) {
        error(
            "New files do not match with old ones, please run the script again"
        );
    }

    if (config.deleteOldResult) {
        deleteFiles(resultPath);
        log("Deleted old result files");
    }

    log("Creating overlaping images");
    for (let i = 0; i < newFiles.length; i++) {
        if (!fs.existsSync(`${oldPath}/${newFiles[i]}`)) {
            console.warn(
                `WARNING: ${newFiles[i]} Will be skipped, because old file with this name does not exist\nRe-run the program to see complete result for all pages`
            );
            continue;
        }

        overlayAndCompareImages(
            `${newPath}/${newFiles[i]}`,
            `${oldPath}/${newFiles[i]}`,
            resultPath
        ).then(() => log(`Difference and overlay made for: ${newFiles[i]}`));
    }
})();
