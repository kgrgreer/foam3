/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.crunch.edit',
  name: 'EditBehaviour',

  methods: [
    {
      name: 'maybeApplyEdit',
      type: 'Boolean',
      args: [
        {
          type: 'Context',
          name: 'userX',
          documentation: `
            Context to pass to actions done on behalf of the user.
          `
        },
        {
          type: 'Context',
          name: 'systemX',
          documentation: `
            The context in which this behaviour is executed.
            This might be the system context, for example.
          `
        },
        {
          type: 'foam.nanos.auth.Subject',
          name: 'editor',
          documentation: 'The subject requesting a UCJ edit'
        },
        {
          type: 'foam.nanos.crunch.UserCapabilityJunction',
          name: 'ucj'
        },
        {
          type: 'FObject',
          name: 'newData'
        }
      ]
    }
  ]
});
