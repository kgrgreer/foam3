foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyReview',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The third step of the send/request payment flow. At this step,
                  it will send the request to create new invoice the
                  associate transactions`,

  requires: [
    'foam.flow.Document',
    'net.nanopay.documents.AcceptanceDocumentService',
    'net.nanopay.documents.AcceptanceDocument',
    'net.nanopay.documents.AcceptanceDocumentType'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'acceptanceDocumentService',
    'ctrl',
    'invoice',
    'isApproving',
    'isPayable',
    'loadingSpin',
    'notify',
    'user',
    'viewData'
  ],

  properties: [
    'disclosureView'
  ],

  css: `
    ^ {
      width: 504px;
      margin-bottom: 100px;
    }
    ^ .invoice-details {
      margin-top: 25px;
    }
    ^ .net-nanopay-ui-LoadingSpinner img{
      width: 150px;
      margin: 200px;
    }
    ^ .foam-flow-Document {
      width: 465px;
      margin: 0px;
      background: #e2e2e3;
      border-radius: 4px;
      box-shadow: inset 0 0 1px 0 rgba(0, 0, 0, 0.5);
    }
    ^ .disclosureView {
      max-height: 170px;
      overflow: scroll;
      margin-top: 15px;
    }
  `,
  messages: [
    {
      name: 'APPROVE_INVOICE_LABEL',
      message: 'Approve'
    },
    {
      name: 'SUBMIT_LABEL',
      message: 'Submit'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.updateDisclosure();

      // Update the next label
      this.nextLabel = this.isApproving
        ? this.APPROVE_INVOICE_LABEL
        : this.SUBMIT_LABEL;

      this.start().addClass(this.myClass())
        .start().show(this.loadingSpin.isHidden$)
          .start({
            class: 'net.nanopay.invoice.ui.InvoiceRateView',
            isPayable: this.type,
            isReadOnly: true,
            quote: this.viewData.quote,
            chosenBankAccount: this.viewData.bankAccount
          })
          .end()
          .start({
            class: 'net.nanopay.sme.ui.InvoiceDetails',
            invoice: this.invoice,
            showActions: false
          }).addClass('invoice-details')
          .end()
        .end()
        .start().add(this.loadingSpin).end()
        .start().addClass('disclosureView').show(this.loadingSpin$.dot('isHidden'))
          .tag(this.disclosureView$)
        .end()
      .end();
    },
    async function updateDisclosure() {
      if ( ! this.isPayable ) return;
      var type = this.viewData.quote ? this.viewData.quote.type : null;
      try {
        var disclosure = await this.acceptanceDocumentService.getTransactionRegionDocuments(this.__context__, type, this.AcceptanceDocumentType.DISCLOSURE, this.user.address.countryId, this.user.address.regionId);
        if ( disclosure ) {
          this.disclosureView = this.Document.create({ markup: disclosure.body });
        }
      } catch (error) {
        console.error(error.message);
        this.ctrl.notify(error.message, 'error');
      }
    }
  ]
});

