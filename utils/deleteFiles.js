const fs = require("fs");
const path = require("path");

/**
 * This function deletes all file in the specified directory
 * @param {string} dir String path to the directory in which you want to delete all files
 */
export function deleteFiles(dir) {
    let files = fs.readdirSync(dir);
    for (let file of files) {
        const filePath = path.join(dir, file);
        fs.unlinkSync(filePath);
    }
}
