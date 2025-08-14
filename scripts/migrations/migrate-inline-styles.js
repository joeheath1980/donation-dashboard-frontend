#!/usr/bin/env node

/**
 * Script to help migrate inline styles to CSS classes for CSP compliance
 * Run: node scripts/migrate-inline-styles.js [component-path]
 */

const fs = require('fs');
const path = require('path');

// Common inline style patterns and their replacements
const stylePatterns = [
  {
    pattern: /style=\{\{\s*display:\s*['"]flex['"]\s*\}\}/g,
    replacement: 'className="display-flex"'
  },
  {
    pattern: /style=\{\{\s*display:\s*['"]flex['"],\s*gap:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="display-flex gap-$1"'
  },
  {
    pattern: /style=\{\{\s*display:\s*['"]flex['"],\s*gap:\s*['"](\d+)px['"],\s*marginBottom:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="display-flex gap-$1 mb-$2"'
  },
  {
    pattern: /style=\{\{\s*fontSize:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="font-size-$1"'
  },
  {
    pattern: /style=\{\{\s*fontSize:\s*['"](\d+)px['"],\s*color:\s*['"]#6c757d['"]\s*\}\}/g,
    replacement: 'className="font-size-$1 text-muted"'
  },
  {
    pattern: /style=\{\{\s*marginTop:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="mt-$1"'
  },
  {
    pattern: /style=\{\{\s*marginBottom:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="mb-$1"'
  },
  {
    pattern: /style=\{\{\s*padding:\s*['"](\d+)px\s+(\d+)px['"]\s*\}\}/g,
    replacement: 'className="p-$1"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#10b981['"]\s*\}\}/g,
    replacement: 'className="text-success"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#dc2626['"]\s*\}\}/g,
    replacement: 'className="text-danger"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#6c757d['"]\s*\}\}/g,
    replacement: 'className="text-muted"'
  }
];

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changeCount = 0;

    // Apply each pattern
    stylePatterns.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        changeCount += matches.length;
      }
    });

    // Look for remaining inline styles
    const remainingStyles = content.match(/style=\{\{[^}]+\}\}/g);
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Migrated ${changeCount} inline styles in ${path.basename(filePath)}`);
    }
    
    if (remainingStyles) {
      console.log(`⚠️  ${remainingStyles.length} complex inline styles remain in ${path.basename(filePath)}`);
      remainingStyles.forEach(style => {
        console.log(`   - ${style.substring(0, 50)}...`);
      });
    } else if (modified) {
      console.log(`✨ All inline styles migrated successfully!`);
    }
    
    return { modified, changeCount, remainingCount: remainingStyles ? remainingStyles.length : 0 };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return { modified: false, changeCount: 0, remainingCount: 0 };
  }
}

function findFilesWithInlineStyles(dir) {
  const files = [];
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(itemPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
        const content = fs.readFileSync(itemPath, 'utf8');
        if (content.includes('style={{')) {
          files.push(itemPath);
        }
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Main execution
const args = process.argv.slice(2);

if (args[0] === '--scan') {
  // Scan mode: find all files with inline styles
  const srcPath = path.join(process.cwd(), 'src');
  const files = findFilesWithInlineStyles(srcPath);
  
  console.log(`\n📊 Found ${files.length} files with inline styles:\n`);
  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`  - ${relativePath}`);
  });
  
} else if (args[0] === '--batch') {
  // Batch mode: migrate simple patterns in all files
  const srcPath = path.join(process.cwd(), 'src');
  const files = findFilesWithInlineStyles(srcPath);
  
  console.log(`\n🚀 Starting batch migration of ${files.length} files...\n`);
  
  let totalChanges = 0;
  let totalRemaining = 0;
  let filesModified = 0;
  
  files.forEach(file => {
    const result = migrateFile(file);
    if (result.modified) filesModified++;
    totalChanges += result.changeCount;
    totalRemaining += result.remainingCount;
  });
  
  console.log(`\n📈 Migration Summary:`);
  console.log(`  - Files modified: ${filesModified}/${files.length}`);
  console.log(`  - Inline styles migrated: ${totalChanges}`);
  console.log(`  - Complex styles remaining: ${totalRemaining}`);
  
} else if (args[0]) {
  // Single file mode
  const filePath = path.resolve(args[0]);
  if (fs.existsSync(filePath)) {
    migrateFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
} else {
  // Help
  console.log(`
CSP Inline Styles Migration Tool

Usage:
  node scripts/migrate-inline-styles.js [options]

Options:
  --scan              Find all files with inline styles
  --batch             Migrate simple patterns in all files
  [file-path]         Migrate a specific file

Examples:
  node scripts/migrate-inline-styles.js --scan
  node scripts/migrate-inline-styles.js --batch
  node scripts/migrate-inline-styles.js src/components/MyComponent.js
  `);
}