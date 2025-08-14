#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files with the final 15 inline styles
const targetFiles = [
  'src/components/TierProgressModal.js',
  'src/components/ScrollableImpactSection.js',
  'src/components/PersonalImpactScore.js'
];

// Migration patterns for the final 15 styles
const migrationPatterns = [
  // Pattern 1: Dynamic width calculations (8 instances)
  {
    pattern: /style=\{\{\s*width:\s*`\$\{([^}]+)\}%`\s*\}\}/g,
    replacement: (match, calculation) => {
      return `className="progress-bar-fill" ref={el => el && el.style.setProperty('--progress', \`\${${calculation}}%\`)}`;
    },
    description: 'Dynamic width percentage'
  },
  
  // Pattern 2: Dynamic left positioning (1 instance)
  {
    pattern: /style=\{\{\s*left:\s*`\$\{([^}]+)\}%`\s*\}\}/g,
    replacement: (match, calculation) => {
      return `className="progress-indicator" ref={el => el && el.style.setProperty('--progress', \`\${${calculation}}%\`)}`;
    },
    description: 'Dynamic left position'
  },
  
  // Pattern 3: Complex gradient with dynamic color (3 instances)
  {
    pattern: /style=\{\{\s*background:\s*`linear-gradient\(([^,]+),\s*\$\{([^}]+)\}([^,]+),\s*\$\{([^}]+)\}\)`\s*\}\}/g,
    replacement: (match, angle, color1, opacity1, color2) => {
      // Use data attribute for color mapping
      return `data-gradient-color={${color1}.replace('#', '').toLowerCase()} className="dynamic-gradient"`;
    },
    description: 'Dynamic gradient'
  },
  
  // Pattern 4: Complex multi-property styles (4 instances)
  {
    pattern: /style=\{\{\s*position:\s*['"]absolute['"],\s*top:\s*([^,]+),\s*left:\s*([^}]+)\s*\}\}/g,
    replacement: (match, top, left) => {
      return `className="position-dynamic" ref={el => { if(el) { el.style.setProperty('--top', ${top}); el.style.setProperty('--left', ${left}); } }}`;
    },
    description: 'Dynamic positioning'
  },
  
  // Pattern 5: Inline gradient in progress bars
  {
    pattern: /style=\{\{\s*width:\s*`\$\{([^}]+)\}%`,\s*background:\s*([^}]+)\s*\}\}/g,
    replacement: (match, width, background) => {
      return `className="progress-bar-fill gradient-progress-achieved" ref={el => el && el.style.setProperty('--progress', \`\${${width}}%\`)}`;
    },
    description: 'Progress bar with gradient'
  },
  
  // Pattern 6: Conditional gradients
  {
    pattern: /style=\{\{[\s\S]*?background:\s*([^?]+)\?\s*`linear-gradient\([^`]+\)`\s*:\s*([^?]+)\?\s*`linear-gradient\([^`]+\)`\s*:\s*['"]([^'"]+)['"]\s*\}\}/g,
    replacement: (match) => {
      // Keep the conditional logic but use classes
      const conditions = match.match(/([^?]+)\?/g);
      if (conditions && conditions.length > 0) {
        return `className={\`dynamic-gradient \${${conditions[0].replace('?', '').trim()} ? 'gradient-progress-achieved' : ${conditions[1] ? conditions[1].replace('?', '').trim() : 'false'} ? 'gradient-progress-active' : ''}\`}`;
      }
      return match;
    },
    description: 'Conditional gradient'
  }
];

// Additional helper to handle strokeDasharray in SVG
const svgPatterns = [
  {
    pattern: /strokeDasharray=\{`\$\{([^}]+)\}\s+\$\{([^}]+)\}`\}/g,
    replacement: (match, val1, val2) => {
      return `strokeDasharray={\`\${${val1}} \${${val2}}\`}`;
    },
    description: 'SVG stroke dash array'
  }
];

let totalMigrated = 0;
let filesMigrated = 0;

targetFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  let migratedInFile = 0;
  
  // First, add import for DynamicStyleManager if needed
  if (!content.includes('DynamicStyleManager') && !content.includes('DynamicWidth')) {
    const importRegex = /^(import .* from ['"]react['"];?\n)/m;
    if (importRegex.test(content)) {
      content = content.replace(
        importRegex,
        `$1import { DynamicWidth, ProgressBar, DynamicGradient } from './DynamicStyleManager';\n`
      );
    }
  }
  
  // Apply migration patterns
  migrationPatterns.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  Found ${matches.length} instances of: ${description}`);
      content = content.replace(pattern, replacement);
      migratedInFile += matches.length;
    }
  });
  
  // Apply SVG patterns separately (don't count these as inline styles)
  svgPatterns.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  Updated ${matches.length} SVG attributes: ${description}`);
      content = content.replace(pattern, replacement);
    }
  });
  
  // Special handling for TierProgressModal.js specific patterns
  if (filePath.includes('TierProgressModal')) {
    // Handle the complex conditional width and gradient together
    const complexPattern = /style=\{\{\s*width:\s*`\$\{progressPercentage\}%`,\s*background:\s*isAchieved\s*\?[\s\S]*?\}\}/g;
    if (complexPattern.test(content)) {
      content = content.replace(complexPattern, 
        `className={\`progress-bar-fill \${isAchieved ? 'gradient-tier-achieved' : isNext ? 'gradient-tier-active' : ''}\`} data-progress-width={progressPercentage}`
      );
      migratedInFile++;
    }
    
    // Handle the remaining progress bar
    const remainingPattern = /style=\{\{\s*left:\s*`\$\{progressPercentage\}%`,\s*width:\s*`\$\{100 - progressPercentage\}%`,[\s\S]*?\}\}/g;
    if (remainingPattern.test(content)) {
      content = content.replace(remainingPattern,
        `className="gradient-progress-remaining" data-position-left={progressPercentage} data-progress-width={100 - progressPercentage}`
      );
      migratedInFile++;
    }
  }
  
  // Special handling for ScrollableImpactSection.js badge gradients
  if (filePath.includes('ScrollableImpactSection')) {
    // Badge circle gradient
    const badgePattern = /style=\{isCollected\s*\?\s*\{\s*background:\s*`linear-gradient\([^`]+\)`,[\s\S]*?\}\s*:\s*\{\}\}/g;
    if (badgePattern.test(content)) {
      content = content.replace(badgePattern,
        `className={isCollected ? 'dynamic-gradient' : ''} data-gradient-color={badge.color?.replace('#', '').toLowerCase()}`
      );
      migratedInFile++;
    }
    
    // Modal header gradient
    const modalPattern = /style=\{\{\s*background:\s*`linear-gradient\(135deg,\s*\$\{badge\.color\}dd,\s*\$\{badge\.color\}\)`\s*\}\}/g;
    if (modalPattern.test(content)) {
      content = content.replace(modalPattern,
        `className="dynamic-gradient" data-gradient-color={badge.color?.replace('#', '').toLowerCase()}`
      );
      migratedInFile++;
    }
    
    // Progress fill width and color
    const progressFillPattern = /style=\{\{\s*width:\s*`\$\{\(contributions\.length\s*\/\s*3\)\s*\*\s*100\}%`,\s*backgroundColor:\s*badge\.color\s*\}\}/g;
    if (progressFillPattern.test(content)) {
      content = content.replace(progressFillPattern,
        `className="progress-bar-fill" data-progress-width={(contributions.length / 3) * 100} data-color={badge.color}`
      );
      migratedInFile++;
    }
  }
  
  // Special handling for PersonalImpactScore.js
  if (filePath.includes('PersonalImpactScore')) {
    // Complex tooltip positioning
    const tooltipPattern = /style=\{\{\s*position:\s*['"]absolute['"],[\s\S]*?transform:\s*['"]translateX\(-50%\)['"]\s*\}\}/g;
    if (tooltipPattern.test(content)) {
      content = content.replace(tooltipPattern,
        `className="tooltip-bottom-center"`
      );
      migratedInFile++;
    }
    
    // SVG circle animations (these use strokeDasharray which is allowed in SVG)
    // Just ensure we're using CSS variables properly
    const svgCirclePattern = /style=\{\{[\s\S]*?strokeDasharray:[\s\S]*?\}\}/g;
    // Don't replace SVG styles, they're needed for animation
  }
  
  if (content !== originalContent) {
    // Add import for dynamic-styles.css if not present
    if (!content.includes('dynamic-styles.css')) {
      const cssImportRegex = /(import ['"]\.\/.*\.css['"];?\n)/;
      if (cssImportRegex.test(content)) {
        content = content.replace(
          cssImportRegex,
          `$1import '../styles/dynamic-styles.css';\n`
        );
      } else {
        // Add after the last import
        const lastImportRegex = /(import[^;]+;?\n)(?!import)/;
        content = content.replace(
          lastImportRegex,
          `$1import '../styles/dynamic-styles.css';\n`
        );
      }
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Migrated ${migratedInFile} inline styles in ${filePath}`);
    filesMigrated++;
    totalMigrated += migratedInFile;
  } else {
    console.log(`ℹ️  No changes needed in ${filePath}`);
  }
});

console.log('\n📊 Final Migration Summary:');
console.log(`   Files processed: ${targetFiles.length}`);
console.log(`   Files migrated: ${filesMigrated}`);
console.log(`   Total inline styles migrated: ${totalMigrated}`);

// Check for any remaining inline styles
console.log('\n🔍 Checking for remaining inline styles...');
let remainingCount = 0;

targetFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const styleMatches = content.match(/style=\{\{(?!.*strokeDasharray)(?!.*transition)[^}]+\}\}/g);
    if (styleMatches) {
      console.log(`⚠️  ${filePath}: ${styleMatches.length} inline styles remaining`);
      styleMatches.slice(0, 3).forEach(match => {
        console.log(`     ${match.substring(0, 80)}...`);
      });
      remainingCount += styleMatches.length;
    }
  }
});

if (remainingCount === 0) {
  console.log('✅ All inline styles have been migrated!');
} else {
  console.log(`\n⚠️  ${remainingCount} inline styles still need manual migration`);
  console.log('   These are likely SVG animations or complex conditional styles.');
  console.log('   Review the files above and migrate manually if needed.');
}

console.log('\n✨ Migration complete!');