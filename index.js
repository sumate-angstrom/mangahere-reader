'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

(async () => {
  var browser = await puppeteer.launch();
  var page = await browser.newPage();
  await page.goto('https://www.mangahere.cc/');
  await page.type('#query', 'diamond');
  await clickPage(page, '.search_button');
  console.log("search finish");
  let name = "Diamond Cut Diamond";
  await clickPage(page, `.result_search > dl > dt > a[rel="${name}"]`);
  console.log("click to name")
  let chapters_url = await page.$$eval(".detail_list > ul > li > span.left > a", (element) => {
    let manga_chapters = []
    for(var i = 0; i < element.length; i++){
      manga_chapters.push(element[i].href);
    }
    return manga_chapters;
  })
  let lower_case_name = name.toLowerCase().split(" ").join("_");
  console.log(path.basename(chapters_url[25]));
  await page.goto(chapters_url[25]);
  console.log('go to chapter');
  // var manga_pages = await page.$$eval("section.readpage_top > .go_page > span.right > select > option", (element) => {
  //   let manga_pages = []
  //   for(var i = 0; i < element.length; i++){
  //     manga_pages.push(element[i].value);
  //   }
  //   return manga_pages;
  // })
  // manga_pages.splice(-1,1);

  // fs.ensureDir('./dcd', err => {
  //   if(err) console.log(err)
  // })


  // for(let i = 0; i < manga_pages.length; i++){
  //   await page.goto(`https:${manga_pages[i]}`);
  //   let image_url = await page.evaluate(() => document.getElementById("image").src);
  //   var viewSource = await page.goto(image_url);
  //   fs.writeFile(`./dcd/${i}.jpg`, await viewSource.buffer(), err => {
  //       if(err) {
  //           return console.log(err);
  //       }
  //       console.log("The file was saved!");
  //   });
  // }
  await browser.close();
})();

function clickPage(page, selector){
  let promise_all = [];
  promise_all.push(page.click(selector));
  promise_all.push(page.waitForNavigation());
  return Promise.all(promise_all);
}