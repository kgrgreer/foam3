/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Hold Ascendant FX specific properties`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.fx.ascendantfx.model.AcceptQuoteResult',
    'net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXService'
  ],

  properties: [

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
      //Get ascendantfx service
      FXService fxService = (FXService) x.get("ascendantFXService");
      try{
        if( fxService.acceptFXRate(getFxQuoteId(), getPayerId()) ) setAccepted(true);
      }catch(Throwable t) {
        ((Logger) x.get(Logger.class)).error("Error sending Accept Quote Request to AscendantFX.", t);
      }

      `
    }
  ]
});
