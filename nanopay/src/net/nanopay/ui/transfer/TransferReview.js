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
  name: 'TransferReview',
  extends: 'net.nanopay.ui.transfer.TransferView',

  documentation: 'Interac transfer review',

  imports: [
    'addCommas',
    'pacs008IndiaPurposeDAO',
    'user',
    'type'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .col {
          display: inline-block;
          vertical-align: top;
          margin-right: 30px;
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

        ^ .invoiceLink {
          height: 42px;
        }

        ^ .purposeMargin {
          margin-bottom: 20px
        }

        ^ .currencyAmount-L{
          font-size: 30px;
        }

        ^ .fromToContainer {
          display: inline-block;
        }

        ^ .fromCard {
          float: left;
        }

        ^ .toCard {
          float: right;
          margin-left: 48px;
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
    { name: 'InvoiceNoLabel', message: 'Invoice No.' },
    { name: 'PONoLabel', message: 'PO No.' },
    { name: 'PDFLabel', message: 'View Invoice PDF' }
  ],

  properties: [
    {
      name: 'rate',
      value: 'Expired',
      validateObj: function(rate) {
        if ( ! rate || rate == 'Expired' ) {
          return 'Rate expired';
        }
      }
    },
    'purpose'
  ],

  methods: [
    function init() {
      var self = this;
      this.rate = this.viewData.rate;
      this.countdownView.onExpiry = function() {
        self.rate = 'Expired';
        self.viewData.rateLocked = false;
      };

      // this.pacs008IndiaPurposeDAO.find(this.viewData.purpose).then(function(purpose) {
      //   self.purpose = purpose.code + ' - ' + purpose.description;
      // });

      this.SUPER();
    },

    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('div').addClass('col')
          .start('div').addClass('invoiceDetailContainer').enableClass('hidden', this.invoice$, true)
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.InvoiceNoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.invoiceNumber).end()
            .br()
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.PONoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.purchaseOrder).end()
          .end()
          .start().addClass('fromToContainer')
            .start().addClass('fromCard')
              .start('p').add(this.FromLabel).addClass('bold').end()
              .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user: this.viewData.payerCard })
            .end()
            .start().addClass('toCard')
              .start('p').addClass('bold').add(this.ToLabel).end()
              .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user: this.viewData.payeeCard })
            .end()
          .end()
          .start('p').addClass('bold').add(this.AmountLabel).end()
          .start('div').addClass('transferRateContainer')
            .callIf(this.type == 'foreign', function() {
              this.start('div').addClass('currencyContainer')
                .start({class: 'foam.u2.tag.Image', data: 'images/canada.svg'}).addClass('currencyFlag').end()
                .start('p').addClass('currencyAmount').add('CAD ', self.addCommas(parseFloat(self.viewData.fromAmount/100).toFixed(2))).end()
              .end()
              // .start('p').addClass('pDetails').addClass('rateLabelMargin').add('Fees: CAD ', this.viewData.fees.toFixed(2)).end() // TODO: Get from viewData
              .start('p').addClass('pDetails').addClass('rateLabelMargin').add('Rate: ', self.rate$).end() // TODO: Get FX rates
              .start('div').addClass('currencyContainer')
                .start({class: 'foam.u2.tag.Image', data: 'images/india.svg'}).addClass('currencyFlag').end()
                .start('p').addClass('currencyAmount').add('INR ', self.addCommas(parseFloat(self.viewData.toAmount/100).toFixed(2))).end()
              .end()
              .start('div').addClass('rateDivider').end()
            })
          .end()
          .start().addClass('transferRateContainer')
            .callIf(this.type == 'regular', function() {
              this.start('p').addClass('currencyAmount-L').add('$ ', self.addCommas(parseFloat(self.viewData.fromAmount/100).toFixed(2))).end()
            })
          .end()
          // .start('div').addClass('pricingCol')
          //   .start('p').addClass('pPricing').add(this.EstimatedDeliveryLabel).end()
          // .end()
          // .start('div').addClass('pricingCol')
          //   .start('p').addClass('pPricing').add('Near Real Time (IMPS)').end()
          // .end()
        .end()
        .start('div').addClass('col')
          .start('a').addClass('invoiceLink').enableClass('hidden', this.invoice$, true)
            // .attrs({href: this.viewData.invoiceFileUrl})
            // .add(this.PDFLabel)
          .end()
          // .start('p').addClass('bold').add(this.PurposeLabel).end()
          // .start('p').addClass('purposeMargin').add(this.purpose$).end()
        .end();
    }
  ]
});
