/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'PrerequisiteLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  issues: [
    'Property "of" needs to specified, which is inconvenient.'
  ],

  imports: [
    'capabilityToPrerequisite',
    'wizardletId',
    'wizardletOf',
    'wizardlets'
  ],

  properties: [
    {
      class: 'String',
      name: 'prerequisiteCapabilityId'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      documentation: `
        OPTIONAL: For loading from the CapabilityJunction's data using a path
      `,
      name: 'loadFromPath'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      documentation: `
        OPTIONAL: For loading into the CapabilityJunction's data using a path
      `,
      name: 'loadIntoPath'
    },
    {
      class: 'Boolean',
      name: 'isWrappedInFObjectHolder'
    },
    {
      class: 'Class',
      name: 'of',
      expression: function (wizardletOf) {
        return wizardletOf;
      }
    }
  ],
  
  methods: [
    async function load({ old }) {
      let initialData = old || await this.SUPER();

      const isDescendantCheck = this.capabilityToPrerequisite[`${this.wizardletId}:${this.prerequisiteCapabilityId}`];

      if ( ! isDescendantCheck ) {
        console.error(
          `prerequisiteCapabilityId: ${this.prerequisiteCapabilityId} is not a prerequisite to ${this.wizardletId}`
        );
        return;
      }

      const prereqWizardlet = this.wizardlets.filter( wizardlet => wizardlet.id === this.prerequisiteCapabilityId )[0];

      if ( ! prereqWizardlet.isAvailable ){
        if ( this.loadIntoPath ) {

          if ( ! initialData ) {
            initialData = this.of.create({}, this);
          }
  
          this.loadIntoPath$set(initialData, null);
  
          return initialData;
        }

        return null;
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

      if ( this.loadFromPath  ) {
        var loadedFromData = this.loadFromPath.f(prereqWizardletData);

        if ( ! loadedFromData ) {
          console.error(
            `prerequisiteCapabilityId: ${this.prerequisiteCapabilityId}'s data returns null for the path ${this.loadFromPath.toString()}`,
          );
          if ( this.of ) {
            return this.of.create({}, this);
          }
        }

        clonedPrereqWizardletData = loadedFromData.clone ? loadedFromData.clone() : loadedFromData;
      } else {
        clonedPrereqWizardletData = prereqWizardletData.clone();
      }

      if ( this.isWrappedInFObjectHolder ) {
        return this.FObjectHolder.create({ fobject: clonedPrereqWizardletData });
      }

      if ( this.loadIntoPath ) {

        if ( ! initialData ) {
          initialData = this.of.create({}, this);
        }

        this.loadIntoPath$set(initialData, clonedPrereqWizardletData);

        return initialData;
      }

      return clonedPrereqWizardletData;
    }
  ]
});