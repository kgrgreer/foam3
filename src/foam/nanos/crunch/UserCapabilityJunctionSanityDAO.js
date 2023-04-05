/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionSanityDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.auth.*',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        UserCapabilityJunction old = (UserCapabilityJunction) super.find_(x, ucj.getId());

        if ( old == null ) {
          old = (UserCapabilityJunction) getDelegate().find(AND(
            EQ(UserCapabilityJunction.TARGET_ID, ucj.getTargetId()),
            EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId())
          ));
          if ( old != null ) ucj.setId(old.getId());
        }

        return super.put_(x, obj);
      `
    }
  ]
});
