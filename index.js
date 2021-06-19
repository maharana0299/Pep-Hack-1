const puppeteer = require('puppeteer');
const chalk = require('chalk');

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
async function automate(fileUrl) {
    try {

        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 50, // for slowing a bit 
            defaultViewport: null, // null the default viewport 
            args: ["--start-maximized"], // for full screen
        });

        console.log('Launched......');
        const page = (await browser.pages())[0];

        // trying to scrap the github data from link 
        let data = await gitScrapper(browser, page, demo3);
        console.log(data);

    } catch (e) {
        console.log(e);
    }
}

async function gitScrapper(browser, page, demoData) {

    try {
        console.log(chalk.blue(`Extracting Github Details for ${demoData.name}`));
        await page.goto(`${demoData.githubUrl}`);

        // extract contribution 
        await page.waitForSelector('.js-yearly-contributions h2');
        let contribution = await page.evaluate(() => {
            let contribution = document.querySelector('.js-yearly-contributions h2');
            return Number(contribution.innerText.split(" ")[0]);
        })

        console.log(chalk.green(`Contribution In Last Year: ${contribution}`));
        // if user have pinned repositories which are not forked from other then extract them 

        await page.waitForSelector('.pinned-item-list-item');

        let top5Repo = await page.evaluate(() => {

            let repo = [];
            let elements = document.querySelectorAll('.pinned-item-list-item.source a span');
            if (elements.length == 0)
                return repo;

            elements.forEach((ele) => {
                repo.push(ele.innerText.trim())
            })

            return repo.slice(0, 5);
        });

        // if not top5, then we have to extract from all repositories section
        let isContains5 = top5Repo.length == 5;


        // goto Repositories section 
        let repositorySection = (await page.$$('.UnderlineNav-item'))[1];
        await Promise.all([repositorySection.click(), page.waitForNavigation()]);

        await page.waitForSelector('#user-repositories-list li.source', { visible: true });
        let totalRepositories = await page.evaluate(() => {
            let allPersonalRepo = document.querySelectorAll('#user-repositories-list li.source')
            return allPersonalRepo.length;
        })

        console.log(chalk.green("Number of repositories: " + totalRepositories));

        // if length is less than 5, then we need to fetch repo name from users repo 
        if (!isContains5) {
            // if user havn't pinned their top5 repos, then extract the remaing from all repositories section
            top5Repo = await addRepositoriesFromAllRepositories(top5Repo, page, `#user-repositories-list li.source .d-inline-block h3`);

        }
        console.log(chalk.green(`Top 5 repositories: ${top5Repo}`));

        // now we need to extract the languages that user had used 
        let languagesUsed = await page.evaluate(() => {
            let spanTag = document.querySelectorAll('#user-repositories-list li.source .d-inline-block span[itemprop="programmingLanguage"]');
            const langsUsed = new Set();
            spanTag.forEach((e) => {
                langsUsed.add(e.innerText.trim());
            })
            return Array.from(langsUsed);
        });

        console.log(chalk.green(`Languages used are: ${languagesUsed}`));

        // all done 
        return {
            "Total Repositories": totalRepositories,
            Contribution: contribution,
            "Top 5 Repos": top5Repo,
            "Known Languages": languagesUsed,
        }
    } catch (e) {
        console.log(chalk.red(e));
        return { error: "Error Occured" }
    }
}


async function addRepositoriesFromAllRepositories(top5Repo, page, selector) {
    return await page.evaluate((top5Repo, selector) => {
        let repo = [];
        let allRepoHeadings = document.querySelectorAll(`${selector}`);
        if (allRepoHeadings.length == 0)
            return repo;

        allRepoHeadings.forEach((ele) => {
            repo.push(ele.innerText.trim())
        })

        repo.forEach((ele) => {
            if (top5Repo.length < 5 && !top5Repo.includes(ele)) {
                top5Repo.push(ele);
            }
        })
        return top5Repo;
    }, top5Repo, selector);
}

automate('put file url here')