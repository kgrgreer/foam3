/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'CILayoutView',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'data',
      factory: function(){
        return net.nanopay.transfer.CITransferQuoteRequest.create({}, this);
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this, data = this.data;

      this.
        addClass()
          .start().add(data.SOURCE_ACCOUNT).end()
          .start().add(data.DESTINATION_ACCOUNT).end()
          .start().add(data.SOURCE_CURRENCY_AMOUNT).end();
    }
  ]
});


