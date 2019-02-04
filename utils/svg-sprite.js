const path = require('path');
const chalk = require('chalk');
const helper = require('./helper');
const SVGParser = require('./svgParser');


class SVGSprite {
  constructor(dir) {
    this.files = [];
    this.svgSprite = '';
    this.HTMLContent = [];
    this.CSSContent = '';
    this.spriteContent = { g: [] };
    this.outputPath = dir;
  }

  collectAll(files) {
    this.files = helper.getAllSVGFiles(...files);
  }

  saveHTML() {
    const html = `<html><head><link rel="stylesheet" href="output.css"></head><body style="display:inline-block">${this.HTMLContent.join('')}</body></html>`;
    helper.saveFile(html, `${this.outputPath}/output.html`);
  }

  saveCSS() {
    helper.saveFile(this.CSSContent, `${this.outputPath}/output.css`);
  }

  saveSVG() {
    const svgtemplate = new SVGParser(path.join(__dirname, '../template/svg-template.svg'));
    svgtemplate.parse().then((res) => {
      const svgSprint = Object.assign({}, res[0], this.spriteContent);
      helper.saveSvg(svgSprint, `${this.outputPath}/output.svg`);
    });
  }

  createNewSprite(files) {
    this.collectAll(files);
    const promises = [];

    this.files.forEach((file) => {
      const svg = new SVGParser(file);
      promises.push(svg.parse());
    });
    Promise.all(promises).then((values) => {
      this.spriteContent.g.push(...values.map((content) => {
        const id = path.parse(content[1]).name.toLowerCase().replace('.', '_');
        this.CSSContent = `${this.CSSContent} ${helper.prepareCSS(id)}`;
        this.HTMLContent.push(`<div style = "margin:5px;border:1px solid grey;display:inline-block"> <span class='${id}' style="display:block;margin:0 auto;"></span> <span style="display:block;margin:0 auto;font-family:monospace;padding:3px;">${id}</span></div> `);
        return helper.updateProperties(helper.getContent(content[0]), id);
      }));
      console.log(chalk.green('> saving svg sprite file'));
      this.saveSVG();
      console.log(chalk.green('> savging css file'));
      this.saveCSS();
      console.log(chalk.green('> saving html file'));
      this.saveHTML();
      console.log(chalk.green.bold('> created svg sprite'));
    });
  }
}

module.exports = SVGSprite;
