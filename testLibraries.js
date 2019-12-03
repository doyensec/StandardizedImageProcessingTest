const execa = require('execa');
const assert = require('assert');
const fs = require('fs');
const rimraf = require("rimraf");
const fc = require('filecompare');
var chai = require('chai');
var expect = require('chai').expect;
var xssDetector = require('./xssDetector');

const testDir = './output/';
const testImagesBasePath = "./images/";
const libsBasePath = "libs";

// Image Libraries Polymorphism Survey
// A library "pass" a test if it behaves correctly e.g. :
// - reject a malformed image
// - does not keep injectable exif
// - return a "good" and "clean" image

// Test1: Check if file changes when a simple resize at same heigh/width is performed (sanity check)
// Test2: Embedding the payload in the exif metadata (tEXt, iTXt and other fields)
// Test3: Embedding the payload in the entropy-coded segment (ECS) for JPEGs
// Test4: Concatenating a JS payload at the end of a valid image (e.g. after IEND for PNGs)
// Test5: Embedding the payload in the iDAT for PNGs
// Test6: Various Experimental #1

before(function() {
    clean();
});

after(function() {
    //process.exit(1);
    console.log("Done!")
})

function runAllTests(interpreter, args, libraryName) {
    //test1(interpreter, args, libraryName);
    //test2(interpreter, args, libraryName);
    //test3(interpreter, args, libraryName);
    //test4(interpreter, args, libraryName);
    test6(interpreter, args, libraryName);
}

describe("PHP libraries", function(){
  const interpreter = "php";


  // Starts Intervention Tests (Imagemagick)
  describe("Intervention", function() {  
      // Starts Intervention Tests (Imagemagick)
      describe("(Imagemagick Driver)", function() {
        const libraryName = "Intervention";
        const libPath = libsBasePath + "/" + libraryName;
        let args = [libPath, "", "magick", "", ""];
        runAllTests(interpreter, args, libraryName)
      }); // Ends Intervention Tests (Imagemagick)

      // Starts Intervention Tests (GraphicsMagick)
      describe("(GraphicsMagick Driver)", function() {
        const libraryName = "Intervention";
        const libPath = libsBasePath + "/" + libraryName;
        let args = [libPath, "", "graphicsmagick", "", ""];
        runAllTests(interpreter, args, libraryName)
      }); // Ends Intervention Tests (GraphicsMagick)
  });

  describe("Imagine", function() {
      // Starts Imagine Tests (Imagemagick)
      describe("(Imagemagick Driver)", function() {
        const libraryName = "Imagine";
        const libPath = libsBasePath + "/" + libraryName;
        let args = [libPath, "", "magick", "", ""];
        runAllTests(interpreter, args, libraryName)
      }); // Ends Imagine Tests (Imagemagick)

      // Starts Imagine Tests (GraphicsMagick)
      describe("(GraphicsMagick Driver)", function() {
        const libraryName = "Imagine";
        const libPath = libsBasePath + "/" + libraryName;
        let args = [libPath, "", "graphicsmagick", "", ""];
        runAllTests(interpreter, args, libraryName)
      }); // Ends Imagine Tests (GraphicsMagick)
  });

});

describe("Ruby libraries", function(){
  const interpreter = "ruby";

  // Starts MiniMagick Tests (Imagemagick)
  describe("MiniMagick (Imagemagick Driver)", function() {
    const libraryName = "minimagick";
    const libPath = libsBasePath + "/" + libraryName;
    let args = [libPath, "", "magick", "", ""];
    runAllTests(interpreter, args, libraryName)
  }); // Ends MiniMagick Tests (Imagemagick)

  // Starts MiniMagick Tests (GraphicsMagick)
  describe("MiniMagick (GraphicsMagick Driver)", function() {
    const libraryName = "minimagick";
    const libPath = libsBasePath + "/" + libraryName;
    let args = [libPath, "", "graphicsmagick", "", "", ""];
    runAllTests(interpreter, args, libraryName)
  }); // Ends MiniMagick Tests (GraphicsMagick)

});

