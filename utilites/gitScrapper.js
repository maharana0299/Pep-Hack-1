const puppeteer = require('puppeteer');
const chalk = require('chalk');
const constants = require(`../excelKeys.js`);

async function gitScrapper(browser, page, user, githubKey) {

    if (user[githubKey]) {

        try {

            console.log(chalk.blue(`Extracting Github Details for ${user['Name']}`));
            await page.goto(`${user[githubKey]}`);

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
                top5Repo = await getFirst5RepoForUser(top5Repo, page, `#user-repositories-list li.source .d-inline-block h3`);

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
            user[constants.noOfRepo] = totalRepositories;
            user[constants.contribution] = contribution;
            user[constants.gitRepo] = top5Repo.join(', ');
            user[constants.knownLanguages] = languagesUsed.join(', ');

            return user;
        } catch (e) {
            console.log(chalk.red(e));
            return { error: "Error Occured" }
        }
    }
}


async function getFirst5RepoForUser(top5Repo, page, selector) {
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

module.exports = gitScrapper;