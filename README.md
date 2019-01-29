# Nodejs build static server
A simple http server to serve static resource files from a local directory.

## Getting started
* Install npm package global `npm install -g yg-server`
* Go to the folder you want to serve
* Run the server `yg-server`

## Options

    -h                         output usage information
    -V, --version              output the version number
    -p, --port <n>             the port to listen to for incoming HTTP connections
    -c, --cors <boolean>       Use cross origin to allow all origins
    -o, --open <boolean>       open server in the local browser

## Example
`yg-server` start server in current folder
`yg-server -p 8000` start server listen to 8000 port
* For more information, see yg-server -h

### TODO
- [x] show file list
- [x] Allow cross-domain
- [x] support cache