describe("Node libraries", function(){
  const interpreter = "node";

  // Starts Sharp Tests (libvips)
  describe("Sharp (libvips Driver)", function() {
    const libraryName = "sharp";
    const libPath = libsBasePath + "/" + libraryName;
    let args = [libPath, "", "libvips", "", ""];
    runAllTests(interpreter, args, libraryName)
  }); // Ends Sharp Tests (libvips)

});

// ====== TEST1 =======

function test1(interpreter, args, libraryName) {
    const scriptName = "reprocess_simple";
    const partialImagePath = testImagesBasePath + "test1"; // image name for the test
    const imageSize = [800, 600];


    const testName = getScriptName(arguments.callee);
    let scriptArgs = args.slice(0);
    scriptArgs[0] = scriptArgs[0]+"/"+scriptName+pickExtension(interpreter);
    scriptArgs[3] = testName;
    scriptArgs[4] = imageSize[0];
    scriptArgs[5] = imageSize[1];
    describe("has differences when re-encoding an image with no parameters", function() {
        it("for JPEG", async () => {
            const extension = ".jpg";
            var jpegArgs = scriptArgs;
            jpegArgs[1] = partialImagePath + extension;

            var imageEquality = await (async () => {
                var stdout;
                try {
                    stdout = await execa(interpreter, jpegArgs);
                } catch (e) {
                    // This should never throw an error
                }
                const outputPath = testDir+testName+"-"+libraryName+"-"+jpegArgs[2]+extension;
                return fc(jpegArgs[1], outputPath, function(isEqual) {
                    return isEqual;
                });
            })();
            expect(imageEquality).to.be.false;
        })
        it("for PNG", async () => {
            const extension = ".png";
            var pngArgs = scriptArgs;

            pngArgs[1] = partialImagePath + extension;
            var imageEquality = await (async () => {
                var stdout;
                try {
                    stdout = await execa(interpreter, pngArgs);
                } catch (e) {
                    // This should never throw an error
                }
                const outputPath = testDir+testName+"-"+libraryName+"-"+pngArgs[2]+extension;
                return fc(pngArgs[1], outputPath, function(isEqual) {
                    return isEqual;
                });
            })();
            expect(imageEquality).to.be.false;
        })
    })
}


// ====== TEST2 =======

function test2(interpreter, args, libraryName) {
    const scriptName = "reprocess_simple";
    const imageSize = [250, 229];
    const partialImagePath = testImagesBasePath + "payload_in_all_known_exif";
    const testDescription = "keep multiple XSS payloads in exif when converting";

    const testName = getScriptName(arguments.callee);
    testIfOutputImageTriggersXSS(interpreter, args, libraryName, testName, partialImagePath, testDescription, scriptName, imageSize)
}


// ====== TEST3 =======

function test3(interpreter, args, libraryName) {
    const scriptName = "reprocess_simple";
    const imageSize = [256, 128];
    const partialImagePath = testImagesBasePath + "PE.jpeg"
    const testDescription = "neutralize scholar's payload";

    const testName = getScriptName(arguments.callee);
    testIfOutputImageTriggersXSS(interpreter, args, libraryName, testName, partialImagePath, testDescription, scriptName, imageSize)
}


// ====== TEST4 =======

function test4(interpreter, args, libraryName) {
    const scriptName = "reprocess_simple";
    const imageSize = [512, 512];
    const partialImagePath = testImagesBasePath + "test4"
    const testDescription = "neutralize payload attached at the end of the image";

    const testName = getScriptName(arguments.callee);
    testIfOutputImageTriggersXSS(interpreter, args, libraryName, testName, partialImagePath, testDescription, scriptName, imageSize)
}

// ====== TEST5 =======

function test5(interpreter, args, libraryName) {
    const scriptName = "reprocess_simple";
    const imageSize = [512, 512];
    const partialImagePath = testImagesBasePath + "test5.png"
    const testDescription = "neutralize payload in IDAT";

    const testName = getScriptName(arguments.callee);
    testIfOutputImageTriggersXSS(interpreter, args, libraryName, testName, partialImagePath, testDescription, scriptName, imageSize)
}

