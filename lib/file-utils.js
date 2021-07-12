const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

module.exports.writeFile = (destination, body) => {
  // make the directory if it doesn't exist
  makeDirectory(destination);
  fs.writeFileSync(destination, body);
};

module.exports.writeMarkdown = (destination, frontmatter, body) => {
  const lines = [
    '---',
    yaml.dump(frontmatter).trim(),
    '---',
    body ? body.toString().trim() : '',
    '',
  ];
  const content = lines.join('\n');
  makeDirectory(destination);
  this.writeFile(destination, content);
};

function makeDirectory(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  fs.mkdirSync(dirname, { recursive: true });
}
