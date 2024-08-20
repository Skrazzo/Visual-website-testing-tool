const fs = require("fs");
const path = require("path");

export function deleteFiles(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            const filePath = path.join(dir, file);

            fs.unlink(filePath, (err) => {
                if (err) throw err;
            });
        }
    });
}
