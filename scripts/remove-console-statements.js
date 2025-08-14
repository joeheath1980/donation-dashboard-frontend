#!/usr/bin/env node

/**
 * Remove Console Statements Script
 * Removes console.log, console.warn, console.error from production code
 * Keeps console statements in specific utility files
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

let totalRemoved = 0;
let filesModified = 0;

// Files where console statements should be preserved
const preserveInFiles = [
  'logger.js',
  'logger.ts',
  'debug.js',
  'debug.ts',
  '.test.js',
  '.spec.js',
  'csrf.service.js', // Logging is important for CSRF debugging
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function shouldPreserveFile(filePath) {
  return preserveInFiles.some(pattern => filePath.includes(pattern));
}

function removeConsoleStatements(filePath) {
  if (shouldPreserveFile(filePath)) {
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Patterns to match console statements
  const patterns = [
    // Simple console statements on single line
    /^\s*console\.(log|warn|error|debug|info|trace|table|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml|profile|profileEnd)\([^)]*\);?\s*$/gm,
    
    // Multi-line console statements
    /^\s*console\.(log|warn|error|debug|info|trace|table|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml|profile|profileEnd)\([^)]*\n[^)]*\);?\s*$/gm,
    
    // Console statements with template literals
    /^\s*console\.(log|warn|error|debug|info|trace|table)\(`[^`]*`\);?\s*$/gm,
    
    // Console statements in conditionals (keep the conditional structure)
    /if\s*\([^)]*\)\s*{\s*console\.(log|warn|error|debug|info)[^}]*}\s*/g,
    
    // Inline console statements (be careful with these)
    /[,;]\s*console\.(log|warn|error|debug|info)\([^)]*\)[,;]?/g,
  ];

  let removedCount = 0;
  
  // Remove console statements
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      removedCount += matches.length;
      content = content.replace(pattern, (match) => {
        // If it's in a conditional, keep the conditional structure
        if (match.includes('if')) {
          return match.replace(/console\.[^;]*;?/, '// Console statement removed');
        }
        // If it's inline, replace with empty string
        if (match.startsWith(',') || match.startsWith(';')) {
          return '';
        }
        // Otherwise, leave an empty line to preserve line numbers
        return '';
      });
    }
  });

  // Clean up multiple empty lines (more than 2 consecutive)
  content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
  
  // Only write if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return removedCount;
  }
  
  return 0;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!['node_modules', '.git', 'build', 'dist', 'coverage'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const removed = removeConsoleStatements(filePath);
      if (removed > 0) {
        const relativePath = path.relative(rootDir, filePath);
        log(`  ✅ Removed ${removed} console statement(s) from ${relativePath}`, 'green');
        totalRemoved += removed;
        filesModified++;
      }
    }
  });
}

function main() {
  log('🧹 Removing Console Statements', 'magenta');
  log('═══════════════════════════════════════\n', 'magenta');
  
  const startTime = Date.now();
  
  try {
    processDirectory(srcDir);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n📊 Summary', 'blue');
    log('═══════════════════════════════════════', 'blue');
    log(`  Total console statements removed: ${totalRemoved}`, totalRemoved > 0 ? 'green' : 'yellow');
    log(`  Files modified: ${filesModified}`, filesModified > 0 ? 'green' : 'yellow');
    log(`  Time taken: ${duration}s`, 'blue');
    
    if (totalRemoved > 0) {
      log('\n✨ Console statements removed successfully!', 'green');
      log('📝 Note: Please test your application to ensure no critical logging was removed.', 'yellow');
    } else {
      log('\n✅ No console statements found to remove!', 'green');
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Add a dry-run option
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  log('🔍 DRY RUN MODE - No files will be modified', 'yellow');
  log('═══════════════════════════════════════\n', 'yellow');
  
  // In dry run, just count the console statements
  let count = 0;
  
  function countConsoleStatements(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'build'].includes(file)) {
        countConsoleStatements(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(/console\.(log|warn|error|debug|info)/g);
        if (matches) {
          const relativePath = path.relative(rootDir, filePath);
          log(`  Found ${matches.length} console statement(s) in ${relativePath}`, 'yellow');
          count += matches.length;
        }
      }
    });
  }
  
  countConsoleStatements(srcDir);
  log(`\n📊 Total console statements found: ${count}`, 'yellow');
  log('Run without --dry-run to remove them.', 'yellow');
} else {
  main();
}