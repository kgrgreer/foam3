/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'fxRate',
      class: 'Double'
    },
    {
      name: 'fxExpiry',
      class: 'DateTime'
    },
    {
      name: 'accepted',
      class: 'Boolean',
      value: false
    },
    {
      name: 'fxQuoteId', // or fxQuoteCode
      class: 'String'
    },
    // destinationAmount ?
  ]
});
