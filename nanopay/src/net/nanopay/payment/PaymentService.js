/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.payment',
  name: 'PaymentService',

  methods: [
    {
      name: 'addPayee',
      args: [
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'user'
        },
      ]
    },
    {
      name: 'submitPayment',
      args: [
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'user'
        },
      ]
    }
  ]
});
