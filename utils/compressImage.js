const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

/**
 * Output will be jpg picture
 * @param {string} input point to the input png file
 * @param {string} output point to the output png file
 * @param {decimal} quality this will determine quality of the image (0 - 1)
 * @throws Will throw an error if either compression fails, or files don't exist
 */

export async function compress(input, output, quality, deleteInput) {
    if (!fs.existsSync(input)) {
        throw new Error("Input file does not exist");
    }

    // Change file extension to jpg
    output = output.replace(path.extname(output), ".jpg");

    let overwrite = false;
    if (input === output) {
        overwrite = true;
    }

    try {
        await sharp(input)
            .jpeg({ quality: quality * 100 })
            .toFile(`${output}${overwrite ? ".tmp" : ""}`);

        if (overwrite) {
            fs.unlinkSync(output);
            fs.renameSync(`${output}.tmp`, `${output}`);
        }
    } catch (error) {
        throw new Error(error);
    }
}
