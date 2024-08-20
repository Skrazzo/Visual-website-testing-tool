const axios = require("axios");
const { parseStringPromise } = require("xml2js");

export const getSitemapUrls = async (sitemapUrl, excludeFiles, pattern) => {
    try {
        const response = await axios.get(sitemapUrl);
        const xml = response.data;
        const urlRegex = /<loc>(.*?)<\/loc>/g;
        const excludedExtensions = /\.(jpg|jpeg|png|gif|pdf|css|js)$/i;
        const excludePattern = new RegExp(pattern, "i");

        let urls = [];
        let match;

        while ((match = urlRegex.exec(xml)) !== null) {
            const url = match[1];

            if (excludeFiles === true && excludedExtensions.test(url)) {
                continue;
            }

            if (pattern !== "" && excludePattern.test(url)) {
                continue;
            }

            urls.push(url);
        }

        return urls;
    } catch (error) {
        return null;
    }
};
