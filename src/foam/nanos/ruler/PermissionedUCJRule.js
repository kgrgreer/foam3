/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'PermissionedUCJRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: `Rule that can only be seen if the user referenced on the UCJ' sourceId has read permission to run it.`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'getUser',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        return ucj.findSourceId(x);
      `
    }
  ]
});
