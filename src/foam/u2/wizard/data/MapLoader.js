/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'MapLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  imports: [
    'wizardlets?'
  ],

  requires: [
    'foam.u2.wizard.data.CreateLoader'
  ],

  properties: [
    {
      class: 'Object',
      name: 'args'
    },
    {
      class: 'Object',
      name: 'bind'
    },
    {
      name: 'delegate',
      factory: function () {
        return this.CreateLoader.create({
          spec: { class: 'foam.core.MapHolder' }
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isHolder',
      documentation: `
        Leave as true when using a MapHolder,
        set to false if populating an FObject.
      `,
      value: true
    }
  ],

  methods: [
    async function load(...a) {
      const target = await this.delegate.load(...a);
      const objectToSet = this.isHolder ? target.value : target;
      for ( const k in this.args ) {
        // don't override already existing value, skip the loader
        if ( objectToSet[k] ) continue;

        let loader = this.args[k];
        // If it's not an FObject, parse it
        if ( ! foam.core.FObject.isInstance(loader) ) {
          console.log('before parse of', loader)
          loader = foam.json.parse(loader, undefined, this.__subContext__);
          console.log('after parse');
        }

        objectToSet[k] = await loader.load({});
      }
      for ( const k in this.bind ) {
        const wizardlet = this.wizardlets.find(w => w.id == this.bind[k]);
        objectToSet[k] = wizardlet.data$;
      }

      return target;
    }
  ]
});
