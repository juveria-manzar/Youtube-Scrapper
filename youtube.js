const { time } = require('console');
const puppeteer = require('puppeteer');

(async () => {
    let totalVideos = 0;
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
        defaultViewport: null,
        args: ["--start-maximized"]
    });
    const page = await browser.newPage();
    await page.goto('https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj');

    await page.waitForSelector('.style-scope.yt-formatted-string');
    totalVideos = await page.evaluate(function () {
        let a = document.querySelectorAll('.style-scope.yt-formatted-string')
        let timeText = a[1].innerText;
        if (timeText.length > 3) {
            timeText = timeText.split(',').join("");
        }
        return Number(timeText);
    });

    let ans= await page.evaluate( async function (tv) {
        let a = document.querySelectorAll('#text.style-scope.ytd-thumbnail-overlay-time-status-renderer');

        function hmsToSecondsOnly(str) {
            var p = str.split(':'),
                s = 0, m = 1;
        
            while (p.length > 0) {
                s += m * parseInt(p.pop(), 10);
                m *= 60;
            }
        
            return s;
        }

        let p=new Promise(function(resolve,reject){
            let interval = setInterval(function () {
                if (a.length != tv) {
                    let videoCardContainer = document.querySelector("#contents");
                    window.scrollTo(0, videoCardContainer.scrollHeight);
                    a = document.querySelectorAll('#text.style-scope.ytd-thumbnail-overlay-time-status-renderer');
                } else {
                    clearInterval(interval);
                    resolve();
                }
            }, 500);
        });

    await p;
    let allDuration=[];
    for(let i=0;i<a.length;i++){
        allDuration.push(hmsToSecondsOnly(a[i].innerText.trim()));
    }
        let totalDurationInSec=allDuration.reduce(function(a,b){return a+b})
        let totalDurationInHours = (totalDurationInSec/3600).toFixed(2)
        return totalDurationInHours;
    }, totalVideos)

    console.log(ans);
    // await browser.close();
})();