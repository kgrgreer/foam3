#!/bin/sh

# This file
# - generates the java code for all models

node tools/xsd/index.js net.nanopay.iso20022 \
  pacs.002.001.09.xsd \
  pacs.008.001.06.xsd \
  pacs.028.001.01.xsd \
  pain.001.001.03.xsd \
  pain.008.001.02.xsd \
  pain.002.001.03.xsd \
  pain.007.001.07.xsd \
  tsin.004.001.01.xsd

node tools/xsd/index.js net.nanopay.fx.ascendantfx.model AFXLinkCustom.svc.xsd

node tools/xsd/index.js net.nanopay.kotak.model.paymentRequest KotakPaymentRequest.xsd
node tools/xsd/index.js net.nanopay.kotak.model.paymentResponse KotakPaymentResponse.xsd
node tools/xsd/index.js net.nanopay.kotak.model.reversal KotakReversal.xsd

# node tools/xsd/index.js net.nanopay.partner.treviso.api.exchange TrevisoExchangeService/Exchange.xsd

node --stack_trace_limit=200 foam3/tools/genjava.js $1 $2 $PWD "$3"
