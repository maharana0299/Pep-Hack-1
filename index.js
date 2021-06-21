const puppeteer = require('puppeteer');
const chalk = require('chalk');
const fs = require('fs');
const csv = require('csvtojson');
const { parse } = require('json2csv');
const csvFilePath = './Profile Data.csv';
const constants = require(`./excelKeys.js`);
const gitScrapper = require('./utilites/gitScrapper');

let githubKey;
let leetCodeKey;
let codechefKey;

let demoData = {
    name: `Nirbhay Kumar Nachiketa`,
    githubUrl: `https://github.com/maharana0299`,
    leetcodeUrl: `https://leetcode.com/nirbhay0299/`,
}

let demo2 = {
    name: 'Shubham',
    githubUrl: 'https://github.com/shubham242k',
}
let demo3 = {
    name: 'Taniya',
    githubUrl: 'https://github.com/taniya142',
}
async function automate(csvFilePath) {
    try {

        const browser = await puppeteer.launch({
            headless: true,
            slowMo: 50, // for slowing a bit 
            defaultViewport: null, // null the default viewport 
            args: ["--start-maximized"], // for full screen
        });
        console.log('Launched......');

        // Async / await usage
        const jsonArray = await csv().fromFile(csvFilePath);
        // console.log(jsonArray);

        if (!jsonArray || jsonArray.length == 0) {
            console.log('Null or Empty!!');
            return;
        }

        updateKeys(jsonArray);

        const page = (await browser.pages())[0];

        for (let i in jsonArray) {

            // console.log(jsonArray[i][githubKey]);
            // console.log(jsonArray[i][leetCodeKey]);
            // console.log(jsonArray[i][codechefKey]);
            // trying to scrap the github data from link 
            if (jsonArray[i]) { // if non empty or not null 

                // we are passing the json and as it is passed by reference, we are appending data in it to make our works easy 
                await gitScrapper(browser, page, jsonArray[i], githubKey);
                // array updated with Github Contents
                // console.log(jsonArray[i]);
            }
        }

        // after completing all the stuffs, we will creae a new csv file and add it 

        // now converting final data to csv
        const fields = Object.keys(jsonArray[0]);
        const opts = { fields };

        try {
            const csv = parse(jsonArray, opts);
            fs.writeFileSync('./dataModify.csv', csv);

            console.log(chalk.greenBright('Bravo!! Your data is now processed, click to open it'));
            console.log(`./dataModify.csv`);
        } catch (err) {
            console.error(err);
        }

    } catch (e) {
        console.log(e);
    }
}



function updateKeys(jsonArray) {
    for (let key in jsonArray[0]) {
        let validate = key.toLowerCase();
        if (validate.includes('github')) {
            githubKey = key;
        } else if (validate.includes('leetcode')) {
            leetCodeKey = key;
        } else if (validate.includes('codechef')) {
            codechefKey = key;
        }
    }
}


automate(`${csvFilePath}`);