/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug.scenarios',
  name: 'PrerequisiteLoaderScenario',
  extends: 'foam.u2.wizard.debug.TestWizardScenario',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.Capability',
      name: 'capabilities',
      factory: () => [
        {
          class: 'foam.nanos.crunch.Capability',
          id: 'Entry',
          wizardConfig: {
            class: 'foam.u2.crunch.EasyCrunchWizard',
            incrementalWizard: true
          }
        },
        {
          class: 'foam.nanos.crunch.Capability',
          id: `HasData`,
          of: 'foam.core.StringHolder'
        },
        {
          class: 'foam.nanos.crunch.Capability',
          id: `WantsData`,
          of: 'foam.core.StringHolder',
          wizardlet: {
            class: 'foam.nanos.crunch.ui.CapabilityWizardlet',
            wao: {
              class: 'foam.u2.wizard.wao.SplitWAO',
              loader: {
                class: 'foam.u2.wizard.data.PrerequisiteLoader',
                prerequisiteCapabilityId: 'HasData'
              }
            }
          }
        }
      ]
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.CapabilityCapabilityJunction',
      name: 'capabilityCapabilityJunctions',
      factory: () => [
        ['Entry','WantsData'],
        ['WantsData','HasData'],
      ]
    }
  ]
});
