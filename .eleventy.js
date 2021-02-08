// const htmlmin = require("html-minifier");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const Cite = require('citation-js');
const Autolinker = require('autolinker');
const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  // Savjee
  eleventyConfig.addLayoutAlias("default", "layouts/default.html");
  eleventyConfig.addLayoutAlias("post", "layouts/post.html");
  eleventyConfig.addLayoutAlias("video", "layouts/video.html");
  eleventyConfig.addLayoutAlias("page", "layouts/page.html");

  eleventyConfig.addFilter("md", function (content = "") {
    return markdownIt({ html: true }).render(content);
  });

  /**
   * Liquid filter: getVideosInSeries 
   * 
   * Usage in liquid:
   *    {% assign vidsInSerie = collections.videos | getVideosInSeries: "Simply explained" %}
   * 
   * Takes the given video collection (parameter 1, before the pipe) 
   * and returns only the videos in a given series (param 2, string).
   */
  eleventyConfig.addLiquidFilter("getVideosInSeries", function(collection, serieName) {
    if(!Array.isArray(collection)){
      throw new Error("getVideosInSeries: first parameter is not an array");
    };
    if(typeof serieName !== "string"){
      throw new Error("getVideosInSeries: second parameter should be a string");
    }
    return collection.filter(m => m.data.series === serieName);
  });
  
  eleventyConfig.addCollection('posts', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/posts/**/*.md')
                        .sort(function(a, b) {
                          return b.date - a.date;
                        });
  });

  eleventyConfig.addCollection('videos', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/videos/**/*.md')
                        // .sort(function(a, b) {
                        //   return b.uploadDate - a.date;
                        // });
  });

  // Define a post_url Liquid tag for cross referencing
  // Original creator: https://rusingh.com/articles/2020/04/24/implement-jekyll-post-url-tag-11ty-shortcode/
  // Adapted by me to work with filename instead of slug.
  const linkHandler = function(collection, filename){
    try {
      if (collection.length < 1) {
        throw "Collection appears to be empty";
      }
      if (!Array.isArray(collection)) {
        throw "Collection is an invalid type - it must be an array!";
      }
      if (typeof filename !== "string") {
        throw "Filename is an invalid type - it must be a string!";
      }

      const found = collection.find(p => p.template.parsed.base.replace('.md', '') == filename.replace('.md', ''));
      if (found === 0 || found === undefined) {
        throw `${filename} not found in specified collection.`;
      } else {
        return found.url;
      }
    } catch (e) {
      console.error(
        `An error occured while searching for the url to ${collection} ${filename}. Details:`,
        e
      );
    }
  }

  // I should deprecate this, because Eleventy allows to link to all collection types
  // not just posts.
  eleventyConfig.addShortcode("post_url", linkHandler);

  // This should be used instead of post_url:
  eleventyConfig.addShortcode("link", linkHandler);


  eleventyConfig.addPairedLiquidShortcode("bibtex", async function(content, firstName, lastName) {
    let bibtexCounter = 1;

    // Parse bibtex string
    const input = await Cite.inputAsync(content);

    // Citation.js required unique IDs, so make sure they're unique.
    // I've always used "src" as ID, showing my BibTex incompetence.
    input.map(e => e.id = bibtexCounter++);

    // Put in Cite object and get HTML out of it!
    const data = new Cite(input);
    const html = data.format('bibliography', {
      format: 'html',
      template: 'apa',
      lang: 'en-US'
    });

    // Convert all links in the output HTML to actual <a> tags
    return Autolinker.link(html, {
      newWindow: true,
      email: false,
      phone: false,
      stripPrefix: false,
      stripTrailingSlash: false,
      className: "no-underline",
    });
  });

  eleventyConfig.setUseGitIgnore(false);

  // eleventyConfig.addWatchTarget("./_tmp");
  // eleventyConfig.addWatchTarget("./_tmp/timeline.css");

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/uploads");
  eleventyConfig.addPassthroughCopy({ "./_tmp": "assets/css" });
  // eleventyConfig.addPassthroughCopy({ "./_tmp/timeline.css": "./assets/timeline.css" });

  // eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
  //   if (
  //     process.env.ELEVENTY_PRODUCTION &&
  //     outputPath &&
  //     outputPath.endsWith(".html")
  //   ) {
  //     let minified = htmlmin.minify(content, {
  //       useShortDoctype: true,
  //       removeComments: true,
  //       collapseWhitespace: true,
  //     });
  //     return minified;
  //   }

  //   return content;
  // });

  // Extract excerpt for each post containing the <!--more--> tag
  // Used to construct SEO <meta> tags in <head>
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    // Optional, default is "---"
    excerpt_separator: "<!--more-->"
  });

    return {
      dir: { input: 'src', output: 'dist', data: '_data' },
      // passthroughFileCopy: false,
      // templateFormats: ['njk', 'md', 'css', 'html', 'yml', 'txt'],
      // htmlTemplateEngine: 'njk'
    }
};
