/* eslint-disable no-cond-assign */
/* eslint-disable no-nested-ternary */
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const junk = require('junk');

const isSvg = (file) => {
  const extension = file.substr((file.lastIndexOf('.') + 1));
  if (!/(SVG|svg)$/ig.test(extension)) {
    return false;
  }
  return true;
};

const saveFile = (content, file) => {
  fs.writeFile(file, content, (err) => {
    if (err) throw err;
  });
};

const saveSvg = (svg, file) => {
  const builder = new xml2js.Builder({ explicitRoot: false, headless: true, rootName: 'svg' });
  const xml = builder.buildObject(svg);
  saveFile(xml, file);
};

const getContent = (svg) => {
  // eslint-disable-next-line no-unused-vars
  const { $: deletedKey, ...otherKeys } = svg;
  return otherKeys;
};

const prepareCSS = classname => `.${classname} { content: url('./output.svg#${classname}'); }\n`;

const updateProperties = (content, id) => {
  return {
    $: {
      class: 'icon',
      id,
    },
    ...content,
  };
};

const flatten = (arr, condition) => {
  return arr.reduce((flat, toFlatten) => flat.concat(Array.isArray(toFlatten)
    ? flatten(toFlatten, condition)
    : (condition ? (condition(toFlatten) ? toFlatten : []) : toFlatten)), []);
};

const traverseAllFiles = (files) => {
  let cleanedFiles = (Array.isArray(files) ? files : [files]).filter(junk.not);
  cleanedFiles = cleanedFiles.filter(junk.not);
  return [...files.map(file => (fs.lstatSync(file).isFile() ? file
    : traverseAllFiles(fs.readdirSync(file).map(f => path.join(file, f)))))];
};

const getAllSVGFiles = (file, ...rest) => {
  const files = [file, ...rest];
  return flatten(traverseAllFiles(files), isSvg);
};

const makeid = () => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < 5; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

const cleanSVG = (fileContent) => {
  const classes = {};
  const regex = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gmi;
  while ((m = regex.exec(fileContent)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex += 1;
    }
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (groupIndex === 1) {
        classes[match] = makeid();
      }
    });
  }
  let changedConent = fileContent;
  Object.keys(classes).forEach((cls) => {
    changedConent = changedConent.replace(new RegExp(cls, 'g'), classes[cls]);
  });
  return changedConent;
};

module.exports = {
  cleanSVG,
  getAllSVGFiles,
  getContent,
  saveFile,
  saveSvg,
  prepareCSS,
  updateProperties,
};
