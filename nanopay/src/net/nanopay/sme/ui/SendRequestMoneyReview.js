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
  name: 'SendRequestMoneyReview',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The third step of the send/request payment flow. At this step,
                  it will send the request to create new invoice the
                  associate transactions`,

  requires: [
    'foam.flow.Document',
    'foam.log.LogLevel',
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
    'subject',
    'txnQuote'
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
    ^ .foam-u2-LoadingSpinner img{
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
      overflow: auto;
      margin-top: 15px;
    }
    ^ .foam-u2-view-StringView {
      width: auto;
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

  messages: [
    { name: 'VOID', message: 'Void' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.updateDisclosure();

      // Update the next label
      this.nextLabel = this.isApproving
        ? this.APPROVE_INVOICE_LABEL
        : this.SUBMIT_LABEL;
      this.hasOtherOption = this.isApproving ? true : false;
      this.optionLabel = this.VOID;
      this.start().addClass(this.myClass())
        .start().show(this.loadingSpin.isHidden$)
          /** summaryTransaction area **/
          .start()
            .add(this.slot(txnQuote => {
              if ( ! txnQuote ) return;
              console.log("txnQuote", this.txnQuote);
              return this.E()
                .start({
                  class: 'net.nanopay.tx.SummaryTransactionCitationView',
                  data: txnQuote
                });
            }))
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
      try {
        var disclosure = await this.acceptanceDocumentService
          .getTransactionRegionDocuments(
            this.__context__,
            this.txnQuote && this.txnQuote.type,
            this.AcceptanceDocumentType.DISCLOSURE,
            this.subject.user.address.countryId,
            this.subject.user.address.regionId);
        if ( disclosure ) {
          this.disclosureView = this.Document.create({ markup: disclosure.body });
        }
      } catch (error) {
        console.error(error.message);
        this.ctrl.notify(error.message, '', this.LogLevel.ERROR, true);
      }
    }
  ]
});