// ====== TEST6 =======

function test6(interpreter, args, libraryName) {
    const scriptName = "reprocess_simple";
    const imageSize = [512, 512];
    const partialImagePath = testImagesBasePath + "test6.jpg"
    const testDescription = "various experimental #1";

    const testName = getScriptName(arguments.callee);
    testIfOutputImageTriggersXSS(interpreter, args, libraryName, testName, partialImagePath, testDescription, scriptName, imageSize)
}

function testIfOutputImageTriggersXSS(interpreter, args, libraryName, testName, testImageFilePath, testDescription, scriptName, imageSize) {
    let scriptArgs = args.slice(0);
    scriptArgs[0] = scriptArgs[0]+"/"+scriptName+pickExtension(interpreter);
    scriptArgs[3] = testName;
    scriptArgs[4] = imageSize[0];
    scriptArgs[5] = imageSize[1];
    var alreadyHasFileExtension = false;
    describe(testDescription, function() {

        if (testImageFilePath.endsWith(".jpeg")) //check if the extension was already added by the test or has to be added and both imaged have to be tested 
            alreadyHasFileExtension = "jpeg";
        else if (testImageFilePath.endsWith(".jpg"))
            alreadyHasFileExtension = "jpg";
        else if (testImageFilePath.endsWith(".png"))
            alreadyHasFileExtension = "png";

        if ((alreadyHasFileExtension === false) || (alreadyHasFileExtension === "jpg") || (alreadyHasFileExtension === "jpeg"))
            it("for JPEG", async () => {
                const extension = ".jpg";
                var jpegArgs = scriptArgs;
                if (alreadyHasFileExtension)
                    jpegArgs[1] = testImageFilePath;
                else
                    jpegArgs[1] = testImageFilePath + extension;

                var stdout;
                var failed = false;
                try {
                    stdout = await execa(interpreter, jpegArgs);
                } catch (e) {
                    failed = true;
                    console.log(e.message)
                }
                if (!failed) {
                    if (alreadyHasFileExtension) alreadyHasFileExtension = "."+alreadyHasFileExtension;
                    let outputPath = testDir+testName+"-"+libraryName+"-"+jpegArgs[2]+ (alreadyHasFileExtension || extension);
                    if (!fs.existsSync(outputPath))
                        outputPath = testDir+testName+"-"+libraryName+"-"+jpegArgs[2]+ (".jpg");
                    if (!fs.existsSync(outputPath))
                        {
                            console.log("[!] "+testName +" on "+libraryName+" did not return any output")
                            var isAlertDetected = await xssDetector.run(outputPath);
                            expect(isAlertDetected).to.be.false;
                        }
                }
            });

        if ((alreadyHasFileExtension === false) || (alreadyHasFileExtension === "png")) // this was placed to support test3, which is jpg only
            it("for PNG", async () => {
                const extension = ".png";
                var pngArgs = scriptArgs;

                if (alreadyHasFileExtension)
                    pngArgs[1] = testImageFilePath;
                else
                    pngArgs[1] = testImageFilePath + extension;

                var stdout;
                var failed = false;
                try {
                    stdout = await execa(interpreter, pngArgs);
                } catch (e) {
                    failed = true;
                    console.log(e.message)
                }
                if (!failed) {
                    if (alreadyHasFileExtension) alreadyHasFileExtension = "."+alreadyHasFileExtension;
                     let outputPath = testDir+testName+"-"+libraryName+"-"+pngArgs[2]+ (alreadyHasFileExtension || extension);
                    var isAlertDetected = await xssDetector.run(outputPath);
                    expect(isAlertDetected).to.be.false;
                }
            });
    })
}

function pickExtension(interpreter) {
    switch (interpreter) {
        case "php": return ".php"; break;
        case "ruby": return ".rb"; break;
        case "node": return ".js"; break;
    }
}

function clean() {
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    } else {
        rimraf.sync(testDir);
        clean();
    }
}

function getScriptName(caller) 
{
   var myName = caller.toString();
   myName = myName.substr('function '.length);
   myName = myName.substr(0, myName.indexOf('('));

   return myName;
}
