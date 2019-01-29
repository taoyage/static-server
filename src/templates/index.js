const fs = require('fs');
const path = require('path');

const fileList = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

const notFound = fs.readFileSync(path.resolve(__dirname, '404.html'), 'utf8');

module.exports = {
  fileList,
  notFound
};
