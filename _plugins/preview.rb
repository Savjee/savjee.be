require 'liquid'

# Based on: http://kjetilvalle.com/posts/blogging-with-jekyll.html
module Jekyll
	module Preview
	  def preview(text, delimiter = '<!--more-->')
		text.split(delimiter)[0]
	  end
	end
end

Liquid::Template.register_filter(Jekyll::Preview)