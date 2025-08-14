#!/usr/bin/env node

/**
 * Frontend Cleanup Script
 * Removes duplicate files, old archives, and organizes the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const componentsDir = path.join(srcDir, 'components');

let removedCount = 0;
let consoleStatementsFound = 0;
let duplicatesResolved = 0;

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

// 1. Clean up build archives
function cleanBuildArchives() {
  log('\n🧹 Cleaning build archives...', 'blue');
  
  const files = fs.readdirSync(rootDir);
  const archivePattern = /\.(tar\.gz|tgz|zip)$/;
  
  files.forEach(file => {
    if (archivePattern.test(file)) {
      const filePath = path.join(rootDir, file);
      try {
        fs.unlinkSync(filePath);
        log(`  ✅ Removed: ${file}`, 'green');
        removedCount++;
      } catch (err) {
        log(`  ❌ Failed to remove: ${file}`, 'red');
      }
    }
  });
}

// 2. Remove archived and old files
function removeArchivedFiles() {
  log('\n🗑️  Removing archived and old files...', 'blue');
  
  const filesToRemove = [
    'src/components/archived/ManagePaymentsComponent.old.js',
    'src/assets/logo.old.png',
    'src/contexts/WebSocketContext-fixed.js',
    'src/components/Search/ProfileSearch-debug.js'
  ];
  
  filesToRemove.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        log(`  ✅ Removed: ${file}`, 'green');
        removedCount++;
      } catch (err) {
        log(`  ❌ Failed to remove: ${file}`, 'red');
      }
    }
  });
  
  // Remove archived directory if it exists
  const archivedDir = path.join(componentsDir, 'archived');
  if (fs.existsSync(archivedDir)) {
    try {
      fs.rmSync(archivedDir, { recursive: true, force: true });
      log(`  ✅ Removed archived directory`, 'green');
      removedCount++;
    } catch (err) {
      log(`  ❌ Failed to remove archived directory`, 'red');
    }
  }
}

// 3. Consolidate duplicate components
function consolidateDuplicates() {
  log('\n🔀 Consolidating duplicate components...', 'blue');
  
  const duplicates = [
    {
      keep: 'src/components/Common/LoadingSpinner.js',
      remove: 'src/components/LoadingSpinner.js',
      updateImports: true
    },
    {
      keep: 'src/components/CharitySearch/CharitySearch.js',
      remove: 'src/components/CharitySearch.js',
      updateImports: true
    },
    {
      keep: 'src/components/CharityProfileEditor/CharityProfileEditor.js',
      remove: 'src/components/CharityProfileEditor.js',
      updateImports: false // App.js uses both, needs manual review
    }
  ];
  
  duplicates.forEach(({ keep, remove, updateImports }) => {
    const keepPath = path.join(rootDir, keep);
    const removePath = path.join(rootDir, remove);
    
    if (fs.existsSync(keepPath) && fs.existsSync(removePath)) {
      if (updateImports) {
        // Update imports in all JS files
        const oldImport = remove.replace('src/', './').replace('.js', '');
        const newImport = keep.replace('src/', './').replace('.js', '');
        
        log(`  📝 Updating imports from ${path.basename(remove)} to ${path.basename(keep)}`, 'yellow');
        
        // This would need to be more sophisticated in production
        // For now, we'll just note what needs to be updated
        log(`    ⚠️  Manual update needed: Update imports of '${oldImport}'`, 'yellow');
      }
      
      // For safety, we'll rename instead of delete
      const backupPath = removePath + '.backup';
      fs.renameSync(removePath, backupPath);
      log(`  ✅ Backed up: ${remove} -> ${remove}.backup`, 'green');
      duplicatesResolved++;
    }
  });
}

// 4. Remove console statements
function analyzeConsoleStatements() {
  log('\n📊 Analyzing console statements...', 'blue');
  
  const consolePattern = /console\.(log|warn|error|debug|info)/g;
  const filesToCheck = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        filesToCheck.push(filePath);
      }
    });
  }
  
  scanDirectory(srcDir);
  
  const filesWithConsole = {};
  
  filesToCheck.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(consolePattern);
    
    if (matches && matches.length > 0) {
      const relativePath = path.relative(rootDir, filePath);
      filesWithConsole[relativePath] = matches.length;
      consoleStatementsFound += matches.length;
    }
  });
  
  // Show top offenders
  const sortedFiles = Object.entries(filesWithConsole)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  log(`  Found ${consoleStatementsFound} console statements in ${Object.keys(filesWithConsole).length} files`, 'yellow');
  log('  Top 10 files with console statements:', 'yellow');
  sortedFiles.forEach(([file, count]) => {
    log(`    ${count.toString().padStart(3)} - ${file}`, 'yellow');
  });
}

// 5. Clean up CSP migration files
function consolidateCSPDocs() {
  log('\n📚 Consolidating CSP documentation...', 'blue');
  
  const cspFiles = fs.readdirSync(rootDir).filter(file => 
    file.startsWith('CSP_') && file.endsWith('.md')
  );
  
  if (cspFiles.length > 1) {
    // Create consolidated documentation
    const consolidatedPath = path.join(rootDir, 'docs', 'CSP_MIGRATION_COMPLETE.md');
    const docsDir = path.join(rootDir, 'docs');
    
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    // Move the most recent CSP file to docs
    const mostRecent = cspFiles.sort().pop();
    fs.renameSync(
      path.join(rootDir, mostRecent),
      consolidatedPath
    );
    log(`  ✅ Moved ${mostRecent} to docs/CSP_MIGRATION_COMPLETE.md`, 'green');
    
    // Remove other CSP files
    cspFiles.filter(f => f !== mostRecent).forEach(file => {
      fs.unlinkSync(path.join(rootDir, file));
      log(`  ✅ Removed redundant: ${file}`, 'green');
      removedCount++;
    });
  }
}

// 6. Organize migration scripts
function organizeMigrationScripts() {
  log('\n📁 Organizing migration scripts...', 'blue');
  
  const scriptsDir = path.join(rootDir, 'scripts');
  const migrationScripts = fs.readdirSync(scriptsDir).filter(file => 
    file.includes('migrate') || file.includes('cleanup')
  );
  
  if (migrationScripts.length > 0) {
    const migrationsDir = path.join(scriptsDir, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    migrationScripts.forEach(script => {
      const oldPath = path.join(scriptsDir, script);
      const newPath = path.join(migrationsDir, script);
      
      if (!fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
        log(`  ✅ Moved ${script} to migrations/`, 'green');
      }
    });
  }
}

// 7. Generate cleanup report
function generateReport() {
  log('\n📈 Cleanup Summary', 'magenta');
  log('═══════════════════════════════════════', 'magenta');
  log(`  Files removed: ${removedCount}`, removedCount > 0 ? 'green' : 'yellow');
  log(`  Duplicates resolved: ${duplicatesResolved}`, duplicatesResolved > 0 ? 'green' : 'yellow');
  log(`  Console statements found: ${consoleStatementsFound}`, consoleStatementsFound > 100 ? 'red' : 'yellow');
  
  log('\n📝 Next Steps:', 'blue');
  log('  1. Review and remove .backup files after testing', 'yellow');
  log('  2. Update component imports for consolidated files', 'yellow');
  log('  3. Run "npm run lint:fix" to fix ESLint issues', 'yellow');
  log('  4. Consider removing console statements with:', 'yellow');
  log('     node scripts/remove-console-statements.js', 'yellow');
  log('  5. Run "npm audit fix" to fix security vulnerabilities', 'yellow');
}

// Main execution
function main() {
  log('🚀 Starting Frontend Cleanup', 'magenta');
  log('═══════════════════════════════════════\n', 'magenta');
  
  try {
    cleanBuildArchives();
    removeArchivedFiles();
    consolidateDuplicates();
    analyzeConsoleStatements();
    consolidateCSPDocs();
    organizeMigrationScripts();
    generateReport();
    
    log('\n✨ Cleanup completed successfully!', 'green');
  } catch (error) {
    log(`\n❌ Cleanup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the cleanup
main();