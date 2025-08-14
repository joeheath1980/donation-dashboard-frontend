#!/usr/bin/env node

/**
 * Final migration for compound inline styles
 */

const fs = require('fs');
const path = require('path');

// Compound style patterns
const compoundPatterns = [
  // Display flex with gap and other properties
  {
    pattern: /style=\{\{\s*display:\s*['"]flex['"],\s*gap:\s*['"](\d+)px['"],\s*marginBottom:\s*['"](\d+)px['"],\s*flexWrap:\s*['"]wrap['"]\s*\}\}/g,
    replacement: 'className="display-flex gap-$1 mb-$2 flex-wrap"'
  },
  {
    pattern: /style=\{\{\s*display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="flex-align-center gap-$1"'
  },
  {
    pattern: /style=\{\{\s*display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*['"](\d+)['"]\s*\}\}/g,
    replacement: 'className="flex-align-center gap-$1"'
  },
  
  // Text with padding
  {
    pattern: /style=\{\{\s*textAlign:\s*['"]center['"],\s*padding:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="text-center p-$1"'
  },
  {
    pattern: /style=\{\{\s*padding:\s*['"]2rem['"],\s*textAlign:\s*['"]center['"]\s*\}\}/g,
    replacement: 'className="p-2rem text-center"'
  },
  
  // Font size with color
  {
    pattern: /style=\{\{\s*fontSize:\s*['"](\d+)px['"],\s*color:\s*['"]#6c757d['"],\s*marginTop:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="font-size-$1 text-muted mt-$2"'
  },
  {
    pattern: /style=\{\{\s*fontSize:\s*['"](\d+)px['"],\s*color:\s*['"]#666['"]\s*\}\}/g,
    replacement: 'className="font-size-$1 text-muted"'
  },
  {
    pattern: /style=\{\{\s*fontSize:\s*['"](\d+)px['"],\s*color:\s*['"]#6c757d['"]\s*\}\}/g,
    replacement: 'className="font-size-$1 text-muted"'
  },
  {
    pattern: /style=\{\{\s*fontSize:\s*['"](\d+)px['"],\s*padding:\s*['"](\d+)px\s+(\d+)px['"]\s*\}\}/g,
    replacement: 'className="font-size-$1 p-$2px-$3px"'
  },
  
  // Max width
  {
    pattern: /style=\{\{\s*maxWidth:\s*['"]150px['"]\s*\}\}/g,
    replacement: 'className="max-width-150"'
  },
  
  // Margin with color
  {
    pattern: /style=\{\{\s*marginLeft:\s*['"](\d+)px['"],\s*padding:\s*['"]\d+px\s+\d+px['"],\s*fontSize:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="ml-$1 p-2px-8px font-size-$2"'
  },
  
  // Text transform
  {
    pattern: /style=\{\{\s*textTransform:\s*['"]capitalize['"]\s*\}\}/g,
    replacement: 'className="text-capitalize"'
  },
  
  // Color only patterns
  {
    pattern: /style=\{\{\s*color:\s*['"]#2d8f7b['"]\s*\}\}/g,
    replacement: 'className="color-hex-2d8f7b"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#f59e0b['"]\s*\}\}/g,
    replacement: 'className="color-hex-f59e0b"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#ef4444['"]\s*\}\}/g,
    replacement: 'className="color-hex-ef4444"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#ec4899['"]\s*\}\}/g,
    replacement: 'className="color-hex-ec4899"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#3b82f6['"]\s*\}\}/g,
    replacement: 'className="color-hex-3b82f6"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#FFD700['"]\s*\}\}/gi,
    replacement: 'className="color-hex-ffd700"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#856404['"]\s*\}\}/g,
    replacement: 'className="color-hex-856404"'
  },
  {
    pattern: /style=\{\{\s*color:\s*['"]#0d47a1['"]\s*\}\}/g,
    replacement: 'className="color-hex-0d47a1"'
  },
  
  // Background patterns
  {
    pattern: /style=\{\{\s*background:\s*['"]none['"]\s*\}\}/g,
    replacement: 'className="bg-none"'
  },
  
  // Width auto
  {
    pattern: /style=\{\{\s*width:\s*['"]auto['"]\s*\}\}/g,
    replacement: 'className="width-auto"'
  },
  
  // Complex margin patterns
  {
    pattern: /style=\{\{\s*marginBottom:\s*['"]1\.5rem['"]\s*,\s*color:\s*['"]#666['"]\s*\}\}/g,
    replacement: 'className="mb-1-5rem text-muted"'
  },
  {
    pattern: /style=\{\{\s*fontSize:\s*['"]3rem['"],\s*color:\s*['"]#666['"],\s*marginBottom:\s*['"]20px['"]\s*\}\}/g,
    replacement: 'className="font-size-3rem text-muted mb-20"'
  },
  
  // Height patterns
  {
    pattern: /style=\{\{\s*maxHeight:\s*['"]400px['"],\s*overflowY:\s*['"]auto['"]\s*\}\}/g,
    replacement: 'className="max-height-400 overflow-y-auto"'
  },
  
  // Flex shrink
  {
    pattern: /style=\{\{\s*color:\s*['"]#2d8f7b['"],\s*flexShrink:\s*0\s*\}\}/g,
    replacement: 'className="color-hex-2d8f7b flex-shrink-0"'
  },
  
  // Text align with margin
  {
    pattern: /style=\{\{\s*textAlign:\s*['"]center['"],\s*marginTop:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="text-center mt-$1"'
  }
];

function migrateFinalPatterns(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changeCount = 0;
    
    compoundPatterns.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        changeCount += matches.length;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.basename(filePath)}: ${changeCount} patterns migrated`);
    }
    
    // Count remaining
    const remaining = content.match(/style=\{\{[^}]+\}\}/g);
    if (remaining) {
      console.log(`   ${remaining.length} styles remain`);
    }
    
    return { modified, changeCount, remaining: remaining ? remaining.length : 0 };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { modified: false, changeCount: 0, remaining: 0 };
  }
}

// Find all files with inline styles
function findFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findFiles(itemPath));
    } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
      const content = fs.readFileSync(itemPath, 'utf8');
      if (content.includes('style={{')) {
        files.push(itemPath);
      }
    }
  });
  
  return files;
}

// Run migration
console.log('\n🎯 Final migration pass...\n');

const srcPath = path.join(process.cwd(), 'src/components');
const files = findFiles(srcPath);

let totalModified = 0;
let totalPatterns = 0;
let totalRemaining = 0;

files.forEach(file => {
  const result = migrateFinalPatterns(file);
  if (result.modified) {
    totalModified++;
    totalPatterns += result.changeCount;
  }
  totalRemaining += result.remaining;
});

console.log('\n📊 Final Summary:');
console.log(`  Files modified: ${totalModified}`);
console.log(`  Patterns migrated: ${totalPatterns}`);
console.log(`  Total remaining: ${totalRemaining}`);