foam.CLASS({
  package: 'net.nanopay.liquidity.rules.approvalRequest',
  name: 'FulfilledAccountApprovals',

  documentation: `
    A rule to determine what to do with an account once the 
    approval request has been APPROVED or REJECTED
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.core.FObject',
    'java.util.Map',
    'foam.nanos.ruler.Operations',
    'net.nanopay.account.Account',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.liquidity.LiquidApprovalRequest'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        LiquidApprovalRequest request = (LiquidApprovalRequest) obj.fclone();

        if ( request.getOperation() == Operations.CREATE ){
          agency.submit(x, new ContextAwareAgent() {
            @Override
            public void execute(X x) {
              DAO localAccountDAO = (DAO) getX().get("localAccountDAO");

              Account accountToEnable =  (Account) (localAccountDAO.find(request.getObjId())).fclone();
              accountToEnable.setEnabled(true);

              localAccountDAO.put_(getX(), accountToEnable);
            }
          }, "Liquid Account Approved Account On Create");
        } else if ( request.getOperation() == Operations.UPDATE ) {
          agency.submit(x, new ContextAwareAgent() {
            @Override
            public void execute(X x) {
              DAO localAccountDAO = (DAO) getX().get("localAccountDAO");

              Account accountToUpdate =  (Account) (localAccountDAO.find(request.getObjId())).fclone();
              Map propsToUpdate = request.getPropertiesToUpdate();

              Object[] keyArray = propsToUpdate.keySet().toArray();

              for ( int i = 0; i < keyArray.length; i++ ){
                accountToUpdate.setProperty((String) keyArray[i],propsToUpdate.get(keyArray[i]));
              }

              localAccountDAO.put_(getX(), accountToUpdate);
            }
          }, "Liquid Account Approved Account On Update");
        } else if ( request.getOperation() == Operations.REMOVE ){
          agency.submit(x, new ContextAwareAgent() {
            @Override
            public void execute(X x) {
              DAO localAccountDAO = (DAO) getX().get("localAccountDAO");

              Account accountToRemove =  (Account) (localAccountDAO.find(request.getObjId())).fclone();

              localAccountDAO.remove_(getX(), accountToRemove);
            }
          }, "Liquid Account Approved Account On Remove");
        }
      `
    }
  ]
});
