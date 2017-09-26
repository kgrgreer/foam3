foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'InvoiceDetailView',
  extends: 'foam.u2.View',

  imports: [ 
    'stack', 
    'hideReceivableSummary' 
  ],

  requires: [ 'net.nanopay.invoice.model.Invoice' ],

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
        width: 300px;
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
          .start().add('New Bill').addClass('light-roboto-h2').end()
          .start().addClass('white-container')
            .start().addClass('customer-div')
              .start().addClass('label').add('Customer').end()
              .start(this.Invoice.PAYER_ID, { objToChoice: function(user) { 
                return [ user.id, user.firstName + ' ' + user.lastName ]; 
              } }).end()
            .end()
            .start().addClass('po-amount-div float-right')
              .start().addClass('label').add('PO #').end()
              .start(this.Invoice.PURCHASE_ORDER).addClass('small-input-box').end()
              .start().addClass('label').add('Amount').end()
              .start(this.Invoice.AMOUNT).addClass('small-input-box').end()
            .end()
            .start().addClass('float-right')
              .start().addClass('label').add('Invoice #').end()
              .start(this.Invoice.INVOICE_NUMBER).addClass('small-input-box').end()
              .start().addClass('label').add('Due Date').end()
              .start(this.Invoice.ISSUE_DATE).addClass('small-input-box').end()
            .end()
            .start()
              .add('Attachments')
              .start().add('Add Attachment').addClass('attachment-btn white-blue-button').end()
              .add('Maximum size 10MB')
            .end()
            .start()
              .tag({class: 'foam.u2.CheckBox'})
              .add('Enable recurring payments').addClass('enable-recurring-text')
            .end()
            .start().addClass('frequency-div')
              .start().addClass('label').add('Frequency').end()
              .start(this.Invoice.INVOICE_NUMBER).addClass('small-input-box').end()
            .end()
            .start().addClass('inline').style({ 'margin-right' : '36px'})
              .start().addClass('label').add('Ends After').end()
              .start(this.Invoice.ISSUE_DATE).addClass('small-input-box').end()
            .end()
            .start().addClass('inline')
              .start().addClass('label').add('Next Bill Date').end()
              .start(this.Invoice.PAYMENT_DATE).addClass('small-input-box').end()
            .end()
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
        X.dao.put(this);
        X.stack.push({class: 'net.nanopay.invoice.ui.SalesView'});
      }
    },
  ]
})