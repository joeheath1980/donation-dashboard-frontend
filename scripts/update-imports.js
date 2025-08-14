#!/usr/bin/env node

/**
 * Update Imports Script
 * Updates import statements for consolidated components
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

let filesUpdated = 0;
let importsUpdated = 0;

// Import mappings for consolidated components
const importMappings = [
  {
    old: ['./LoadingSpinner', '../LoadingSpinner', './components/LoadingSpinner'],
    new: './Common/LoadingSpinner',
    componentPath: 'components/Common/LoadingSpinner'
  },
  {
    old: ['./CharitySearch', '../CharitySearch', './components/CharitySearch'],
    new: './CharitySearch/CharitySearch',
    componentPath: 'components/CharitySearch/CharitySearch'
  },
  {
    old: ['./components/CharityProfileEditor'],
    new: './components/CharityProfileEditor/CharityProfileEditor',
    componentPath: 'components/CharityProfileEditor/CharityProfileEditor'
  }
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

function getRelativePath(from, to) {
  const fromDir = path.dirname(from);
  let relativePath = path.relative(fromDir, to);
  
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  // Remove .js extension if present
  relativePath = relativePath.replace(/\.js$/, '');
  
  return relativePath;
}

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let updated = 0;
  
  importMappings.forEach(mapping => {
    mapping.old.forEach(oldImport => {
      // Match various import patterns
      const patterns = [
        // import LoadingSpinner from './LoadingSpinner'
        new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
        // import { LoadingSpinner } from './LoadingSpinner'
        new RegExp(`import\\s+{([^}]+)}\\s+from\\s+['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
        // const LoadingSpinner = require('./LoadingSpinner')
        new RegExp(`const\\s+(\\w+)\\s+=\\s+require\\(['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`, 'g'),
      ];
      
      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          // Calculate the correct relative path
          const componentFullPath = path.join(srcDir, mapping.componentPath + '.js');
          const newImportPath = getRelativePath(filePath, componentFullPath);
          
          content = content.replace(pattern, (match, captured) => {
            const importType = match.includes('{') ? `{ ${captured} }` : captured;
            const statement = match.includes('require') ? 
              `const ${captured} = require('${newImportPath}')` :
              `import ${importType} from '${newImportPath}'`;
            updated++;
            return statement;
          });
        }
      });
    });
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return updated;
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
    } else if ((file.endsWith('.js') || file.endsWith('.jsx')) && !file.endsWith('.backup')) {
      const updated = updateImports(filePath);
      if (updated > 0) {
        const relativePath = path.relative(rootDir, filePath);
        log(`  ✅ Updated ${updated} import(s) in ${relativePath}`, 'green');
        importsUpdated += updated;
        filesUpdated++;
      }
    }
  });
}

function main() {
  log('📦 Updating Component Imports', 'magenta');
  log('═══════════════════════════════════════\n', 'magenta');
  
  try {
    // First check if the consolidated components exist
    let missingComponents = [];
    
    importMappings.forEach(mapping => {
      const componentPath = path.join(srcDir, mapping.componentPath + '.js');
      if (!fs.existsSync(componentPath)) {
        missingComponents.push(mapping.componentPath);
      }
    });
    
    if (missingComponents.length > 0) {
      log('⚠️  Warning: Some consolidated components are missing:', 'yellow');
      missingComponents.forEach(comp => {
        log(`    - ${comp}`, 'yellow');
      });
      log('\n  Run the cleanup script first or manually create these components.', 'yellow');
      return;
    }
    
    processDirectory(srcDir);
    
    log('\n📊 Summary', 'blue');
    log('═══════════════════════════════════════', 'blue');
    log(`  Imports updated: ${importsUpdated}`, importsUpdated > 0 ? 'green' : 'yellow');
    log(`  Files modified: ${filesUpdated}`, filesUpdated > 0 ? 'green' : 'yellow');
    
    if (importsUpdated > 0) {
      log('\n✨ Imports updated successfully!', 'green');
      log('📝 Note: Please test your application to ensure all imports are working.', 'yellow');
      
      // Clean up backup files if everything works
      log('\n🗑️  You can now remove the backup files:', 'yellow');
      log('  rm src/components/*.backup', 'yellow');
    } else {
      log('\n✅ No imports needed updating!', 'green');
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();