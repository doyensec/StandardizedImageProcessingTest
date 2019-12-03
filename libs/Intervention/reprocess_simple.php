<?php
require 'vendor/autoload.php';
use Intervention\Image\ImageManager;

function testGd($path, $driver, $testName, $width, $height)
{
    $manager = new ImageManager(array('driver' => 'gd'));
    $image = $manager->make($path)->resize($width, $height);
    $img_extension = pathinfo($path)['extension'];
    var_dump($img_extension);
	$image->save('./output/'.$testName.'-Intervention-'.$driver.'.'.$img_extension);
}

function testImagick($path, $driver, $testName, $width, $height)
{
    $manager = new ImageManager(array('driver' => 'imagick'));
    $image = $manager->make($path)->resize($width, $height);
    $img_extension = pathinfo($path)['extension'];
	$image->save('./output/'.$testName.'-Intervention-'.$driver.'.'.$img_extension);
}

$imagepath = $argv[1];
$driver = $argv[2];
$testName = $argv[3];
$width = $argv[4];
$height = $argv[5];

if ($driver === "magick")
    testImagick($imagepath, $driver, $testName, $width, $height);
else
    testGd($imagepath, $driver, $testName, $width, $height);