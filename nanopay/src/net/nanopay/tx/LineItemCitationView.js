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
  name: 'LineItemCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],

  imports: [
    'translationService'
  ],

  css: `
    ^highlight-title {
      font-weight: 600;
    }
  `,

  properties: [
    'data',
    {
      name: 'prop',
      expression: function(data, hideInnerLineItems) {
        var of = this.data.cls_;
        var props = of.getAxiomsByClass(foam.core.Property);
        var candidates = [];

        for ( var i = 0; i < props.length; i++ ) {
          var p = props[i];

          // filter unnecessary properties
          if ( p.name !== 'id' && p.name !== 'name' && ! (hideInnerLineItems && p.name == 'lineItems') ) {
            candidates.push(p);
          }
        }

        return candidates;
      }
    },
    {
      name: 'amountProp',
      expression: function(data) {
        var of = this.data.cls_;
        var props = of.getAxiomsByClass(foam.core.Property);
        for ( const p of props ) {
          if ( p.name === 'amount' ) return p;
        }
        return undefined;
      }
    },
    {
      class: 'Boolean',
      name: 'hideInnerLineItems'
    },
    {
      class: 'Boolean',
      name: 'inline',
      value: false
    },
    {
      class: 'Boolean',
      name: 'highlightInlineTitle',
      value: false
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      this.start()
      .callIf(!this.inline, () => {
        this.start('h3').add(this.data.toSummary()).end()
        this.forEach(this.prop, (p) => {
          if ( p.label && ! p.hidden && p.visibility !== foam.u2.DisplayMode.HIDDEN ) {
             self.start(self.Cols)
               .add(p.label)
               .start(p, { mode: this.data.requiresUserInput && p.required ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.RO }).end()
             .end()
          }
        })
      .end()
      })
      .callIf(this.inline && this.amountProp, () => {
        console.log(`${this.data.cls_.package}.${this.data.cls_.name}.${this.data.toSummary()}`)
        this.callIf(this.highlightInlineTitle, () => {
          this.start(this.Cols)
            .start().addClass(this.myClass('highlight-title')).add(this.translationService.getTranslation(foam.locale,`${this.data.cls_.package}.${this.data.cls_.name}.${this.data.toSummary()}`, this.data.toSummary())).end()
            .start(this.amountProp, { mode: this.data.requiresUserInput && this.amountProp.required ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.RO }).end()
          .end()
        })
        .callIf(!this.highlightInlineTitle, () => {
          this.start(this.Cols)
            .add(this.translationService.getTranslation(foam.locale,`${this.data.cls_.package}.${this.data.cls_.name}.${this.data.toSummary()}`, this.data.toSummary()))
            .start(this.amountProp, { mode: this.data.requiresUserInput && this.amountProp.required ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.RO }).end()
          .end()
        })
      })
    }
  ]
});
