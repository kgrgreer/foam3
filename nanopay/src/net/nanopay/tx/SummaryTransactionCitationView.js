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
    { name: 'POST_TITLE', message: 'Remittance Details' },
    { name: 'PRE_TITLE', message: 'Review Remittance Details' },
    { name: 'AMOUNT', message: 'Amount' },
    { name: 'AMOUNT_IN', message: 'Amount in' },
    { name: 'RATE', message: 'Rate'},
    { name: 'TRANSACTION_DATE', message: 'Payment date' },
    { name: 'TRANSACTION_REFERENCE', message: 'Reference' },
    { name: 'VET_TITLE', message: 'Effective Rate(VET)' }
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
      name: 'showingTitle',
      factory: function() {
        return this.showTransactionDetail ? this.POST_TITLE : this.PRE_TITLE;
      }
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
      name: 'dataProps',
      expression: function(data) {
        let ret = {};
        let of = this.data.cls_;
        let props = of.getAxiomsByClass(foam.core.Property);
        let candidates = [ 'destinationAmount', 'inverseRate', 'amount'];
        for ( const p of props ) {
          if ( candidates.includes(p.name) ) {
            ret[p.name] = p;
          }
        }
        return ret;
      }
    },
    {
      name: 'txAmount',
      factory: function() {
        return this.data.destinationAmount;
      }
    },
    {
      name: 'currencyRate',
      factory: function() {
        let lineItems = this.data.lineItems;
        for ( const lineItem of lineItems ) {
          if ( this.FxSummaryTransactionLineItem.isInstance(lineItem) ) {
            //get rate from lineItem[0] in FxSummaryTransactionLineItem.
            let totalRateLineItem = lineItem.lineItems[0];
            if ( this.TotalRateLineItem.isInstance(totalRateLineItem) ) {
              return totalRateLineItem.rate;
            }
          }
        }
        return 0;
      }
    },
    {
      name: 'currencyRateView',
      factory: function() {
        let lineItems = this.data.lineItems;
        for ( const lineItem of lineItems ) {
          if ( this.FxSummaryTransactionLineItem.isInstance(lineItem) ) {
            return lineItem.inverseRate;
          }
        }
        return '';
      }
    },
    {
      name: 'txAmounIn',
      factory: function() {
        return this.data.amount;
      }
    },
    'sourceCurrencyFormat',
    'destinationCurrencyFormat',
    {
      name: 'showVET',
      expression: function(data) {
        return data.sourceCurrency != data.destinationCurrency;
      }
    },
    {
      name: 'totalAmount',
      factory: function() {
        return this.data.amount;
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
        .start('h2').add(this.showingTitle).end()
        .br()
        .start().show(this.showTransactionDetail$)
          .start(this.Cols)
            .add(this.TRANSACTION_DATE)
            .start().add(this.dataString).end()
          .end()
          .start(this.Cols)
            .add(this.TRANSACTION_REFERENCE)
            .start().add(this.transactionId).end()
          .end()
          .br()
        .end()
        .start('h3').add(this.data.toSummary()).end()
        .br()
        .start(this.Cols)
          .add(this.AMOUNT)
          .start().add(destinationCurrencyFormat.format(this.txAmount)).end()
        .end()
        .start(this.Cols)
          .add(this.RATE)
          .start().add(this.currencyRateView).end()
        .end()
        .start(this.Cols)
        .add(this.AMOUNT_IN).add(` (${this.sourceCurrency})`)
        .start(this.dataProps['amount'], { mode: foam.u2.DisplayMode.RO, data$: this.txAmounIn$ }).end()
      .end()
        .br()
        .start()
          .add(
            this.slot( function(data) {
              if ( ! data ) return;
              let e = this.E();
              let totalFee = 0;
              let totalTax = 0;
              //TODO: use fee engine as it is treviso only.
              let irsTax = 0;

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
                  //TODO: use fee engine as it is treviso only.
                  if ( taxLineItem.name === "IRS Tax" ) {
                    irsTax += taxLineItem.amount;
                    console.log('aaa', irsTax);
                  }
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
              this.txAmounIn = this.totalAmount - totalFee - totalTax;
              e.br().start({
                class: 'net.nanopay.tx.LineItemCitationView',
                data: this.GrandTotalLineItem.create({
                  amount: this.totalAmount,
                  currency: data.sourceCurrency
                }),
                inline:true,
                highlightInlineTitle: true
              });

              //TODO: use fee engine as it is treviso only.
              let vet = (this.totalAmount - irsTax) / data.destinationAmount;
              e.br().start(self.Cols).show(this.showVET$)
                .add(this.VET_TITLE)
                .start().add(this.formatRate(destinationCurrencyFormat, 100, sourceCurrencyFormat, vet*1000000)).end()
              .end();

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
