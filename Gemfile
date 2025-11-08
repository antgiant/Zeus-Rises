source "https://rubygems.org"

# Use a standalone Jekyll toolchain in Actions that we control. We will
# precompile the theme's SCSS with Dart Sass in the workflow to avoid the
# older Sass compiler incompatibility in the github-pages gem.
gem "jekyll", "~> 4.2"
gem "bundler", "~> 2.4"

group :jekyll_plugins do
	gem "jekyll-remote-theme"
	gem "jekyll-feed"
	gem "jekyll-seo-tag"
	gem "jekyll-sitemap"
	gem "jekyll-paginate"
	gem "jekyll-relative-links"
end
