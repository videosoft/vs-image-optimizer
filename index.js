
const fs = require("fs");
const sharp = require('sharp');
const globby = require('globby');
const chokidar = require('chokidar');
const config = require('./config.json');

const optimizeImage = async (image) => {
  const imageOptimized = image + '.webp';
  if (fs.existsSync(image) && !fs.existsSync(imageOptimized) && !image.endsWith('.webp')) {
    if (!image.endsWith('.gif')) {
      console.count('optimizeImage');
      await sharp(image).webp({ quality: 70 }).toFile(imageOptimized);
    }
  }
}

const optimizeAll = async () => {
  try {
    const files = await globby(config.folder) || [];
    for (const file of files) {
      try {
        await optimizeImage(file);
      } catch (error) {
        console.error('error', file)
      }
    }
    console.log('optimizeAll', files.length);
  } catch (error) {
    console.error(error);
  }
}

let isRunning = false;
let timeoutRef;

const tryOptimize = async () => {
  if (!isRunning) {
    isRunning = true;
    await optimizeAll();
    isRunning = false;
  } else {
    clearTimeout(timeoutRef);
    timeoutRef = setTimeout(tryOptimize, 5000);
  }
}

if (config.watch) {
  chokidar.watch(config.folder).on('all', tryOptimize);
}

if (config.execOnOpen) {
  tryOptimize();
}
