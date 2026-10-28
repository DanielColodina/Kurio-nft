import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
for(const [name,width,height] of [['audit-desktop-home',1440,900],['audit-mobile-home',414,896],['audit-desktop-sorted',1440,900]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const url=name.endsWith('sorted')?'http://127.0.0.1:4174/?sort=price_asc#diario':'http://127.0.0.1:4174/';
 page.on('pageerror',err=>console.log(name,'ERROR',err.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(3500);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.waitForTimeout(100);
 const sizes=await page.evaluate(()=>({h:document.documentElement.scrollHeight,scrollY:scrollY,images:[...document.images].slice(0,5).map(i=>({ok:i.complete&&i.naturalWidth>0,src:i.currentSrc}))}));
 await page.screenshot({path:name+'.png',fullPage:true,animations:'disabled'});
 console.log(name,JSON.stringify(sizes));
 await page.close();
}
await browser.close();