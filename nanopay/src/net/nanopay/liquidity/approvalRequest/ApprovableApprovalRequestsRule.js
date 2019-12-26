foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'ApprovableApprovalRequestsRule',

  documentation: `
    A rule to update the approvable once it's related approval request has been
    APPROVED or REJECTED
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
    'net.nanopay.liquidity.approvalRequest.Approvable',
    'net.nanopay.liquidity.approvalRequest.ApprovableId'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        ApprovalRequest request = (ApprovalRequest) obj.fclone();

        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            DAO approvableDAO = (DAO) getX().get("approvableDAO");

            ApprovableId approvableId = (ApprovableId) request.getObjId();

            Approvable updatedApprovable = (Approvable) (approvableDAO.find(approvableId)).fclone();

            updatedApprovable.setStatus(request.getStatus());

            approvableDAO.put_(getX(), updatedApprovable);
          }
        }, "Updated approvable status based on the approval request");
      `
    }
  ]
});
