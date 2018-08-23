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

  // implements: [
  //   'net.nanopay.tx.AcceptAware'
  // ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.fx.ascendantfx.model.AcceptQuoteResult',
    'net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest',
    'net.nanopay.fx.ExchangeRateStatus'
  ],

  properties: [

  ],

  constants: [
    {
          type: 'String',
          name: 'AFX_ORG_ID',
          value: 'AFX_ORG_ID' // TODO: Set proper Organization ID
      },
      {
          type: 'String',
          name: 'AFX_METHOD_ID',
          value: 'AFX_METHOD_ID' // TODO: Set proper METHOD ID
      }
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

      //Build Ascendant Request
      AcceptQuoteRequest acceptQuoteRequest = new AcceptQuoteRequest();
      acceptQuoteRequest.setMethodID(AFX_METHOD_ID);
      acceptQuoteRequest.setOrgID(AFX_ORG_ID);
      acceptQuoteRequest.setQuoteID(Long.parseLong(getFxQuoteId()));
      try{
        AcceptQuoteResult acceptQuoteResult = ascendantFX.acceptQuote(acceptQuoteRequest);
        if( null != acceptQuoteResult){
          setFxStatus(ExchangeRateStatus.ACCEPTED);
        }
      }catch(Throwable t) {
        ((Logger) x.get(Logger.class)).error("Error sending Accept Quote Request to AscendantFX.", t);
      }

      `
    }
  ]
});
