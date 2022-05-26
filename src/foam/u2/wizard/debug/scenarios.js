/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

([
  {
    name: 'LiftOneAllowTwo',
    choices: ['ChoiceA', 'ChoiceB', 'ChoiceC'],
    lifted: ['ChoiceA'],
    max: 2
  },
  {
    name: 'LiftOneAllowOne',
    choices: ['ChoiceA', 'ChoiceB', 'ChoiceC'],
    lifted: ['ChoiceA'],
    max: 1
  }
].forEach(META => foam.CLASS({
  package: 'foam.u2.wizard.debug.scenarios',
  name: META.name,
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
        ...META.choices.map((name, i) => ({
          class: 'foam.nanos.crunch.Capability',
          id: name,
          of: ['String','Int','Boolean'].map(v => `foam.core.${v}Holder`)[i % 3]
        })),
        {
          class: 'foam.nanos.crunch.MinMaxCapability',
          id: 'MinMax',
          min: 1, max: META.max
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
        ...META.lifted.map(name => ['Entry', name]),
        ['Entry','MinMax'],
        ...META.choices.map(name => ['MinMax', name])
      ]
    }
  ]
})));

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

foam.CLASS({
  package: 'foam.u2.wizard.debug.scenarios',
  name: 'PrerequisiteWAOScenario',
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
              class: 'foam.u2.wizard.wao.PrerequisiteWAO',
              of: 'foam.core.StringHolder',
              prerequisiteCapabilityId: 'HasData'
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
