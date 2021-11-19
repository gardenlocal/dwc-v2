const puppeteer = require('puppeteer');

const config = require(process.argv[2])
const { NO_USERS, MIN_USER_CONNECT_TIME, MAX_USER_CONNECT_TIME, MIN_USER_DELAY, MAX_USER_DELAY, URL } = config

function sleep(s) {
    return new Promise((res, rej) => {
        setTimeout(() => res(), s * 1000)
    })
}

const randomInRange = (a, b) => {
    return Math.random() * (b - a) + a
}
  

const handleUser = async (browser, index) => {
    console.log('User ', index, ' taking a break...')
    await sleep(randomInRange(MIN_USER_DELAY, MAX_USER_DELAY))

    try {
        console.log('User ', index, ' opening a browser...')
        const page = await browser.newPage();
    
        console.log('User ', index, ' navigating to ', URL)
        await page.goto(URL)
        page.setDefaultNavigationTimeout(0)
    
        const duration = randomInRange(MIN_USER_CONNECT_TIME, MAX_USER_CONNECT_TIME)
        console.log('User ', index, 'will be active for ', duration, 'seconds')    
        await sleep(duration)
    
        console.log('User ', index, ' leaving page...')
        await page.close()    
    } catch (e) {
        console.log('Caught exception for user ', index)
    } finally {
        handleUser(browser, index)
    }
}

(async () => {
    let pages = []    
    const browser = await puppeteer.launch({ headless: true });

    for (let i = 0; i < NO_USERS; i++) {
        handleUser(browser, i)
    }
})()