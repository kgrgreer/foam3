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
    'net.nanopay.tx.FeeLineItem'
  ],

  messages: [
    { name: 'TITLE', message: 'Review Remittance Details' }
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
        let newProps = new Array(candidates.length);

        for ( const p of props ) {
          if ( candidates.includes(p.name) ) {
            newProps[candidates.indexOf(p.name)] = {prop: p, value: p.get(this.data)};
          }
        }

        for ( const p of props_rateLineItem ) {
          if ( p.name != 'amount' && candidates.includes(p.name) ) {
            newProps[candidates.indexOf(p.name)] = {prop: p, value: p.get(rateLineItem)};
          }
        }

        return newProps;
      }
    }
  ],

  methods: [
    function initE() {
      console.log("this.data", this.data);
      console.log("this.data.toSummary", this.data.toSummary);
      console.log("this.data.toSummary()", this.data.toSummary());
      this.SUPER();
      var self = this;
      this.start().addClass(this.myClass())
        .start('h2').add(this.TITLE).end()
        .start('h3').add(this.data.toSummary()).end()
        .forEach(self.prop, function(p) {
            if ( !p ) return;
            if ( p.prop.label && ! p.prop.hidden && ! p.prop.visibility ) {
              let label = self.toSentenceCase(p.prop.label);
              self.start(self.Cols)
                .add(label)
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

              let lineItems = data.lineItems.filter( lineItem => ! lineItem.requiresUserInput
                                                                && (data.showAllLineItem || 
                                                                  this.FeeSummaryTransactionLineItem.isInstance(lineItem) ||
                                                                  this.TaxLineItem.isInstance(lineItem)
                                                                )
                                                                && lineItem.showLineItem() )
              // tax.
              lineItems
                .filter( lineItem => this.TaxLineItem.isInstance(lineItem) )
                .forEach( (taxLineItem) => {
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
              
              //TODO: grandTotal and VET.

              // Show grand total
              e.start({
                class: 'net.nanopay.tx.LineItemCitationView',
                data: this.GrandTotalLineItem.create({
                  amount: data.amount + totalFee,
                  currency: data.sourceCurrency
                })
              });

              return e;
            })
          )
        .end()
      .end();
    },

    function toSentenceCase(s) {
      return s[0].toUpperCase() + s.slice(1).toLowerCase();
    }
  ]
});
