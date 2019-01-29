#! /usr/bin/env node

const yargs = require('yargs');
const path = require('path');
const config = require('./config');
const StaticServer = require('../src/app');
const pkg = require(path.join(__dirname, '..', 'package.json'));

const options = yargs
  .version(pkg.name + '@' + pkg.version)
  .usage('yg-server [options]')
  .option('p', { alias: 'port', describe: '设置服务器端口号', type: 'number', default: config.port })
  .option('o', { alias: 'openbrowser', describe: '是否打开浏览器', type: 'boolean', default: config.openbrowser })
  .option('n', { alias: 'host', describe: '设置主机名', type: 'string', default: config.host })
  .option('c', { alias: 'cors', describe: '是否允许跨域', type: 'string', default: config.cors })
  .option('v', { alias: 'version', type: 'string' })
  .example('yg-server -p 8000 -o localhost', '在根目录开启监听8000端口的静态服务器')
  .help('h').argv;

const server = new StaticServer(options);

server.start();
