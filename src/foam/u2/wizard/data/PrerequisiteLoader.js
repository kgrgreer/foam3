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
    'capabilityToPrerequisite?',
    'wizardController',
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
    },
    {
      class: 'Boolean',
      name: 'cloneValue',
      value: true
    },
    {
      class: 'Boolean',
      name: 'useInitialData',
      documentation: `
        Use when prerequisite data should be copied onto initialData
        when loadIntoPath is not set.
      `
    }
  ],
  
  methods: [
    async function load({ old }) {
      let initialData = this.delegate ? await this.delegate.load({ old }) : old;

      const prereqWizardlet = (this.wizardController?.wizardlets || this.wizardlets).find( wizardlet => wizardlet.id === this.prerequisiteCapabilityId );

      if ( ! prereqWizardlet ) {
        console.error(`prerequisiteCapabilityId: ${this.prerequisiteCapabilityId} not found`);
        return initialData;
      }

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
        return initialData;
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
            return initialData || this.of.create({}, this);
          }
        }

        clonedPrereqWizardletData = (loadedFromData.clone && this.cloneValue) ? loadedFromData.clone() : loadedFromData;
      } else {
        clonedPrereqWizardletData = this.cloneValue ? prereqWizardletData.clone() : prereqWizardletData;
      }

      if ( this.isWrappedInFObjectHolder ) {
        var fobjRet = this.useInitialData ? initialData.copyFrom(clonedPrereqWizardletData) : clonedPrereqWizardletData;
        return this.FObjectHolder.create({ fobject: fobjRet });
      }

      if ( this.loadIntoPath ) {

        if ( ! initialData ) {
          initialData = this.of.create({}, this);
        }

        this.loadIntoPath$set(initialData, clonedPrereqWizardletData);

        return initialData;
      }

      return this.useInitialData ? initialData.copyFrom(clonedPrereqWizardletData) : clonedPrereqWizardletData;
    }
  ]
});
