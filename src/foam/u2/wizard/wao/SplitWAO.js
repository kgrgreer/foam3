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
      this.ensure_terminal(canceler, this.ProxyCanceler, this.NullCanceler);
      await canceler.cancel();
    },
    async function load (wizardlet) {
      const loader = foam.json.parse(this.loader, undefined, wizardlet.__subContext__);
      this.ensure_terminal(loader, this.ProxyLoader, this.NullLoader);
      if ( wizardlet.loading ) return;
      wizardlet.loading = true;
      wizardlet.data = await loader.load();
      wizardlet.loading = false;
    },
    async function save (wizardlet) {
      const saver = foam.json.parse(this.saver, undefined, wizardlet.__subContext__);
      this.ensure_terminal(saver, this.ProxySaver, this.NullSaver);
      // temp workaround until daosaver is implemented
      if ( this.NullSaver.isInstance(saver) ) {
        await this.delegate.save(wizardlet);
      } else {
        if ( wizardlet.loading ) return;
        if ( ! wizardlet.isAvailable ) return;
        wizardlet.loading = true;
        await saver.save(wizardlet.data);
      }
      wizardlet.loading = false;
    },
    // ensure that the last delegate is the null implementation
    function ensure_terminal (obj, proxyCls, nullCls) {
      while ( proxyCls.isInstance(obj) ) {
        if ( ! obj.delegate ) {
          obj.delegate = nullCls.create();
        }
        obj = obj.delegate;
      }
    }
  ]
});
