/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.c3',
  name: 'C3',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.box.Context',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.client.ClientBuilder'
  ],

  properties: [
    {
      name: 'client'
    }
  ],

  methods: [
    async function ainit() {
      this.client = await this.ClientBuilder.create().promise;
      this.add('Client Created').br();
    },

    function render() {
      this.add('C3').br();
      this.ainit();
    }
  ]
});
