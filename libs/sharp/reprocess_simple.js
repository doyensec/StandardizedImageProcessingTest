const sharp = require('sharp');

var path = process.argv[2];
var driver = process.argv[3];
var testName = process.argv[4];
var width = process.argv[5];
var height = process.argv[6];
var img_extension = path.match(/\.(\w+)/)[1];
sharp(path)
  .resize(width/1, height/1)
  .toFile('./output/'+testName+'-sharp-'+driver+'.'+img_extension, (err, info) => { 
  	console.log(err)
  });