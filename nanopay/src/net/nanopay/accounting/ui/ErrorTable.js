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
  package: 'net.nanopay.accounting.ui',
  name: 'ErrorTable',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'pushMenu',
    'quickbooksService',
    'stack',
    'user',
    'xeroService',
    'salesDAO'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.accounting.IntegrationCode'
  ],

  css: `
  .error-table-container .foam-u2-view-TableView-vertDots {
    background-color: aqua !important;
    display: none;
  }
  
  .error-table-title {
    height: 48px;
    background-color: #ffffff;
    padding-left: 8%;
    line-height: 48px;
    text-align: initial;
    border: solid 1px #e2e2e3;
    box-shadow: 0 1px 1px 0 #dae1e9;
  }
  
  .error-table-title:hover {
    cursor: pointer;
  }
  
  .error-table-container .foam-u2-view-TableView thead > tr > th {
    text-align: center;
    color: #8e9090;
  }

  .error-table-container {
    max-hieght: 238x;
  }
  
  .error-table-container .foam-u2-view-TableView {
    width: 677px !important;
  }
  
  .error-table-container .foam-u2-view-TableView tbody > tr {
    text-align: center;
    background-color: /*%GREY5%*/ #f5f7fa;
  }
  
  .error-table-container .arrow-icon {
    margin-right: 8px;
    margin-left: -24px;
  }

  .error-table-container .foam-u2-view-TableView {
    border: 1px solid #e2e2e3 !important;
    box-shadow: 0 1px 1px 0 #dae1e9;
    white-space: unset;
    table-layout: fixed;
  }

  .error-table-container .foam-u2-view-TableView tbody > tr > td {
    white-space: unset;
    word-wrap: break-word;
  }

  .error-table-container .foam-u2-view-TableView tbody {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .error-table-container .table-container {
    max-height: 180px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .error-table-container .table-container .foam-u2-view-TableView thead > tr {
    width: 677px;
    overflow: hidden; 
  }


  .error-table-container .table-container .foam-u2-view-TableView-td:last-child {
    display: none;
  }

  .error-table-container .table-container tr > td {
    padding: 5px;
    text-align: left;
  }

  .error-table-container .table-container .foam-u2-view-TableView-th:last-child {
    display: none;
  }
  `,

  messages: [
    { name: 'SuccessMessage', message: 'Successfully synced contacts and invoices' },
  ],

  properties: [
    'invoiceResult',
    'contactResult',
    'columns',
    {
      type: 'String',
      name: 'header'
    },
    {
      name: 'data',
    },
    {
      name: 'open',
      type: 'Boolean',
      value: false
    }
  ],

  methods: [
    function initE() {
      let other = false;
      if ( this.header.startsWith('Other') ) {
        this.columns.push('message');
        other = true;
      }
      this
        .start()
        .start('div').addClass('error-table-container')

          .start('div').addClass('error-table-title').on('click', this.toggle)
            .start('img').addClass('arrow-icon').attrs({ src: 'images/active.svg' }).show(this.open$).end()
            .start('img').addClass('arrow-icon').attrs({ src: 'images/resting.svg' }).show(this.slot(
              function(open) {
                return ! open;
              })).end()
            .add(this.header)
          .end()

        .start().addClass('table-container').enableClass('other', other).show(this.open$)
          .start({
            class: 'foam.u2.view.TableView',
            data$: this.data$,
            editColumnsEnabled:false,
            selection:false,
            columns: this.columns
          }).end()
        .end()

        .end()
        .end()
    }
  ],

  listeners: [
    function toggle() {
      this.open = ! this.open;
    }
  ]

});
