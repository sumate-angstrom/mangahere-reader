const program = require('commander');
const puppeteer_util = require('./puppeteer_util');

program
  .command("find <story_name>")
  .action((story_name,command) => {
    var puppeteer_util_class = new puppeteer_util();
    puppeteer_util_class.find(story_name);
  })

program
  .command("list_chapters <manga_key>")
  .action((manga_key,command) => {
    var puppeteer_util_class = new puppeteer_util();
    puppeteer_util_class.listChapters(manga_key);
  })

program
  .command("download <manga_key>")
  .option("-c, --chapter <chapter>", "chapter want to download")
  .action((manga_key,command) => {
    var puppeteer_util_class = new puppeteer_util();
    if(command.chapter){
      puppeteer_util_class.downloadChapter(manga_key, command);
    }else{
      puppeteer_util_class.downloadAll(manga_key);
    }
  })

program.parse(process.argv);