/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'ExecuteActionsSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  documentation: `
    Used to execute specified list of actions on wizardlet data when it is saved.
  `,

  properties: [
    {
      class: 'StringArray',
      name: 'actions'
    }
  ],

  methods: [
    async function save(data) {
      for ( var action of this.actions ) {
        await data[action]?.code.call(data)
      }
      await this.delegate.save(data);
    }
  ]
});