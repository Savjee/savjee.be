const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const pluginTOC = require('eleventy-plugin-toc');
const path = require('path');
const getAssetInfo = require("./src/utils/getAssetInfo.js");

module.exports = function (config) {

    // ----------------------- Plugins -----------------------
    config.addPlugin(syntaxHighlight);
    config.addPlugin(pluginTOC, {
        wrapper: "div",
        ul: true,
        wrapperClass: "toc-list",
    });


    // ----------------------- Layouts -----------------------
    [
        "default", "narrow", "post", "video", "page", "course", "newsletter",
    ].forEach((layoutName) => {
        config.addLayoutAlias(layoutName, `layouts/${layoutName}.html`);
    });


    // ----------------------- Custom filters -----------------------
    [
        "getVideosInSeries", "getFeatureable", "indexOf", "getRelated",
        "htmlImageSize", "groupByYear", "startsWith", "filterArrayStartsWith",
        "getThumbnailUrl", "getTitle"
    ].forEach((filterName) => {
        config.addLiquidFilter(filterName, 
            require('./src/utils/filters/' + filterName));
    });


    

    // ----------------------- Collections -----------------------
    config.addCollection('courses', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/site/courses/**/index.md');
     });

    config.addCollection('newsletter', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/site/newsletter/**/*.md');
    });

    config.addCollection('posts', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/site/posts/**/*.md')
            .sort(function (a, b) {
                return b.date - a.date;
            });
    });

    config.addCollection('videos', (collectionApi) => {
         return collectionApi.getFilteredByGlob('src/site/videos/**/*.md')
            .sort((a, b) => {
                return b.date - a.date;
            });
    });

    config.addCollection("tags", function (collection) {
        const tags = new Set();    
        for (const item of collection.getAll()) {
          if ("tags" in item.data) {
            for (const tag of item.data.tags) {
              tags.add(tag);
            }
          }
        }
    
        return [...tags].sort();
      });

    config.addCollection('trivia', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/site/trivia/**/*.md')
            .sort(function (a, b) {
                return b.date - a.date;
            });
    });

    // ----------------------- Custom shortcodes -----------------------
    config.addShortcode("link", require('./src/utils/shortcode/link.js'));
    config.addShortcode("assetUrl", require('./src/utils/shortcode/assetUrl.js'));
    config.addPairedShortcode("bibtex", require('eleventy-plugin-bibtex'));
    config.addPairedShortcode("xd_img", require('./src/utils/shortcode/xd_img'));
    config.addShortcode("baseUrl", () => "https://simplyexplained.com");


    // ----------------------- File copies -----------------------
    [
        // Copy all assets, except for JS and CSS files. Those are handled
        // below with cache-busting filenames.
        // TODO: this does still copy CSS files!
        "src/site/assets/**/*[^(js|css)]",
        "src/site/robots.txt",
       
        // Ignore all files starting with underscore (private files such as
        // thumbnail designs)
        "src/site/uploads/**/(?!_)*",

        // Copy all resource files (except the markdown files themselves)
        "src/site/courses/**/*[^md]",
        "src/site/projects/**/*[^md]",
        "src/site/videos/**/*[^md]",
        "src/site/newsletter/assets/**/*[^md]",
        "src/site/trivia/**/*[^md]",
    ].forEach(path => config.addPassthroughCopy(path));

    // Copy JS and CSS files but add a cache-busting hash to their filenames
    config.addPassthroughCopy("src/site/assets/", {
        expand: true,
        filter: ["**/*.js", "**/main.css"],
        rename: function(filePath) {
            const assetInfo = getAssetInfo("src/site/assets/" + filePath);
            const parsedPath = path.parse(filePath);
            const newFileName = path.join(parsedPath.dir, assetInfo.filename);
            return newFileName;
        },
    });

    
    // Extract excerpt for each post containing the <!--more--> tag
    // Used to construct SEO <meta> tags in <head>
    config.setFrontMatterParsingOptions({
        excerpt: true,
        excerpt_separator: "<!--more-->"
    });


    // Markdown option: external links should be opened in a 
    // new tab and not expose personal details
    const milaOptions = {
        matcher(href) {
            return href.match(/^https?:\/\//);
        },
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

        // Generates anchors for all headings (used for table of contents)
        .use(require('markdown-it-anchor'))

        // Generate table of contents when asked (needs anchors to work)
        // Needed for inline [[TOC]]
        .use(require("markdown-it-table-of-contents"))

        .use(require('markdown-it-footnote'))

        // Lazy load all images by default (browser support needed)
        .use(require('./src/utils/markdown-it-xd-images'), {
            image_size: true,
            base_path: __dirname + '/src/site',
        });

    config.setLibrary("md", markdownLib);

    config.addLiquidFilter("md", (content = "") => {
        return markdownLib.render(content);
    });

    config.setLiquidOptions({
        strictFilters: true,
        orderedFilterParameters: true,
        lenientIf: true,
      });
    
    return {
        dir: { input: 'src/site', output: '_site', data: '_data' },
    };
};
