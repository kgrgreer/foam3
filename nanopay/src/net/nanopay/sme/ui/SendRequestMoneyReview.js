foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyReview',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The third step of the send/request payment flow. At this step,
                  it will send the request to create new invoice the
                  associate transactions`,

  requires: [
    'foam.flow.Document',
    'net.nanopay.disclosure.Disclosure',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'disclosuresDAO',
    'invoice',
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

  methods: [
    function initE() {
      this.SUPER();
      this.updateDisclosure();

      // Update the next label
      this.nextLabel = 'Submit';
      this.start().addClass(this.myClass())
        .start().show(this.loadingSpin.isHidden$)
          .start({
            class: 'net.nanopay.invoice.ui.InvoiceRateView',
            isPayable: this.type,
            isReadOnly: true
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
      if ( ! this.viewData.isPayable || this.viewData.isDomestic ) return;
      try {
        var disclosure = await this.disclosuresDAO.where(
          this.AND(
            this.EQ(this.Disclosure.TRANSACTION_TYPE, this.viewData.quote.type),
            this.EQ(this.Disclosure.COUNTRY, this.user.address.countryId),
            this.EQ(this.Disclosure.STATE, this.user.address.regionId)
          )
        ).select();

        disclosure = disclosure.array ? disclosure.array[0] : null;
        if ( disclosure ) {
          var text = '<h4>Transaction to be executed by AscendantFX.</h4>' + disclosure.text;
          this.disclosureView = this.Document.create({ markup: text });
        }
      } catch (error) {
        console.error(error.message);
        this.notify(error.message, 'error');
      }
    }
  ]
});
