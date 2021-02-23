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
  name: 'SubscriptionDetailView',
  extends: 'foam.u2.View',

  documentation: "Edit View for Recurring Invoices.",

  requires: [ 
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice'
  ],

  imports: [
    'hideActionButton',   
    'recurringInvoiceDAO',
    'stack'    
  ],

  exports: [
    'hideActionButton',
    'hideSubscription',
    'showInvoices'
  ],

  properties: [
    {
      name: 'showInvoices',
      value: false
    },
    {
      class: 'Boolean',
      name: 'hideSubscription',
      value: false
    },
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
        }
        ^view-invoices{
          width: 303px;
          height: 30px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.19);
          margin: auto;
        }
        ^ .link{
          margin: 8px 20px;
          font-size: 12px;
        }
        ^ .arrow-down{
          position: relative;
          top: 10px;
          right: 15px;
        }
        ^ .light-roboto-h2{
          font-size: 18px;
          width: 500px;
        }
        ^ .blue-button{
          margin-right: 40px;
        }
        ^ .grey-button{
          margin-top: 20px;
          top: 0;
        }
        ^ .white-blue-button{
          margin-top: 20px
        }
        ^ .foam-u2-ActionView-expandInvoices{
          width: 300px;
          height: 30px;
          position: absolute;
          opacity: 0.01;
        }
        ^ .foam-u2-view-TableView-net-nanopay-invoice-model-Invoice{
          margin-top: 25px;
        }
        ^ .blue {
          background: #59aadd;
          color: white;
        }
        ^ .turn{
          transform: rotate(180deg);
          -ms-transform: rotate(180deg);
          -webkit-transform: rotate(180deg);         
        }
        */
      }
    })
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      this.hideActionButton = true;

      this
        .addClass(this.myClass())
        .start()
          .hide(this.hideSubscription$)
          .start().addClass('button-row')
            .start(this.BACK_ACTION).addClass('grey-button').end()
            .start(this.MODIFY).addClass('float-right').addClass('blue-button').end()
            .start(this.CANCEL_SUBSCRIPTION).addClass('float-right').addClass('white-blue-button').end()
          .end() 
          .start()
          .add('Recurring Invoice for ', this.data.payer.toSummary()).addClass('light-roboto-h2')
          .end()
          .tag({ class: 'net.nanopay.invoice.ui.shared.SingleSubscriptionView', data: this.data })
          .start().addClass(this.myClass('view-invoices')).enableClass('blue' ,this.showInvoices$)
            .start(this.EXPAND_INVOICES).end()
            .start().add('View Past Invoices').addClass('link').addClass('inline').enableClass('blue' ,this.showInvoices$).end()
            .start().addClass('arrow-down').addClass('inline').addClass('float-right').enableClass('turn' ,this.showInvoices$).end()
          .end()
        .end()
        .start({
          class: 'foam.u2.ListCreateController',
          dao: this.data.invoices,
          detailView: { class: 'net.nanopay.invoice.ui.SubscriptionInvoiceView' },
          summaryView: this.InvoicesTableView.create(),
          showActions: false            
        }).show(this.showInvoices$)
        .end()
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.push({ class: 'net.nanopay.invoice.ui.SubscriptionView' })
      }
    },
    {
      name: 'cancelSubscription',
      code: function(X){
        X.recurringInvoiceDAO.remove(this)
        X.stack.push({ class: 'net.nanopay.invoice.ui.SubscriptionView' })        
      }
    },
    {
      name: 'modify',
      code: function(X){
        X.stack.push({ class: 'net.nanopay.invoice.ui.SubscriptionEditView', data: this })        
      }
    },
    {
      name: 'expandInvoices',
      code: function(X){
        X.showInvoices$.set(X.showInvoices ? false : true);
      }
    }
  ],

  classes: [
    {
      name: 'InvoicesTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.invoice.model.Invoice' ],

      properties: [ 
        'selection', 
        'data'
      ],

      methods: [
        function initE() {

          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              config: {
                amount: { 
                  tableCellView: function(obj, e) {
                  return e.E().add('- $', obj.amount).style({color: '#c82e2e'})
                  }
                }
              },
              columns: [
                'invoiceNumber', 'purchaseOrder', 'payerId', 'dueDate', 'amount', 'status'
              ]
            }).addClass(this.myClass('table'))
            .end()
        }
      ],
    }
  ]
});