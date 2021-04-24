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
  ],

  messages: [
    { name: 'TITLE', message: 'Review Remittance Details' }
  ],

  properties: [
    'data',
    {
      name: 'prop',
      expression: function(data) {
        var of = this.data.cls_;
        var props = of.getAxiomsByClass(foam.core.Property);
        var candidates = [ 'amount', 'destinationAmount', 'sourceAccount' ];
        var newProps = [];

        for ( var i = 0; i < props.length; i++ ) {
          var p = props[i];

          // filter unnecessary properties

          for ( var j = 0; j < candidates.length; j++ ) {
            if ( p.name === candidates[j] ) {
              newProps.push(p);
            }
          }
        }
        console.log('newProps', newProps);
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
            if ( p.label && ! p.hidden && ! p.visibility ) {
              p.label = self.toSentenceCase(p.label);
              self.start(self.Cols)
                .add(p.label)
                .start(p, { mode: foam.u2.DisplayMode.RO }).end()
              .end();
            }
          })
        .end()
        .start()
          .add(
            this.slot( function(data) {
              if ( ! data ) return;
              let e = this.E();
              let totalFee = 0;

              for ( i=0; i < data.lineItems.length; i++ ) {
                if ( ! data.lineItems[i].requiresUserInput
                  && (data.showAllLineItems || this.SummaryTransactionLineItem.isInstance(data.lineItems[i]))
                  && data.lineItems[i].showLineItem() ) {

                  const curItemLabel = data.lineItems[i].toSummary();
                  data.lineItems[i].toSummary = function(s) {
                    return this.toSentenceCase(s);
                  }.bind(this, curItemLabel);
                  e.start({
                    class: 'net.nanopay.tx.LineItemCitationView',
                    data: data.lineItems[i],
                    hideInnerLineItems: true
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
