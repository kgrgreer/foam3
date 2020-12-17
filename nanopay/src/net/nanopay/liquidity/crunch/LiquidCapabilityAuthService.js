/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidCapabilityAuthService',
  extends: 'foam.nanos.auth.CapabilityAuthService',

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  javaImports: [
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    'foam.dao.ArraySink',
    'foam.dao.LimitedSink',
    'foam.dao.DAO',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.util.List',
    'java.util.Map',
    'java.util.concurrent.ConcurrentHashMap',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Map',
      name: 'cache',
      javaFactory: `
        return new ConcurrentHashMap<String, Boolean>();
      `
    },
    {
      name: 'initialized',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    {
      name: 'initialize',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      javaCode: `
        if ( getInitialized() )
          return;

        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO capabilityDAO = (DAO) x.get("localCapabilityDAO");
        if ( userCapabilityJunctionDAO == null )
          return;

        Map<String, Boolean> cache = ( Map<String, Boolean> ) getCache();
        Sink purgeSink = new Sink() {
          public void put(Object obj, Detachable sub) {
            cache.clear();
          }
          public void remove(Object obj, Detachable sub) {
            cache.clear();
          }
          public void eof() {
          }
          public void reset(Detachable sub) {
            cache.clear();
          }
        };

        // Add the purge listener
        userCapabilityJunctionDAO.listen(purgeSink, TRUE);
        capabilityDAO.listen(purgeSink, TRUE);
        
        // Initialization done
        setInitialized(true);
      `
    },
    {
      name: 'checkUser',
      documentation: `
        Check if the given input string is in the userCapabilityJunctions or
        implied by a capability in userCapabilityJunctions for a given user.
      `,
      javaCode: `
        if ( x == null || permission == null ) return false;
        if ( x.get(Session.class) == null ) return false;
        if ( user == null || ! user.getEnabled() ) return false;
        
        Logger logger = (Logger) x.get("logger");

        this.initialize(x);

        String key = user.getId() + permission;
        if ( (( Map<String, Boolean> )getCache()).containsKey(key) ) {
          return (( Map<String, Boolean> )getCache()).get(key);
        }

        boolean result = false;
        try {
          DAO capabilityDAO = (DAO) x.get("localCapabilityDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          ProxySink proxy = new ProxySink(x, new LimitedSink(x, 1, 0, new ArraySink())) {
            int count = 0;
            @Override
            public void put(Object o, Detachable sub) {
              UserCapabilityJunction ucj = (UserCapabilityJunction) ((UserCapabilityJunction) o).deepClone();
              Capability c = (Capability) capabilityDAO.find(ucj.getTargetId());
              if ( c.implies(x, permission) ) {
                getDelegate().put(o, sub);
              }
            }
          };

          List<UserCapabilityJunction> ucjs = ((ArraySink) ((ProxySink) ((ProxySink) userCapabilityJunctionDAO
            .where(EQ(UserCapabilityJunction.SOURCE_ID, user.getId()))
            .select(proxy))
            .getDelegate())
            .getDelegate())
            .getArray();
            
          if ( ucjs.size() > 0) {
            result = true;
          }

          // Add the result to the cache
          (( Map<String, Boolean> ) getCache()).put(key, result);

        } catch (Exception e) {
          logger.error("check", permission, e);
        }
        return result;
      `
    }
  ]
});
