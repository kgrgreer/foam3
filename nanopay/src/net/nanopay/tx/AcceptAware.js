/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.tx',
  name: 'AcceptAware',

  methods: [
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
