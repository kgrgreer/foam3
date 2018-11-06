/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ETALineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  properties: [
    {
      documentation: 'The longest estimated time of arrival or completion of Transaction.  An Alterna CI, for example, has a 2 day ETA.',
      name: 'eta',
      label: 'ETA',
      class: 'Long',
      tableCellFormatter: function(eta, X) {
        var self = this;
        this
          .start()
          .add('$', self.formatTime(eta))
          .end();
      }
    }
  ]
});
