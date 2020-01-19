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
    'foam.core.Detachable',
    'foam.core.X',
    'foam.core.FObject',
    'foam.core.MethodInfo',
    'foam.dao.DAO',
    'foam.dao.AbstractSink',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.ruler.Operations',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.liquidity.approvalRequest.RoleApprovalRequest',
    'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Int',
      name: 'approverLevel'
    },
    {
      class: 'String',
      name: 'outgoingAccountFinder',
      value: 'getOutgoingAccount'
    },
    {
      class: 'Boolean',
      name: 'isFinal'
    },
    {
      class: 'Long',
      name: 'defaultApprover',
      documentation: 'The default approver when there is no approvers found in the UCJ for the approverLevel.',
      value: 1348
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
            boolean done = processApproval(x, rule.getDaoKey(), obj,
              String.format("Created by Rule: %s", rule.getId()));

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
        { name: 'obj', type: 'FObject' },
        { name: 'description', type: 'String' }
      ],
      javaCode: `
        Object objId = obj.getProperty("id");
        String modelName = getModelName(obj);
        String classification = String.format("L%d - %s approval", getApproverLevel(), modelName);

        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        ApprovalStatus approval = ApprovalRequestUtil.getState(
          approvalRequestDAO.where(AND(
            EQ(ApprovalRequest.OBJ_ID, objId),
            EQ(ApprovalRequest.DAO_KEY, daoKey),
            getIsFinal()
              ? TRUE : EQ(ApprovalRequest.CLASSIFICATION, classification)
          ))
        );

        // 1. Create approval request if not yet exists.
        if ( approval == null ) {
          if ( getIsFinal() ) return false;

          AccountUCJQueryService ucjQueryService = (AccountUCJQueryService) x.get("accountUcjQueryService");
          MethodInfo method = (MethodInfo) obj.getClassInfo().getAxiomByName(getOutgoingAccountFinder());
          long accountId = ((Long) method.call(x, obj, null)).longValue();

          List<Long> approvers = ucjQueryService.getApproversByLevel(
            x, modelName, accountId, getApproverLevel());

          User user = (User) x.get("user");
          User agent = (User) x.get("agent");
          ApprovalRequest approvalRequest = new RoleApprovalRequest.Builder(x)
            .setClassification(classification)
            .setObjId(objId)
            .setDaoKey(daoKey)
            .setOperation(Operations.CREATE)
            .setInitiatingUser(agent != null ? agent.getId() : user.getId())
            .setStatus(ApprovalStatus.REQUESTED)
            .setDescription(description)
            .build();

          if ( ! approvers.isEmpty() ) {
            for ( Long approver : approvers ) {
              approvalRequest.clearId();
              approvalRequest.setApprover(approver);
              approvalRequestDAO.put(approvalRequest);
            }
          } else if ( getDefaultApprover() > 0 ) {
            approvalRequest.setApprover(getDefaultApprover());
            approvalRequestDAO.put(approvalRequest);
          } else {
            ((Logger) x.get("logger")).error(
              "ApprovalRuleActionOnCreate - No approvers found.", classification, objId);
          }

          return false;
        }

        // 2. Wait for approval request status change.
        if ( approval == ApprovalStatus.REQUESTED ) {
          return false;
        }

        DAO dao = (DAO) x.get(daoKey);
        FObject object = dao.find(objId).fclone();

        // 3. Found rejected approval request, set lifecycleState = REJECTED.
        if ( approval == ApprovalStatus.REJECTED ) {
          if ( object instanceof LifecycleAware ) {
            ((LifecycleAware) object).setLifecycleState(LifecycleState.REJECTED);
            dao.inX(x).put(object);
          }
          updateApprovalRequestsIsFulfilled(x, objId, daoKey);

          return false;
        }

        // 4. Approved and set lifecycleState = ACTIVE.
        if ( getIsFinal() ) {
          if ( object instanceof LifecycleAware ) {
            ((LifecycleAware) object).setLifecycleState(LifecycleState.ACTIVE);
            dao.inX(x).put(object);
          }
          updateApprovalRequestsIsFulfilled(x, objId, daoKey);
        }
        return true;
      `
    },
    {
      name: 'getModelName',
      type: 'String',
      args: [
        { name: 'obj', type: 'FObject' }
      ],
      javaCode: `
        if ( obj instanceof Transaction ) return "transaction";
        if ( obj instanceof Account )     return "account";
        return null;
      `
    },
    {
      name: 'updateApprovalRequestsIsFulfilled',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'objId', type: 'Object' },
        { name: 'daoKey', type: 'String' }
      ],
      javaCode: `
        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        approvalRequestDAO.where(
          AND(
            EQ(ApprovalRequest.OBJ_ID, objId),
            EQ(ApprovalRequest.DAO_KEY, daoKey)
          )
        ).select(new AbstractSink() {
          public void put(Object obj, Detachable sub) {
            RoleApprovalRequest approvalRequest = (RoleApprovalRequest) obj;
            approvalRequest.setIsFulfilled(true);
            approvalRequestDAO.inX(x).put(approvalRequest);
          }
        });
      `
    }
  ]
});
