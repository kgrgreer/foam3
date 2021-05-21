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
  package: 'net.nanopay.admin.ui',
  name: 'TransactionDetailView',
  extends: 'foam.u2.View',

  documentation: 'View displaying transaction details',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.InvoiceTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.ui.ExpandContainer',
  ],

  imports: [
    'transactionDAO',
    'stack',
    'formatCurrency',
  ],

  css: `
    ^ {
      width: 962px;
      margin: 0 auto;
    }
    ^ .topContainer {
      width: 100%;
    }
    ^ .balanceBox {
      position: relative;
      margin-top: 20px;
      margin-bottom: 20px;
      margin-right: 20px;
      min-width: 300px;
      max-width: calc(100% - 150px);
      padding-bottom: 15px;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
      display: inline-block;
      vertical-align: middle;
    }
    ^ .sideBar {
      width: 6px;
      height: 100%;
      background-color: /*%PRIMARY3%*/ #406dea;
      position: absolute;
    }
    ^ .balanceBoxTitle {
      color: /*%BLACK%*/ #1e1f21;
      font-size: 12px;
      margin-left: 44px;
      padding-top: 14px;
      line-height: 1.33;
      letter-spacing: 0.2px;
    }
    ^ .balance {
      font-size: 30px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.5px;
      overflow-wrap: break-word;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 27px;
      margin-left: 44px;
      margin-right: 44px;
    }
    ^ .inlineDiv {
      display: inline-block;
      width: 135px;
      vertical-align: middle;
    }
    ^ table {
      border-collapse: collapse;
      margin: auto;
      width: 962px;
    }
    ^ .net-nanopay-ui-ExpandContainer{
      width: 962px;
      margin-top: 30px;
      margin-bottom: 30px;
    }
    ^ .labelDiv {
      margin-bottom: 30px;
      margin-right: 20px;
    }
    ^ .inlineDiv {
      display: inline-block;
      margin-right: 40px;
      vertical-align: top;
    }
    ^ .topInlineDiv {
      display: inline-block;
      vertical-align: top;
    }
    ^ .labelTitle {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 15px;
    }
    `,

  properties: [
    {
      name: 'transaction'
    },
    {
      name: 'selectedTransactionDAO',
      expression: function() {
        this.transactionDAO.find(this.transaction.id).then(function(dao) {
          return dao;
        });
      }
    },
    {
      name: 'formattedAmount',
      expression: function() { return this.formatCurrency(this.transaction.total/100); }
    },
    {
      name: 'formattedTotalFee',
      expression: function() { return this.formatCurrency(this.transaction.getCost()/100); }
    },
    {
      name: 'eta',
      expression: function() { return this.formatTime(this.transaction.getEta()); }
    }
  ],

  messages: [
    { name: 'transactionAmountTitle', message: 'Transaction Amount' },
    { name: 'totalFeeTitle', message: 'Total Cost' },
    { name: 'etaTitle', message: 'ETA' }
  ],

  methods: [
    function init() {
    },
    function initE() {
      this.SUPER();

      var self = this;
      this
      .addClass(this.myClass())
        .start(this.BACK_ACTION).end()
        .start('div').addClass('topContainer')
          .start('div').addClass('balanceBox')
            .start('div').addClass('sideBar').end()
            .start().add(this.transactionAmountTitle).addClass('balanceBoxTitle').end()
            .start().add(this.formattedAmount$).addClass('balance').end()
          .end()
          .start('div').addClass('balanceBox')
            .start('div').addClass('sideBar').end()
            .start().add(this.totalFeeTitle).addClass('balanceBoxTitle').end()
            .start().add(this.formattedTotalFee$).addClass('balance').end()
          .end()
          .start('div').addClass('balanceBox')
            .start('div').addClass('sideBar').end()
            .start().add(this.etaTitle).addClass('balanceBoxTitle').end()
            .start().add(this.eta$).addClass('balance').end()
          .end()
        .end();

        this
        .start('h2').addClass('light-roboto-h2').style({ 'margin-bottom': '0px'})
          .add('Transaction Details:')
        .end()
        .start(this.ExpandContainer.create({ title: this.transaction.type, link: '', linkView: '', expandBox: true }))
          .start().addClass('inlineDiv')
            .start().addClass('labelDiv')
              .start().add('Name').addClass('labelTitle').end()
              .start().add(this.transaction.name).addClass('labelContent').end()
            .end()
            .start().addClass('labelDiv')
              .start().add('Created Date').addClass('labelTitle').end()
              .start().add(this.formatDate(this.transaction.created)).addClass('labelContent').end()
            .end()
            .start().addClass('labelDiv')
              .start().add('Source Currency').addClass('labelTitle').end()
              .start().add(this.transaction.sourceCurrency).addClass('labelContent').end()
            .end()
          .end()
          .start().addClass('inlineDiv')
            .start().addClass('labelDiv')
              .start().add('Created By').addClass('labelTitle').end()
              .start().add(this.transaction.createdBy).addClass('labelContent').end()
            .end()
            .start().addClass('labelDiv')
              .start().add('Completed Date').addClass('labelTitle').end()
              .start().add(this.formatDate(this.transaction.completionDate)).addClass('labelContent').end()
            .end()
            .start().addClass('labelDiv')
              .start().add('Destination Currency').addClass('labelTitle').end()
              .start().add(this.transaction.destinationCurrency).addClass('labelContent').end()
            .end()
          .end()
          .start().addClass('inlineDiv')
            .start().addClass('labelDiv')
              .start().add('Status').addClass('labelTitle').end()
              .start().add(this.transaction.status.name).addClass('labelContent').end()
            .end()
            .start().addClass('labelDiv')
              .start().add('Source Account').addClass('labelTitle').end()
              .start().add(this.transaction.payer.fullName).addClass('labelContent').end()
            .end()
            .start().addClass('labelDiv')
              .start().add('Destination Account').addClass('labelTitle').end()
              .start().add(this.transaction.payee.fullName).addClass('labelContent').end()
            .end()
          .end()
          .callIf(this.InvoiceTransaction.isInstance(this.transaction), function() {
            this.start().addClass('inlineDiv')
              .start().addClass('labelDiv')
                .start().add('Percent Complete').addClass('labelTitle').end()
                .start().add(self.transaction.serviceCompleted).addClass('labelContent').end()
              .end()
            .end();
          })
        .end();

        this
        .start('h2').addClass('light-roboto-h2').style({ 'margin-bottom': '0px'})
          .add('Transaction Hierchy:')
        .end()
        .start(this.ExpandContainer.create({ title: this.transaction.type, link: '', linkView: '' }))
          .start()
            .tag({
                  class: 'foam.u2.view.TreeView',
                  data: this.selectedTransactionDAO,
                  relationship: net.nanopay.tx.model.TransactionTransactionChildrenRelationship,
                  startExpanded: true,
                  formatter: function(data) { this.add(data.type); }
              })
          .end()
        .end();

        this
        .start('h2').addClass('light-roboto-h2').style({ 'margin-bottom': '0px'})
          .add('Lineitems:')
        .end();
        for ( var i = 0; i < this.transaction.lineItems.length; ++i ) {
          var eta = 'N/A';
          if ( this.ETALineItem.isInstance( this.transaction.lineItems[i] ) ) {
            eta = this.transaction.lineItems[i].eta;
          }
          this
          .start(this.ExpandContainer.create({ title: this.transaction.lineItems[i].name, link: '', linkView: '' }))
            .start().addClass('inlineDiv')
              .start().addClass('labelDiv')
                .start().add('Amount').addClass('labelTitle').end()
                .start().add(this.formatCurrency( this.transaction.lineItems[i].amount/100)).addClass('labelContent').end()
              .end()
              .start().addClass('labelDiv')
                .start().add('Notes').addClass('labelTitle').end()
                .start().add(this.formatCurrency( this.transaction.lineItems[i].note)).addClass('labelContent').end()
              .end()
            .end()
            .start().addClass('inlineDiv')
              .start().addClass('labelDiv')
                .start().add('ETA').addClass('labelTitle').end()
                .start().add(this.formatTime(eta)).addClass('labelContent').end()
              .end()
            .end()
          .end();
        }
    },
    function formatTime(time) {
      var days = time / 3600000 / 24;
      if ( days >= 1 ) {
        var parsedDays = parseInt(days);
        return parsedDays + ( parsedDays > 1 ?  ' days' : ' day' );
      }
      var hrs = time / 3600000;
      if ( hrs >= 1 ) {
        var parsedHrs = parseInt(hrs);
        return parsedHrs + ( parsedHrs > 1 ? ' hrs' : ' hr');
      }
      return 'instant';
    },
    function formatDate(date) {
      if ( typeof date === 'undefined' ) return '';

      return date.toLocaleString(foam.locale, { month: 'short' }) + ' ' +
        date.getDate() + ', ' +
        date.getFullYear() + ' ' +
        date.getHours() + ':' +
        date.getMinutes();
    }
  ],
  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.back();
      }
    }
  ]

});
