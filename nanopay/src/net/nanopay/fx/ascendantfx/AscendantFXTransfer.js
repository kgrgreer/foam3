/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXTransfer',
  extends: 'net.nanopay.fx.FXTransfer',

  documentation: `Hold Ascendant FX specific properties`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.fx.FXService',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.fx.ascendantfx.model.AcceptQuoteResult',
    'net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest',
    'net.nanopay.fx.ExchangeRateStatus'
  ],

  methods: [
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaCode: `
      //Get ascendant service
      AscendantFX ascendantFX = (AscendantFX) x.get("ascendantFX");
      FXService fxService = new FXService(new AscendantFXServiceProvider(x, ascendantFX));
      try{
        if( fxService.acceptFXRate(getFxQuoteId())) setAccepted(true);
      }catch(Throwable t) {
        ((Logger) x.get(Logger.class)).error("Error sending Accept Quote Request to AscendantFX.", t);
      }

      `
    }
  ]
});
