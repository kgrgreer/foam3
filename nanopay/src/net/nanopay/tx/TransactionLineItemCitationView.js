/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
