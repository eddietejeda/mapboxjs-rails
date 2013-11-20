require "bundler/gem_tasks"
require 'fileutils'

desc "Build mapbox.js from source."
task :build_source do
  path = ENV["MAPBOX_JS_PATH"]
  `cd #{path} && make`
  ["mapbox.js", "mapbox.private.js","mapbox.uncompressed.js"].each do |js_file|
    FileUtils.cp "#{path}/dist/#{js_file}", "./vendor/assets/javascripts/#{js_file}", preserve: false
  end
  FileUtils.cp "#{path}/theme/style.css", "./vendor/assets/stylesheets/mapbox.css"
end
