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
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.ApproverLevel',
    'net.nanopay.liquidity.crunch.GlobalLiquidCapability'
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

      modelToApprove = modelToApprove.toLowerCase();

      List<GlobalLiquidCapability> capabilitiesWithAbility;

      switch(modelToApprove){
        case "liquidcapability":
          capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
            MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_CAPABILITY, true)
          ).select(new ArraySink())).getArray();
          break;
        case "rule":
          capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
            MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_RULE, true)
          ).select(new ArraySink())).getArray();
          break;
        case "liquiditysettings":
          capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
            MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_LIQUIDITYSETTINGS, true)
          ).select(new ArraySink())).getArray();
          break;
        case "user":
          capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
            MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_USER, true)
          ).select(new ArraySink())).getArray();
          break;
        case "capabilityrequest":
          capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
            MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_CAPABILITYREQUEST, true)
          ).select(new ArraySink())).getArray();
          break;
        default:
          capabilitiesWithAbility = null;
          logger.error("Something went wrong with the requested model: " + modelToApprove);
          throw new RuntimeException("Something went wrong with the requested model: " + modelToApprove);
      }

      // using a set because we only care about unique approver ids
      Set<Long> uniqueApprovers = new HashSet<>();
      List<String> capabilitiesWithAbilityNameIdOnly = new ArrayList<>();

      for ( int i = 0; i < capabilitiesWithAbility.size(); i++ ){
        capabilitiesWithAbilityNameIdOnly.add(capabilitiesWithAbility.get(i).getId());
      }

      List ucjsForApprovers = ((ArraySink) ucjDAO.where(MLang.IN(UserCapabilityJunction.TARGET_ID, capabilitiesWithAbilityNameIdOnly)).select(new ArraySink())).getArray();

      for ( int i = 0; i < ucjsForApprovers.size(); i++ ){
        UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForApprovers.get(i);

        if ( currentUCJ.getData() != null ){
          uniqueApprovers.add(currentUCJ.getSourceId());
        } else {
          logger.warning("A UCJ with no data is found: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
        }
      }

      List uniqueApproversList = new ArrayList(uniqueApprovers);
      
      return uniqueApproversList;
      `
    }
  ]
});
