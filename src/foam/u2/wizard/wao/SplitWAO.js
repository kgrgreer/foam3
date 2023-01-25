/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'SplitWAO',
  extends: 'foam.u2.wizard.wao.ProxyWAO',

  requires: [
    'foam.u2.wizard.data.NullCanceler',
    'foam.u2.wizard.data.NullLoader',
    'foam.u2.wizard.data.NullSaver',
    'foam.u2.wizard.data.ProxyCanceler',
    'foam.u2.wizard.data.ProxyLoader',
    'foam.u2.wizard.data.ProxySaver'
  ],

  properties: [
    {
      class: 'foam.util.FObjectSpec',
      of: 'foam.u2.wizard.data.Canceler',
      name: 'canceler',
      factory: () => ({ class: 'foam.u2.wizard.data.NullCanceler' })
    },
    {
      class: 'foam.util.FObjectSpec',
      of: 'foam.u2.wizard.data.Loader',
      name: 'loader',
      factory: () => ({ class: 'foam.u2.wizard.data.NullLoader' })
      // factory: function () { return this.NullLoader.create() }
    },
    {
      class: 'foam.util.FObjectSpec',
      of: 'foam.u2.wizard.data.Saver',
      name: 'saver',
      factory: () => ({ class: 'foam.u2.wizard.data.NullSaver' })
    }
  ],

  methods: [
    async function cancel (wizardlet) {
      const canceler = foam.json.parse(this.canceler, undefined, wizardlet.__subContext__);
      foam.u2.wizard.data.ensureTerminal(canceler, this.ProxyCanceler, this.NullCanceler);
      await canceler.cancel();
    },
    async function load (wizardlet) {
      if ( wizardlet.loading ) return;
      const loader = foam.json.parse(this.loader, undefined, wizardlet.__subContext__);
      foam.u2.wizard.data.ensureTerminal(loader, this.ProxyLoader, this.NullLoader);
      await this.SUPER(wizardlet);
      wizardlet.loading = true;
      wizardlet.data = await loader.load({ old: wizardlet.data });
      wizardlet.loading = false;
    },
    async function save (wizardlet) {
      const saver = foam.json.parse(this.saver, undefined, wizardlet.__subContext__);
      foam.u2.wizard.data.ensureTerminal(saver, this.ProxySaver, this.NullSaver);
      // temp workaround until daosaver is implemented
      try {
        if ( this.NullSaver.isInstance(saver) && this.delegate ) {
        // No-op handled in finally
        } else {
          if ( wizardlet.loading ) return;
          if ( ! wizardlet.isAvailable ) return;
          wizardlet.loading = true;
          await saver.save(wizardlet.data);
        }
      } finally {
        await this.delegate.save(wizardlet);
        wizardlet.loading = false;
      }
    }
  ]
});
