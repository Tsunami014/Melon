#!/bin/sh
rm -rf dist

printf '%s\n' src/*.js | LC_ALL=C sort | xargs cat | minify --type js -o main.js
minify base/style.css -o style.css
minify base/main.html -o index.html
