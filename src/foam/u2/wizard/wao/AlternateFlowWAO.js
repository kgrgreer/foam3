/**
 * @license
 * copyright 2022 the foam authors. all rights reserved.
 * http://www.apache.org/licenses/license-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'AlternateFlowWAO',
  extends: 'foam.u2.wizard.wao.ProxyWAO',
  documentation: `
    Wraps the WAO of an AlternateFlowWizardlet so that saving the current wizardlet
    does nothing when an alternateFlow is being executed
  `,

  methods: [
    function load(wizardlet) {
      this.delegate.load(wizardlet);
    },
    function save(wizardlet) {
      if ( wizardlet.isInAltFlow) {
        wizardlet.isInAltFlow = false;
      } else {
        this.delegate.save(wizardlet);
      }

    }
  ]
});
