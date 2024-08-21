const archiver = require("archiver");
const fs = require("fs");

export function createZipFile(directory, outputFile) {
    const output = fs.createWriteStream(outputFile);
    const archive = archiver("zip", { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
        output.on("close", () => {
            resolve();
        });

        archive.on("error", (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(directory, false);
        archive.finalize();
    });
}
