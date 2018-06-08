'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const Table = require('cli-table');
const _cliProgress = require('cli-progress');
const archiver = require('archiver');

module.exports = class PuppeteerUtil{
  async find(story_name){
    if(!story_name){
      console.log('please identify story name');
      return;
    }
    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.goto('https://www.mangahere.cc/');
    await page.type('#query', story_name);
    await this.clickPage(page, '.search_button');
    console.log("search finish");
    let searched_mangas = await page.$$eval(".result_search > dl > dt > a", (element) => {
      let manga_chapters = []
      for(var i = 0; i < element.length; i++){
        if(element[i].rel){
          manga_chapters.push({
            name: element[i].rel,
            key: element[i].href
          });
        }
      }
      return manga_chapters;
    });
    var table = new Table({head: ['story_name', 'manga_key']});
    for(let i = 0; i < searched_mangas.length; i++){
      table.push([searched_mangas[i].name, path.basename(searched_mangas[i].key)]);
      // console.log(searched_mangas[i]);
    }
    console.log(table.toString());
    await browser.close();
  }

  async listChapters(key){
    if(!key){
      console.log('please identify manga key');
      return;
    }
    let manga_url = `https://www.mangahere.cc/manga/${key}/`
    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.goto(manga_url);
    let chapters_url = await page.$$eval(".detail_list > ul > li > span.left > a", (element) => {
      let manga_chapters = []
      for(var i = 0; i < element.length; i++){
        manga_chapters.push(element[i].href);
      }
      return manga_chapters;
    })
    for(let i = chapters_url.length - 1; i >= 0; i--){
      console.log(path.basename(chapters_url[i]));
    }
    await browser.close();
  }

  async downloadAll(key){
    if(!key){
      console.log('please identify manga key');
      return;
    }
    let manga_url = `https://www.mangahere.cc/manga/${key}/`
    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.goto(manga_url);
    let chapters_url = await page.$$eval(".detail_list > ul > li > span.left > a", (element) => {
      let manga_chapters = []
      for(var i = 0; i < element.length; i++){
        manga_chapters.push(element[i].href);
      }
      return manga_chapters;
    })
    for(let i = 0; i < chapters_url.length; i++){
      await page.goto(chapters_url[i]);
      await this.download(page, key, chapters_url[i]);
    }
    await browser.close();
  }

  async downloadChapter(key, command){
    if(!key){
      console.log('please identify manga key');
      process.exit(1);
    }
    if(!command.chapter){
      console.log('please identify chapter');
      process.exit(1);
    }
    var chapter = '';
    if(command.chapter < 10) chapter = `c00${parseInt(command.chapter)}`;
    else if(command.chapter < 100) chapter = `c0${parseInt(command.chapter)}`;
    else chapter = `c${parseInt(command.chapter)}`;
    let manga_url = `https://www.mangahere.cc/manga/${key}/${chapter}/`
    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.goto(manga_url);
    try{
      await this.download(page, key, manga_url);
      await browser.close();
    }catch(exception){
      console.log(exception);
      console.log("chapter not found")
      process.exit(1);
    }
  }

  async download(page, key, url){
    var manga_pages = await page.$$eval("section.readpage_top > .go_page > span.right > select > option", (element) => {
      let manga_pages = []
      for(var i = 0; i < element.length; i++){
        manga_pages.push(element[i].value);
      }
      return manga_pages;
    })
    manga_pages.splice(-1,1);
    let file_dir = `./${key}/${path.basename(url)}`;
    fs.ensureDir(file_dir, err => {
      if(err) console.log(err)
    });
    var bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    console.log(`start download ${url}`)
    bar1.start(100, 0);
    for(let i = 0; i < manga_pages.length; i++){
      await page.goto(`https:${manga_pages[i]}`);
      let image_url = await page.evaluate(() => document.getElementById("image").src);
      var viewSource = await page.goto(image_url);
      var page_file_name = '';
      if(i + 1 < 10) page_file_name = `00${i + 1}.jpg`;
      else if(i + 1 < 100) page_file_name = `0${i + 1}.jpg`;
      else page_file_name = `${i + 1}.jpg`;
      fs.writeFile(`${file_dir}/${page_file_name}`, await viewSource.buffer(), err => {
          if(err) {
              return console.log(err);
          }
      });
      bar1.update(100 * (i + 1) / manga_pages.length);
    }
    bar1.stop();
    console.log(`${url} download complete`);
    await this.compressFiles(key, path.basename(url), file_dir);
  }

  async compressFiles(key, file_name, file_dir){
    var output = fs.createWriteStream(`./${key}` + `/${file_name}.cbz`);
    var archive = archiver('zip', {
      zlib: { level: 9 }
    });
    archive.pipe(output);
    archive.directory(file_dir, false);
    await archive.finalize();
    fs.remove(file_dir, err => {
      if(err)console.log(err);
    })
  }

  clickPage(page, selector){
    let promise_all = [];
    promise_all.push(page.click(selector));
    promise_all.push(page.waitForNavigation());
    return Promise.all(promise_all);
  }
}