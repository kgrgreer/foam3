/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'AddCapabilityHierarchy',
  implements: ['foam.core.ContextAgent'],
  imports: [
    'wizardlets as previousWizardlets'
  ],
  exports: [
    'wizardlets_ as wizardlets'
  ],
  requires: [
    'foam.u2.crunch.wizardflow.CapabilityAdaptAgent',
    'foam.u2.wizard.agents.RootCapabilityAgent',
    'foam.u2.crunch.wizardflow.LoadCapabilitiesAgent',
    'foam.u2.crunch.wizardflow.LoadCapabilityGraphAgent',
    'foam.u2.crunch.wizardflow.WAOSettingAgent',
    'foam.u2.crunch.wizardflow.GraphWizardletsAgent',
    'foam.u2.crunch.wizardflow.PublishToWizardletsAgent',
    'foam.util.async.Sequence',
    'foam.dao.SilentReadOnlyDAO'
  ],
  properties: [
    {
      class: 'String',
      name: 'capability'
    },
    {
      class: 'Enum',
      of: foam.u2.wizard.WizardType,
      name: 'type'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'wizardlets_'
    }
  ],
  static: [
    function getImpliedId (args) {
      return this.id + '_' + args.capability;
    }
  ],
  methods: [
    async function execute (x) {
      x = x || this.__context__;
      const seq = this['createSequence_' + this.type.name](x);
      x = x.createSubContext({userCapabilityJunctionDAO: this.SilentReadOnlyDAO.create({delegate: x.userCapabilityJunctionDAO})});
//      x = x.createSubContext({userCapabilityJunctionDAO: null});

      subX = await seq.execute();
      this.wizardlets_ = [
        ...(this.previousWizardlets || []),
        ...subX.wizardlets
      ];
    },

    function createSequence_TRANSIENT (x) {
      const capable = foam.nanos.crunch.lite.BaseCapable.create();
      x = x || this.__subContext__;
      x = x.createSubContext({ capable });

      return this.Sequence.create({}, x)
        .add(this.RootCapabilityAgent, {
          rootCapability: this.capability
        })
        .add(this.CapabilityAdaptAgent)
        .add(this.LoadCapabilitiesAgent)
        .add(this.LoadCapabilityGraphAgent)
        .add(this.WAOSettingAgent, {
          waoSetting: this.WAOSettingAgent.WAOSetting.CAPABLE
        })
        .add(this.GraphWizardletsAgent)
        .add(this.PublishToWizardletsAgent, { event: 'onReady' })
        ;
    },

    function createSequence_UCJ (x) {
      const capable = foam.nanos.crunch.lite.BaseCapable.create();
      x = x || this.__subContext__;
      x = x.createSubContext({ capable });

      return this.Sequence.create({}, x)
        .add(this.RootCapabilityAgent, {
          rootCapability: this.capability
        })
        .add(this.CapabilityAdaptAgent)
        .add(this.LoadCapabilitiesAgent)
        .add(this.LoadCapabilityGraphAgent)
        .add(this.WAOSettingAgent, {
          waoSetting: this.WAOSettingAgent.WAOSetting.UCJ
        })
        .add(this.GraphWizardletsAgent)
        .add(this.PublishToWizardletsAgent, { event: 'onReady' })
        ;
    }
  ]
});
