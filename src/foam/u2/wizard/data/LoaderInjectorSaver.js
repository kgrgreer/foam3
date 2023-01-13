/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'LoaderInjectorSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  documentation: `
    Injects a prerequisite loader onto another wizardlet.
    This is useful for re-use of part of another wizard tree when part of the
    data is obtained through a different method.
  `,

  imports: [
    'wizardlets'
  ],

  requires: [
    'foam.u2.wizard.data.NullLoader',
    'foam.u2.wizard.data.ProxyLoader',
    'foam.u2.wizard.wao.SplitWAO'
  ],

  properties: [
    {
      class: 'String',
      name: 'wizardletId'
    },
    {
      class: 'foam.util.FObjectSpec',
      of: 'foam.u2.wizard.data.loader',
      name: 'loader'
    }
  ],

  methods: [
    async function save (data) {
      const target = this.wizardlets.find(w => w.id === this.wizardletId);

      if ( ! target ) {
        console.error(`wizardletId missing for WizardletSaver: ${this.wizardletId}`);
        return;
      }

      if ( ! this.SplitWAO.isInstance(target.wao) ) {
        target.wao = this.SplitWAO.create({ delegate: target.wao });
        // console.error(`LoaderInjectorSaver only supported on wizardlets with SplitWAO`);
        // return;
      }

      let node = target.wao.loader;

      const loader = foam.json.parse(this.loader, undefined, target.__subContext__);
      foam.u2.wizard.data.ensureTerminal(loader, this.ProxyLoader, this.NullLoader);

      target.wao.loader = loader;
      await this.delegate.save(data);

      // TODO: fix all this
      if ( false ) {
        // Short circuit: no decorators on target loader
        if ( ! this.ProxyLoader.isInstance(node) ) {
          loader.delegate = node;
          target.wao.loader = loader;
          return;
        }

        let tail = this.NullLoader.create();
        while ( true ) {
          if ( ! node.delegate ) break;
          if ( ! this.ProxyLoader.isInstance(node.delegate) ) {
            tail = node.delegate;
          }
        }

        node.delegate = loader;
        loader.delegate = tail;
      }
    }
  ]
});
