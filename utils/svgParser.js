const fs = require('fs');
const xml2js = require('xml2js');
const helper = require('./helper');

module.exports = class SVGParser {
  constructor(file) {
    this.svgFile = file;
  }

  parse() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.svgFile, (err, data) => {
        if (err) {
          reject(err);
        }
        const parser = xml2js.parseString;
        const cleanedContent = helper.cleanSVG(data.toString())
        parser(cleanedContent, (error, result) => {
          if (err) {
            reject(error);
          }
          resolve([result.svg, this.svgFile]);
        });

      });
    });
  }
};
