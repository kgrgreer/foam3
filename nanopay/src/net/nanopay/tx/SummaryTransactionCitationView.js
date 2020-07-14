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
    'foam.u2.layout.Rows'
  ],

  properties: [
    'data',
    {
      name: 'prop',
      expression: function(data) {
        var of = this.data.cls_;
        var props = of.getAxiomsByClass(foam.core.Property);
        var candidates = [ 'amount', 'destinationAmount', 'sourceAccount', 'summary' ];
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

        return newProps;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      this.start()
        this.start('h3').add(this.data.toSummary()).end()
        this.forEach(self.prop, function(p) {
          if ( p.label && ! p.hidden && ! p.visibility ) {
             self.start(self.Cols)
               .add(p.label)
               .start(p, { mode: foam.u2.DisplayMode.RO }).end()
             .end()
          }
        })
      .end()
    }
  ]
});
