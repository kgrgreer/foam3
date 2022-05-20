/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'FlowAgentWizardlet',
  extends: 'foam.u2.wizard.wizardlet.BaseWizardlet',
  imports: ['flowAgent?'],
  properties: [
    ['isVisible', false],
    ['of', null],
    'pubMessage'
  ],
  methods: [
    function save() {
      if ( this.flowAgent ) this.flowAgent.pub(this.pubMessage);
    }
  ]
});
