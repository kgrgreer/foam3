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
    'wizardSubject'
  ],

  exports: [
    'getWAO'
  ],

  requires: [
    'foam.nanos.crunch.ui.ApprovableUserCapabilityJunctionWAO',
    'foam.nanos.crunch.ui.UserCapabilityJunctionWAO',
    'foam.nanos.crunch.ui.CapableWAO',
  ],

  enums: [
    {
      name: 'WAOSetting',
      values: ['UCJ', 'CAPABLE', 'APPROVAL']
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
          return this.UserCapabilityJunctionWAO.create({ subject: this.wizardSubject }, this.__context__);
        case this.WAOSetting.CAPABLE:
          return this.CapableWAO.create({}, this.__context__);
        case this.WAOSetting.APPROVAL:
          return this.ApprovableUserCapabilityJunctionWAO.create({ subject: this.wizardSubject });
        default:
          throw new Error('WAOSetting is unrecognized: ' + this.waoSetting);
      }
    }
  ]
});
