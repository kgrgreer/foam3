/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'InlineTransientSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',
  documentation: `
    This saver invokes an inline wizard based on the root capability for a
    transient wizard (a Capable wizard where the Capable object is disposed).

    Unlike InlineInterceptSaver, the data passed here is not a Capable object.
    Instead, provide either a falsey value or a MapHolder. If the data is a
    MapHolder, it will be used to populate the subcontext.
  `,

  issues: [
    'inline transient wizards cannot be re-loaded via alternate flows'
  ],

  imports: [
    'crunchController',
    'wizardController',
    'wizardlet'
  ],

  requires: [
    'foam.core.MapHolder',
    'foam.nanos.crunch.lite.Capable'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'wizardSpecLoader',
      documentation: `
        The loader should load a "wizard spec", which is a capability id or
        a Capable object.
      `
    },
    {
      class: 'FObjectArray',
      // of: 'foam.util.FluentSpec',
      of: 'foam.core.FObject',
      name: 'sequenceExtras'
    }
  ],

  methods: [
    async function save (data) {
      // InlineTransientSaver will create duplicate wizards if it is called
      // more than once, so deactivate this wizardlet's saver.
      this.wizardlet.wao.saver = { class: 'foam.u2.wizard.data.NullSaver' };

      let subX = this.wizardController.__subContext__;
      if ( data && this.MapHolder.isInstance(data) ) {
        subX = subX.createSubContext(data.value);
      }

      if ( ! this.wizardController ) {
        console.error('[InlineTransientSaver] not in wizard context', {
          data: data,
          saver: this,
          x: this.__context__
        });
      }

      // Load from wizardSpecLoader
      const root = this.wizardSpecLoader ? await this.wizardSpecLoader.load({}) : data;
      if ( typeof root === 'string' ) {
        await this.crunchController.doInlineIntercept(
          this.wizardController, null, root, null,
          { put: false },
          subX, this.sequenceExtras
        );
        return await this.delegate.save(data);
      }

      if ( this.Capable.isInstance(root) ) {
        for ( const capabilityId of root.capabilityIds ) {
          // TODO: add excludes list
          if ( capabilityId === 'authentication' ) continue;
          if ( root.capablePayloads.length > 0 ) return;
          await this.crunchController.doInlineIntercept(
            this.wizardController, root, capabilityId, null,
            { put: false },
            subX, this.sequenceExtras
          );
        }

        return await this.delegate.save(data);
      }
      await this.delegate.save(data);
      throw new Error('could not instantiate a wizard from this object:', root);
    }
  ]
});
