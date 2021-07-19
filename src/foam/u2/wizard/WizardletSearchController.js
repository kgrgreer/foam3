/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'SearchableWizardlet',

  documentation: `
    This model wraps a Wizardlet to include a string containing search keywords.
    This allows searching recursive data with acceptable performance.
  `,

  properties: [
    {
      name: 'value',
      class: 'String'
    },
    {
      name: 'wizardlet',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.Wizardlet'
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'WizardletSearchController',

  documentation: `
    A controller that sets the isHidden property for wizardlets depending on
    a search query.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.ArrayDAO',
    'foam.parse.QueryParser',
    'foam.u2.wizard.SearchableWizardlet'
  ],

  properties: [
    {
      class: 'String',
      name: 'data'
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet',
      name: 'wizardlets'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'searchDAO'
    },
    {
      name: 'queryParser',
      factory: function() {
        return this.QueryParser.create({
          of: 'foam.u2.wizard.SearchableWizardlet'
        });
      }
    },
  ],

  methods: [
    function init() {
      this.generateSearchDao_();
      this.wizardlets$.sub(this.generateSearchDao_.bind(this));
      this.data$.sub(() => {
        console.log('UPDATE TO SEARCH QUERY', this.data);
        if ( this.data == '' ) this.affectVisibility(this.TRUE);
        else this.affectVisibility(
          this.OR(
            this.queryParser.parseString(this.data) || this.FALSE,
            this.KEYWORD(this.data)
          )
        )
      });
    },
    function generateSearchDao_() {
      var array = [];
      for ( let w of this.wizardlets ) {
        if ( ! w.of ) continue;
        // array.push(w.of.model_);
        let str = '';
        let writeClassProps;
        let seen = [];
        writeClassProps = cls => {
          if ( seen.includes(cls) ) return;
          seen.push(cls);
          for ( let p of cls.getAxiomsByClass(foam.core.Property) ) {
            str += `${p.name} ${p.label} `;
            if ( foam.core.FObjectProperty.isInstance(p) ) {
              let ofCls = typeof p.of === 'string' ? foam.lookup(p.of) : p.of;
              writeClassProps(ofCls);
            }
          }
        };
        writeClassProps(w.of);
        array.push(this.SearchableWizardlet.create({
          value: str,
          wizardlet: w,
        }))
      }
      this.searchDAO = this.ArrayDAO.create({
        array: array,
        of: 'foam.u2.wizard.SearchableWizardlet'
      });
    },
    async function affectVisibility(predicate) {
      let sink = await this.searchDAO.where(predicate).select();
      let visibleWizardlets = sink.array.map(v => v.wizardlet);
      for ( let w of this.wizardlets ) {
        if ( ! w.of ) continue;
        w.isHidden = ! visibleWizardlets.includes(w);
      }
    }
  ]
});
