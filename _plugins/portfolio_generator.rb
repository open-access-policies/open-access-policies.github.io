module Jekyll
  class PortfolioGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      # Read the portfolio markdown file
      portfolio_file = File.join(site.source, '_portfolio', 'items.md')
      
      if File.exist?(portfolio_file)
        content = File.read(portfolio_file)
        portfolio_items = parse_portfolio_markdown(content)
        
        # Store in site data
        site.data['portfolio_from_md'] = { 'portfolio_items' => portfolio_items }
      end
    end

    private

    def parse_portfolio_markdown(content)
      items = []
      sections = content.split(/^## /).reject(&:empty?)
      
      sections.each do |section|
        lines = section.strip.split("\n")
        next if lines.empty?
        
        title = lines[0].strip
        
        # Find image, description, and link
        image = nil
        description = nil
        link = nil
        
        lines.each do |line|
          if line.match(/!\[.*\]\((.*)\)/)
            image = $1
          elsif line.match(/\[(.*)\]\((.*)\)/) && !line.start_with?('!')
            link = $2
          elsif !line.empty? && !line.start_with?('!') && !line.start_with?('[') && !line.start_with?('---') && line != title
            description = line.strip if description.nil?
          end
        end
        
        # Set default gradient based on title
        gradient = case title.downcase
                  when /health/
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  when /streaming/
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  when /hire/
                    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
                  else
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  end
        
        items << {
          'title' => title,
          'description' => description,
          'image' => image,
          'link' => link,
          'gradient' => gradient
        }
      end
      
      items
    end
  end
end
