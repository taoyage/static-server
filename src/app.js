const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const crypto = require('crypto');
const zlib = require('zlib');
const openbrowser = require('open');
const handlebars = require('handlebars');
const templates = require('./templates');

class StaticServer {
  constructor(options) {
    this.host = options.host;
    this.port = options.port;
    this.rootPath = process.cwd();
    this.cors = options.cors;
    this.openbrowser = options.openbrowser;
  }

  /**
   * handler request
   * @param {*} req
   * @param {*} res
   */
  requestHandler(req, res) {
    const { pathname } = url.parse(req.url);
    const filepath = path.join(this.rootPath, pathname);

    // To check if a file exists
    fs.stat(filepath, (err, stat) => {
      if (!err) {
        if (stat.isDirectory()) {
          this.responseDirectory(req, res, filepath, pathname);
        } else {
          this.responseFile(req, res, filepath, stat);
        }
      } else {
        this.responseNotFound(req, res);
      }
    });
  }

  /**
   * Reads the contents of a directory , response files list to client
   * @param {*} req
   * @param {*} res
   * @param {*} filepath
   */
  responseDirectory(req, res, filepath, pathname) {
    fs.readdir(filepath, (err, files) => {
      if (!err) {
        const fileList = files.map(file => {
          const isDirectory = fs.statSync(filepath + '/' + file).isDirectory();
          return {
            filename: file,
            url: path.join(pathname, file),
            isDirectory
          };
        });
        const html = handlebars.compile(templates.fileList)({ title: pathname, fileList });
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      }
    });
  }

  /**
   * response resource
   * @param {*} req
   * @param {*} res
   * @param {*} filepath
   */
  async responseFile(req, res, filepath, stat) {
    this.cacheHandler(req, res, filepath).then(
      data => {
        if (data === true) {
          res.writeHead(304);
          res.end();
        } else {
          res.setHeader('Content-Type', mime.getType(filepath) + ';charset=utf-8');
          res.setHeader('Etag', data);

          this.cors && res.setHeader('Access-Control-Allow-Origin', '*');

          const compress = this.compressHandler(req, res);

          if (compress) {
            fs.createReadStream(filepath)
              .pipe(compress)
              .pipe(res);
          } else {
            fs.createReadStream(filepath).pipe(res);
          }
        }
      },
      error => {
        this.responseError(req, res, error);
      }
    );
  }

  /**
   * not found request file
   * @param {*} req
   * @param {*} res
   */
  responseNotFound(req, res) {
    const html = handlebars.compile(templates.notFound)();
    res.writeHead(404, {
      'Content-Type': 'text/html'
    });
    res.end(html);
  }

  /**
   * server error
   * @param {*} req
   * @param {*} res
   * @param {*} err
   */
  responseError(req, res, err) {
    res.writeHead(500);
    res.end(`there is something wrong in th server! please try later!`);
  }

  /**
   * To check if a file have cache
   * @param {*} req
   * @param {*} res
   * @param {*} filepath
   */
  cacheHandler(req, res, filepath) {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filepath);
      const md5 = crypto.createHash('md5');
      const ifNoneMatch = req.headers['if-none-match'];
      readStream.on('data', data => {
        md5.update(data);
      });

      readStream.on('end', () => {
        let etag = md5.digest('hex');
        if (ifNoneMatch === etag) {
          resolve(true);
        }
        resolve(etag);
      });

      readStream.on('error', err => {
        reject(err);
      });
    });
  }

  /**
   * compress file
   * @param {*} req
   * @param {*} res
   */
  compressHandler(req, res) {
    const acceptEncoding = req.headers['accept-encoding'];
    if (/\bgzip\b/.test(acceptEncoding)) {
      res.setHeader('Content-Encoding', 'gzip');
      return zlib.createGzip();
    } else if (/\bdeflate\b/.test(acceptEncoding)) {
      res.setHeader('Content-Encoding', 'deflate');
      return zlib.createDeflate();
    } else {
      return false;
    }
  }

  /**
   * server start
   */
  start() {
    const server = http.createServer((req, res) => this.requestHandler(req, res));
    server.listen(this.port, () => {
      if (this.openbrowser) {
        openbrowser(`http://${this.host}:${this.port}`);
      }
      console.log(`server started in http://${this.host}:${this.port}`);
    });
  }
}

module.exports = StaticServer;
