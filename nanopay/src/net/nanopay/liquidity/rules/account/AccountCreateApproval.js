foam.CLASS({
  package: 'net.nanopay.liquidity.rules.account',
  name: 'AccountCreateApproval',

  documentation: `
    A rule to send out approval requests when creating 
    an account as a liquid user
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.ruler.Operations',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.LiquidApprovalRequest',
    'net.nanopay.approval.ApprovalStatus'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            Account account = (Account) obj.fclone();
            DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
            approvalRequestDAO.put_(getX(),
              new LiquidApprovalRequest.Builder(getX())
                .setDaoKey("localAccountDAO")
                .setObjId(account.getId())
                .setClassification("Account")
                .setOutgoingAccount(account.getParent())
                .setOperation(Operations.CREATE)
                .setInitiatingUser(account.getLastModifiedBy())
                .setStatus(ApprovalStatus.REQUESTED).build());
          }
        }, "Liquid Account Put Approval Request");
      `
    }
  ]
});
