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

foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'TransactionLimitView',
  extends: 'foam.u2.View',

  documentation: `
    View detailing company/business transaction limit information.
  `,

  imports: [
    'user'
  ],

  css: `
    ^ {
      padding: 24px;
    }
    ^ .info-container {
      width: 25%;
      display: inline-grid;
      height: 40px;
      margin-top: 30px;
    }
    ^ .table-content {
      height: 21px;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Transaction limits' },
    { name: 'LIMIT_LABEL', message: 'Limit amount' },
    { name: 'TRANSACTION_LIMIT', message: '$100,000.00' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).addClass('card')
        .start().addClass('sub-heading').add(this.TITLE).end()
        // TODO: Edit Business
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.LIMIT_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.TRANSACTION_LIMIT).end()
        .end();
    }
  ]
});
