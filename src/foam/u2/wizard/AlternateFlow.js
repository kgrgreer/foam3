/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'AlternateFlow',

  imports: [
    'wizardlets?'
  ],

  requires: [
    'foam.u2.wizard.WizardPosition'
  ],

  properties: [
    // IDEA: maybe these two properties can come from a mixin
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'label'
    },
    {
      class: 'String',
      name: 'icon'
    },
    {
      class: 'StringArray',
      name: 'available'
    },
    {
      class: 'StringArray',
      name: 'unavailable'
    },
    {
      class: 'StringArray',
      name: 'visible'
    },
    {
      class: 'StringArray',
      name: 'invisible'
    },
    {
      class: 'StringArray',
      name: 'removals'
    },
    {
      class: 'Array',
      name: 'select'
    },
    {
      class: 'Enum',
      of: 'foam.u2.ButtonStyle',
      name: 'buttonStyle'
    },
    {
      class: 'String',
      name: 'wizardletId',
      documentation: 'set this to jump to a specific wizardlet by id'
    },
    {
      class: 'Boolean',
      name: 'canSkipData',
      documentation: 'Set to true if the alternateflow action should always be enabled'
    },
    {
      class: 'Boolean',
      name: 'saveCurrent',
      documentation: `
        When a wizardletId is given, we jump to the given wizardlet instead of calling gonext which
        saves the current wizardlet.
        Set this boolean to true if the current wizardlet should be saved before executing alt flow where
        wizardletId is given.
      `
    }
  ],

  methods: [
    function execute(x) {

      if ( this.select.length != 0 ) {
        for ( let item of this.select ) {
          foam.assert(item.length == 2, "'select' entries in AlternateFlow must have two elements")

          let minMaxId = item[0];
          let choices = item[1];
          let w = x.wizardlets.find(w => w.id === minMaxId);
          w.data.selectedData = choices;
        }
      }
      // set availability/visibility after updating selecteddata
      // which will change availability/visibility
      [
        ['unavailable', 'isAvailable', false],
        ['available', 'isAvailable', true],
        ['invisible', 'isVisible', false],
        ['visible', 'isVisible', true]
      ].forEach(([listProp, propToChange, newValue]) => {
        for ( const wizardletId of this[listProp] ) {
          const w = x.wizardlets.find(w => w.id == wizardletId);
          if ( w )
            w[propToChange] = newValue;
        }
      })
    },
    function handleNext(wizardController) {
      if ( ! this.wizardletId ) {
        wizardController.goNext();
        return;
      }

      if  ( this.saveCurrent ) wizardController.currentWizardlet.save();

      const wi = wizardController.wizardlets.findIndex(w => w.id == this.wizardletId);
      if ( wi < 0 ) {
        throw new Error('wizardlet not found with id: ' + this.wizardletId);
      }
      const pos = this.WizardPosition.create({
        wizardletIndex: wi,
        sectionIndex: 0
      })
      wizardController.wizardPosition = pos;

      if ( ! wizardController.currentWizardlet.isVisible || 
           ! wizardController.currentSection?.isAvailable ) {
        wizardController.next();
      }
    }
  ]
})
