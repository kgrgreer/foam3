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
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'RoleUserQueryService',
  implements: [
    'foam.nanos.auth.UserQueryService'
  ],

  javaImports: [
    'foam.core.X',
    'java.util.ArrayList',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.List',
    'java.util.Map',
    'foam.core.Detachable',
    'java.util.HashMap',
    'java.util.Set',
    'java.util.HashSet',
    'foam.core.FObject',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Logger',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'foam.nanos.crunch.Capability'
  ],

  methods: [
    {
      name: 'getAllApprovers',
      async: true,
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'modelToApprove',
          type: 'String'
        }
      ],
      javaCode: `  
        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO capabilitiesDAO = (DAO) x.get("localCapabilityDAO");

        Logger logger = (Logger) x.get("logger");

        String capabilityName = "approve" + modelToApprove;

        // using a set because we only care about unique approver ids
        Set<Long> uniqueApprovers = new HashSet<>();

        List foundCapabilityArray = ((ArraySink) capabilitiesDAO
          .where(
            foam.mlang.MLang.EQ(Capability.NAME, capabilityName)
          ).select(new ArraySink())).getArray();

        if ( foundCapabilityArray.size() == 0 ) {
          logger.error("Capability could not be found with name: " + capabilityName);
          throw new RuntimeException("Capability could not be found with name: " + capabilityName);
        }

        if ( foundCapabilityArray.size() > 1 ){
          logger.error("Multiple capabilities exist with the same name: " + capabilityName);
          throw new RuntimeException("Multiple capabilities exist with the same name: " + capabilityName);
        }

        LiquidCapability foundCapability = (LiquidCapability) foundCapabilityArray.get(0);

        List ucjsForApprovers = ((ArraySink) ucjDAO.where(
            MLang.AND(
              MLang.EQ(UserCapabilityJunction.TARGET_ID, foundCapability.getId()),
              MLang.EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
            )
          )
          .select(new ArraySink())).getArray();

        for ( int i = 0; i < ucjsForApprovers.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForApprovers.get(i);

          if ( currentUCJ.getData() != null ){
            logger.warning("Expecting null data for: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          } else {
            uniqueApprovers.add(currentUCJ.getSourceId());
          }
        }

        List uniqueApproversList = new ArrayList(uniqueApprovers);

        return uniqueApproversList;
      `
    }
  ]
});
