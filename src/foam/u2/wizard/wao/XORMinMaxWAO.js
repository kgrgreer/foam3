/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'XORMinMaxWAO',
  implements: [ 'foam.u2.wizard.wao.WAO' ],
  flags: ['web'],
  extends: 'foam.u2.wizard.wao.ProxyWAO',

  imports: [
    'wizardlets?',
    'capabilityToPrerequisite?'
  ],
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
    },
    {
      class: 'Class',
      name: 'of'
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
      name: 'cloneValue',
      value: true
    }
  ],

  methods: [
    async function load(wizardlet) {
      wizardlet.isLoaded = false;

      const isDescendantCheck = this.capabilityToPrerequisite[`${wizardlet.id}:${this.minMaxCapabilityId}`];

      if ( ! isDescendantCheck ) {
        console.error(
          `MinMaxCapabilityId: ${this.minMaxCapabilityId} is not a prerequisite to ${wizardlet.id}`
        );
        return;
      }

      const prereqMinMaxWizardlet = this.wizardlets.filter( wizardlet => wizardlet.id === this.minMaxCapabilityId )[0];

      let selectedCapabilityId;

      if ( ! prereqMinMaxWizardlet.isVisible ){
        // check if any of its children are available as this implies selection
        var impliedChoiceArray = prereqMinMaxWizardlet.choiceWizardlets.filter(cw => cw.isAvailable);

        if ( impliedChoiceArray.length != 1 ){
          console.error(
            `Cannot apply XOR to MinMaxCapabilityId: ${this.minMaxCapabilityId}`
          );
          return;
        }

        selectedCapabilityId = impliedChoiceArray[0].id;

      } else {
        const minMaxSelectedData = prereqMinMaxWizardlet.data.selectedData;

        if ( minMaxSelectedData?.length != 1 ){
          console.error(
            `Cannot apply XOR to MinMaxCapabilityId: ${this.minMaxCapabilityId}`
          );

          if ( this.of ) {
            wizardlet.data = this.of.create({}, this);
          }

          return;
        }

        selectedCapabilityId = minMaxSelectedData[0];
      }

      const selectedCapabilityWizardlet = prereqMinMaxWizardlet.prerequisiteWizardlets.find(w =>
        ( w?.capability?.id == selectedCapabilityId) ||
        ( w?.id == selectedCapabilityId)
      );

      if ( ! selectedCapabilityWizardlet ){
        console.error(
          `Cannot find prerequisite for Selected Capability Id: ${selectedCapabilityId}`
        );
        return;
      }


      let selectedCapabilityWizardletData = selectedCapabilityWizardlet.data;

      if ( ! selectedCapabilityWizardletData ) {
        // if data is undefined then create a fresh instance
        selectedCapabilityWizardletData = this.of.create({}, this)
      }

      let clonedSelectedWizardletData;

      if ( this.loadFromPath  ){
        var loadedFromData = this.loadFromPath.f(selectedCapabilityWizardletData);

        if ( ! loadedFromData ){
          console.error(
            `xorCapabilityId: ${this.minMaxCapabilityId}'s data returns null for the path ${this.loadFromPath.toSummary()}`
          );
          if ( this.of ) {
            wizardlet.data = this.of.create({}, this);
            return;
          }
        }

        clonedSelectedWizardletData = this.cloneValue ?
          loadedFromData.clone() : loadedFromData;
      } else {
        clonedSelectedWizardletData = this.cloneValue ?
          selectedCapabilityWizardletData.clone() : selectedCapabilityWizardletData;
      }

      if ( this.isWrappedInFObjectHolder ){
        const fObjectHolder = this.FObjectHolder.create({ fobject: clonedSelectedWizardletData });

        wizardlet.data = fObjectHolder;

        wizardlet.isLoaded = true;

        return fObjectHolder;
      }


      if ( this.loadIntoPath ){

        if ( ! wizardlet.data ){
          wizardlet.data = this.of.create({}, this);
        }

        this.loadIntoPath$set(wizardlet.data, clonedSelectedWizardletData);
        wizardlet.isLoaded = true;

        return;
      }

      wizardlet.data = clonedSelectedWizardletData;
      wizardlet.isLoaded = true;

      return clonedSelectedWizardletData;
    }
  ]
});
