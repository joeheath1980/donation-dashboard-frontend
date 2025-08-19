#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to match hardcoded API URLs
const API_URL_PATTERN = /process\.env\.REACT_APP_API_BASE_URL\s*\|\|\s*['"]http:\/\/localhost:3002['"]/g;
const API_URL_PATTERN_WITH_PATH = /\$\{process\.env\.REACT_APP_API_BASE_URL\s*\|\|\s*['"]http:\/\/localhost:3002['"]\}/g;
const FETCH_PATTERN = /fetch\s*\(\s*`?\$?\{?process\.env\.REACT_APP_API_BASE_URL\s*\|\|\s*['"]http:\/\/localhost:3002['"]\}?/g;

// Files to exclude from migration
const EXCLUDE_FILES = [
  'api.config.js',
  'api.service.js',
  'migrate-api-urls.js'
];

// Function to check if file should be excluded
function shouldExclude(filePath) {
  return EXCLUDE_FILES.some(file => filePath.includes(file));
}

// Function to migrate a single file
function migrateFile(filePath) {
  if (shouldExclude(filePath)) {
    console.log(`Skipping: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;

  // Check if file already imports API_CONFIG
  const hasApiConfigImport = content.includes("from '../config/api.config'") || 
                             content.includes("from '../../config/api.config'") ||
                             content.includes("from './config/api.config'");

  // Replace direct usage of process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'
  if (API_URL_PATTERN.test(content) || API_URL_PATTERN_WITH_PATH.test(content) || FETCH_PATTERN.test(content)) {
    
    // Add import if not present
    if (!hasApiConfigImport) {
      // Determine the correct import path based on file location
      const fileDir = path.dirname(filePath);
      const srcDir = path.join(process.cwd(), 'src');
      const relativeToSrc = path.relative(fileDir, srcDir);
      const configPath = path.join(relativeToSrc, 'config/api.config').replace(/\\/g, '/');
      
      // Add import after the last import statement or at the beginning
      const importStatement = `import { API_CONFIG } from '${configPath}';\n`;
      
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLastImport = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
      } else {
        content = importStatement + content;
      }
    }

    // Replace the patterns
    content = content.replace(API_URL_PATTERN, 'API_CONFIG.BASE_URL');
    content = content.replace(API_URL_PATTERN_WITH_PATH, '${API_CONFIG.BASE_URL}');
    content = content.replace(FETCH_PATTERN, 'fetch(`${API_CONFIG.BASE_URL}');
    
    // Also replace any standalone references in template literals
    content = content.replace(/\$\{process\.env\.REACT_APP_API_BASE_URL\s*\|\|\s*['"]http:\/\/localhost:3002['"]\}/g, '${API_CONFIG.BASE_URL}');
    
    modified = content !== originalContent;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrated: ${filePath}`);
    return true;
  }

  return false;
}

// Main migration function
function migrate() {
  console.log('🔍 Searching for files to migrate...\n');
  
  const pattern = path.join(process.cwd(), 'src', '**', '*.{js,jsx,ts,tsx}');
  const files = glob.sync(pattern);
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  files.forEach(file => {
    if (migrateFile(file)) {
      migratedCount++;
    } else if (!shouldExclude(file)) {
      skippedCount++;
    }
  });
  
  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Migrated: ${migratedCount} files`);
  console.log(`   ⏭️  Skipped: ${skippedCount} files`);
  console.log(`   📁 Total: ${files.length} files checked`);
  
  if (migratedCount > 0) {
    console.log('\n⚠️  Important: Please review the changes and test your application!');
    console.log('   Run: npm start');
  }
}

// Run migration
migrate();