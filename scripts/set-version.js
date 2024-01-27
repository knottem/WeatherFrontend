const fs = require('fs');

const packageJson = require('../package.json');
const version = packageJson.version;

const environmentFilePath = './src/environments/environment.ts';
const envFileContent = fs.readFileSync(environmentFilePath, 'utf8');

const currentVersionMatch = envFileContent.match(/apiVersion: '(.*)'/);
const currentVersion = currentVersionMatch ? currentVersionMatch[1] : null;

if (currentVersion !== version) {
    const newContent = envFileContent.replace(/apiVersion: '.*'/, `apiVersion: '${version}'`);
    fs.writeFileSync(environmentFilePath, newContent, 'utf8');
    console.log(`Version updated to ${version} in ${environmentFilePath}`);
}