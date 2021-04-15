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
        outputDir: "_site/css-sass/"
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
    config.addLiquidFilter("getFeatureable", require('./src/utils/filters/getFeaturable'));
    config.addLiquidFilter("reverse", require('./src/utils/filters/reverse'));
    config.addLiquidFilter("indexOf", require('./src/utils/filters/indexOf'));

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

            // Sort on the "uploadDate" that I've manually put it
            // Fallback to the "date" that Eleventy generates (based
            // on file creation date).
            .sort((a, b) => {
                return a.data.uploadDate - b.data.uploadDate;
            });
    });

    config.addShortcode("link", require('./src/utils/shortcode/link.js'));
    config.addPairedLiquidShortcode("bibtex", require('./src/utils/shortcode/bibtex'));

    config.addPassthroughCopy("src/site/assets");

    // Ignore all files starting with underscore (private files such as
    // thumbnail designs)
    config.addPassthroughCopy("src/site/uploads/**/(?!_)*");

    // Copy all resource files for courses (except the markdown files themselves)
    config.addPassthroughCopy("src/site/courses/**/*[^md]");
    config.addPassthroughCopy("src/site/projects/**/*[^md]");
    config.addPassthroughCopy("src/site/videos/**/*[^md]");
    config.addPassthroughCopy("src/site/robots.txt");
    
    // Extract excerpt for each post containing the <!--more--> tag
    // Used to construct SEO <meta> tags in <head>
    config.setFrontMatterParsingOptions({
        excerpt: true,
        // Optional, default is "---"
        excerpt_separator: "<!--more-->"
    });


    // Markdown option: external links should be opened in a 
    // new tab and not expose personal details
    const milaOptions = {
        pattern: /^https?:/,
        attrs: {
            target: "_blank",
            rel: "noopener noreferrer"
        }
    };

    // Main options for the Markdown renderer
    const markdownOptions = {
        // Allow HTML tags inside md files
        html: true,
    };

    const markdownLib = markdownIt(markdownOptions)
        // Makes sure that each external link opens in a new tab 
        .use(require("markdown-it-link-attributes"), milaOptions)

        // Generates anchors for all headings
        .use(require('markdown-it-anchor'))
        
        // Generate table of contents when asked (needs anchors to work)
        .use(require("markdown-it-table-of-contents"))

        // Lazy load all images by default (browser support needed)
        .use(require('markdown-it-image-lazy-loading'));

    config.setLibrary("md", markdownLib);

    // Custom "md" tag to render Markdown. This is used for the page excerpt,
    // which sometimes contains a markdown link.
    // Markdown excerpt > HTML > liquid strip_html filter
    config.addFilter("md", function (content = "") {
        return markdownIt({ html: true }).render(content);
    });

    return {
        dir: { input: 'src/site', output: '_site', data: '_data' },
    }
};
