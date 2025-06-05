// Simple Node.js test for Shark class
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Shark Class Validation Test ===');

try {
    // Read and validate shark.js file
    const sharkPath = join(__dirname, 'src', 'game', 'shark.js');
    const sharkContent = readFileSync(sharkPath, 'utf8');
    
    console.log('✓ Shark.js file loaded successfully');
    console.log('File size:', sharkContent.length, 'characters');
    
    // Check import statements
    const lines = sharkContent.split('\n');
    const importLines = lines.filter(line => line.trim().startsWith('import'));
    
    console.log('\\nImport statements found:');
    importLines.forEach((line, index) => {
        console.log(`${index + 1}. ${line.trim()}`);
    });
    
    // Check for syntax issues
    const hasNaN = sharkContent.includes('NaN');
    const hasUndefined = sharkContent.includes('undefined');
    const hasMalformedImports = sharkContent.includes('import ') && sharkContent.includes('{') && !sharkContent.includes('from');
    
    console.log('\\nSyntax validation:');
    console.log('Contains NaN references:', hasNaN);
    console.log('Contains undefined references:', hasUndefined);
    console.log('Has malformed imports:', hasMalformedImports);
    
    if (!hasNaN && !hasMalformedImports) {
        console.log('\\n✓ Shark.js appears to be syntactically correct');
    } else {
        console.log('\\n⚠ Potential issues detected in Shark.js');
    }
    
    // Check class definition
    const hasClassDefinition = sharkContent.includes('class Shark') || sharkContent.includes('export default class');
    const hasExport = sharkContent.includes('export default');
    
    console.log('\\nClass structure:');
    console.log('Has class definition:', hasClassDefinition);
    console.log('Has export statement:', hasExport);
    
    if (hasClassDefinition && hasExport) {
        console.log('\\n✓ Shark class structure appears correct');
    }
    
} catch (error) {
    console.error('Error during validation:', error.message);
}

console.log('\\n=== Test Complete ===');
