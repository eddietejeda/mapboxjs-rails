# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'mapboxjs/rails/version'

Gem::Specification.new do |spec|
  spec.name          = "mapboxjs-rails"
  spec.version       = Mapboxjs::Rails::VERSION
  spec.authors       = ["eddietejeda"]
  spec.email         = ["eddie@codeforamerica.org"]
  spec.description   = %q{Mapboxjs for rails}
  spec.summary       = %q{Mapboxjs for rails}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_dependency "railties", ">= 3.1"

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end
