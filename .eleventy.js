// const htmlmin = require("html-minifier");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  // Savjee
  eleventyConfig.addLayoutAlias("default", "layouts/default.html");
  eleventyConfig.addLayoutAlias("post", "layouts/default.html");
  eleventyConfig.addLayoutAlias("video", "layouts/default.html");
  eleventyConfig.addLayoutAlias("page", "layouts/page.html");
  
  eleventyConfig.addCollection('posts', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/posts/**/*.md')
                        .sort(function(a, b) {
                          return b.date - a.date;
                        });
  });

  // Define a post_url Liquid tag for cross referencing
  // Original creator: https://rusingh.com/articles/2020/04/24/implement-jekyll-post-url-tag-11ty-shortcode/
  // Adapted by me to work with filename instead of slug.
  const linkHandler = function(collection, filename){
    // console.log("hi: ", collection[0].template.parsed.base);
    // return "";
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
        `An error occured while searching for the url to ${filename}. Details:`,
        e
      );
    }
  }

  // I should deprecate this, because Eleventy allows to link to all collection types
  // not just posts.
  eleventyConfig.addShortcode("post_url", linkHandler);

  // This should be used instead of post_url:
  eleventyConfig.addShortcode("link", linkHandler);

  eleventyConfig.setUseGitIgnore(false);

  eleventyConfig.addWatchTarget("./_tmp/style.css");
  eleventyConfig.addWatchTarget("./_tmp/timeline.css");

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
      // templateFormats: ['njk', 'md', 'css', 'html', 'yml'],
      // htmlTemplateEngine: 'njk'
    }
};
