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
  name: 'CreateUserCapabilityJunctionOnRequestApproval',

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.core.NumberSet',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'java.util.Set',
    'java.util.HashSet',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'foam.nanos.logger.Logger',
    'foam.core.PropertyInfo',
    'net.nanopay.liquidity.tx.AccountHierarchy',
    'static foam.mlang.MLang.*'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            DAO userCapabilityJunctionDAO = (DAO) getX().get("userCapabilityJunctionDAO");
            DAO capabilityDAO = (DAO) getX().get("localCapabilityDAO");
            DAO roleTemplateDAO = (DAO) getX().get("roleTemplateDAO");
            DAO accountTemplateDAO = (DAO) getX().get("accountTemplateDAO");
            Logger logger = (Logger) getX().get("logger");

            RoleAssignment req = (RoleAssignment) obj;
            RoleTemplate roleTemplate = (RoleTemplate) roleTemplateDAO.find(req.getRoleTemplate());
            AccountTemplate accountTemplate = (AccountTemplate) accountTemplateDAO.find(req.getAccountTemplate());
            
            List<Long> users = req.getUsers();
            List<PropertyInfo> allProps = roleTemplate.getClassInfo().getAxiomsByClass(PropertyInfo.class);

            for ( PropertyInfo property : allProps ){
              if ( ! SafetyUtil.equals(property.getValueClass().getSimpleName(),"boolean") ) continue;

              Boolean isCurrentCapabilityIncluded = (Boolean) roleTemplate.getProperty(property.getName());

              if ( isCurrentCapabilityIncluded ){
                
                List foundCapabilityArray = ((ArraySink) capabilityDAO
                  .where(
                    foam.mlang.MLang.EQ(Capability.NAME, property.getName())
                  ).inX(getX()).select(new ArraySink())).getArray();

                if ( foundCapabilityArray.size() == 0 ) {
                  logger.error("Capability could not be found with name: " + property.getName());
                  throw new RuntimeException("Capability could not be found with name: " + property.getName());
                }

                if ( foundCapabilityArray.size() > 1 ){
                  logger.error("Multiple capabilities exist with the same name: " + property.getName());
                  throw new RuntimeException("Multiple capabilities exist with the same name: " + property.getName());
                }

                LiquidCapability foundCapability = (LiquidCapability) foundCapabilityArray.get(0);

                if ( SafetyUtil.equals(foundCapability.getName(), "viewAccount") ){
                  AccountHierarchy accountHierarchy = (AccountHierarchy) getX().get("accountHierarchyService");
                  accountHierarchy.addViewableRootAccounts(x, req.getUsers(), accountTemplate.getRoots());
                }

                for ( Long userId : users ) {
                  UserCapabilityJunction ucj = new UserCapabilityJunction.Builder(x).setSourceId(userId).setTargetId(foundCapability.getId()).build();

                  if ( foundCapability.getIsAccountBased() ){
                    UserCapabilityJunction oldUcj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucj.getId());

                    if ( accountTemplate == null ){
                      logger.error("AccountGroup does not exist " + property.getName());
                      throw new RuntimeException("Cannot assign the following capability without an account group: " + property.getName()); 
                    }

                    Set<String> dataSet = new HashSet<String>(accountTemplate.getAccounts());
                    //TODO: fix for account string id.
                    if ( true ) throw new RuntimeException("TODO: fix numberset in CreateUserCapabilityJunctionOnRequestApproval");
                    // if ( oldUcj != null ){
                    //   NumberSet oldData = (NumberSet) oldUcj.getData();
                    //   Set<Long> oldDataSet = (HashSet<Long>) oldData.getAsRealSet();
                    //   dataSet.addAll(oldDataSet);
                    // }

                    // NumberSet newData = new NumberSet();
                    // newData.setAsRealSet(dataSet);

                    // ucj.setData(newData);
                  }

                  ucj.setStatus(foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
                  userCapabilityJunctionDAO.put_(getX(), ucj);

                }
              }
            }
          }
        }, "Create UserCapabilityJunction on RoleAssignment Approval");
      `
    }
  ]
});



foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'ApprovedRoleAssignmentPredicate',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.auth.LifecycleState',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return
          EQ(DOT(NEW_OBJ, RoleAssignment.LIFECYCLE_STATE), LifecycleState.ACTIVE)
        .f(obj);
      `
    } 
  ]
});
