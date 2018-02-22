#!/bin/sh

# This file
# - cleans build folder for all projects under NANOPAY
# - generates the java code for all models
# - move all java code to the root directory build folder

# Remove the build folder if it exist and create a new one
clean() {
  if [ -d "$build/" ]; then
    rm -rf build
    mkdir build
  fi
}

# Clean top level build folder
clean

node tools/xsd/index.js net.nanopay.iso20022 pacs.002.001.09.xsd pacs.008.001.06.xsd pacs.028.001.01.xsd
node tools/xsd/index.js net.nanopay.fx.ascendantfx.model AFXLinkCustom.svc.xsd

# For each project, grabs java code
for d in *; do
  if [ "$d" = 'admin-portal' ]  || [ "$d" = 'foam2' ]   ||
     [ "$d" = 'interac' ]       || [ "$d" = 'merchant' ]  || [ "$d" = 'nanopay' ]; then

    cd $d
    clean

    cd src/
    find . -name '*.java' | cpio -pdm ../../build/

    cd ../../
  fi
done

#Generate java files from models and move to build folderses 
cwd=$(pwd)
node foam2/tools/genjava.js $cwd/tools/classes.js $cwd/build $cwd
