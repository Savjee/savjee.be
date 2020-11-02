require 'bibtex'
require 'citeproc'
require 'csl/styles'

module Jekyll
    class BibtexBlock < Liquid::Block
        def render(context)
            content = super

            testing = BibTeX.parse(content)
            testing.replace

            cp = CiteProc::Processor.new style: 'apa', format: 'html'
            cp.import testing.to_citeproc

            out = testing['@entry, @meta_content'].map do |e|
                if e.entry?
                    citation = cp.render :bibliography, :id => e.key
                    citation = citation.join.gsub(/(?<!"|'|>)https?:\/\/[\S]+/, '<a href="\0" rel="nofollow">\0</a>')
                    "<p>" + citation + "</p>"
                else
                    e.to_s
                end
            end

            return "<div class='bibtex-sources'>" + out.join + "</div>"
        end
    end
end

Liquid::Template.register_tag('bibtex', Jekyll::BibtexBlock)
