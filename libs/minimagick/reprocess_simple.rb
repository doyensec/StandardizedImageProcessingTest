require "mini_magick"

picturePath = ARGV[0]
driver = ARGV[1]
testName = ARGV[2];
width = ARGV[3];
height = ARGV[4];

if driver != "magick"
	MiniMagick.configure do |config|
		config.cli = :graphicsmagick # or :imagemagick or :imagemagick7
		driver = "graphicsmagick"
	end
end

image = MiniMagick::Image.open(picturePath)
image.path
image.resize height+"x"+width
if File.extname(picturePath) === ".png"
	image.format "png"
	image.write "./output/"+testName+"-minimagick-"+driver+".png"
else
	image.format "jpg"
	image.write "./output/"+testName+"-minimagick-"+driver+".jpg"
end

