foam.CLASS({
  package: 'net.nanopay.liquidity.ruler',
  name: 'ApprovalRuleActionOnCreate',

  documentation: `
    Processes the object through the approval flow:
    - Create approval request(s) if not yet exist and
    - Update the object lifecycleState according to the approval requests state.

    Note: Intended use as the asyncAction of multi-level approval rules. See
    deployment/liquid/rules.jrl for example usages.
  `,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.ruler.Operations',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.liquidity.approvalRequest.RoleApprovalRequest',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'classification'
    },
    {
      class: 'Boolean',
      name: 'updateOnApproved'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Object objId = obj.getProperty("id");

        if ( objId == null ) {
          ((Logger) x.get("logger")).error(
            "ApprovalRuleActionOnCreate early returns because obj.id is null.", obj);
          return;
        }

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            boolean done = processApproval(x, rule.getDaoKey(), objId);
            if ( ! done ) {
              ruler.stop();
            }
          }
        }, "Apply approval rule (" + rule.getId() + ") on " + obj.getClass().getSimpleName() + ":" + objId);
      `
    },
    {
      name: 'processApproval',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'daoKey', type: 'String' },
        { name: 'objId', type: 'Object' }
      ],
      javaCode: `
        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        ApprovalStatus approval = ApprovalRequestUtil.getState(
          approvalRequestDAO.where(AND(
            EQ(RoleApprovalRequest.OBJ_ID, objId),
            EQ(RoleApprovalRequest.DAO_KEY, daoKey),
            OR(
              EQ(getClassification(), ""),
              EQ(RoleApprovalRequest.CLASSIFICATION, getClassification())
            )
          ))
        );

        // 1. Create approval request if not yet exists.
        if ( approval == null ) {
          User user = (User) x.get("user");
          User agent = (User) x.get("agent");
          approvalRequestDAO.inX(x).put(
            new RoleApprovalRequest.Builder(x)
              .setClassification(getClassification())
              .setObjId(objId)
              .setDaoKey(daoKey)
              .setOperation(Operations.CREATE)
              .setInitiatingUser(agent != null ? agent.getId() : user.getId())
              // TODO: Change setApprover(user) where user is the approver found
              // by U(A)CJ service
              .setGroup("liquidDev")
              .setStatus(ApprovalStatus.REQUESTED)
              .build()
          );
          return false;
        }

        // 2. Wait for approval request status change.
        if ( approval == ApprovalStatus.REQUESTED ) {
          return false;
        }

        // 3. Found rejected approval request, set lifecycleState = REJECTED.
        DAO dao = (DAO) x.get(daoKey);
        FObject object = dao.find(objId).fclone();
        if ( approval == ApprovalStatus.REJECTED ) {
          if ( object instanceof LifecycleAware ) {
            ((LifecycleAware) object).setLifecycleState(LifecycleState.REJECTED);
            dao.inX(x).put(object);
          }
          return false;
        }

        // 4. Approved and set lifecycleState = ACTIVE.
        if ( getUpdateOnApproved() ) {
          if ( object instanceof LifecycleAware ) {
            ((LifecycleAware) object).setLifecycleState(LifecycleState.ACTIVE);
            dao.inX(x).put(object);
          }
        }
        return true;
      `
    }
  ]
});
