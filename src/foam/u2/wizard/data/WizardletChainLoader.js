/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'WizardletChainLoader',
  implements: ['foam.u2.wizard.data.Loader'],

  documentation: `
    Delegates to the loader in the specified wizardlet.

    It is important to note that the loader from the wizardlet
    specified will execute under that wizardlet's subcontext
    rather than the subcontext of the wizardlet which is using
    WizardletChainLoader.
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
    }
  ],

  methods: [
    async function load(...a) {
      const wizardlet = this.wizardlets.find(w => w.id == this.wizardletId);

      if ( ! wizardlet ) {
        const errorMsg = this.cls_.name +
          ' did not find a matching wizardlet for: ' +
          this.wizardletId;
        foam.assert(false, errorMsg);
      }

      if ( ! this.SplitWAO.isInstance(wizardlet.wao) ) {
        const errorMsg = this.cls_.name +
          ' cannot operate on a wizardlet with WAO of class: ' +
          this.wizardlet.wao.cls_.id;
        foam.assert(false, errorMsg);
      }

      const loader = foam.json.parse(
        wizardlet.wao.loader, undefined, wizardlet.__subContext__);
      foam.u2.wizard.data.ensureTerminal(loader, this.ProxyLoader, this.NullLoader);
      // Clone is necessary here as otherwise the two wizardlet's data gets linked together
      return (await loader.load({ ...a, old: wizardlet.data })).clone();
    }
  ]
});
