const htmlmin = require("html-minifier");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  // Savjee
  eleventyConfig.addLayoutAlias("default", "layouts/default.html");
  eleventyConfig.addLayoutAlias("post", "layouts/default.html");
  eleventyConfig.addLayoutAlias("video", "layouts/default.html");

  eleventyConfig.addCollection('posts', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/posts/*.md');
  });

  eleventyConfig.setUseGitIgnore(false);

  eleventyConfig.addWatchTarget("./_tmp/style.css");

  eleventyConfig.addPassthroughCopy({ "./_tmp/style.css": "./style.css" });

  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith(".html")
    ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

    return {
      dir: { input: 'src', output: 'dist', data: '_data' },
      // passthroughFileCopy: false,
      // templateFormats: ['njk', 'md', 'css', 'html', 'yml'],
      // htmlTemplateEngine: 'njk'
    }
};
