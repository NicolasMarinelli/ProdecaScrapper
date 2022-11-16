const puppeteer = require('puppeteer');
const express = require('express');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')

const app= express()

app.get('/',(req,res)=>{
    res.send('hello')
})


app.get('/results',async(req,res)=>{
    
    async function run(){
        // First, we must launch a browser instance
        const browser = await puppeteer.launch({
            // Headless option allows us to disable visible GUI, so the browser runs in the "background"
            // for development lets keep this to true so we can see what's going on but in
            // on a server we must set this to true
            headless: true,
            // This setting allows us to scrape non-https websites easier
            ignoreHTTPSErrors: true,
        })
        const url = 'https://prodeca.com.ar/auth/login'
        // then we need to start a browser tab
        let page = await browser.newPage();
        // and tell it to go to some URL
        await page.goto(url, {waitUntil: 'domcontentloaded'});

        await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        await page.waitForSelector('#mat-input-0')
        await page.click('#mat-input-0');
        await page.keyboard.type('n.marinelli@tecnoredenergia.ar');
        await page.click('body > prodeca-root > div > div > prodeca-login > div > div > div > mat-card > div > div:nth-child(1) > button');
        await page.waitForSelector('#mat-input-1')
        await page.click('#mat-input-1');
        await page.keyboard.type('Mitre857');
        await page.click('body > prodeca-root > div > div > prodeca-login > div > div > div > mat-card > div > div:nth-child(1) > button > span.mat-button-wrapper');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        await page.waitForSelector('body > prodeca-root > div > div > prodeca-tournaments > div > div > prodeca-tournament:nth-child(2) > div > div')
        await page.click('body > prodeca-root > div > div > prodeca-tournaments > div > div > prodeca-tournament:nth-child(2) > div > div');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        await page.click('body > prodeca-root > div > prodeca-toolbar > div > div > div:nth-child(5) > span');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        await page.waitForSelector('body > prodeca-root > div > div > prodeca-friend-tournaments > div > div > div.col-12.col-md-8.col-lg-9 > div > prodeca-thumb-friend-tournament > div > div')
        await page.click('body > prodeca-root > div > div > prodeca-friend-tournaments > div > div > div.col-12.col-md-8.col-lg-9 > div > prodeca-thumb-friend-tournament > div > div');  
        const lastPosition= await scrollPageToBottom(page, {
            size: 110,
            delay: 250,
        })
        await page.waitForSelector('body > prodeca-root > div > div > prodeca-friend-tournament > div.container-fluid > div > div.col-12.col-md-8.col-lg-7 > prodeca-user-ranking:nth-child(19) > mat-card')

        const data = await page.evaluate(() => {
            let result = []
            for(let i=1; i<19;i++){
                const div = document.querySelector(`body > prodeca-root > div > div > prodeca-friend-tournament > div.container-fluid > div > div.col-12.col-md-8.col-lg-7 > prodeca-user-ranking:nth-child(${i})`).innerHTML;
                result.push(div);
            }
            return result
        });
        // close everything
        await browser.close();

        return data

    }

const regex=  /\>(.*?)\</g
const results =await run();
const proceessresult=[]
results.forEach((data)=>{
    let value = [...data.match(regex)]
    let values= [value[2][1],value[5],value[7][1]]
    proceessresult.push(values)
})


console.log(proceessresult)
res.send(proceessresult)


})

const port = 3000

app.listen(port,()=>{
    console.log(`server is running in port ${port}`)
})