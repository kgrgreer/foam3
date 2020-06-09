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
  package: 'net.nanopay.invoice.ui',
  name: 'SummaryCard',
  extends: 'foam.u2.View',

  documentation: 'Cards for summary views',

  imports: [
    'formatCurrency'
  ],

  css: `
    ^ {
      display: inline-block;
      width: 145px;
      background: white;
      height: 100px;
      vertical-align: top;
      margin-left: 6px;
      border-radius: 3px;
      overflow: hidden;
      border: 3px solid white;
    }
    ^ .Pending{
      width: 105px;
      border-radius: 100px;
      border: solid 1px /*%BLACK%*/ #1e1f21;
      color: /*%BLACK%*/ #1e1f21;
      padding: 3px 3px 3px 15px;
    }
    ^ .Overdue{
      color: white;
      background: #c82e2e;
      border-radius: 100px;
      padding-left: 10px;
      padding-top: 5;
      width: 55px;
    }
    ^ .Disputed{
      width: 60px;
      padding: 3px 3px 3px 15px;
      border-radius: 100px;
      border: solid 1px #c82e2e;  
      color: #c82e2e;
    }
    ^ .Paid{
      width: 35px;
      padding: 3px 3px 3px 15px;
      border-radius: 100px;
      background: #2cab70;
      color: white;
    }
    ^ .Scheduled{
      color: #2cab70;
      width: 66px;
      border: 1px solid #2cab70;
      border-radius: 100px;
      padding: 3px 0 0 10px;
    }
    ^ .New{
      color: #59a5d5;
      width: 40px;
      border: 1px solid #59a5d5;
      border-radius: 100px;
      padding: 3px 0 0 15px;
    }
    ^ .Unpaid{
      color: white;
      background: #59aadd;
      border-radius: 100px;
      width: 30px;
      padding-left: 10px;
      padding-top: 5;
    }
    ^ .label{
      position: relative;
      top: 35;
      left: 10;
      font-size: 12px;
      padding: 3px 7px;
      display: inline;
    }
    ^ .count{
      font-size: 30px;
      font-weight: 300;
      line-height: 1;
      position: relative;
      top: 20;
      left: 20;
    }
    ^ .amount{
      line-height: 0.86;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      opacity: 0.6;
      float: right;
      margin-right: 15px;
    }
    ^.active{
      border: 3px solid #1cc2b7;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'formattedAmount',
      expression: function(amount) {
        return this.formatCurrency(amount/100);
      }
    },
    'amount',
    'count',
    'status',
    {
      class: 'Boolean',
      name: 'active',
      value: false
    }
 ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .enableClass('active', this.active$)
          .start().addClass('count').add(this.count$).end()
          .start().addClass('amount').add(this.formattedAmount$).end()
          .start()
            .addClass(this.status)
            .addClass('label')
            .addClass('special-status-tag')
            .add(this.status)
          .end()
        .end();
    },
    function toggle() {
      this.active = ! this.active;
    }
  ]
});
