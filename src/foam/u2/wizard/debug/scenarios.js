/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug.scenarios',
  name: 'MinMaxChoicePrereqLiftScenario',
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
          wizardConfig: foam.u2.crunch.EasyCrunchWizard.create({
            class: 'foam.u2.crunch.EasyCrunchWizard',
            incrementalWizard: true
          })
        },
        ...'ABC'.split('').map(L => ({
          class: 'foam.nanos.crunch.Capability',
          id: `BasicData.${L}`,
          of: 'foam.core.StringHolder'
        })),
        {
          class: 'foam.nanos.crunch.MinMaxCapability',
          id: 'MinMax.D',
          min: 1, max: 2
        },
        {
          class: 'foam.nanos.crunch.Capability',
          id: 'Choice.D.A',
          of: 'foam.core.IntHolder'
        },
        {
          class: 'foam.nanos.crunch.Capability',
          id: 'Choice.D.B',
          of: 'foam.core.BooleanHolder'
        }
      ]
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.CapabilityCapabilityJunction',
      name: 'capabilityCapabilityJunctions',
      factory: () => [
        ['Entry','BasicData.A'],
        ['Entry','BasicData.B'],
        ['Entry','BasicData.C'],
        ['Entry','MinMax.D'],
        ['MinMax.D','Choice.D.A'],
        ['MinMax.D','Choice.D.B'],
        ['MinMax.D','BasicData.C']
      ]
    }
  ]
});