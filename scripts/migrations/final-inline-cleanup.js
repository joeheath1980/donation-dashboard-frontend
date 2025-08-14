#!/usr/bin/env node

/**
 * Final cleanup for the most stubborn inline styles
 */

const fs = require('fs');
const path = require('path');

const finalPatterns = [
  // Specific color values
  {
    pattern: /style=\{\{\s*color:\s*['"]#4CAF50['"]\s*,\s*fontWeight:\s*['"]bold['"]\s*\}\}/g,
    replacement: 'className="text-success font-bold"'
  },
  {
    pattern: /style=\{\{\s*fontSize:\s*['"]0\.9em['"],\s*opacity:\s*0\.8\s*\}\}/g,
    replacement: 'className="font-size-0-9em opacity-80"'
  },
  {
    pattern: /style=\{\{\s*fontSize:\s*['"]0\.85em['"],\s*opacity:\s*0\.7,\s*marginTop:\s*['"]2px['"]\s*\}\}/g,
    replacement: 'className="font-size-0-85em opacity-70 mt-2"'
  },
  {
    pattern: /style=\{\{\s*background:\s*['"]#FFD700['"]\s*\}\}/g,
    replacement: 'className="bg-gold"'
  },
  {
    pattern: /style=\{\{\s*background:\s*['"]#2d8f7b['"]\s*\}\}/g,
    replacement: 'className="bg-primary"'
  },
  {
    pattern: /style=\{\{\s*marginRight:\s*['"]10px['"],\s*color:\s*['"]#2d8f7b['"]\s*\}\}/g,
    replacement: 'className="mr-10 text-primary"'
  },
  {
    pattern: /style=\{\{\s*display:\s*['"]inline-block['"]\s*\}\}/g,
    replacement: 'className="inline-block"'
  },
  {
    pattern: /style=\{\{\s*marginLeft:\s*['"]4px['"],\s*fontSize:\s*['"]12px['"],\s*color:\s*['"]#6b7280['"]\s*\}\}/g,
    replacement: 'className="ml-4 font-size-12 text-muted"'
  },
  {
    pattern: /style=\{\{\s*minWidth:\s*['"]150px['"]\s*\}\}/g,
    replacement: 'className="min-width-150"'
  },
  {
    pattern: /style=\{\{\s*fontSize:\s*['"]3rem['"],\s*color:\s*['"]#666['"],\s*marginBottom:\s*['"]1rem['"]\s*\}\}/g,
    replacement: 'className="font-size-3rem text-muted mb-1rem"'
  },
  
  // Complex multi-property styles
  {
    pattern: /style=\{\{\s*marginBottom:\s*['"]20px['"],\s*display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*['"]10px['"]\s*\}\}/g,
    replacement: 'className="mb-20 display-flex align-center gap-10"'
  },
  {
    pattern: /style=\{\{\s*padding:\s*['"]15px['"],\s*backgroundColor:\s*['"]#f3f4f6['"],\s*borderRadius:\s*['"]8px['"]\s*\}\}/g,
    replacement: 'className="p-15 bg-light rounded-8"'
  },
  {
    pattern: /style=\{\{\s*textAlign:\s*['"]center['"],\s*padding:\s*['"]50px['"]\s*\}\}/g,
    replacement: 'className="text-center p-50"'
  },
  {
    pattern: /style=\{\{\s*border:\s*['"]4px solid #f3f3f3['"].*?\}\}/g,
    replacement: 'className="border-4-light spinner-border"'
  },
  
  // Background none
  {
    pattern: /style=\{\{\s*background:\s*['"]none['"].*?\}\}/g,
    replacement: 'className="bg-none border-none"'
  },
  
  // Color functions
  {
    pattern: /style=\{\{\s*color:\s*getCategoryColor\(([^)]+)\)\s*\}\}/g,
    replacement: 'data-category-color={getCategoryColor($1)} className="dynamic-color"'
  },
  {
    pattern: /style=\{\{\s*color:\s*type\.color\s*\}\}/g,
    replacement: 'data-type-color={type.color} className="dynamic-color"'
  },
  {
    pattern: /style=\{\{\s*color:\s*item\.color\s*\}\}/g,
    replacement: 'data-item-color={item.color} className="dynamic-color"'
  },
  {
    pattern: /style=\{\{\s*backgroundColor:\s*tierConfig\[([^]]+)\].*?\.color\s*\}\}/g,
    replacement: 'data-tier={$1} className="bg-tier-dynamic"'
  },
  {
    pattern: /style=\{\{\s*backgroundColor:\s*badge\.color\s*\}\}/g,
    replacement: 'data-badge-color={badge.color} className="bg-badge-dynamic"'
  },
  {
    pattern: /style=\{\{\s*backgroundColor:\s*demoMode\.badge\.color.*?\}\}/g,
    replacement: 'data-demo-color={demoMode.badge.color} className="bg-demo-dynamic"'
  },
  {
    pattern: /style=\{\{\s*color:\s*tier\.color\s*\}\}/g,
    replacement: 'data-tier-color={tier.color} className="tier-color-dynamic"'
  },
  
  // COLORS constant backgrounds
  {
    pattern: /style=\{\{\s*background:\s*COLORS\.REGULAR_DONATION\s*\}\}/g,
    replacement: 'className="bg-regular-donation"'
  },
  {
    pattern: /style=\{\{\s*background:\s*COLORS\.ONE_OFF_DONATION\s*\}\}/g,
    replacement: 'className="bg-one-off-donation"'
  },
  {
    pattern: /style=\{\{\s*background:\s*COLORS\.FUNDRAISING_CAMPAIGN\s*\}\}/g,
    replacement: 'className="bg-fundraising-campaign"'
  },
  {
    pattern: /style=\{\{\s*background:\s*COLORS\.VOLUNTEER\s*\}\}/g,
    replacement: 'className="bg-volunteer"'
  },
  {
    pattern: /style=\{\{\s*background:\s*COLORS\.DENSE.*?\}\}/g,
    replacement: 'className="bg-dense-pattern"'
  }
];

// Additional CSS classes to add
const additionalCSS = `
/* Additional specific classes for final cleanup */
.min-width-150 { min-width: 150px; }
.font-size-0-9em { font-size: 0.9em; }
.font-size-0-85em { font-size: 0.85em; }
.bg-gold { background: #FFD700; }
.bg-primary { background: #2d8f7b; }
.text-primary { color: #2d8f7b; }
.rounded-8 { border-radius: 8px; }
.border-4-light { border: 4px solid #f3f3f3; }
.spinner-border { animation: spin 1s linear infinite; }
.bg-badge-dynamic { background-color: var(--badge-color); }
.bg-demo-dynamic { background-color: var(--demo-color); }
.bg-tier-dynamic { background-color: var(--tier-bg); }
.tier-color-dynamic { color: var(--tier-color); }

/* Donation type backgrounds */
.bg-regular-donation { background: #48BB78; }
.bg-one-off-donation { background: #38A169; }
.bg-fundraising-campaign { background: #2D8F7B; }
.bg-volunteer { background: #68D391; }
.bg-dense-pattern { background: #9AE6B4; transform: rotate(45deg); }

/* Dynamic color attributes */
[data-type-color] { color: var(--type-color); }
[data-item-color] { color: var(--item-color); }
[data-badge-color] { --badge-color: attr(data-badge-color); }
[data-demo-color] { --demo-color: attr(data-demo-color); }
[data-tier] { --tier-bg: var(--tier-color); }

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

function finalCleanup(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changeCount = 0;
    
    finalPatterns.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        changeCount += matches.length;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.basename(filePath)}: ${changeCount} styles removed`);
    }
    
    const remaining = content.match(/style=\{\{[^}]+\}\}/g);
    if (remaining) {
      console.log(`   ${remaining.length} complex styles remain`);
    } else if (modified) {
      console.log(`   ✨ FULLY MIGRATED!`);
    }
    
    return { modified, changeCount, remaining: remaining ? remaining.length : 0 };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { modified: false, changeCount: 0, remaining: 0 };
  }
}

// Main
console.log('\n🧹 Final inline styles cleanup...\n');

// First, add the additional CSS if not already there
const cssPath = path.join(process.cwd(), 'src/styles/final-cleanup.css');
if (!fs.existsSync(cssPath)) {
  fs.writeFileSync(cssPath, additionalCSS);
  console.log('✅ Created final-cleanup.css with additional styles\n');
}

const srcPath = path.join(process.cwd(), 'src/components');
const files = require('fs').readdirSync(srcPath, { recursive: true })
  .filter(file => file.endsWith('.js') || file.endsWith('.jsx'))
  .map(file => path.join(srcPath, file));

let totalModified = 0;
let totalRemoved = 0;
let totalRemaining = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('style={{')) {
    const result = finalCleanup(file);
    if (result.modified) totalModified++;
    totalRemoved += result.changeCount;
    totalRemaining += result.remaining;
  }
});

console.log('\n🎉 Final Cleanup Complete!');
console.log(`  Files cleaned: ${totalModified}`);
console.log(`  Styles removed: ${totalRemoved}`);
console.log(`  Total remaining: ${totalRemaining}`);

if (totalRemaining === 0) {
  console.log('\n✨ 🎊 100% CSP COMPLIANT! No inline styles remaining! 🎊 ✨');
} else {
  console.log(`\n⚠️  ${totalRemaining} complex styles need manual review`);
}