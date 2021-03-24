// const htmlmin = require("html-minifier");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const markdownIt = require("markdown-it");

module.exports = function (config) {
    config.addPlugin(syntaxHighlight);

    // Savjee
    config.addLayoutAlias("default", "layouts/default.html");
    config.addLayoutAlias("post", "layouts/post.html");
    config.addLayoutAlias("video", "layouts/video.html");
    config.addLayoutAlias("page", "layouts/page.html");

    config.addFilter("md", function (content = "") {
        return markdownIt({ html: true }).render(content);
    });

    config.addLiquidFilter("getVideosInSeries", require('./src/utils/filters/getVideosInSeries'));

    config.addCollection('posts', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/site/posts/**/*.md')
            .sort(function (a, b) {
                return b.date - a.date;
            });
    });

    config.addCollection('videos', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/site/videos/**/*.md')
            .sort((a, b) => {
                // First sort on series
                if (a.data.series > b.data.series) return 1;
                if (a.data.series < b.data.series) return -1;

                // Then sort on upload date (if it's set)
                if (a.data.uploadDate && b.data.uploadDate) {
                    if (a.data.uploadDate > b.data.uploadDate) return 1;
                    if (a.data.uploadDate < b.data.uploadDate) return -1;
                }

                // Finally, sort on upload order
                if (a.data.order && b.data.order) {
                    if (a.data.order > b.data.order) return 1;
                    if (a.data.order < b.data.order) return -1;
                }

                return 0;
            });
    });



    config.addShortcode("link", require('./src/utils/shortcode/link.js'));
    config.addPairedLiquidShortcode("bibtex", require('./src/utils/shortcode/bibtex'));

    config.addPassthroughCopy("src/site/assets");
    config.addPassthroughCopy("src/site/uploads");
    config.addPassthroughCopy({ "./_tmp": "site/assets/css" });

    // Extract excerpt for each post containing the <!--more--> tag
    // Used to construct SEO <meta> tags in <head>
    config.setFrontMatterParsingOptions({
        excerpt: true,
        // Optional, default is "---"
        excerpt_separator: "<!--more-->"
    });

    //
    // External links should be opened in a new tab and should
    // not expose personal details
    //
    const mila = require("markdown-it-link-attributes");
    const milaOptions = {
        pattern: /^https?:/,
        attrs: {
            target: "_blank",
            rel: "noopener noreferrer"
        }
    };

    const markdownLib = markdownIt({
        html: true
    }).use(mila, milaOptions);
    config.setLibrary("md", markdownLib);

    return {
        dir: { input: 'src/site', output: 'dist', data: '_data' },
        // passthroughFileCopy: false,
        // templateFormats: ['njk', 'md', 'css', 'html', 'yml', 'txt'],
        // htmlTemplateEngine: 'njk'
    }
};
