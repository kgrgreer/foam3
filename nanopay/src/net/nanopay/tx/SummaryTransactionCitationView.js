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

 /**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SummaryTransactionCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'net.nanopay.tx.FeeSummaryTransactionLineItem',
    'net.nanopay.tx.GrandTotalLineItem',
    'net.nanopay.tx.SummaryTransactionLineItem',
    'net.nanopay.tx.FxSummaryTransactionLineItem',
    'net.nanopay.tx.TaxLineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.fx.TotalRateLineItem'
  ],

  messages: [
    { name: 'TITLE', message: 'Review Remittance Details' },
    { name: 'AMOUNT', message: 'Amount' },
    { name: 'AMOUNT_IN', message: 'Amount in' },
    { name: 'RATE', message: 'Rate'},
    { name: 'GRAND_TOTAL', message: 'Total Due' },
    { name: 'TRANSACTION_DATE', message: 'Payment date' },
    { name: 'TRANSACTION_REFERENCE', message: 'Reference' }
  ],

  imports: [
    'translationService',
    'currencyDAO'
  ],

  properties: [
    'data',
    {
      name: 'prop',
      expression: function(data) {
        let of = this.data.cls_;
        let rateLineItem = this.data.lineItems.find(e => this.FxSummaryTransactionLineItem.isInstance(e))
        let of_rateLineItem = rateLineItem.cls_;
        let props = of.getAxiomsByClass(foam.core.Property);
        let props_rateLineItem = of_rateLineItem.getAxiomsByClass(foam.core.Property);
        let candidates = [ 'destinationAmount', 'inverseRate', 'amount'];
        let labels = [this.AMOUNT, this.RATE, this.AMOUNT_IN];
        let newProps = new Array(candidates.length);

        for ( const p of props ) {
          if ( candidates.includes(p.name) ) {
            newProps[candidates.indexOf(p.name)] = {prop: p, value: p.get(this.data), label: labels[candidates.indexOf(p.name)] + (p.name === 'amount' ? ` (${data.sourceCurrency})`: '')};
          }
        }

        for ( const p of props_rateLineItem ) {
          if ( p.name != 'amount' && candidates.includes(p.name) ) {
            newProps[candidates.indexOf(p.name)] = {prop: p, value: p.get(rateLineItem), label: labels[candidates.indexOf(p.name)]};
          }
        }

        return newProps;
      }
    },
    {
      name: 'sourceCurrency',
      factory: function() {
        return this.data.sourceCurrency;
      }
    },
    {
      name: 'destinationCurrency',
      factory: function() {
        return this.data.destinationCurrency;
      }
    },
    {
      name: 'showTransactionDetail',
      value: false
    },
    {
      class: 'Date',
      name: 'processingDate'
    },
    {
      class: 'String',
      name: 'dataString',
      factory: function() {
        if ( ! this.processingDate ) return '';
        return this.processingDate.toLocaleDateString(foam.locale)
      }
    },
    {
      name: 'transactionId',
      factory: function() {
        return this.data.id.split('-', 1)[0];
      }
    },
    {
      name: 'grandTotal',
      expression: function(data) {
        return data;
      }
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();
      var self = this;
      let sourceCurrencyFormat = await this.getCurrencyFormat(this.sourceCurrency);
      let destinationCurrencyFormat = await this.getCurrencyFormat(this.destinationCurrency);

      this.start().addClass(this.myClass())
        .start('h2').add(this.TITLE).end()
        .start().show(this.showTransactionDetail$)
          .start(this.Cols)
            .add(this.TRANSACTION_DATE)
            .start().add(this.dataString).end()
          .end()
          .start(this.Cols)
            .add(this.TRANSACTION_REFERENCE)
            .start().add(this.transactionId).end()
          .end()
        .end()
        .start('h3').add(this.data.toSummary()).end()
        .forEach(self.prop, function(p) {
            if ( !p ) return;
            if ( p.prop.label && ! p.prop.hidden && ! p.prop.visibility ) {
              self.start(self.Cols)
                .add(p.label)
                .start(p.prop, { mode: foam.u2.DisplayMode.RO, data: p.value }).end()
              .end();
            }
          })
        .end()
        .br()
        .start()
          .add(
            this.slot( function(data) {
              if ( ! data ) return;
              let e = this.E();
              let totalFee = 0;
              let totalTax = 0;

              let lineItems = data.lineItems.filter( lineItem => ! lineItem.requiresUserInput
                                                                && (data.showAllLineItem || 
                                                                  this.FeeSummaryTransactionLineItem.isInstance(lineItem) ||
                                                                  this.TaxLineItem.isInstance(lineItem) ||
                                                                  this.TotalRateLineItem.isInstance(lineItem)
                                                                )
                                                                && lineItem.showLineItem() )
              // tax.
              lineItems
                .filter( lineItem => this.TaxLineItem.isInstance(lineItem) )
                .forEach( (taxLineItem) => {
                  totalTax += taxLineItem.amount;
                  e.start({
                    class: 'net.nanopay.tx.LineItemCitationView',
                    data: taxLineItem,
                    hideInnerLineItems: true,
                    inline:true
                  });
                });
              
              // fee.
              lineItems
                .filter( lineItem => this.FeeSummaryTransactionLineItem.isInstance(lineItem) )
                .forEach( (feeSummaryLineItem) => {
                  feeSummaryLineItem.lineItems.forEach( (feeLineItem) => {
                    // const curItemLabel = lineItem.toSummary();
                    // lineItem.toSummary = function(s) {
                    //   return this.toSentenceCase(s);
                    // }.bind(this, curItemLabel);
                    totalFee += feeLineItem.amount;
                    e.start({
                      class: 'net.nanopay.tx.LineItemCitationView',
                      data: feeLineItem,
                      hideInnerLineItems: true,
                      inline:true
                    });
                  });
                });

              // TODO: grandTotal lineItem
              let totalAmount = data.amount + totalFee + totalTax;
              e.br().start({
                class: 'net.nanopay.tx.LineItemCitationView',
                data: this.GrandTotalLineItem.create({
                  amount: totalAmount,
                  currency: data.sourceCurrency
                }),
                inline:true,
                highlightInlineTitle: true
              });

              //VET
              lineItems
                .filter( lineItem => this.TotalRateLineItem.isInstance(lineItem) )
                .forEach( (totalRateLineItem) => {
                  self.start(self.Cols)
                    .add(this.translationService.getTranslation(foam.locale, `net.nanopay.tx.TotalRateLineItem.${totalRateLineItem.name}`, totalRateLineItem.name))
                    .start().add(this.formatRate(destinationCurrencyFormat, 100, sourceCurrencyFormat, (1/totalRateLineItem.rate)*1000000)).end()
                  .end();
                });


              return e;
            })
          )
        .end()
      .end();
    },

    function toSentenceCase(s) {
      return s[0].toUpperCase() + s.slice(1).toLowerCase();
    },

    async function getCurrencyFormat(currency) {
      return await this.currencyDAO.find(currency);
    },

    function formatRate(currency_a, ammount_a, currency_b, ammount_b) {
      let c_currency_b = currency_b.clone()
      c_currency_b.precision = 6
      return `${currency_a.format(ammount_a)} : ${c_currency_b.format(ammount_b)}`;
    }
  ]
});
