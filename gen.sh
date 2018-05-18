#!/bin/sh

# This file
# - cleans build
# - generates the java code for all models

# Remove the build folder if it exist and create a new one
clean() {
  if [ -d "build/" ]; then
    rm -rf build
    mkdir build
  fi
}

# Clean top level build folder
clean

node tools/xsd/index.js net.nanopay.iso20022 \
  pacs.002.001.09.xsd \
  pacs.008.001.06.xsd \
  pacs.028.001.01.xsd \
  pain.007.001.07.xsd \
  tsin.004.001.01.xsd

node tools/xsd/index.js net.nanopay.fx.ascendantfx.model AFXLinkCustom.svc.xsd

node foam2/tools/genjava.js tools/classes.js build $PWD
