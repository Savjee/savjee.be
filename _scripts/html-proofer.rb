require 'html-proofer'

HTMLProofer.check_directory("../_site", {

  # Ignore images without an ALT tag
  :alt_ignore => [/.*/],

  # Check external URLs
  :disable_external => true,

  :check_opengraph => true,
  :assume_extension => true,
  :cache => { :timeframe => '30d' },
  :parallel => { :in_processes => 2},

  # Timeout for checking external links = 10 seconds, verify the SSL certificates
  :typhoeus => { timeout: 10, :ssl_verifyhost => 2, :followlocation => true},
}).run