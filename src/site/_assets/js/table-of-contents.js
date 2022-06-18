document.addEventListener('DOMContentLoaded', function () {
  const classlist = document.body.classList;

  // Check if classlist exists (old browsers don't have it), and if body has the
  // class "toc_enabled".
  if(classlist && classlist.contains('toc_enabled')){
    tocbot.init({
      // Where to render the table of contents.
      tocSelector: '.js-toc',

      // Where to grab the headings to build the table of contents.
      contentSelector: 'article',
      
      // Which headings to grab inside of the contentSelector element.
      // H1 is skipped, because it's used as the page title.
      headingSelector: 'h2, h3',
      
      // For headings inside relative or absolute positioned containers within content.
      hasInnerContainers: true,

      // Don't collapse any headings. By default, tocbot collapses everything,
      // and only shows subitems when the parent is active.
      collapseDepth: 6,
    });

    // The block containing the table-of-contents is hidden by default. Make it
    // visible, once it has been rendered (and we know that JS has ran)
    document.querySelector(".toc").classList.add("visible");
  }
});