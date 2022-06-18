document.addEventListener('DOMContentLoaded', function () {
  if(document.body.classList.contains('toc_enabled')){
    tocbot.init({
      // Where to render the table of contents.
      tocSelector: '.js-toc',
      // Where to grab the headings to build the table of contents.
      contentSelector: 'article',
      // Which headings to grab inside of the contentSelector element.
      headingSelector: 'h2, h3',
      // For headings inside relative or absolute positioned containers within content.
      hasInnerContainers: true,
      collapseDepth: 6,
    });

    // The block containing the table-of-contents is hidden by default. Make it
    // visible, once it has been rendered (and we know that JS has ran)
    document.querySelector(".toc").style.display = "block";
  }
});