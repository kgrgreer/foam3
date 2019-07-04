/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXLineItem',
  extends: 'net.nanopay.tx.ExpiryLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'rate',
      class: 'Double'
    },
    {
      name: 'accepted',
      class: 'Boolean',
      value: false,
      hidden: true
    },
    {
      // can we use id for this.
      name: 'quoteId', // or fxQuoteCode
      class: 'String',
      hidden: true
    },
    // destinationAmount ?
  ]
});
