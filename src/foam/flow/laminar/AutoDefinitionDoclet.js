/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.laminar',
  name: 'AutoDefinitionDoclet',
  extends: 'foam.flow.laminar.AbstractDoclet',
  documentation: `
    Auto-definition doclet tries to find definitions for bolded terms in
    previous doclets which haven't already been defined.
  `,

  requires: [
    'foam.u2.borders.Block',
    'foam.u2.view.AnyView'
  ],

  properties: [
    {
      name: 'foundDefinitions_',
      hidden: true
    }
  ],

  methods: [
    async function execute_ (x) {
      this.foundDefinitions_ = [];
      const definitionWords = x.definitionWords || [];
      for ( const term of definitionWords ) {
        const cls = x.lookup(term);
        if ( ! cls ) continue;
        this.foundDefinitions_.push({
          term: cls.name,
          definition: cls.model_.description || cls.model_.documentation
        });
      }
    },
    function toE (args, x) {
      // return this.AnyView.create({ data$: this.value_$ });
      return this.foundDefinitions_$.map(foundDefinitions => {
        return x.E()
          .start('h2').add('Definitions').end()
          .start(this.Block)
            .forEach(foundDefinitions || [], function ({ term, definition }) {
              this
                .start('h3').add(term).end()
                .start('p').add(definition).end()
            })
          .end()
          ;
      });
    }
  ]
})
