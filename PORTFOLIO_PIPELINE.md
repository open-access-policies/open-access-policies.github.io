# Portfolio Pipeline Documentation

This document explains the portfolio management system for the Open Access Policies website.

## Overview

The portfolio items have been refactored from inline HTML in `index.md` to a maintainable system using:

1. **Data-driven approach**: Portfolio items stored in `_data/portfolio.yml`
2. **Jekyll includes**: Templated rendering via `_includes/portfolio-grid.html`
3. **GitHub Actions**: Automatic deployment pipeline

## File Structure

```
├── _data/portfolio.yml              # YAML data for portfolio items
├── _includes/portfolio-grid.html    # Template for rendering portfolio grid
├── .github/workflows/pages.yml      # GitHub Actions workflow for deployment
└── build.sh                         # Local build script
```

## How It Works

### 1. Data Source

The system uses `_data/portfolio.yml` as the single source of truth for portfolio items.

### 2. YAML Format

Portfolio items in `_data/portfolio.yml` follow this structure:

```yaml
portfolio_items:
  - title: "Item Title"
    description: "Description text"
    image: "/path/to/image.jpg"
    link: "https://example.com"
    gradient: "linear-gradient(135deg, #color1, #color2)"
```

## Local Development

### Prerequisites

- Ruby (3.1+)
- Bundler gem

### Setup

1. Install dependencies:
   ```bash
   bundle install
   ```

2. Build the site:
   ```bash
   ./build.sh
   ```

3. Serve locally:
   ```bash
   bundle exec jekyll serve
   ```

### Adding Portfolio Items

Edit `_data/portfolio.yml` and add your item to the `portfolio_items` array following the YAML structure above.

## Deployment

The site uses GitHub Actions for automatic deployment:

- **Trigger**: Push to `main` branch
- **Workflow**: `.github/workflows/pages.yml`
- **Output**: GitHub Pages site

### Manual Deployment

You can also deploy manually:

1. Build locally: `./build.sh`
2. Push `_site` contents to your hosting provider

## Customization

### Styling

The portfolio grid styling is in `_includes/portfolio-grid.html`. Key CSS classes:

- `.portfolio-grid`: Main grid container
- `.portfolio-item`: Individual portfolio item
- `.portfolio-item:hover`: Hover effects

### Layout

Grid layout is responsive and uses CSS Grid:
- `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
- Automatically adjusts to screen size
- 2rem gap between items

### Plugin Customization

Since the system now uses only YAML data, no custom plugins are needed. The portfolio data is directly accessible via Jekyll's data system.

## Troubleshooting

### Build Issues

1. **Plugin not working**: Ensure `_plugins` directory is included in your repository
2. **Styles not loading**: Check that CSS is properly included in your layout
3. **Images not showing**: Verify image paths are correct and files exist

### GitHub Pages Issues

1. **Permissions**: Ensure your repository has Pages enabled and proper permissions set.

### Local Development Issues

1. **Bundle install fails**: Ensure you have Ruby 3.1+ installed
2. **Jekyll serve fails**: Check for syntax errors in your files
3. **Changes not reflecting**: Try clearing Jekyll cache: `bundle exec jekyll clean`

## Benefits of This Approach

1. **Simplicity**: Single YAML file as source of truth
2. **Maintainability**: Easy to add/edit portfolio items
3. **GitHub Pages Compatible**: No custom plugins required
4. **Separation of Concerns**: Content separated from presentation
5. **Version Control Friendly**: Changes are easier to track
6. **Automation**: Automatic deployment via GitHub Actions
