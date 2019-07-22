/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionLineItemCitationView',
  extends: 'foam.u2.CitationView',

  css: `
    ^ .property-name {
      font-size: 16px;
      font-weight: bold;
      line-height: 2;
    }

    ^ .property-id {
      width: 135%;
    }
  `,

  requires: [
    'foam.u2.layout.Cols'
  ],

  methods: [
  function initE() {
      this.addClass(this.myClass());

      this.start(this.Cols).style({ 'justify-content': 'space-between' })
        .start(this.Cols)
          .tag(this.of.NAME)
          .tag(this.of.ID)
        .end()
        .tag(this.of.AMOUNT)
      .end()
    }
  ]
});
