const markdownIt = require("markdown-it");

/**
 * Custom "md" tag to render Markdown. This is used for the page excerpt,
 * which sometimes contains a markdown link. 
 * Markdown excerpt > HTML > liquid strip_html filter.
 * 
 * @param {string} content Markdown content
 * @returns {string} Rendered HTML
 */
module.exports = (content = "") => {
    return markdownIt({ html: true }).render(content);
}
