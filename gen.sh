#!/bin/sh

# This file
# - generates the java code for all models

node tools/xsd/index.js net.nanopay.iso20022 \
  pacs.002.001.09.xsd \
  pacs.008.001.06.xsd \
  pacs.028.001.01.xsd \
  pain.007.001.07.xsd \
  tsin.004.001.01.xsd

node tools/xsd/index.js net.nanopay.fx.ascendantfx.model AFXLinkCustom.svc.xsd

node tools/xsd/index.js net.nanopay.fx.kotak.model \
  KotakPaymentRequest.xsd \
  KotakPaymentResponse.xsd \
  KotakReversal.xsd

node foam2/tools/genjava.js tools/classes.js build $PWD
