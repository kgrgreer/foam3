foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'InvoiceDetailView',
  extends: 'foam.u2.View',

  imports: [
    'stack',
    'hideReceivableSummary',
    'recurringInvoiceDAO'
  ],

  exports: [
    'frequency',
    'endsAfter',
    'nextInvoiceDate'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'checkBoxRecurring',
      value: false
    },
    {
      class: 'Double',
      name: 'endsAfter'
    },
    {
      class: 'Date',
      name: 'nextInvoiceDate'
    },
    {
      class: 'String',
      name: 'frequency',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Daily',
          'Weekly',
          'Biweekly',
          'Monthly'
        ]
      },
      value: 'Daily'
    }
  ],

  axioms: [
   foam.u2.CSS.create({
     code: function CSS() {/*
      ^{
        font-weight: 100;
      }
      ^ .customer-div {
        display: inline-block;
        margin-bottom: 20px;
      }
      ^ .po-amount-div {
        margin-left: 20px;
        position: relative;
        right: 70px;
      }
      ^ .frequency-div {
        display: inline-block;
        margin: 0 36px 20px 0;
      }
      ^ .attachment-btn {
        margin: 10px 0;
      }
      ^ .enable-recurring-text {
        font-size: 12px;
        margin: 20px 0;
      }
      ^ .company-card {
        width: 480px;
        height: 155px;
        margin-top: 20px;
      }
      ^ .small-input-box{
        margin: 20px 0;
      }
      ^ .label{
        margin: 0;
      }
      ^ .net-nanopay-ui-ActionView-cancel {
        margin-left: 457px;
        margin-top: 20px;
      }
      ^ .input-box {
        margin-left: 0;
        margin-top: 15px;
        height: 40px;
      }
      ^ .foam-u2-tag-Select {
        width: 225px;
        height: 40px;
        margin-top: 10px;
      }
     */}
   })
 ],

  methods: [
      function initE() {
        this.SUPER();
        var self = this;
        this.hideReceivableSummary = true;

        this
          .addClass(this.myClass())
          .start().addClass('button-row')
            .start(this.DELETE_DRAFT).end()
            .start(this.SAVE_AND_PREVIEW).addClass('float-right').end()
            .start(this.SAVE_AS_DRAFT).addClass('float-right').end()
          .end()
          .start().add('New Invoice').addClass('light-roboto-h2').end()
          .start().addClass('white-container')
            .start().addClass('customer-div')
              .start().addClass('label').add('Customer').end()
              .start(this.Invoice.PAYER_ID, { objToChoice: function(user) {
                return [ user.id, user.firstName + ' ' + user.lastName ];
              } }).end()
            .end()
            .start().style({ 'float' : 'right'})
              .start().addClass('po-amount-div float-right')
                .start().addClass('label').add('PO #').end()
                .start(this.Invoice.PURCHASE_ORDER).addClass('small-input-box').end()
              .end()
              .start().addClass('float-right')
                .start().addClass('label').add('Due Date').end()
                .start(this.Invoice.DUE_DATE).addClass('small-input-box').end()
                .start().addClass('label').add('Amount').end()
                .start(this.Invoice.AMOUNT).addClass('small-input-box').end()
              .end()
            .end()
            .start()
              .add('Attachments')
              .start().add('Add Attachment').addClass('attachment-btn white-blue-button btn').end()
              .add('Maximum size 10MB')
            .end()
            .start()
              .tag({class: 'foam.u2.CheckBox', data$: this.checkBoxRecurring$ })
              .add('Enable recurring payments').addClass('enable-recurring-text')
            .end()
            .startContext({data: this})
              .start().show(this.checkBoxRecurring$)              
                .start().addClass('frequency-div')
                  .start().addClass('label').add('Frequency').end()
                    .start(this.FREQUENCY).end()
                .end()
                .start().addClass('inline').style({ 'margin-right' : '36px'})
                  .start().addClass('label').add('Ends After ( ) Occurences').end()
                  .start(this.ENDS_AFTER).addClass('small-input-box').end()
                .end()
                .start().addClass('inline')
                  .start().addClass('label').add('Next Bill Date').end()
                  .start(this.NEXT_INVOICE_DATE).addClass('small-input-box').end()
                .end()
              .end()
            .endContext()
            .start()
              .add('Note')
              .start(this.Invoice.NOTE).addClass('half-input-box').end()
            .end()
          .end();
      }
  ],

  actions: [
    {
      name: 'deleteDraft',
      label: 'Delete Draft',
      code: function(X) {
        X.stack.push({class: 'net.nanopay.invoice.ui.SalesView'});
      }
    },
    {
      name: 'saveAsDraft',
      label: 'Save As Draft',
      code: function(X) {
        X.dao.put(this);
        X.stack.push({class: 'net.nanopay.invoice.ui.SalesView'});
      }
    },
    {
      name: 'saveAndPreview',
      label: 'Save & Preview',
      code: function(X) {
        var self = this;
        if(X.frequency && X.endsAfter && X.nextInvoiceDate){
          var recurringInvoice = net.nanopay.invoice.model.RecurringInvoice.create({
            frequency: X.frequency,
            endsAfter: X.endsAfter,
            nextInvoiceDate: X.nextInvoiceDate,
            amount: this.amount,
            payeeId: this.payeeId,
            payerId: this.payerId,
            invoiceNumber: this.invoiceNumber,
            dueDate: this.dueDate,
            purchaseOrder: this.purchaseOrder,
            payeeName: this.payeeName,
            payerName: this.payerName
          })
          X.recurringInvoiceDAO.put(recurringInvoice).then(function(a){
            self.recurringInvoice = a;
            X.dao.put(self);
          })
        } else {
          X.dao.put(this);
        }

        X.stack.push({class: 'net.nanopay.invoice.ui.SalesView'});
      }
    },
  ]
});
