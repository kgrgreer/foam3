/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'ConfigureUCJExpiryOnGranted',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.RenewableData',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.util.Calendar',
    'java.util.Date'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        final var clsName = getClass().getSimpleName();
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Logger logger = Loggers.logger(x, null, clsName);
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            UserCapabilityJunction old = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucj.getId());
            // logger.debug("ucj ", ucj);
            // logger.debug("old ", old);

            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED || ucj.getIsRenewable() ) return;
            if ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED && ! old.getIsRenewable() &&
              ( ( old.getData() == null && ucj.getData() == null ) ||
                ( old.getData() != null && old.getData().equals(ucj.getData()) ) )
            ) return;

            Capability capability = (Capability) ucj.findTargetId(x);
            // logger.debug("ucj.findTargetId(x) - capability", capability);
            if ( capability == null ) {
              logger.debug("UCJ Expiry not configured: Capability not found for UCJ targetId", ucj.getSourceId());
              return;
            }

            // if the data is Renewable and expiry is user-configured, get the expiry from the RenewableData,
            // otherwise, get the expiry from the capability
            FObject data = ucj.getData();

            Date junctionExpiry = data instanceof RenewableData && ((RenewableData) data).getDataConfiguredExpiry() ?
              ((RenewableData) data).getExpiry() :
              capability.getExpiry(); 

            if ( capability.getExpiryPeriod() > 0 ) {
              Date expiry = capability.calculateDate(x, null, capability.getExpiryPeriod(), capability.getExpiryPeriodTimeUnit());
    
              if ( junctionExpiry == null ) {
                junctionExpiry = expiry;
              } else {
                junctionExpiry = junctionExpiry.after(expiry) ? expiry : junctionExpiry;
              }
            }
            ucj.setExpiry(junctionExpiry);
            // logger.debug("ucj.setExpiry()", ucj);
            if ( junctionExpiry != null && ( data instanceof RenewableData ) ) {
              ((RenewableData) data).setRenewable(capability.getIsRenewable());
              ucj.setData(data);
            }
          }
        }, "");
      `
    }
  ]
});
