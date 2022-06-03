/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'FacadeWizardletSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  imports: [
    'wizardlets'
  ],
  
  methods: [
    async function save(facadeWizardlet) {
      facadeWizardlet.facadeWizardletSpecs.forEach(facadeSpec => {
        const wizardletToOverride = this.grabWizardletFromFacadeSpec(facadeSpec);
        
        let dataToSave = facadeSpec.loadFromFacadePath 
          ? facadeSpec.loadFromFacadePath.f(facadeWizardlet.data)
          : facadeWizardlet.data;
        
        let dataToOverride = wizardletToOverride.data;

        if ( facadeSpec.loadIntoRealPath ){
          facadeSpec.loadIntoRealPath$set(dataToOverride, dataToSave);
        } else {
          dataToOverride = dataToSave;
        }

        wizardletToOverride.isVisible = facadeSpec.isOverridedWizardletVisible;

      })      
    },

    function grabWizardletFromFacadeSpec(facadeSpec){
      let foundWizardlet;

      for ( let wizardlet in this.wizardlets ){
        if ( wizardlet.id === facadeSpec.wizardletId ) foundWizardlet = wizardlet;
        break;
      }

      return foundWizardlet;
    }
  ]
});
