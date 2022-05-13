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

foam.CLASS({
  package: 'foam.u2.wizard.debug.scenarios',
  name: 'AddCardScenario',
  extends: 'foam.u2.wizard.debug.TestWizardScenario',

  requires: [
    'foam.u2.wizard.agents.ValueAgent'
  ],

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
            // incrementalWizard: true
            controller: {
              class: 'foam.u2.wizard.views.FocusWizardForm',
              progressWizardView: 'foam.u2.borders.NullBorder',
              showTitle: true
            },
            popup: {
              class: 'foam.u2.dialog.ApplicationPopup'
            }
          }
          // wizardConfig: {
          //   class: 'foam.u2.crunch.EasyCrunchWizard',
          //   incrementalWizard: true
          // }
        },
        {
          class: 'foam.nanos.crunch.Capability',
          id: 'CardBasicInfo',
          of: 'net.nanopay.cards.mock.MockCard',
          wizardlet: {
            // class: 'foam.nanos.crunch.ui.CapabilityWizardlet',
            class: 'foam.u2.wizard.wizardlet.AlternateFlowWizardlet',
            of: 'net.nanopay.cards.mock.MockCard',
            title: 'Add New Subscription',
            defaultSections: ['basicInfo', 'limits'],
            choices: [
              {
                class: 'foam.u2.wizard.AlternateFlow',
                name: 'goNext',
                label: 'Review Card',
                unavailable: ['AddSchedule'],
                invisible: ['CardCapabilitiesMinMax']
              },
              {
                class: 'foam.u2.wizard.AlternateFlow',
                name: 'scheduleFunds',
                label: 'Add a Schedule',
                available: ['AddSchedule'],
                invisible: ['CardCapabilitiesMinMax']
              }
            ]
          }
        },
        {
          class: 'foam.nanos.crunch.MinMaxCapability',
          id: 'CardCapabilitiesMinMax',
          min: 0, max: 1
        },
        {
          class: 'foam.nanos.crunch.Capability',
          id: 'AddSchedule',
          of: 'net.nanopay.cards.DepositScheduleData',
          wizardlet: {
            class: 'foam.nanos.crunch.ui.CapabilityWizardlet',
            title: 'Add Your Schedule'
          }
        },
        {
          class: 'foam.nanos.crunch.Capability',
          id: 'Review',
          of: 'foam.core.MapHolder',
          wizardlet: {
            class: 'foam.u2.wizard.wizardlet.ReviewWizardlet',
            title: "Review Your Subscription",
            showTitle: false,
            of: 'foam.core.MapHolder',
            items: [
              {
                class: 'foam.u2.wizard.wizardlet.ReviewItem',
                name: 'card',
                border: {
                  class: 'foam.u2.borders.TopBorderCard',
                  color: '#406dea'
                },
                view: {
                  class: 'foam.u2.detail.SectionView',
                  showTitle: false,
                  sectionName: 'review'
                }
              },
              {
                class: 'foam.u2.wizard.wizardlet.ReviewItem',
                name: 'schedule',
                border: {
                  class: 'foam.u2.borders.BackgroundCard',
                  backgroundColor: '#DADDE2'
                },
                view: {
                  class: 'foam.u2.detail.SectionView',
                  showTitle: false,
                  sectionName: 'review'
                }
              },
            ],
            wao: {
              class: 'foam.u2.wizard.wao.CompositeWAO',
              of: 'foam.core.MapHolder',
              delegates: [
                {
                  class: 'foam.u2.wizard.wao.PrerequisiteWAO',
                  of: 'foam.core.MapHolder',
                  prerequisiteCapabilityId: 'CardBasicInfo',
                  loadIntoPath: 'value.card'
                },
                {
                  class: 'foam.u2.wizard.wao.PrerequisiteWAO',
                  of: 'foam.core.MapHolder',
                  prerequisiteCapabilityId: 'AddSchedule',
                  loadIntoPath: 'value.schedule'
                }
              ]
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
        ['Review','CardBasicInfo'],
        ['Review','CardCapabilitiesMinMax'],
        ['CardCapabilitiesMinMax', 'AddSchedule'],
        ['Entry','Review']
      ]
    }
  ],

  methods: [
    function installInSequence (sequence) {
      sequence.remove('RequirementsPreviewAgent');
      sequence.addBefore('ConfigureFlowAgent', this.ValueAgent, {
        value: {
          showWizardletSectionTitles: false
        }
      })
    }
  ]
});