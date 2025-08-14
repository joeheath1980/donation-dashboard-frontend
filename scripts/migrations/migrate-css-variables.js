#!/usr/bin/env node

/**
 * Migration script for CSS variables and complex inline styles
 */

const fs = require('fs');
const path = require('path');

// CSS Variable patterns
const cssVariablePatterns = [
  // CSS custom properties
  {
    name: 'CSS Variable - tier color',
    pattern: /style=\{\{\s*['"]--tier-color['"]\s*:\s*getTierColor\(([^)]+)\)\s*\}\}/g,
    replacement: 'data-tier-color={getTierColor($1)}'
  },
  {
    name: 'CSS Variable - category color',
    pattern: /style=\{\{\s*['"]--category-color['"]\s*:\s*([^}]+)\s*\}\}/g,
    replacement: 'data-category-color={$1}'
  },
  {
    name: 'CSS Variable - action color',
    pattern: /style=\{\{\s*['"]--action-color['"]\s*:\s*([^}]+)\s*\}\}/g,
    replacement: 'data-action-color={$1}'
  },
  {
    name: 'CSS Variable - hover color',
    pattern: /style=\{\{\s*['"]--hover-color['"]\s*:\s*([^}]+)\s*\}\}/g,
    replacement: 'data-hover-color={$1}'
  },
  {
    name: 'CSS Variable - ring color',
    pattern: /style=\{\{\s*['"]--ring-color['"]\s*:\s*([^}]+)\s*\}\}/g,
    replacement: 'data-ring-color={$1}'
  },
  
  // Spread operators
  {
    name: 'Spread with display block',
    pattern: /style=\{\{\s*\.\.\.style,\s*display:\s*['"]block['"]\s*\}\}/g,
    replacement: 'className="style-spread-base display-block"'
  },
  {
    name: 'Spread with style',
    pattern: /style=\{\{\s*\.\.\.style\s*\}\}/g,
    replacement: 'className="style-spread-base"'
  },
  
  // Conditional opacity
  {
    name: 'Transition opacity',
    pattern: /style=\{\{\s*transition:\s*['"]opacity\s+[^'"]+['"]\s*\}\}/g,
    replacement: 'className="opacity-transition"'
  },
  
  // Dynamic height
  {
    name: 'Height conditional',
    pattern: /style=\{\{\s*height:\s*detailed\s*\?\s*['"]400px['"]\s*:\s*['"]300px['"]\s*\}\}/g,
    replacement: 'className={detailed ? "height-detailed-400" : "height-simple-300"}'
  },
  
  // Background colors with functions
  {
    name: 'Background getTierColor',
    pattern: /style=\{\{\s*backgroundColor:\s*getTierColor\(([^)]+)\)\s*\}\}/g,
    replacement: 'data-tier-color={getTierColor($1)} className="bg-tier"'
  },
  {
    name: 'Background getStatusColor',
    pattern: /style=\{\{\s*backgroundColor:\s*getStatusColor\(([^)]+)\)\s*\}\}/g,
    replacement: 'data-status-color={getStatusColor($1)} className="bg-status"'
  },
  {
    name: 'Background getCategoryColor',
    pattern: /style=\{\{\s*background:\s*getCategoryColor\(([^)]+)\)\s*\}\}/g,
    replacement: 'data-category-color={getCategoryColor($1)} className="bg-category"'
  },
  
  // Color with functions
  {
    name: 'Color getScoreColor',
    pattern: /style=\{\{\s*color:\s*getScoreColor\(([^)]+)\)\s*\}\}/g,
    replacement: 'data-score-color={getScoreColor($1)} className="dynamic-color"'
  },
  {
    name: 'Color getTierColor',
    pattern: /style=\{\{\s*color:\s*getTierColor\(([^)]+)\)\s*\}\}/g,
    replacement: 'data-tier-color={getTierColor($1)} className="tier-color"'
  },
  
  // Margin right specific values
  {
    name: 'marginRight 8px',
    pattern: /style=\{\{\s*marginRight:\s*['"]8px['"]\s*\}\}/g,
    replacement: 'className="mr-8"'
  },
  {
    name: 'marginRight 10px',
    pattern: /style=\{\{\s*marginRight:\s*['"]10px['"]\s*\}\}/g,
    replacement: 'className="mr-10"'
  },
  
  // Display none
  {
    name: 'display none',
    pattern: /style=\{\{\s*display:\s*['"]none['"]\s*\}\}/g,
    replacement: 'className="display-none"'
  },
  
  // Border radius
  {
    name: 'borderRadius 6px with gradient',
    pattern: /style=\{\{\s*borderRadius:\s*['"]6px['"],\s*background:\s*[^}]+\}\}/g,
    replacement: 'className="border-rounded-6 bg-gradient-primary"'
  },
  
  // Complex conditionals
  {
    name: 'Color with ternary',
    pattern: /style=\{\{\s*color:\s*isPositive\s*\?\s*['"]#10b981['"]\s*:\s*['"]#dc2626['"]\s*\}\}/g,
    replacement: 'className={isPositive ? "text-success" : "text-danger"}'
  },
  
  // Font size specific
  {
    name: 'fontSize 20px',
    pattern: /style=\{\{\s*color:\s*['"]#856404['"],\s*fontSize:\s*['"]20px['"]\s*\}\}/g,
    replacement: 'className="color-hex-856404 font-size-20"'
  },
  
  // Layout specific
  {
    name: 'layout horizontal',
    pattern: /style=\{\{\s*layout:\s*["']horizontal["']\s*\}\}/g,
    replacement: 'data-layout="horizontal"'
  }
];

function migrateCSSVariables(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changeLog = [];
    
    cssVariablePatterns.forEach(({ name, pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        changeLog.push(`${name} (${matches.length})`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.basename(filePath)}: ${changeLog.length} patterns migrated`);
      changeLog.forEach(change => console.log(`   - ${change}`));
    }
    
    const remaining = content.match(/style=\{\{[^}]+\}\}/g);
    if (remaining) {
      console.log(`   ⚠️  ${remaining.length} styles remain`);
      // Show first few remaining for debugging
      remaining.slice(0, 3).forEach(style => {
        console.log(`      ${style.substring(0, 60)}...`);
      });
    } else if (modified) {
      console.log(`   ✨ All inline styles removed!`);
    }
    
    return { modified, changeCount: changeLog.length, remaining: remaining ? remaining.length : 0 };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { modified: false, changeCount: 0, remaining: 0 };
  }
}

// Main execution
const args = process.argv.slice(2);

if (args[0] === '--all') {
  console.log('\n🎯 Migrating CSS variables and complex patterns...\n');
  
  const srcPath = path.join(process.cwd(), 'src/components');
  const files = require('fs').readdirSync(srcPath, { recursive: true })
    .filter(file => file.endsWith('.js') || file.endsWith('.jsx'))
    .map(file => path.join(srcPath, file));
  
  let totalModified = 0;
  let totalMigrated = 0;
  let totalRemaining = 0;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('style={{')) {
      const result = migrateCSSVariables(file);
      if (result.modified) totalModified++;
      totalMigrated += result.changeCount;
      totalRemaining += result.remaining;
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`  Files modified: ${totalModified}`);
  console.log(`  Patterns migrated: ${totalMigrated}`);
  console.log(`  Styles remaining: ${totalRemaining}`);
  
} else if (args[0]) {
  const filePath = path.resolve(args[0]);
  if (fs.existsSync(filePath)) {
    migrateCSSVariables(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
} else {
  console.log(`
CSS Variables Migration Tool

Usage:
  node scripts/migrate-css-variables.js --all
  node scripts/migrate-css-variables.js [file-path]

This tool migrates:
  - CSS custom properties (--variable-name)
  - Spread operators
  - Complex conditionals
  - Dynamic colors and backgrounds
  `);
}