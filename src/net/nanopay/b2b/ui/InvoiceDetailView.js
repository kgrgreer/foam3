foam.CLASS({
    package: 'net.nanopay.b2b.ui',
    name: 'InvoiceDetailView',
    extends: 'foam.u2.View',

    requires: [ 'net.nanopay.b2b.model.Invoice' ],

    imports: [ 'stack', 'hideReceivableSummary' ],

    exports: [ 'hideReceivableSummary' ],

    axioms: [
     foam.u2.CSS.create({
       code: function CSS() {/*
         ^ {
           background-color: #edf0f5;
         }
         ^ .invoice-button-div {
           width: 1004px;
           height: 40px;
           margin: auto;
           margin-bottom: 30px;
         }
         ^ .invoice-title-div {
           width: 1004px;
           margin: auto;
           margin-bottom: 20px;
         }
         ^ .invoice-box-div {
           width: 964px;
           height: 532px;
           background: white;
           radius: 2px;
           margin: auto;
           padding: 20px;
           text-align: center;
         }
         ^ .customer-div {
           display: inline-block;
           margin-bottom: 120px;
           vertical-align: top;
         }
         ^ .invoice-due-date-div {
           display: inline-block;
           float: right;
         }
         ^ .po-amount-div {
           display: inline-block;
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
         ^ .box-title {
           font-family: Roboto;
           font-size: 14px;
           font-weight: 300;
           letter-spacing: 0.2px;
           text-align: left;
           color: #093649;
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
         ^ .max-size-text {
           font-family: Roboto;
           font-size: 12px;
           line-height: 1.33;
           letter-spacing: 0.2px;
           color: #A4B3B8;
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
            outline: 0;
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
           outline: 0;
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
           outline: 0;
         }
         .foam-u2-ActionView-cancel {
           visibility: hidden;
         }
         .foam-u2-ActionView-save {
           visibility: hidden;
         }
       */}
     })
   ],

    methods: [
        function initE() {
          this.SUPER();
          this.hideReceivableSummary = true;

          this
            .addClass(this.myClass())
            .start('div').addClass('invoice-button-div')
              .add(this.DELETE_DRAFT)
              .add(this.SAVE_AND_PREVIEW)
              .add(this.SAVE_AS_DRAFT)
            .end()
            .start('div').addClass('invoice-title-div')
              .start('h2').add('New Invoice').addClass('new-invoice-title').end()
            .end()
            .start('div').addClass('invoice-box-div')
              .start('div').addClass('customer-div')
                .add('Customer').addClass('box-title')
                .add(this.Invoice.FROM_BUSINESS_ID)
              .end()
              .start('div').addClass('po-amount-div')
                .add('PO #').addClass('box-title')
                .add(this.Invoice.PURCHASE_ORDER)
                .add('Amount').addClass('box-title')
                .add(this.Invoice.AMOUNT)
              .end()
              .start('div').addClass('invoice-due-date-div')
                .add('Invoice #').addClass('box-title')
                .add(this.Invoice.INVOICE_NUMBER)
                .add('Due Date').addClass('box-title')
                .add(this.Invoice.ISSUE_DATE)
              .end()
              .add('Attachments').addClass('box-title')
              .start('div').add('Add Attachment').addClass('add-attachment-btn').end()
              .add('Maximum size 10MB').addClass('max-size-text')
              .start('div')
                .tag({class: 'foam.u2.CheckBox'})
                .add('Enable recurring payments').addClass('enable-recurring-text')
              .end()
              .start('div').addClass('frequency-div')
                .add('Frequency').addClass('box-title')
                .start('div').add('Biweekly').addClass('frequency-box').end()
              .end()
              .start('div').addClass('ends-after-div')
                .add('Ends After').addClass('box-title')
                .start('div').add('30 Occurences').addClass('frequency-box').end()
              .end()
              .start('div').addClass('next-invoice-div')
                .add('Next Invoice Date').addClass('box-title')
                .add(this.Invoice.PAYMENT_DATE)
              .end()
              .start('div')
                .add('Note').addClass('box-title')
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
          X.stack.push({class: 'net.nanopay.b2b.ui.receivables.SalesView'});
        }
      },
      {
        name: 'saveAsDraft',
        label: 'Save As Draft',
        code: function(X) {
          X.dao.put(this);
          X.stack.push({class: 'net.nanopay.b2b.ui.receivables.SalesView'});
        }
      },
      {
        name: 'saveAndPreview',
        label: 'Save & Preview',
        code: function(X) {
          X.dao.put(this);
          X.stack.push({class: 'net.nanopay.b2b.ui.receivables.SalesView'});
        }
      }
    ]
})