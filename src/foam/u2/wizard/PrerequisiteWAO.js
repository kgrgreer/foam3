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
  issues: [
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
      name: 'loadFromPropertyName'
    },
    {
      class: 'String',
      documentation: `
        OPTIONAL: For loading into only a specific property of the CapabilityJunction's data
      `,
      name: 'loadIntoPropertyName'
    },
    {
      class: 'Boolean',
      name: 'isWrappedInFObjectHolder'
    },
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    async function load(wizardlet) {
      wizardlet.isLoaded = false;

      const prereqWizardlet = wizardlet.prerequisiteWizardlets.find(w =>
        w.capability && w.capability.id == this.prerequisiteCapabilityId
      );


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

      let prereqWizardletData = prereqWizardlet.data;

      if ( ! prereqWizardletData ) {
        // if data is undefined then create a fresh instance
        prereqWizardletData = this.of.create({}, this)
      }

      let clonedPrereqWizardletData;

      if ( this.loadFromPropertyName  ){
        if (  ! prereqWizardletData.hasOwnProperty(this.loadFromPropertyName) ){
          console.error(
            `prerequisiteCapabilityId: ${this.prerequisiteCapabilityId}'s data does not have the property ${this.loadFromPropertyName}`
          );
          if ( this.of ) {
            wizardlet.data = this.of.create({}, this);
            return;
          }
        }

        clonedPrereqWizardletData = prereqWizardletData[this.loadFromPropertyName].clone();
      } else {
        clonedPrereqWizardletData = prereqWizardletData.clone();
      }

      if ( this.isWrappedInFObjectHolder ){
        const fObjectHolder = this.FObjectHolder.create({ fobject: clonedPrereqWizardletData });

        wizardlet.data = fObjectHolder;

        wizardlet.isLoaded = true;

        return fObjectHolder;
      }

      if ( this.loadIntoPropertyName ){

        if ( ! wizardlet.data ){
          wizardlet.data = this.of.create({}, this);
        }

        wizardlet.data[this.loadIntoPropertyName] = clonedPrereqWizardletData;
        wizardlet.isLoaded = true;

        return;
      }

      wizardlet.data = clonedPrereqWizardletData;
      wizardlet.isLoaded = true;

      return clonedPrereqWizardletData;
    }
  ]
});
