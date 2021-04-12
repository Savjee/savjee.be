// const htmlmin = require("html-minifier");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const markdownIt = require("markdown-it");

const pluginSass = require("eleventy-plugin-sass");

module.exports = function (config) {
    config.addPlugin(syntaxHighlight);
    config.addPlugin(pluginSass, {
        watch: [
            "src/site/_assets/css/bundle.scss"
        ],
        outputDir: "dist/css-sass/"
    });

    // Savjee
    config.addLayoutAlias("default", "layouts/default.html");
    config.addLayoutAlias("post", "layouts/post.html");
    config.addLayoutAlias("video", "layouts/video.html");
    config.addLayoutAlias("page", "layouts/page.html");
    config.addLayoutAlias("course", "layouts/course.html");

    config.addFilter("md", function (content = "") {
        return markdownIt({ html: true }).render(content);
    });

    config.addLiquidFilter("getVideosInSeries", require('./src/utils/filters/getVideosInSeries'));

    config.addLiquidFilter("getFeatureableVideos", (collection) => {
        if (!Array.isArray(collection)) {
            throw new Error("getFeatureableVideos: first parameter is not an array");
        };
        
        return collection
            .filter(m => m.data.not_featureable === undefined || m.data.not_featureable === false)
            .reverse();
    });

    config.addCollection('posts', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/site/posts/**/*.md')
            .sort(function (a, b) {
                return b.date - a.date;
            });
    });

    config.addCollection('courses', (collectionApi) => {
       return collectionApi.getFilteredByGlob('src/site/courses/**/*.md');
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

    // Copy all resource files for courses (except the markdown files themselves)
    config.addPassthroughCopy("src/site/courses/**/*[^md]");
    
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

    // Custom "md" tag to render Markdown. This is used for the page excerpt,
    // which sometimes contains a markdown link.
    // Markdown excerpt > HTML > liquid strip_html filter
    config.addFilter("md", function (content = "") {
        return markdownIt({ html: true }).render(content);
    });

    return {
        dir: { input: 'src/site', output: 'dist', data: '_data' },
        // passthroughFileCopy: false,
        // templateFormats: ['njk', 'md', 'css', 'html', 'yml', 'txt'],
        // htmlTemplateEngine: 'njk'
    }
};
