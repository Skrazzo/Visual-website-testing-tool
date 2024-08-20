export function sanitizeUrl(url) {
    return url
        .replace(/^https?:\/\//, "") // Remove http:// or https://
        .replace(/[<>:"\/\\|?*]/g, "_") // Replace invalid characters
        .substring(0, 255); // Limit length if necessary
}
