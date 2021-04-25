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
    'net.nanopay.tx.TaxLineItem'
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

              for ( i=0; i < data.lineItems.length; i++ ) {
                if ( ! data.lineItems[i].requiresUserInput
                  && (data.showAllLineItems || 
                    this.FeeSummaryTransactionLineItem.isInstance(data.lineItems[i]) ||
                    this.TaxLineItem.isInstance(data.lineItems[i])
                    )
                  && data.lineItems[i].showLineItem() ) {

                  if ( ! this.TaxLineItem.isInstance(data.lineItems[i]) ) {
                    const curItemLabel = data.lineItems[i].toSummary();
                    data.lineItems[i].toSummary = function(s) {
                      return this.toSentenceCase(s);
                    }.bind(this, curItemLabel);
                  }

                  e.start({
                    class: 'net.nanopay.tx.LineItemCitationView',
                    data: data.lineItems[i],
                    hideInnerLineItems: true,
                    inline:true
                  });

                  // Calculate totalFee
                  if ( this.FeeSummaryTransactionLineItem.isInstance(data.lineItems[i]) ) {
                    totalFee = data.lineItems[i].lineItems.reduce(
                      (ret, item) => ret + item.amount, totalFee);
                  }
                }
              }

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
