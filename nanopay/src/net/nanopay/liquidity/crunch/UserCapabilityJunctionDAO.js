/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'UserCapabilityJunctionDAO',
  extends: 'foam.nanos.crunch.UserCapabilityJunctionDAO',

  documentation: `Authenticated DAO decorator to only show capabilities owned by a user. Updates can only be performed by system.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.*',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'put_', 
      documentation: `
      A liquid specific decorator for the UserCapabilityJunctionDAO so that the accountTemplateData
      will be updated instead of overwritten on ucj update.
      `,
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

        UserCapabilityJunction oldUcj = (UserCapabilityJunction) ((DAO) x.get("userCapabilityJunctionDAO")).find(ucj.getId());

        Capability capability = (Capability) ((DAO) x.get("capabilityDAO")).find(ucj.getTargetId());
        
        if ( ucj != null || capability instanceof AccountBasedLiquidCapability ) {
          // actually should put a diff here to check if data actually changed
          AccountTemplate newData = (AccountTemplate) ucj.getData();
          AccountTemplate oldData = (AccountTemplate) oldUcj.getData();
  
          // check if both null or empty 

          newData.mergeMaps(oldData);
          ucj.setData(newData);
        }

        ucj.setStatus(foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        return getDelegate().put_(x, obj);
      
      `
    },
    {
      name: 'remove_',
      documentation: `
      A liquid specific decorator for the UserCapabilityJunctionDAO so that the accountTemplateData
      will be updated instead of overwritten on ucj update.
      `,
      javaCode: `
      return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      super.removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'select_',
      javaCode: `
      return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'find_',
      javaCode:`
      return super.find_(x, id);
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            /**
             * A liquid specific remove_ method to remove a capability from a user
             * for a specific account instead of removing the relationship altogether
             */
            public FObject remove_(foam.core.X x, foam.core.FObject obj, Long accountId) {

              UserCapabilityJunction ucjToRemove = (UserCapabilityJunction) ((DAO) x.get("userCapabilityJunctionDAO")).find(((UserCapabilityJunction) obj).getId());
      
              if ( ucjToRemove == null ) return null;

              AccountTemplate data = (AccountTemplate) ucjToRemove.getData();
              if ( data == null ) return null;

              java.util.Map<Long, AccountData> map = data.getAccounts();
              if ( map == null || ! map.containsKey(accountId) ) return null;

              data.removeAccount(accountId);
              ucjToRemove.setData(data);

              return getDelegate().put_(x, ucjToRemove);
              
            }
          `
        }));
      }
    }
  ],
});
    