const Jimp = require("jimp");
const path = require("path");

export async function overlayAndCompareImages(
    imagePath1,
    imagePath2,
    outputPath,
    opacity
) {
    const image1 = await Jimp.read(imagePath1);
    const image2 = await Jimp.read(imagePath2);

    // Resize images to the same dimensions if needed
    image2.resize(image1.bitmap.width, image1.bitmap.height);

    // Overlay the second image on the first with transparency
    image1.composite(image2, 0, 0, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: opacity, // Adjust opacity (0.0 - fully transparent, 1.0 - fully opaque)
    });

    // Save the overlay result
    await image1.writeAsync(
        `${outputPath}/overlay_${path.basename(imagePath1)}`
    );

    // Compute the difference between the images
    const diff = Jimp.diff(image1, image2);

    // Save the difference image
    const diffOutputPath = `${outputPath}/diff_${path.basename(imagePath1)}`;
    await diff.image.writeAsync(diffOutputPath);
}
