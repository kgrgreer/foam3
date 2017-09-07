
foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferWizard',
  extends: 'net.nanopay.interac.ui.shared.wizardView.WizardView',

  documentation: 'Pop up that extends WizardView for e-transfer',

  requires: [
    'net.nanopay.interac.ui.CountdownView'
  ],

  exports: [
    'countdownView',
    'invoice'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.interac.ui.shared.wizardView.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code}),
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^ .topRow {
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        margin-bottom: 20px;
      }

      ^ .net-nanopay-interac-ui-CountdownView {
        display: inline-block;
        margin-top: 3px;
      }

      ^ .timerText {
        display: inline-block;
        vertical-align: top;
        margin-left: 20px;
        margin-top: 6px;
        opacity: 1 !important;
      }

      ^ .hidden {
        display: none !important;
      }

      ^ .interacImage {
        width: 90px;
        height: 40px;
        object-fit: contain;
        float: right;
      }

      ^ p {
        margin: 0;
        color: #093649;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        margin-bottom: 8;
      }

      ^ .pDetails {
        opacity: 0.7;
        font-size: 12px;
        line-height: 1.17;
        letter-spacing: 0.2px;
        color: #093649;
      }

      ^ .bold {
        font-weight: bold;
        margin-bottom: 20px;
        letter-spacing: 0.4px;
      }

      ^ .detailsCol {
        display: inline-block;
        vertical-align: top;
        width: 320px;
      }

      ^ .divider {
        display: inline-block;
        vertical-align: top;
        width: 2px;
        height: 520;
        box-sizing: border-box;
        background-color: #a4b3b8;
        opacity: 0.3;
        margin: auto 51px;
      }

      ^ .fromToCol {
        display: inline-block;
        vertical-align: top;
        width: 300px;
      }

      ^ .fromToCard {
        box-sizing: border-box;
        padding: 20px;
        width: 300px;
        border-radius: 2px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        margin-bottom: 20px;
      }

      ^ .pricingCol {
        display: inline-block;
        vertical-align: top;
        width: 160px;
        box-sizing: border-box;
      }

      ^ .pPricing {
        font-size: 12px;
        margin-bottom: 10px;
      }

      ^ .invoiceDetailContainer {
        width: 100%;
        margin-bottom: 20px;
      }

      ^ .invoiceLabel {
        display: inline-block;
        vertical-align: top;
        box-sizing: border-box;
        width: 100px;
        margin: 0;
        margin-right: 35px;
      }

      ^ .invoiceLabel:first-child {
        margin-bottom: 10px;
      }

      ^ .invoiceDetail {
        display: inline-block;
        vertical-align: top;

        font-size: 12px;
        letter-spacing: 0.2px;
        color: #093649;
        margin: 0;
      }

      ^ .invoiceLink {
        display: block;
        font-size: 12px;
        line-height: 1.33;
        letter-spacing: 0.2px;
        text-align: left;
        color: #59a5d5;
        margin-bottom: 20px;
      }

      ^ .invoiceLink:hover {
        cursor: pointer;
      }
    */}})
  ],

  messages: [
    { name: 'TimerText', message: 'before exchange rate expires.' }
  ],

  properties: [
    {
      name: 'countdownView',
      factory: function() {
        return this.CountdownView.create();
      }
    },
    'invoice'
  ],

  methods: [
    function init() {
      this.title = 'Send e-Transfer';
      if ( this.invoice ) {
        this.viewData.invoiceNo = this.invoice.invoiceNo;
        this.viewData.purchaseOrder = this.invoice.purchaseOrder;
        this.viewData.invoiceFileUrl = this.invoice.invoiceFileUrl;
        this.viewData.fromAmount = this.invoice.amount;
      } else {
        this.viewData.invoiceNo = 'N/A';
        this.viewData.purchaseOrder = 'N/A';
      }
      this.views = [
        { parent: 'etransfer', id: 'etransfer-transfer-details',     label: 'Account & Payee',      view: { class: 'net.nanopay.interac.ui.etransfer.TransferDetails' } },
        { parent: 'etransfer', id: 'etransfer-transfer-amount',      label: 'Amount',               view: { class: 'net.nanopay.interac.ui.etransfer.TransferAmount'  } },
        { parent: 'etransfer', id: 'etransfer-transfer-review',      label: 'Review',               view: { class: 'net.nanopay.interac.ui.etransfer.TransferReview'  } },
        { parent: 'etransfer', id: 'etransfer-transfer-complete',    label: 'Successful',           view: { class: 'net.nanopay.interac.ui.etransfer.TransferComplete'  } }
      ];
      this.countdownView.hide();
      this.SUPER();
    },

    function initE(){
      var self = this;

      this.addClass(this.myClass())
        .start('div').addClass('row')
          .start('div').addClass('positionColumn')
            .start('p').add(this.title || '').addClass('title').end()
            .tag({ class: 'net.nanopay.interac.ui.shared.wizardView.WizardViewOverview', titles: this.viewTitles, position$: this.position$ })
          .end()
          .start('div').addClass('stackColumn')
            .start('div').addClass('topRow')
              // TODO: 30 minute timer
              .add(this.countdownView)
              .start('p').addClass('pDetails').addClass('timerText').enableClass('hidden', this.countdownView.isHidden$).add(this.TimerText).end()
              .start({class: 'foam.u2.tag.Image', data: 'images/interac.png'})
                .attrs({srcset: 'images/interac@2x.png 2x, images/interac@3x.png 3x'})
                .addClass('interacImage')
              .end()
            .end()
            .tag({ class: 'foam.u2.stack.StackView', data: this.subStack, showActions: false }).addClass('stackView')
          .end()
        .end()
        .start('div').addClass('row')
          .start('div').addClass('navigationContainer')
            .tag(this.GO_BACK, {label$: this.backLabel$})
            .tag(this.GO_NEXT, {label$: this.nextLabel$})
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      code: function(X) {
        if ( this.position == 0 ) {
          X.stack.back();
          return;
        }

        if ( this.position == 1 ) {
          this.countdownView.stop();
          this.countdownView.hide();
          this.countdownView.reset();
          this.viewData.fromAmount = 1.5;
          this.viewData.toAmount = 0;
          this.viewData.rateLocked = false;
        }

        if ( this.position == 3 ) {
          X.stack.back();
          return;
        }

        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position, errors) {
        if ( errors ) return false; // Error present
        return true; // Not in dialog
      },
      code: function() {
        var self = this;
        if ( this.position == 2 ) { // On Review Transfer page.
          this.countdownView.stop();
          this.countdownView.hide();
          this.countdownView.reset();

          // TODO: Run the transfer
          this.subStack.push(this.views[this.subStack.pos + 1].view);
          this.backLabel = 'Back to Home';
          this.nextLabel = 'Make Another Transfer';
          return;
        }

        if ( this.position == 3 ) {
          // TODO: Reset params and restart flow
          this.viewData.purpose = 'General';
          this.viewData.notes = '';
          this.viewData.fromAmount = 1.5;
          this.viewData.toAmount = 0;
          this.viewData.rateLocked = false;
          while ( this.position != 0 ) {
            this.subStack.back();
          }
          this.backLabel = 'Back';
          this.nextLabel = 'Next';
          return;
        }
        this.subStack.push(this.views[this.subStack.pos + 1].view); // otherwise
      }
    }
  ]
})
