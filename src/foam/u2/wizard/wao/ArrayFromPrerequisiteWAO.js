/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'ArrayFromPrerequisiteWAO',
  implements: [ 'foam.u2.wizard.wao.WAO' ],
  flags: ['web'],
  extends: 'foam.u2.wizard.wao.ProxyWAO',

  imports: [
    'wizardlets',
    'capabilityToPrerequisite'
  ],
  requires: [
    'foam.nanos.crunch.CapabilityJunctionPayload'
  ],

  documentation: `
    A WAO that reduces prerequisite data into an array and loads the array into either a property or the wizardlet's data/
    Has the option to convert the prerequisite data into CapabilityJunctionPayloads before pushing into the array.
  `,
  
  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.PrereqPropertySpec',
      name: 'loadFromSpecs',
      factory: function(){
        return [];
      }
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
      name: 'isDataConvertedToPayload'
    }
  ],

  methods: [
    async function load(wizardlet) {
      wizardlet.isLoaded = false;

      var prereqDataArray = this.loadFromSpecs.map(spec => this.prereqPropertySpecHandler(wizardlet, spec));

      if ( this.loadIntoPath ){
        this.loadIntoPath$set(wizardlet.data, prereqDataArray);

        wizardlet.isLoaded = true;
        return;
      }

      wizardlet.data = prereqDataArray;
      wizardlet.isLoaded = true;
    },

    function prereqPropertySpecHandler(wizardlet, spec){
      if ( ! this.isDescendant(wizardlet.id, spec.capabilityId) ) return null;

      var prereqWizardlet = this.grabWizardletFromPrereqSpec(spec);

      var prereqData = this.grabDataFromWizardletWithPrereqSpec(prereqWizardlet, spec);

      // capabilityId can differ from spec.capabilityId if using a minmax
      return this.isDataConvertedToPayload 
        ? this.makePayload(
            prereqWizardlet ? prereqWizardlet.id : spec.id,
            prereqData
          )
        : prereqData;
    },

    function grabWizardletFromPrereqSpec(spec){
      let prereqWizardlet = this.wizardlets.filter( wizardlet => wizardlet.id === spec.capabilityId )[0];

      // TODO: Need to figure out a better way to handle grabbing selectedData from MinMaxCapabilityWizardlets
      // or to grab the data of the wizardlets listed in selectedData
      if ( foam.nanos.crunch.ui.MinMaxCapabilityWizardlet.isInstance(prereqWizardlet) ){
        prereqWizardlet = this.grabSelectedWizardletFromMinMax(prereqWizardlet);

      }

      return prereqWizardlet;
    },

    function grabDataFromWizardletWithPrereqSpec(wizardlet, spec){
      if ( ! wizardlet ) return null;

      if ( ! wizardlet.of ) {
        console.error(
          `prerequisiteCapabilityId: ${this.prerequisiteCapabilityId} has no data`
        );
        return null;
      }

      let prerequisiteData = wizardlet.data;

      // probably irrelevant if using min max
      if ( spec.path ) prerequisiteData = spec.path.f(prerequisiteData);

      if ( ! prerequisiteData ) {
        return null;
      }

      return prerequisiteData.clone();
    },

    function isDescendant(capabilityId, descendantId){
      const isDescendantCheck = this.capabilityToPrerequisite[`${capabilityId}:${descendantId}`];

      if ( ! isDescendantCheck ) {
        console.error(
          `prerequisiteCapabilityId: ${descendantId} is not a prerequisite to ${capabilityId}`
        );
      }

      return isDescendantCheck;
    },

    function grabSelectedWizardletFromMinMax(minMaxWizardlet){
      const minMaxSelectedData = minMaxWizardlet.data.selectedData;

      if ( minMaxSelectedData.length != 1 ){
        console.error(
          `Cannot apply XOR to MinMaxCapabilityId: ${minMaxWizardlet.id}`
        );
        
        return null;
      }

      const selectedCapabilityId = minMaxSelectedData[0];

      var selectedWizardlet = this.wizardlets.filter( wizardlet => wizardlet.id === selectedCapabilityId )[0];

      if ( ! selectedWizardlet ){
        console.error(
          `Cannot find prerequisite for Selected Capability Id: ${selectedCapabilityId}`
        );
        return null;
      }

      return selectedWizardlet;
    },

    function makePayload(capabilityId, data) {
      return this.CapabilityJunctionPayload.create({
        capability: capabilityId,
        data:data
      });
    }
  ]
});
