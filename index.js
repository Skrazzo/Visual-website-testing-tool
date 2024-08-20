const puppeteer = require("puppeteer");
const config = require("./config.json");
const fs = require("fs");
const { sanitizeUrl } = require("./utils/sanitizeUrl");
const { sleep } = require("./utils/sleep");
const { error } = require("./utils/throwError");
const { overlayAndCompareImages } = require("./utils/overylayImage");
const { deleteFiles } = require("./utils/deleteFiles");
const { getSitemapUrls } = require("./utils/getSitemapUrls");
const { createZipFile } = require("./utils/zipFile");

/**
 * Sitemap can be single url to the actual website sitemap, or just array of links
 */

// TODO Image compression

let urls = config.sitemap;

// Create output dir if doesn't exist
if (!fs.existsSync(config.outputFolder)) fs.mkdirSync(config.outputFolder);

// Check if previous results exist
const newPath = `${config.outputFolder}/new`;
const oldPath = `${config.outputFolder}/old`;
const historyPath = `${config.outputFolder}/history`;

const resultPath = `${config.outputFolder}/result`;
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
        log(`Going to ${urls[i]}`);
        try {
            await page.goto(urls[i], {
                waitUntil: "networkidle2",
                timeout: 60000,
            });
        } catch (err) {
            console.log(err);
        }

        await sleep(config.sleep);
        log(`${urls[i]} loaded`);

        // Save screenshot to the new directory
        let fileName = `${imagePrefix}_${sanitizeUrl(urls[i])}.png`;
        await page.screenshot({
            path: `${config.outputFolder}/new/${fileName}`,
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
    // Check if urls is sitemap string or array
    if (typeof urls === "string") {
        log("Downloading sitemap from ", urls);
        urls = await getSitemapUrls(
            urls,
            config.exclude.files,
            config.exclude.pattern
        );
    } else if (typeof urls === "object") {
    } else {
        error("Unknown sitemap type");
    }

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
            "New files do not match with old ones, please run the script again",
            false
        );
    }

    if (config.results.deleteOldResult) {
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

        await overlayAndCompareImages(
            `${newPath}/${newFiles[i]}`,
            `${oldPath}/${newFiles[i]}`,
            resultPath,
            config.overlayOpacity
        );
        log(`Difference and overlay made for: ${newFiles[i]}`);
    }

    fs.writeFileSync(`${resultPath}/scannedUrls.json`, JSON.stringify(urls));

    // Zip results if thats specified in the config
    if (config.results.zip) {
        // Check if keeping history in the config is set to true
        if (config.results.history.keepHistory && config.results.zip) {
            if (fs.existsSync(`${config.outputFolder}/results.zip`)) {
                if (!fs.existsSync(historyPath)) fs.mkdirSync(historyPath);
                let historyFiles = fs.readdirSync(historyPath);

                // Delete the oldest history file, so that the files could be shifted
                const hLimit = config.results.history.limit;
                if (historyFiles.length === hLimit) {
                    fs.unlinkSync(`${historyPath}/${hLimit}.zip`);
                }

                // Shift files, and make space for new results.zip
                for (let i = hLimit - 1; i > 0; i--) {
                    if (!fs.existsSync(`${historyPath}/${i}.zip`)) continue;
                    fs.renameSync(
                        `${historyPath}/${i}.zip`,
                        `${historyPath}/${i + 1}.zip`
                    );
                }

                fs.renameSync(
                    `${config.outputFolder}/results.zip`,
                    `${historyPath}/1.zip`
                );
                log("Added results.zip to the history folder");
            }
        }

        try {
            log("Creating zip file");
            await createZipFile(
                resultPath,
                `${config.outputFolder}/results.zip`
            );
            log("Zip file created");
        } catch (error) {
            console.error("Error creating ZIP file:", error);
        }
    }
})();
