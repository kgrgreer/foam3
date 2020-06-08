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
  name: 'AddChildAccountToMakerOnAccountApproval',

  documentation: `For ucjs that gives the user V/M/A permission on an account with no cascading, any 
  child accounts created by the user will have to be added explicitly to the ucj so that the user will 
  also have v/m/a permission on the child account
  `,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'java.util.Map',
    'net.nanopay.account.Account',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          if ( ((LifecycleAware) obj).getLifecycleState() == foam.nanos.auth.LifecycleState.ACTIVE ) {
            DAO ucjDao = (DAO) x.get("userCapabilityJunctionDAO");
            DAO capabilityDao = (DAO) x.get("localCapabilityDAO");

            Account account = (Account) obj;
            String parentId = String.valueOf(account.getParent());

            List<UserCapabilityJunction> ucjs= ((ArraySink) ucjDao
              .where(EQ(UserCapabilityJunction.SOURCE_ID, account.getCreatedBy()))
              .select(new ArraySink()))
              .getArray();
          
            for ( UserCapabilityJunction ucj : ucjs ) {
              if ( ucj.getData() instanceof AccountApproverMap ) {
                AccountBasedLiquidCapability cap = (AccountBasedLiquidCapability) capabilityDao.find(ucj.getTargetId());
                if ( cap == null || ! cap.getCanMakeAccount() ) continue;

                AccountApproverMap aam = (AccountApproverMap) ucj.getData();
                Map<String, CapabilityAccountData> map = aam.getAccounts();

                if ( map.containsKey(parentId) && map.get(parentId).getIsIncluded() && ! map.get(parentId).getIsCascading() ) {
                  map.put(String.valueOf(account.getId()), map.get(parentId));
                  aam.setAccounts(map);
                  ucj.setData(aam);
                  ucjDao.put(ucj);
                }
              }
            }
          

          }
        }
      }, "Rule to Add Child Account To Ucj of its maker even if the parent does not have cascading in the ucj");
      `
    }
  ]
});