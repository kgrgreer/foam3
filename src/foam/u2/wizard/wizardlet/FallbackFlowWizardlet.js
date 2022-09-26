/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'FallbackFlowWizardlet',
  extends: 'foam.u2.wizard.wizardlet.AlternateFlowWizardlet',

  imports: [
    'wizardController'
  ],

  properties: [
    {
      class: 'Int',
      name: 'fallbackPosition'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.MinMaxCapabilityData',
      name: 'data',
      factory: function(){
        return foam.nanos.crunch.MinMaxCapabilityData.create();
      }
    },
    {
      name: 'sections',
      factory: function () {
        return [
          this.WizardletSection.create({
            isAvailable: true,
            customView: {
              class: 'foam.u2.borders.NullBorder'
            }
          })
        ];
      }
    }
  ],

  methods: [
    async function load() {
      await this.wao.load(this);
      this.fallbackWizardletNext();
      return this;
    },
    function resetFallback () {
      this.fallbackPosition = 0;
    }
  ],

  listeners: [
    {
      name: 'fallbackWizardletNext',
      isFramed: true,
      code: async function () {
        let x = this.__subContext__;

        // Only proceed if this wizardlet was landed on
        if ( x.wizardController.currentWizardlet != this ) return;

        // Get the next flow and increment the fallback counter
        const flow = this.choices[this.fallbackPosition++];

        // If we're at the last flow, stay there
        if ( this.fallbackPosition >= this.choices.length ) {
          this.fallbackPosition = this.choices.length - 1;
        }

        // Invoke the alternate flow
        await flow.execute(this.__subContext__);

        // Automatically progress to the next wizardlet
        this.wizardController.next();
      }
    }
  ]
});
