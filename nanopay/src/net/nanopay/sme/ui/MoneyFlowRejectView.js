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
  name: 'MoneyFlowRejectView',
  extends: 'foam.u2.Controller',

  documentation: `
    USAGE:
    // To get to ReceiveMoney flow Reject screen
    this.stack.push({
      class: 'net.nanopay.sme.ui.MoneyFlowRejectView',
      invoice: invoice
    });
  `,

  imports: [
    'menuDAO',
    'stack',
    'user'
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background: /*%GREY5%*/ #f5f7fa;
    }
    ^ .link {
      color: #7404EA;
      cursor: pointer;
      font-size: 16px;
      text-align: center;
    }
    ^ .reject-title {
      margin-bottom: 30px;
      text-align: center
    }
    ^ .void-img {
      width: 53px;
      height: 53px;
      margin-bottom: 30px;
    }
    ^ .reject-content {
      text-align: center;
      position: absolute;
      top: 35%;
      left: 50%;
      margin-right: -50%;
      transform: translate(-50%, -50%);
    }
    ^ .navigationContainer {
      position: fixed;
      width: 100%;
      left: 0;
      bottom: 0;
      background-color: white;
      z-index: 100;
      padding: 10px 0;
    }
    ^ .buttonContainer {
      width: 300px;
      float: right;
    }
    ^ .net-nanopay-sme-ui-MoneyFlowRejectView-void-img {
      width: 64px;
      height: 64px;
      margin-bottom: 10px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice'
    },
    {
      class: 'Boolean',
      name: 'isPayable_',
      expression: function(invoice) {
        return invoice.payerId === this.user.id;
      }
    },
    {
      name: 'topImage',
      expression: function() {
        return {
          class: 'foam.u2.tag.Image',
          data: 'images/ablii/void/void_2x.png'
        };
      }
    },
  ],

  messages: [
    { name: 'TITLE', message: 'This invoice has been voided' },
    { name: 'V_PAY', message: 'View this invoice' },
    { name: 'V_REC', message: 'View this receivable' }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .start().addClass('reject-content')
          .add(this.slot(function(topImage) {
            return this.E().start(topImage)
              .addClass(this.myClass('void-img'))
            .end();
          }))
          .start()
            .addClass('reject-title').addClass('medium-header')
            .add(this.TITLE)
          .end()
          .start('a')
            .addClass('link')
            .add(this.isPayable_$.map((value) => value ? this.V_PAY : this.V_REC))
            .on('click', () => {
              this.stack.push({
                class: 'net.nanopay.sme.ui.InvoiceOverview',
                invoice: this.invoice,
                isPayable: this.isPayable_
              });
            })
          .end()
        .end()
        .start('div').addClass('navigationContainer')
          .start('div').addClass('buttonContainer')
            .tag(this.DONE)
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'done',
      label: 'Done',
      code: function(X) {
        var menuId = this.isPayable_ ?
            'mainmenu.invoices.payables' :
            'mainmenu.invoices.receivables';
        this.menuDAO
          .find(menuId)
          .then((menu) => menu.launch());
      }
    }
  ]
});
