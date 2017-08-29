foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferReview',
  extends: 'foam.u2.View',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
  ],

  exports: [ 'as data' ],

  documentation: 'Interac transfer review',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .col {
          display: inline-block;
          vertical-align: top;
          width: 320px;
          margin-right: 40px;
        }

        ^ .col:last-child {
          margin-right: 0;
        }

        ^ .transferRateContainer {
          position: relative;
          width: 100%;
          margin-bottom: 30px;
        }

        ^ .currencyContainer {
          width: 100%;
          height: 24px;
          margin-bottom: 8px;
        }

        ^ .currencyContainer:last-child {
          margin-bottom: 0;
        }

        ^ .currencyFlag {
          display: inline-block;
          width: 24px;
          height: 14px;
          object-fit: contain;
          margin: 1px 0;
          margin-right: 8px;
          vertical-align: top;
        }

        ^ .currencyAmount {
          display: inline-block;
        }

        ^ .rateLabelMargin {
          margin-left: 37px;
          margin-bottom: 13px;
        }

        ^ .rateDivider {
          position: absolute;
          top: 15px;
          left: 11px;
          width: 2px;
          height: 72px;
          opacity: 0.3;
          background-color: #a4b3b8;
        }
      */}
    })
  ],

  messages: [
    { name: 'ToLabel', message: 'To' },
    { name: 'FromLabel', message: 'From' },
    { name: 'AmountLabel', message: 'Amount' },
    { name: 'SendingFeeLabel', message: 'Sending Fee:' },
    { name: 'ReceivingFeeLabel', message: 'Receiving Fee:' },
    { name: 'TotalLabel', message: 'Total Amount:' },
    { name: 'EstimatedDeliveryLabel', message: 'Estimated Delivery Date:' },
    { name: 'PurposeLabel', message: 'Purpose of Transfer' },
    { name: 'NotesLabel', message: 'Notes' }
  ],

  properties: [
    {
      // TODO: Pull FX rate from somewhere
      class: 'Double',
      name: 'fxRate',
      value: 52.01
    }
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('topRow')
          .start({class: 'foam.u2.tag.Image', data: 'images/interac.png'})
            .attrs({srcset: 'images/interac@2x.png 2x, images/interac@3x.png 3x'})
            .addClass('interacImage')
          .end()
        .end()
        .start('div').addClass('col')
          .start('p').add(this.FromLabel).addClass('bold').end()
          // TODO: Make card based on from and to information
          .start('p').addClass('bold').add(this.AmountLabel).end()
          .start('div').addClass('transferRateContainer')
            .start('div').addClass('currencyContainer')
              .start({class: 'foam.u2.tag.Image', data: 'images/canada.svg'}).addClass('currencyFlag').end()
              .start('p').addClass('currencyAmount').add('CAD ', parseFloat(this.viewData.fromAmount).toFixed(2)).end()
            .end()
            .start('p').addClass('pDetails').addClass('rateLabelMargin').add('Fees: CAD 5.00').end()
            .start('p').addClass('pDetails').addClass('rateLabelMargin').add('Rate: ', this.fxRate$).end() // TODO: Get FX rates
            .start('div').addClass('currencyContainer')
              .start({class: 'foam.u2.tag.Image', data: 'images/india.svg'}).addClass('currencyFlag').end()
              .start('p').addClass('currencyAmount').add('INR ', parseFloat(this.viewData.toAmount).toFixed(2)).end()
            .end()
            .start('div').addClass('rateDivider').end()
          .end()
          .start('div').addClass('pricingCol')
            .start('p').addClass('pPricing').add(this.EstimatedDeliveryLabel).end()
          .end()
          .start('div').addClass('pricingCol')
            .start('p').addClass('pPricing').add('Near Real Time (IMPS)').end()
          .end()
        .end()
        .start('div').addClass('col')
          // TODO: Make card based on from and to information

          .start('p').addClass('bold').add(this.ToLabel).end()
          .start('p').addClass('bold').add(this.PurposeLabel).end()
          .start('p').add(this.viewData.purpose).end()
          .start('p').addClass('bold').add(this.NotesLabel).end()
          .start('p').add(this.viewData.notes ? this.viewData.notes : 'None').end()
        .end();
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        this.errors = this.errors_;
      }
    }
  ]
});
