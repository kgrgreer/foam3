/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'FacadeWizardletSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  requires: [
    'foam.u2.wizard.data.NullSaver',
    'foam.u2.wizard.data.ProxySaver'
  ],

  imports: [
    'wizardlets'
  ],

  properties: [
    {
      class: 'FObjectArray',
      name: 'facadeWizardletSpecs',
      of: 'foam.u2.wizard.wizardlet.FacadeWizardletSpec'
    }
  ],
  
  methods: [
    async function save(data) {
      this.facadeWizardletSpecs.forEach(facadeSpec => {
        const wizardletToOverride = this.grabWizardletFromFacadeSpec(facadeSpec);
        
        let dataToSave = facadeSpec.loadFromFacadePath 
          ? facadeSpec.loadFromFacadePath.f(data)
          : data;
        
        // Apply saver decorators
        const saver = foam.json.parse(facadeSpec.saver, undefined, this.__subContext__);
        const result = foam.u2.wizard.data.ensureTerminal(saver, this.ProxySaver, this.NullSaver);
        saver.save(dataToSave);
        dataToSave = result.data;
        
        let dataToOverride = wizardletToOverride.data;

        if ( facadeSpec.loadIntoRealPath ){
          facadeSpec.loadIntoRealPath$set(dataToOverride, dataToSave);
        } else {
          wizardletToOverride.data = null;
          wizardletToOverride.data = dataToSave;
        }

        wizardletToOverride.isVisible = facadeSpec.isOverridedWizardletVisible;
      })      
    },

    function grabWizardletFromFacadeSpec(facadeSpec){
      let foundWizardlet;

      for ( let wizardlet of this.wizardlets ){
        if ( wizardlet.id === facadeSpec.wizardletId ){
          foundWizardlet = wizardlet;
          break;
        }
      }

      return foundWizardlet;
    }
  ]
});
