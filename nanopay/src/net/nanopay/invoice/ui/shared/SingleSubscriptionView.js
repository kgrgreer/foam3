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
  package: 'net.nanopay.invoice.ui.shared',
  name: 'SingleSubscriptionView',
  extends: 'foam.u2.View',

  imports: [
    'user'
  ],

  properties: [
    'data'
  ],

  css: `
    ^table-header{
      width: 960px;
      height: 40px;
      background-color: rgba(110, 174, 195, 0.2);
      padding-bottom: 10px;
    }
    ^ h3{
      width: 150px;
      display: inline-block;
      font-size: 14px;
      line-height: 1;
      font-weight: 500;
      text-align: center;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ h4{
      width: 150px;
      display: inline-block;
      font-size: 14px;
      line-height: 1;
      font-weight: 500;
      text-align: center;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^table-body{
      width: 960px;
      height: auto;
      background: white;
      padding: 10px 0;
    }
    ^ p{
      display: inline-block;
      width: 90px;
    }
    ^table-body h3{
      font-weight: 300;
      font-size: 12px;
      margin-top: 25px;
    }
    ^table-body h4{
      font-weight: 300;
      font-size: 12px;
      margin-top: 25px;
    }
  `,

  methods: [
    function initE(){
      var self = this;

      this
        .addClass(this.myClass())
        .start('div').addClass('invoice-detail')
          .start().addClass(this.myClass('table-header'))
            .start('h3').add('Recurring ID').end()
            .start('h3').add('Customer').end()
            .start('h4').add('Amount Per Invoice').end()
            .start('h4').add('Next Invoice Date').end()
            .start('h3').add('Frequency').end()
            .start('h3').add('Occurrences').end()
          .end()
          .start().addClass(this.myClass('table-body'))
            .start('h3').add(this.data.id).end()
            .start('h3').add(this.data.payer.toSummary()).end()
            .start('h3').add('$', this.data.amount.toFixed(2)).end()
            .start('h4').add(this.data.nextInvoiceDate.toLocaleDateString(foam.locale)).end()
            .start('h4').add(this.data.frequency).end()
            .start('h3').add(this.data.endsAfter).end()
          .end()
        .end()
    }
  ]
});