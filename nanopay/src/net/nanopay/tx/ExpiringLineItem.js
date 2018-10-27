/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ExpiringLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  properties: [
    {
      documentation: 'A Transaction may depend on an FX Quote for example which is only valid for some time window.',
      name: 'amount',
      label: 'Expires',
      //class: 'DateTime',
      class: 'Long',
      tableCellFormatter: function(amount, X) {
        var self = this;
        this
          .start()
          .add('$', self.formatTime(amount - Date.now()))
          .end();
      }
    }
  ]
});
