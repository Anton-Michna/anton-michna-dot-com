#!/bin/sh

cd api
npm install
npm run build
node dist/main.js