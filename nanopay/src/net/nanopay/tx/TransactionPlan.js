/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionPlan',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'expiry',
      class: 'DateTime'
    },
    {
      name: 'eta',
      class: 'Long'
    },
    {
      name: 'cost',
      class: 'Long'
    },
    {
      name: 'transaction',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction'
    }
  ],
});
