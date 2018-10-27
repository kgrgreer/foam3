/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ETALineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  properties: [
    {
      documentation: 'The longest estimated time of arrival or completion of Transaction.  An Alterna CI, for example, has a 2 day ETA.',
      name: 'amount',
      label: 'ETA',
      class: 'Long',
      tableCellFormatter: function(amount, X) {
        var self = this;
        this
          .start()
          .add('$', self.formatTime(amount))
          .end();
      }
    },
  ]
});
