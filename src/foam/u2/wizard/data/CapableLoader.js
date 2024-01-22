/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'CapableLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  documentation: `
    Previously a part of the PrerequisiteLoader, this class is responsible for loading a prerequisite's Capable data directly,
    usually to be used in conjunction with the CapableSaver which stores its data as CapablePayloads on the Capable.
  `,

  imports: [
    'wizardController',
    'wizardlets'
  ],

  properties: [
    {
      class: 'String',
      name: 'prerequisiteCapabilityId'
    }
  ],
  
  methods: [
    async function load() {
      const prereqWizardlet = (this.wizardController?.wizardlets || this.wizardlets).find( wizardlet => wizardlet.id === this.prerequisiteCapabilityId );

      if ( ! prereqWizardlet ) {
        console.error(`prerequisiteCapabilityId: ${this.prerequisiteCapabilityId} not found`);
        return null;
      }

      if ( ! prereqWizardlet.isAvailable ){
        return null;
      }

      if ( ! prereqWizardlet.of ) {
        console.error(
          `prerequisiteCapabilityId: ${this.prerequisiteCapabilityId} has no data`
        );
        return null;
      }

      let prereqWizardletData = prereqWizardlet.data;

      if ( ! prereqWizardletData ) {
        // if data is undefined then create a fresh instance
        prereqWizardletData = prereqWizardlet.of.create({}, this)
      }

      return prereqWizardletData;
    }
  ]
});