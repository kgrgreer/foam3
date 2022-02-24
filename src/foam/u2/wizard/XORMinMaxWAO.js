/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'XORMinMaxWAO',
  implements: [ 'foam.u2.wizard.WAO' ],
  flags: ['web'],
  extends: 'foam.u2.wizard.ProxyWAO',
  
  requires: [
    'foam.u2.wizard.FObjectHolder'
  ],

  documentation: `
    Currently checks if the direct prerequisite of the wizardlet to match the minMaxCapabilityId string.
    Data of the min max needs to have only 1 element in the FObjectArray hence the XOR.
    Will use the data of the min max to find the prerequisite selected, and load its data.
  `,
  
  properties: [
    {
      class: 'String',
      name: 'minMaxCapabilityId',
    },
    {
      class: 'Boolean',
      name: 'isWrappedInFObjectHolder'
    }
  ],

  methods: [
    async function load(wizardlet) {
      wizardlet.isLoaded = false;

      const prereqMinMaxWizardlet = wizardlet.prerequisiteWizardlets.find(w =>
        w.capability && w.capability.id == this.minMaxCapabilityId
      );

      if ( ! prereqMinMaxWizardlet ) {
        console.error(
          `MinMaxCapabilityId: ${this.minMaxCapabilityId} is not a direct prerequisite to ${wizardlet.id}`
        );
        return;
      }

      const minMaxSelectedData = prereqMinMaxWizardlet.data.selectedData;

      if ( minMaxSelectedData.length != 1 ){
        console.error(
          `Cannot apply XOR to MinMaxCapabilityId: ${this.minMaxCapabilityId}`
        );
        return;
      }

      const selectedCapabilityId = minMaxSelectedData[0];

      const selectedCapabilityWizardlet = prereqMinMaxWizardlet.prerequisiteWizardlets.find(w =>
        w.capability && w.capability.id == selectedCapabilityId
      );

      if ( ! selectedCapabilityWizardlet ){
        console.error(
          `Cannot find prerequisite for Selected Capability Id: ${selectedCapabilityId}`
        );
        return;
      }

      const clonedWizardletData = selectedCapabilityWizardlet.data.clone();

      if ( this.isWrappedInFObjectHolder ){
        const fObjectHolder = this.FObjectHolder.create({ fobject: clonedWizardletData });

        wizardlet.data = fObjectHolder;
  
        wizardlet.isLoaded = true;
  
        return fObjectHolder;
      }

      wizardlet.data = clonedWizardletData;
      wizardlet.isLoaded = true;

      return clonedWizardletData;
    }
  ]
});
