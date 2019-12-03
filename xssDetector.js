const puppeteer = require('puppeteer');
var http = require('http');
var fs = require('fs');
var path = require('path');
var isAlertDetected = false;

const run = async function(imagePath) {
    var target_url = await spawnServer(imagePath);

    const browser = await puppeteer.launch(
    {
      headless: true
    });
    const page = await browser.newPage();
    await detectAlerts(page)
    await page.goto(target_url)
    await browser.close();
    return isAlertDetected;
}

async function detectAlerts(page) {
    page.on('dialog', async dialog => {
        await dialog.dismiss();
        isAlertDetected = true;
    });
 }

async function spawnServer(filePath) {

    var xssDetectorServer = http.createServer(function (request, response) {
        var contentType = 'text/html';
        fs.readFile(filePath, function(error, content) {
            if (error) {
                if(error.code == 'ENOENT')
                   throw "[xssDetector server]: Image passed not found in provided path";
                else 
                    throw "[xssDetector server]: Something went wrong when serving the image, "+error.code+' ..\n';
            }
            else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });

    }).listen(0);

    return `http://127.0.0.1:${xssDetectorServer.address().port}/`;
}

exports.run = run;