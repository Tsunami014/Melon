#!/bin/sh
rm -rf dist

cat src/*.js | minify --type js -o main.js
minify base/style.css -o style.css
minify base/main.html -o index.html
