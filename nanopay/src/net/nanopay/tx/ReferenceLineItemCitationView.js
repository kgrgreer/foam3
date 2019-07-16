/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ReferenceLineItemCitationView',
  extends: 'foam.u2.CitationView',

  requires: [
    'foam.u2.layout.Rows'
  ],

  css: `
    ^type {
      font-weight: bold;
      font-size: 16px;
      line-height: 2;
    }

    ^reference {

    }
  `,

  methods: [
   function initE() {
     debugger;
      this.addClass(this.myClass());

      this.start(this.Rows)
        .start().addClass(this.myClass('type'))
          .add(this.of.name)
        .end()
        .start().addClass(this.myClass('reference'))
          .add(this.summary$)
        .end()

    }
  ]
});