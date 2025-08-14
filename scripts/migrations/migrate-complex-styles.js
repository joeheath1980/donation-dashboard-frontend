#!/usr/bin/env node

/**
 * Enhanced migration script for complex inline styles
 * Handles dynamic colors, conditional styles, and calculated values
 */

const fs = require('fs');
const path = require('path');

// Complex pattern replacements
const complexPatterns = [
  // Dynamic colors
  {
    name: 'Dynamic color with function',
    pattern: /style=\{\{\s*color:\s*([a-zA-Z]+)\((.*?)\)\s*\}\}/g,
    handler: (match, func, args) => {
      // Handle getStatusColor, getTierColor, etc.
      if (func === 'getStatusColor' || func === 'getConfidenceColor') {
        return `className={getStatusColorClass(${args})}`;
      } else if (func === 'getTierColor') {
        return `className={getTierColorClass(${args})}`;
      }
      return match; // Keep original if not recognized
    }
  },
  
  // Conditional display
  {
    name: 'Conditional display',
    pattern: /style=\{\{\s*display:\s*([^}]+\?[^:]+:[^}]+)\s*\}\}/g,
    handler: (match, condition) => {
      // Parse ternary: condition ? 'block' : 'none'
      const parts = condition.match(/(.+)\s*\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/);
      if (parts && parts[2] === 'block' && parts[3] === 'none') {
        return `className={${parts[1].trim()} ? 'display-block' : 'display-none'}`;
      } else if (parts && parts[2] === 'flex' && parts[3] === 'none') {
        return `className={${parts[1].trim()} ? 'display-flex' : 'display-none'}`;
      }
      return match;
    }
  },
  
  // Width percentage
  {
    name: 'Dynamic width percentage',
    pattern: /style=\{\{\s*width:\s*\`\$\{([^}]+)\}%\`\s*\}\}/g,
    handler: (match, expression) => {
      return `data-width={Math.round((${expression}) / 5) * 5}`;
    }
  },
  
  // Multiple margin values
  {
    name: 'Specific margin values',
    pattern: /style=\{\{\s*marginRight:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="mr-$1"'
  },
  {
    name: 'Specific margin left',
    pattern: /style=\{\{\s*marginLeft:\s*['"](\d+)px['"]\s*\}\}/g,
    replacement: 'className="ml-$1"'
  },
  
  // Background color literals
  {
    name: 'Background color success',
    pattern: /style=\{\{\s*backgroundColor:\s*['"]#10b981['"]\s*\}\}/g,
    replacement: 'className="bg-success"'
  },
  {
    name: 'Background color warning',
    pattern: /style=\{\{\s*backgroundColor:\s*['"]#f59e0b['"]\s*\}\}/g,
    replacement: 'className="bg-warning"'
  },
  
  // Text align center
  {
    name: 'Text align center',
    pattern: /style=\{\{\s*textAlign:\s*['"]center['"]\s*\}\}/g,
    replacement: 'className="text-center"'
  },
  
  // Cursor pointer
  {
    name: 'Cursor pointer',
    pattern: /style=\{\{\s*cursor:\s*['"]pointer['"]\s*\}\}/g,
    replacement: 'className="cursor-pointer"'
  },
  
  // Display none
  {
    name: 'Display none',
    pattern: /style=\{\{\s*display:\s*['"]none['"]\s*\}\}/g,
    replacement: 'className="display-none"'
  },
  
  // Inline block
  {
    name: 'Display inline-block',
    pattern: /style=\{\{\s*display:\s*['"]inline-block['"]\s*\}\}/g,
    replacement: 'className="inline-block"'
  }
];

function addImportsIfNeeded(content, filePath) {
  // Check if we need to add utility imports
  let needsImport = false;
  let importsToAdd = [];
  
  if (content.includes('getStatusColorClass') || content.includes('getTierColorClass')) {
    needsImport = true;
    importsToAdd.push("import { getStatusColorClass, getTierColorClass, getColorClass } from '../utils/dynamicStyles';");
  }
  
  if (needsImport && !content.includes('dynamicStyles')) {
    // Find the last import statement
    const importMatch = content.match(/^((?:import .+;\n)+)/m);
    if (importMatch) {
      const imports = importMatch[1];
      const newImports = imports + importsToAdd.join('\n') + '\n';
      content = content.replace(imports, newImports);
      console.log('  ✅ Added necessary imports');
    }
  }
  
  return content;
}

function migrateComplexFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changeLog = [];
    
    // Apply complex patterns
    complexPatterns.forEach(({ name, pattern, handler, replacement }) => {
      if (handler) {
        // Use handler function for complex replacements
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
          matches.forEach(match => {
            const newValue = handler(...match);
            if (newValue !== match[0]) {
              content = content.replace(match[0], newValue);
              modified = true;
              changeLog.push(name);
            }
          });
        }
      } else if (replacement) {
        // Use simple replacement
        const matches = content.match(pattern);
        if (matches) {
          content = content.replace(pattern, replacement);
          modified = true;
          changeLog.push(`${name} (${matches.length})`);
        }
      }
    });
    
    // Add imports if needed
    if (modified) {
      content = addImportsIfNeeded(content, filePath);
    }
    
    // Check for remaining styles
    const remainingStyles = content.match(/style=\{\{[^}]+\}\}/g);
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.basename(filePath)}: Migrated ${changeLog.length} pattern types`);
      changeLog.forEach(change => console.log(`   - ${change}`));
    }
    
    if (remainingStyles) {
      console.log(`   ⚠️  ${remainingStyles.length} styles remain`);
    }
    
    return { 
      modified, 
      changeCount: changeLog.length, 
      remainingCount: remainingStyles ? remainingStyles.length : 0,
      changes: changeLog
    };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { modified: false, changeCount: 0, remainingCount: 0 };
  }
}

// Priority files with most complex styles
const priorityFiles = [
  'src/components/AdminAnalyticsReporting.js',
  'src/components/AdminBusinessPartnerManagement.js',
  'src/components/AdminContentManagement.js',
  'src/components/AdminDonationManagement.js',
  'src/components/AdminReceiptApproval.js',
  'src/components/AdminSystemIntegration.js',
  'src/components/AdminUserManagement.js',
  'src/components/CharitySignupFlow.js',
  'src/components/PersonalImpactScore.js',
  'src/components/ImpactVisualization.js'
];

// Main execution
const args = process.argv.slice(2);

if (args[0] === '--priority') {
  console.log('\n🚀 Migrating priority files with complex styles...\n');
  
  let totalModified = 0;
  let totalChanges = 0;
  let totalRemaining = 0;
  
  priorityFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const result = migrateComplexFile(fullPath);
      if (result.modified) totalModified++;
      totalChanges += result.changeCount;
      totalRemaining += result.remainingCount;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`  Files modified: ${totalModified}/${priorityFiles.length}`);
  console.log(`  Pattern types migrated: ${totalChanges}`);
  console.log(`  Styles remaining: ${totalRemaining}`);
  
} else if (args[0]) {
  // Single file mode
  const filePath = path.resolve(args[0]);
  if (fs.existsSync(filePath)) {
    migrateComplexFile(filePath);
  } else {
    console.error(`❌ File not found: ${filePath}`);
  }
} else {
  console.log(`
Complex Style Migration Tool

Usage:
  node scripts/migrate-complex-styles.js [options]

Options:
  --priority          Migrate priority files with complex styles
  [file-path]         Migrate a specific file

This tool handles:
  - Dynamic colors (getStatusColor, getTierColor)
  - Conditional displays
  - Calculated widths
  - Specific margin/padding values
  `);
}