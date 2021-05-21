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
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceReceivedHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView',
    'net.nanopay.invoice.util.InvoiceHistoryUtility'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice'
  ],

  documentation: 'View for displaying create date and received company on invoice history',

  imports: [
    'invoiceDAO',
    'userDAO',
    'user'
  ],

  properties: [
    'name'
  ],

  css: `
    ^ .iconPosition {
      margin-left: -6px;
    }
    ^ .statusBox {
      margin-top: -20px;
      padding-bottom: 22px;
    }
    ^ .statusContent {
      padding-left: 40px;
    }
    ^ .statusDate {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 8px;
      line-height: 1.33;
      letter-spacing: 0.1px;
      color: #a4b3b8;
      top: 5px;
      position: relative;
    }
    ^ .statusTitle {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }
  `,

  methods: [
    async function outputRecord(parentView, record) {
      var invoice = await this.invoiceDAO.find(record.objectId);
      // check which name should use agent name or business name
      this.name = this.getDisplayName(record, this.user, invoice);

      return parentView
        .addClass(this.myClass())
        .style({ 'padding-left': '20px' })
        .start('div').addClass('iconPosition')
          .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-received.svg' })
        .end()
        .start('div').addClass('statusBox')
          .start('div')
            .style({ 'padding-left': '30px' })
            .start('span').addClass('statusTitle')
              .add('Invoice received from ', this.name$)
            .end()
          .end()
          .start('div')
            .style({ 'padding-left': '30px' })
            .start('span').addClass('statusDate')
              .add(this.formatDate(record.timestamp))
            .end()
          .end()
        .end();
    }
  ]
});
