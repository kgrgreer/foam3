/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'PrerequisiteWAO',
  implements: [ 'foam.u2.wizard.WAO' ],
  flags: ['web'],
  extends: 'foam.u2.wizard.ProxyWAO',
  todo: [
    'Explore an efficient way to be able to load from any prequisite descendent of a wizardlet'
  ],

  requires: [
    'foam.u2.wizard.FObjectHolder'
  ],

  documentation: `
  A WAO that loads from a direct (for now) prerequisite wizardlet's data
  `,
  
  properties: [
    {
      class: 'String',
      name: 'prerequisiteCapabilityId'
    },
    {
      class: 'String',
      documentation: `
        OPTIONAL: For grabbing only a specific property from the CapabilityJunction's data
      `,
      name: 'propertyName'
    }
  ],

  methods: [
    async function load(wizardlet) {
      wizardlet.isLoaded = false;

      let prereqWizardlet;

      for ( let i = 0; i < wizardlet.prerequisiteWizardlets.length; i++ ){
        const currentWizardlet = wizardlet.prerequisiteWizardlets[i];

        if ( 
          currentWizardlet.capability && 
          currentWizardlet.capability.id == this.prerequisiteCapabilityId 
        ){
          prereqWizardlet = currentWizardlet;
          break;
        }
      }

      if ( ! prereqWizardlet ) {
        console.error(
          `prerequisiteCapabilityId: ${this.prerequisiteCapabilityId} is not a direct prerequisite to ${wizardlet.id}`
        );
        return;
      }

      if ( ! prereqWizardlet.of ) {
        console.error(
          `prerequisiteCapabilityId: ${this.prerequisiteCapabilityId} has no data`
        );
        return;
    }

      const prereqWizardletData = prereqWizardlet.data;

      if ( this.propertyName  ){
        if (  ! prereqWizardletData.hasOwnProperty(this.propertyName) ){
          console.error(
            `prerequisiteCapabilityId: ${this.prerequisiteCapabilityId}'s data does not have the property ${this.propertyName}`
          );
        }
        
        return this.FObjectHolder.create({ fobject: prereqWizardletData[this.propertyName] });
      }

      wizardlet.isLoaded = true;
      return this.FObjectHolder.create({ fobject: prereqWizardletData });
    }
  ]
});
