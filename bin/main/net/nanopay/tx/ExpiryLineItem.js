/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ExpiryLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  properties: [
    {
      documentation: 'A Transaction may depend on an FX Quote for example which is only valid for some time window.',
      name: 'expiry',
      label: 'Expires',
      class: 'DateTime',
      tableCellFormatter: function(expiry, X) {
        var self = this;
        this
          .start()
          .add('$', self.formatTime(expires - Date.now()))
          .end();
      }
    }
  ]
});
