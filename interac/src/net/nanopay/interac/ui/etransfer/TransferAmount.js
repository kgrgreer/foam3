foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferAmount',
  extends: 'foam.u2.View',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
  ],

  exports: [ 'as data' ],

  documentation: 'Transfer amount details',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .transferRateContainer {
          position: relative;
          width: 100%;
          margin-bottom: 30px;
        }

        ^ .currencyContainer {
          box-sizing: border-box;
          width: 320px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          padding: 8px;
          margin-bottom: 13px;
        }

        ^ .currencyContainer:last-child {
          margin-bottom: 0;
        }

        ^ .rateLabelMargin {
          margin-left: 100px;
          margin-bottom: 13px;
        }

        ^ .rateDivider {
          position: absolute;
          width: 2px;
          height: 100%;
          background-color: #a4b3b8;
          opacity: 0.3;
          top: 0;
          left: 86px;
        }
      */}
    })
  ],

  messages: [
    { name: 'SendingFeeLabel', message: 'Sending Fee:' },
    { name: 'ReceivingFeeLabel', message: 'Receiving Fee:' },
    { name: 'TotalLabel', message: 'Total Amount:' },
    { name: 'EstimatedDeliveryLabel', message: 'Estimated Delivery Date:' },
    { name: 'FromLabel', message: 'From' },
    { name: 'ToLabel', message: 'To' }
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
          // TODO: 30 minute timer
          .start({class: 'foam.u2.tag.Image', data: 'images/interac.png'})
            .attrs({srcset: 'images/interac@2x.png 2x, images/interac@3x.png 3x'})
            .addClass('interacImage')
          .end()
        .end()
        .start('div').addClass('detailsCol')
          .start('div').addClass('transferRateContainer')
            .start('div').addClass('currencyContainer')
              // TODO: Get currency & total
            .end()
            .start('p').addClass('pDetails').addClass('rateLabelMargin').add('Rate: #.##').end() // TODO: Get FX rates
            .start('div').addClass('currencyContainer')
              // TODO: Get currency & total
            .end()
            .start('div').addClass('rateDivider').end()
          .end()
          .start('div').addClass('pricingCol')
            .start('p').addClass('pPricing').add(this.SendingFeeLabel).end()
            .start('p').addClass('pPricing').add(this.ReceivingFeeLabel).end()
            .start('p').addClass('bold').add(this.TotalLabel).end()
            .start('p').addClass('pPricing').add(this.EstimatedDeliveryLabel).end()
          .end()
          .start('div').addClass('pricingCol')
            .start('p').addClass('pPricing').add('CAD #.##').end()
            .start('p').addClass('pPricing').add('CAD #.##').end()
            .start('p').addClass('bold').add('CAD #.##').end()
            .start('p').addClass('pPricing').add('Near Real Time (IMPS)').end()
          .end()
        .end()
        .start('div').addClass('divider').end()
        .start('div').addClass('fromToCol')
          // TODO: Make card based on from and to information
          .start('p').add(this.FromLabel).addClass('bold').end()
          .start('p').add(this.ToLabel).addClass('bold').end()
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
