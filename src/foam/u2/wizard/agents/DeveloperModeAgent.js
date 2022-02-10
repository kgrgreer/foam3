/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'DeveloperModeAgent',
  implements: [ 'foam.core.ContextAgent' ],

  imports: [
    'userCapabilityJunctionDAO'
  ],

  exports: [
    'developerMode'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'developerMode'
    }
  ],

  methods: [
    async function execute() {
      const usersJunctions = (await this.userCapabilityJunctionDAO.select()).array;
      const developerCapability = usersJunctions.find(j => j.targetId === 'developer');
      this.developerMode = developerCapability !== undefined;
    }
  ]
});
