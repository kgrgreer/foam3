foam.CLASS({
    package: 'net.nanopay.invoice.ui',
    name: 'BillDetailView',
    extends: 'foam.u2.View',

    imports: [ 
      'stack', 
      'hideSaleSummary' 
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
         ^ .invoice-due-date-div {
           float: right;
         }
         ^ .po-amount-div {
           margin-left: 20px;
           float: right;
         }
         ^ .frequency-div {
           display: inline-block;
           margin-right: 36px;
           margin-bottom: 20px;
         }
         ^ .ends-after-div {
           display: inline-block;
           margin-right: 36px;
         }
         ^ .next-invoice-div {
           display: inline-block;
         }
         ^ .frequency-box {
           font-family: Roboto;
           width: 215px;
           height: 40px;
           padding-left: 5px;
           font-size: 12px;
           color: #093649;
           display: block;
           background-color: #ffffff;
           border: solid 1px rgba(164, 179, 184, 0.5);
           margin-top: 8px;
           line-height: 40px;
         }
         ^ .add-attachment-btn {
           width: 135px;
           height: 40px;
           border-radius: 2px;
           border: solid 1px #59A5D5;
           color: #59A5D5;
           text-align: center;
           line-height: 40px;
           cursor: pointer;
           margin-top: 8px;
           margin-bottom: 10px;
         }
         ^ .new-invoice-title {
           opacity: 0.6;
           font-family: Roboto;
           font-size: 20px;
           font-weight: 300;
           letter-spacing: 0.3px;
           color: #093649;
           margin: 0;
         }
         ^ .note-box {
           width: 481px;
           height: 60px;
           background-color: #ffffff;
           border: solid 1px rgba(164, 179, 184, 0.5);
           padding-left: 5px;
           padding-right: 5px;
           font-size: 12px;
           color: #093649;
           display: block;
           margin-top: 8px;
           outline: none;
         }
         ^ .enable-recurring-text {
           font-family: Roboto;
           font-size: 12px;
           line-height: 1.33;
           letter-spacing: 0.2px;
           color: #093649;
           margin-top: 20px;
           margin-bottom: 20px;
         }
         ^ .company-card {
           width: 480px;
           height: 155px;
           border-radius: 2px;
           border: solid 1px rgba(164, 179, 184, 0.5);
           margin-top: 20px;
         }
        ^ .company-picture{
          width: 80px;
          height: 80px;
          margin: 17px 30px 0 20px;
        }
        ^ .company-name {
          font-size: 14px;
          font-weight: 300;
          margin-bottom: 10px;
        }
        ^ .vendor-name {
          opacity: 0.6;
          font-family: Roboto;
          font-size: 14px;
          color: #093649;
          margin: 0;
          display: block;
          margin-bottom: 6px;
        }
        ^ .company-address {
          font-family: Roboto;
          font-size: 12px;
          color: #093649;
          letter-spacing: 0.2px;
          margin: 0;
        }
        ^ .connection-icon {
          width: 24px;
          height: 24px;
          float: right;
          margin-right: 20px;
          margin-top: 110px;
        }
         ^ .property-invoiceNumber {
           display: block;
           margin-top: 8px;
           margin-bottom: 20px;
         }
         ^ .property-fromBusinessId {
           margin-top: 8px;
         }
         ^ .property-purchaseOrder {
           display: block;
           margin-top: 8px;
           margin-bottom: 20px;
         }
         ^ .property-issueDate {
           display: block;
           margin-top: 8px;
         }
         ^ .property-amount {
           display: block;
           margin-top: 8px;
         }
         ^ .property-paymentDate {
           display: block;
           margin-top: 8px;
         }
         ^ .foam-u2-TextField {
           font-size: 12px;
           padding-left: 5px;
           padding-right: 5px;
           width: 215px;
           height: 40px;
           background-color: #ffffff;
           border: solid 1px rgba(164, 179, 184, 0.5);
           outline: none;
         }
         ^ .foam-u2-tag-Select {
           width: 481px;
           height: 40px;
           background-color: #ffffff;
           border: solid 1px rgba(164, 179, 184, 0.5);
           font-size: 12px;
           outline: none;
           margin-top: 8px;
         }
         ^ .foam-u2-IntView {
           font-size: 12px;
           padding-left: 5px;
           padding-right: 5px;
           width: 215px;
           height: 40px;
           background-color: #ffffff;
           border: solid 1px rgba(164, 179, 184, 0.5);
           outline: none;
         }
         ^ .foam-u2-DateView {
           width: 215px;
           height: 40px;
           background-color: #ffffff;
           border: solid 1px rgba(164, 179, 184, 0.5);
           padding-left: 5px;
           font-size: 12px;
           outline: none;
         }
         ^ .foam-u2-ActionView-deleteDraft {
            font-family: Roboto;
            background-color: rgba(164, 179, 184, 0.1);
            width: 135px;
            height: 40px;
            border-radius: 2px;
            text-align: center;
            cursor: pointer;
            display: inline-block;
            border: solid 1px #8C92AC;
            color: #093649;
            font-size: 14px;
            margin: 0;
         }
         ^ .foam-u2-ActionView-saveAndPreview {
           font-family: Roboto;
           background-color: #59AADD;
           width: 135px;
           height: 40px;
           border-radius: 2px;
           color: white;
           font-size: 14px;
           text-align: center;
           display: inline-block;
           cursor: pointer;
           border: 1px solid #59AADD;
           float: right;
           margin: 0;
         }
         ^ .foam-u2-ActionView-saveAsDraft {
           font-family: Roboto;
           background-color: #EDF0F5;
           width: 135px;
           height: 40px;
           border-radius: 2px;
           border: solid 1px #59A5D5;
           color: #59A5D5;
           text-align: center;
           display: inline-block;
           cursor: pointer;
           float: right;
           margin: 0px 5px 0px 0px;
           font-size: 14px;
           padding: 0;
         }
         .foam-u2-ActionView-cancel {
           margin-left: 457px;
           margin-top: 20px;
         }
       */}
     })
   ],

    methods: [
        function initE() {
          this.SUPER();
          this.hideSaleSummary = true;

          this
            .addClass(this.myClass())
            .start().addClass('button-row')
              .add(this.DELETE_DRAFT)
              .add(this.SAVE_AND_PREVIEW)
              .add(this.SAVE_AS_DRAFT)
            .end()
            .start().add('New Bill').addClass('light-roboto-h2').end()
            .start().addClass('white-container')
              .start().addClass('customer-div')
                .add()
                .add(this.Invoice.TO_BUSINESS_ID)
                .start().addClass('company-card')
                  .start({class:'foam.u2.tag.Image', data: 'images/business-placeholder.png'}).addClass('company-picture').end()
                  .start().addClass('inline')
                    .start('h5').add('Company Name').addClass('company-name').end()
                    .start('h5').add('Vendor').addClass('vendor-name').end()
                    .start('h6').add('12123 Avenue, Unit 999, Toronto, Ontario,').addClass('company-address').end()
                    .start('h6').add('Canada').addClass('company-address').end()
                    .start('h6').add('M2G 1K9').addClass('company-address').end()
                  .end()
                  .start({class:'foam.u2.tag.Image', data: 'images/ic-connection.png'}).addClass('connection-icon').end()
                .end()
              .end()
              .start('div').addClass('po-amount-div')
                .add('PO #')
                .add(this.Invoice.PURCHASE_ORDER)
                .add('Amount')
                .add(this.Invoice.AMOUNT)
              .end()
              .start('div').addClass('invoice-due-date-div')
                .add('Invoice #')
                .add(this.Invoice.INVOICE_NUMBER)
                .add('Due Date')
                .add(this.Invoice.ISSUE_DATE)
              .end()
              .add('Attachments')
              .start('div').add('Add Attachment').addClass('add-attachment-btn').end()
              .add('Maximum size 10MB')
              .start('div')
                .tag({class: 'foam.u2.CheckBox'})
                .add('Enable recurring payments').addClass('enable-recurring-text')
              .end()
              .start('div').addClass('frequency-div')
                .add('Frequency')
                .start('div').add('Biweekly').addClass('frequency-box').end()
              .end()
              .start('div').addClass('ends-after-div')
                .add('Ends After')
                .start('div').add('30 Occurences').addClass('frequency-box').end()
              .end()
              .start('div').addClass('next-invoice-div')
                .add('Next Bill Date')
                .add(this.Invoice.PAYMENT_DATE)
              .end()
              .start('div')
                .add('Note')
                .start('textarea').addClass('note-box').end()
              .end()
            .end();
            
        }
    ],

    actions: [
      {
        name: 'deleteDraft',
        label: 'Delete Draft',
        code: function(X) {
          X.stack.push({class: 'net.nanopay.b2b.ui.payables.ExpensesView'});
        }
      },
      {
        name: 'saveAsDraft',
        label: 'Save As Draft',
        code: function(X) {
          X.dao.put(this);
          X.stack.push({class: 'net.nanopay.b2b.ui.payables.ExpensesView'});
        }
      },
      {
        name: 'saveAndPreview',
        label: 'Save & Preview',
        code: function(X) {
          X.dao.put(this);
          X.stack.push({class: 'net.nanopay.b2b.ui.payables.ExpensesView'});
        }
      },

    ]
})