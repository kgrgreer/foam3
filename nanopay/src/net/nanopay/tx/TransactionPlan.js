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
      documentation: 'The earliest expiry of the plans Transactions or Transfers.  A plan may depend on an FX Quote for example which is only valid for some time window.',
      name: 'expiry',
      class: 'DateTime'
    },
    {
      documentation: 'The longest estimated time of completion of plans Transactions or Transfers.  An Alterna CI, for example, has a 2 day ETC.',
      name: 'etc',
      label: 'Estimated Time of Completion',
      class: 'Long'
    },
    {
      documentation: 'The cost, generally monitary, of executing this plan. A FX Quote, for example, may include Fees, the fees would be the cost of the plan.',
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
