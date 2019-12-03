<?php

require 'vendor/autoload.php';

use Imagine\Image\Box;
use Imagine\Image\Point;

function testGd($path, $driver, $testName, $width, $height)
{
    $img_extension = pathinfo($path)['extension'];

    $imagine = new Imagine\Gd\Imagine();

    $image = $imagine->open($path);

    $image->resize(new Box($width, $height))
        ->save('./output/'.$testName.'-Imagine-'.$driver.'.'.$img_extension);
}

function testImagick($path, $driver, $testName, $width, $height)
{
    $img_extension = pathinfo($path)['extension'];

    $imagine = new Imagine\Imagick\Imagine();

    $image = $imagine->open($path);

    $image->resize(new Box($width, $height))
        ->save('./output/'.$testName.'-Imagine-'.$driver.'.'.$img_extension);
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