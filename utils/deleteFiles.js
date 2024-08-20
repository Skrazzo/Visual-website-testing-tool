const fs = require("fs");
const path = require("path");

export function deleteFiles(dir) {
    let files = fs.readdirSync(dir);
    for (let file of files) {
        const filePath = path.join(dir, file);
        fs.unlinkSync(filePath);
    }
}
