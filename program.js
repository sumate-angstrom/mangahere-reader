const program = require('commander');
const puppeteer_util = require('./puppeteer_util');

program
  .command("find <story_name>")
  .action((story_name,command) => {
    console.log(command.name())
    console.log(story_name)
    var puppeteer_util_class = new puppeteer_util();
    puppeteer_util_class.find(story_name);
  })

program.parse(process.argv);