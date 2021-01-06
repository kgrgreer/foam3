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
  package: 'net.nanopay.ui.transfer',
  name: 'TransferAmount',
  extends: 'net.nanopay.ui.transfer.TransferView',

  documentation: 'Transfer amount details',

  imports: [
    'addCommas',
    'exchangeRate',
    'notify',
    'type',
    'user'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.LoadingSpinner'
  ],

  css: `
    ^ .transferRateContainer {
      position: relative;
      width: 100%;
      margin-bottom: 30px;
    }

    ^ .invoiceMarginOverride {
      margin-bottom: 0px;
    }

    ^ .currencyContainer {
      box-sizing: border-box;
      width: 320px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      margin-bottom: 13px;
    }

    ^ .currencyDenominationContainer {
      display: inline-block;
      width: 85px;
      height: 100%;
      padding: 8px;
      box-sizing: border-box;
    }

    ^ .currencyFlag {
      display: inline-block;
      width: 24px;
      height: 14px;
      margin: 4px 0;
    }

    ^ .currencyName {
      display: inline-block;
      font-size: 12px;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;

      vertical-align: top;
      margin: 5px 0;
      margin-left: 15px;
    }

    ^ .currencyContainer:last-child {
      margin-bottom: 0;
    }

    ^ .rateLabel {
      line-height: 20px;
      height: 20px;
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

    ^ .property-fromAmount,
      .property-toAmount {
      display: inline-block;
      box-sizing: border-box;
      vertical-align: top;
      float: right;
      width: 231px;
      height: 38px;
      padding: 0 20px;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      border: none;
      outline: none;
    }

    ^ .property-fromAmount:focus,
      .property-toAmount:focus {
      border: solid 1px #59A5D5;
      padding: 0 19px;
    }

    ^ input[type=number]::-webkit-inner-spin-button,
    ^ input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    ^ .net-nanopay-interac-ui-shared-LoadingSpinner {
      margin-left: 100px;
      margin-bottom: 13px;
    }

    ^ .from-amount {
      float: none;
      margin-bottom: 20px;
    }

    ^ .label{
      margin-left: 0;
    }

    ^ .invoice-amount{
      font-size: 40px;
      margin: 20px 0;
      font-weight: 300;
    }
  `,

  messages: [
    { name: 'AmountError', message: 'Amount needs to be greater than $0.00' },
    { name: 'SendingFeeLabel', message: 'Sending Fee:' },
    { name: 'ReceivingFeeLabel', message: 'Receiving Fee:' },
    { name: 'TotalLabel', message: 'Total Amount:' },
    { name: 'EstimatedDeliveryLabel', message: 'Estimated Delivery Date:' },
    { name: 'FromLabel', message: 'From' },
    { name: 'ToLabel', message: 'To' },
    { name: 'InvoiceNoLabel', message: 'Invoice No.' },
    { name: 'PONoLabel', message: 'PO No.' },
    { name: 'PDFLabel', message: 'View Invoice PDF' }
  ],

  properties: [
    {
      class: 'Double',
      name: 'fees',
      factory: function() {
        this.viewData.fees = 0; // TODO: Make this dynamic eventually
        return 0;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.fees = newValue;
      }
    },
    {
      // TODO: Pull FX rate from somewhere
      class: 'Double',
      name: 'rate',
      postSet: function(oldValue, newValue) {
        // TODO: enable input
        this.viewData.rate = newValue;
        // NOTE: This is a one way conversion. It is very lossy on certain fx rates.
        if ( newValue ) this.toAmount = (this.fromAmount) * newValue;

        // if ( newValue ) this.toAmount = (this.fromAmount - this.fees) * newValue;
      },
      validateObj: function(rate) {
        if ( ! rate ) {
          return 'Rate expired';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'feedback_',
      value: false
    },
    {
      // TODO: change class to Currency?
      class: 'Double',
      name: 'fromAmount',
      value: 1.5,
      min: 1.5,
      precision: 2,
      view: 'net.nanopay.ui.transfer.FixedFloatView',
      preSet: function(oldValue, newValue) {
        // TODO: Use mode of the view later on.
        if ( this.invoice ) return this.invoice.amount + this.fees;
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.fromAmount = newValue;

        if ( this.feedback ) return;
        this.feedback = true;
        this.toAmount = (newValue - this.fees) * this.rate;
        this.feedback = false;
      },
      validateObj: function(fromAmount) {
        if ( fromAmount <= this.fees ) {
          return this.AmountError;
        }
      }
    },
    {
      // TODO: change class to Currency?
      class: 'Double',
      name: 'toAmount',
      min: 0,
      value: 0,
      precision: 2,
      view: 'net.nanopay.ui.transfer.FixedFloatView',
      postSet: function(oldValue, newValue) {
        this.viewData.toAmount = newValue;

        if ( this.feedback ) return;
        this.feedback = true;
        this.fromAmount = newValue;
        this.fromAmount = (newValue / this.rate) + this.fees;
        this.feedback = false;
      },
      validateObj: function(toAmount) {
        if ( toAmount <= 0 ) {
          return this.AmountError;
        }
      }
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    },
    {
      name: 'isNearRealTime',
      value: true,
      expression: function(fromAmount) {
        if ( fromAmount >= 3500 ) return false;
        return true;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      // TODO: Get FX Rate
      if ( this.type == 'foreign' ) {
        this.countdownView.onExpiry = function() {
          self.refreshRate();
        };
      }

      // TODO: Get FX Rate
      if ( ! this.viewData.rateLocked && this.type == 'foreign' ) {
        this.refreshRate();
      } else {
        this.loadingSpinner.hide();
      }

      // NOTE: This order is important. If we pull rate first, it will break
      //       the fromAmount value
      if ( this.viewData.fromAmount ) {
        this.fromAmount = this.viewData.fromAmount;
      }

      if ( this.viewData.rate ) {
        this.rate = this.viewData.rate;
      }
    },

    function initE() {
      var self = this;
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('div').addClass('transferRateContainer').enableClass('invoiceMarginOverride', this.invoiceMode)
            .callIf(this.type == 'foreign', function() {
              this.start('div').addClass('currencyContainer')
                // TODO: Get currency & total
                .start('div').addClass('currencyDenominationContainer')
                  .start({class: 'foam.u2.tag.Image', data: 'images/canada.svg'}).addClass('currencyFlag').end()
                  .start('p').addClass('currencyName').add('CAD').end() // TODO: Make it dyamic.
                .end()
                .start(self.FROM_AMOUNT, {onKey: true, mode: self.invoiceMode ? foam.u2.DisplayMode.RO : undefined})
                  .attrs({
                    step: 0.01
                  })
                .end()
              .end()
              .start('p').addClass('pDetails').addClass('rateLabel').addClass('rateLabelMargin')
                // TODO: Get Fees rates
                // .add('Fees: CAD ', self.fees.toFixed(2) , ' (included)')
              .end()
              .start('p').addClass('pDetails').addClass('rateLabel').addClass('rateLabelMargin').enableClass('hidden', self.loadingSpinner.isHidden$, true)
                // TODO: Get FX rates
                .add('Rate: ', self.rate$)
              .end()
              .add(self.loadingSpinner)
              .start('div').addClass('currencyContainer')
                // TODO: Get currency & total
                .start('div').addClass('currencyDenominationContainer')
                  .start({class: 'foam.u2.tag.Image', data: 'images/india.svg'}).addClass('currencyFlag').end()
                  .start('p').addClass('currencyName').add('INR').end() // TODO: Make it dyamic.
                .end()
                .start(self.TO_AMOUNT, {onKey: true, mode: self.invoiceMode ? foam.u2.DisplayMode.RO : undefined})
                  .attrs({
                    step: 0.01
                  })
                .end()
              .end()
              .start('div').addClass('rateDivider').end()
            })
          .end()
          .start()
            .callIf(this.type == 'regular' && !this.invoice, function() {
              this.start().addClass('label').add('Enter Amount:').end()
              .start(self.FROM_AMOUNT, { onKey: true, mode: self.invoiceMode ? foam.u2.DisplayMode.RO : undefined }).addClass('from-amount').end()
            })
          .end()
          .start()
            .callIf(this.type == 'regular' && this.invoiceMode, function(){
              this.start().addClass('label').add('Amount:').end()
              .start().addClass('invoice-amount').add('$ ', self.addCommas(self.fromAmount.toFixed(2))).end()
            })
          .end()
          // .start('div').addClass('pricingCol')
          //   .start('p').addClass('pPricing').add(this.EstimatedDeliveryLabel).end()
          // .end()
          // .start('div').addClass('pricingCol')
          //   .start('p').addClass('pPricing').enableClass('hidden', this.isNearRealTime$, true).add('Near Real Time (IMPS)').end()
          //   .start('p').addClass('pPricing').enableClass('hidden', this.isNearRealTime$).add('Next Business Days (NEFT)').end()
          // .end()
        .end()
        .start('div').addClass('divider').end()
        .start('div').addClass('fromToCol')
          .start('div').addClass('invoiceDetailContainer').enableClass('hidden', this.invoice$, true)
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.InvoiceNoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.invoiceNumber).end()
            .br()
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.PONoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.purchaseOrder).end()
          .end()
          .start('a').addClass('invoiceLink').enableClass('hidden', this.invoice$, true)
            // .attrs({href: this.viewData.invoiceFileUrl})
            // .add(this.PDFLabel)
          .end()
          // TODO: Make card based on from and to information
          .start('p').add(this.FromLabel).addClass('bold').end()

          .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user: this.user })

          .start('p').add(this.ToLabel).addClass('bold').end()

          .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user: this.viewData.payee })

        .end();
    },

    function refreshRate() {
      var self = this;
      this.rate = 0;
      this.loadingSpinner.show();
      this.countdownView.hide();
      this.countdownView.reset();
      this.viewData.rateLocked = false;

      this.exchangeRate.getRate('CAD', 'INR', 100).then(function(response) {
        if ( ! response ) {
          self.notify('Unable to retrieve rate, Please try again later.', '', self.LogLevel.WARN, true);
          return;
        }
        self.rate = response.toAmount;
        self.loadingSpinner.hide();
        self.startTimer();
        self.viewData.rateLocked = true;
      });
    },

    function startTimer() {
      this.countdownView.show();
      this.countdownView.start();
    }
  ]
});
