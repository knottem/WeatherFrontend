const fs = require('fs');

const packageJson = require('../package.json');
const devVersion = packageJson.version + '-dev'; // Append '-dev' to the package version

const environmentFilePath = './src/environments/environment.development.ts';
const envFileContent = fs.readFileSync(environmentFilePath, 'utf8');

// Extract the current version in the environment file
const currentVersionMatch = envFileContent.match(/apiVersion: '(.*)'/);
const currentVersion = currentVersionMatch ? currentVersionMatch[1] : null;

if (currentVersion !== devVersion) {
    const newContent = envFileContent.replace(/apiVersion: '.*'/, `apiVersion: '${devVersion}'`);
    fs.writeFileSync(environmentFilePath, newContent, 'utf8');
    console.log(`Version updated to ${devVersion} in ${environmentFilePath}`);
}