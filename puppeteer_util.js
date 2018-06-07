'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

module.exports = class PuppeteerUtil{
  async find(story_name){
    var browser = await puppeteer.launch();
    var page = await browser.newPage();
    await page.goto('https://www.mangahere.cc/');
    await page.type('#query', story_name);
    await this.clickPage(page, '.search_button');
    console.log("search finish");
    let searched_mangas = await page.$$eval(".result_search > dl > dt > a", (element) => {
      let manga_chapters = []
      for(var i = 0; i < element.length; i++){
        manga_chapters.push(element[i].rel);
      }
      return manga_chapters;
    });
    for(let i = 0; i < searched_mangas.length; i++){
      console.log(searched_mangas[i]);
    }
    await browser.close();
  }

  clickPage(page, selector){
    let promise_all = [];
    promise_all.push(page.click(selector));
    promise_all.push(page.waitForNavigation());
    return Promise.all(promise_all);
  }
}