#!/bin/sh

rm -r build
mkdir build

echo $cwd
cwd=$(pwd)
cd ../foam2
rm -rf build
mkdir build
cd src
find . -name '*.java' | cpio -pdm $cwd/build/
cd ../../NANOPAY/
cd b2b/src
find . -name '*.java' | cpio -pdm $cwd/build
cd ../../
cd interac/src
find . -name '*.java' | cpio -pdm $cwd/build
cd ../../
cd nanopay/src
find . -name '*.java' | cpio -pdm $cwd/build
cd ../../
cd build/
find . -name build -type d -print0|xargs -0 rm -r --
cd ../
# Generate java files to build dir

node ../foam2/tools/genjava.js $cwd/tools/classes.js $cwd/build $cwd