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
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'EmptyTransactionListView',
  extends: 'foam.u2.View',

  documentation: 'View for empty transaction list',

  imports: [
    'showHeader'
  ],

  css: `
    ^ {
      width: 320px;
      height: 100%;
      background-color: #ffffff;
      position: relative;
    }
    ^ .no-transactions-label {
      height: 16px;
      font-size: 16px;
      line-height: 1;
      text-align: center;
      color: #252c3d;
      padding-top: 156px;
    }
  `,

  messages: [
    { name: 'noTransactions', message: 'You don’t have any transactions yet.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .addClass('no-transactions-label')
          .add(this.noTransactions)
        .end()
    }
  ]
});