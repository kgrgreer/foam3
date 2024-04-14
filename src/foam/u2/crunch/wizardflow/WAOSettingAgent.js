/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'WAOSettingAgent',
  implements: [ 'foam.core.ContextAgent' ],

  documentation: `
    basic WAO setting.
  `,

  imports: [
    'wizardSubject?',
    'subject'
  ],

  exports: [
    'getWAO'
  ],

  requires: [
    'foam.nanos.crunch.ui.ApprovableUserCapabilityJunctionWAO',
    'foam.nanos.crunch.ui.UserCapabilityJunctionWAO',
    'foam.nanos.crunch.ui.CapableWAO',
    'foam.u2.wizard.wao.SplitWAO',
    'foam.u2.wizard.data.UserCapabilityJunctionSaver'
  ],

  enums: [
    {
      name: 'WAOSetting',
      values: ['UCJ', 'CAPABLE', 'APPROVAL', 'UCJ_SIMPLE']
    }
  ],

  properties: [
    {
      name: 'waoSetting',
      factory: function() {
        return this.WAOSetting.UCJ;
      }
    }
  ],

  methods: [
    function execute() {
      return Promise.resolve();
    },
    function getWAO() {
      switch ( this.waoSetting ) {
        case this.WAOSetting.UCJ:
          return this.UserCapabilityJunctionWAO.create({ subject: this.wizardSubject || this.subject }, this.__context__);
        case this.WAOSetting.CAPABLE:
          return this.CapableWAO.create({}, this.__context__);
        case this.WAOSetting.APPROVAL:
          return this.ApprovableUserCapabilityJunctionWAO.create({ subject: this.wizardSubject || this.subject});
        case this.WAOSetting.UCJ_SIMPLE:
          return this.SplitWAO.create({
            saver: this.UserCapabilityJunctionSaver.create()
          });
        default:
          throw new Error('WAOSetting is unrecognized: ' + this.waoSetting);
      }
    }
  ]
});
