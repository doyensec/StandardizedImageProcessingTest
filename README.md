# Standardized Image Processing Test Suite
Currently supported libraries:
- Intervention (both ImageMagick and GraphicsMagick drivers)
- Imagine (both ImageMagick and GraphicsMagick drivers)
- MiniMagick (both ImageMagick and GraphicsMagick drivers)
- Sharp (libvips driver)

For background on how we leveraged this tool to exploit a Cross-Site Scripting vulnerability affecting a Google web property, please refer to https://blog.doyensec.com/2020/04/30/polymorphic-images-for-xss.html

## How to run it
After executing `npm install`, just run:
```
npm run test
```

## How to add a new test
Place the test images in the /images/ folder and add your custom test to the `runAllTests` callback in the `testLibraries.js` file:

```
function runAllTests(interpreter, args, libraryName) {
    test1(interpreter, args, libraryName);
    test2(interpreter, args, libraryName);
    test3(interpreter, args, libraryName);
    test4(interpreter, args, libraryName);
    ...
    testX(interpreter, args, libraryName);
}
```

Then, define the test function in the same file, e.g.:

```
function test2(interpreter, args, libraryName) {
    const scriptName = "reprocess_simple"; // script name, e.g. process.php
    const imageSize = [250, 229]; // height, width of the test image
    const partialImagePath = testImagesBasePath + "payload_in_all_known_exif"; // name of the test image. If no extension is provided, both .jpg and .png versions will be looked for and tested
    const testDescription = "keep multiple XSS payloads in exif when converting"; // description for the test

    const testName = getScriptName(arguments.callee);
    testIfOutputImageTriggersXSS(interpreter, args, libraryName, testName, partialImagePath, testDescription, scriptName, imageSize)
}
```
You can re-use helper functions like `testIfOutputImageTriggersXSS` or `filecompare` in your test, or define new ones depending on which differences do you wish to detect between libraries.



## How to add a new library
Create a new folder with the same name as the new library name in the `libs/` folder. You will finally need to add the library name to the corresponding language section (e.g. for sharp for Node.JS, using libvips):

```
describe("Node libraries", function(){
  const interpreter = "node"; //interpreter

  // Starts Sharp Tests (libvips)
  describe("Sharp (libvips Driver)", function() {
    const libraryName = "sharp";
    const libPath = libsBasePath + "/" + libraryName;
    let args = [libPath, "", "libvips", "", ""];
    runAllTests(interpreter, args, libraryName)
  }); // Ends Sharp Tests (libvips)

});
```

## Credits

This work has been sponsored by [Doyensec LLC](https://www.doyensec.com).

![alt text](https://doyensec.com/images/logo.svg "Doyensec Logo")
