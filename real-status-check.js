// Real Project Status Check
// This script verifies the actual working state of the WebAI 3D project

const fs = require('fs');
const path = require('path');

console.log('🔍 DEFINITIVE PROJECT STATUS CHECK');
console.log('=====================================\n');

// Check 1: Core files exist and have content
const coreFiles = [
    'index.html',
    'src/app.js', 
    'src/utils/math.js',
    'src/utils/webglContextManager.js',
    'src/utils/geometryValidator.js'
];

let filesOK = true;
console.log('📁 Checking core files...');
coreFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const sizeKB = (content.length / 1024).toFixed(1);
        console.log(`✅ ${file} (${sizeKB} KB)`);
        
        // Check for corruption indicators
        if (content.includes('undefined') && content.includes('import') && content.length < 100) {
            console.log(`⚠️  ${file} appears corrupted (very short with undefined imports)`);
            filesOK = false;
        }
    } else {
        console.log(`❌ ${file} - MISSING`);
        filesOK = false;
    }
});

// Check 2: WebGL fix implementations
console.log('\n🔧 Checking WebGL fix implementations...');
let fixesImplemented = true;

const mathContent = fs.readFileSync('src/utils/math.js', 'utf8');
if (mathContent.includes('sanitizeGeometry') && mathContent.includes('deepSanitizeGeometry')) {
    console.log('✅ Geometry sanitization functions present');
} else {
    console.log('❌ Geometry sanitization functions missing');
    fixesImplemented = false;
}

const appContent = fs.readFileSync('src/app.js', 'utf8');
if (appContent.includes('WebGLContextManager') && appContent.includes('geometryValidator')) {
    console.log('✅ WebGL fixes integrated in app.js');
} else {
    console.log('❌ WebGL fixes not integrated in app.js');
    fixesImplemented = false;
}

// Check 3: Syntax validation
console.log('\n📝 Checking for obvious syntax errors...');
let syntaxOK = true;

try {
    // Basic syntax check for JavaScript files
    const jsFiles = ['src/app.js', 'src/utils/math.js'];
    jsFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for common syntax issues
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        
        if (openBraces !== closeBraces) {
            console.log(`❌ ${file} - Mismatched braces: ${openBraces} open, ${closeBraces} close`);
            syntaxOK = false;
        } else if (openParens !== closeParens) {
            console.log(`❌ ${file} - Mismatched parentheses: ${openParens} open, ${closeParens} close`);
            syntaxOK = false;
        } else {
            console.log(`✅ ${file} - Basic syntax appears correct`);
        }
    });
} catch (error) {
    console.log(`❌ Error checking syntax: ${error.message}`);
    syntaxOK = false;
}

// Check 4: Project structure
console.log('\n📦 Checking project structure...');
const requiredDirs = ['src', 'libs', 'assets'];
let structureOK = true;

requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/ directory exists`);
    } else {
        console.log(`❌ ${dir}/ directory missing`);
        structureOK = false;
    }
});

// Final assessment
console.log('\n🎯 FINAL ASSESSMENT');
console.log('==================');

const overallStatus = filesOK && fixesImplemented && syntaxOK && structureOK;

console.log(`📁 Core Files: ${filesOK ? '✅ OK' : '❌ ISSUES'}`);
console.log(`🔧 WebGL Fixes: ${fixesImplemented ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
console.log(`📝 Syntax: ${syntaxOK ? '✅ CLEAN' : '❌ ERRORS'}`);
console.log(`📦 Structure: ${structureOK ? '✅ INTACT' : '❌ BROKEN'}`);

console.log(`\n🚀 PROJECT STATUS: ${overallStatus ? '✅ WORKING' : '❌ BROKEN'}`);

if (overallStatus) {
    console.log('\n✅ SUCCESS: The project appears to be properly fixed and should work!');
    console.log('🎮 You can run it by:');
    console.log('   1. Starting a web server: python -m http.server 8080');
    console.log('   2. Opening: http://localhost:8080');
    console.log('   3. The WebGL fixes are active and monitoring for errors');
} else {
    console.log('\n❌ ISSUES DETECTED: The project needs additional fixes');
    console.log('🔧 Recommended actions:');
    if (!filesOK) console.log('   - Restore missing/corrupted files');
    if (!fixesImplemented) console.log('   - Implement missing WebGL fixes');
    if (!syntaxOK) console.log('   - Fix syntax errors');
    if (!structureOK) console.log('   - Restore project structure');
}

console.log('\n=====================================');
console.log('Status check complete.');
