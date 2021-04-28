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
    'foam.core.FObject',
    'foam.core.MethodInfo',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovableAware',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.dao.Operation',

    'java.util.List',

    'net.nanopay.account.Account',
    'net.nanopay.liquidity.approvalRequest.AccountRoleApprovalRequest',
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
    },
    {
      class: 'Boolean',
      name: 'isTrackingRequestSent',
      value: true
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
          String accountId = (String) method.call(x, obj, null);

          List<Long> approvers = ucjQueryService.getApproversByLevel(
            x, modelName, accountId, getApproverLevel());

          // Get initiating user
          User initiatingUser = null;
          try {
            initiatingUser = ((CreatedByAware) ((DAO) x.get(daoKey)).find(objId)).findCreatedBy(x);
          } catch (Exception ex) {
            ((Logger) x.get("logger")).warning("CreatedByAware lookup failed with exception.", ex);
          }

          // Fallback if initiating user was not found
          if (initiatingUser == null) {
            ((Logger) x.get("logger")).info("Falling back to agent/user for initiating user.");
            initiatingUser = ((Subject) x.get("subject")).getRealUser();
          }

          // Context for putting approval requests as the initiating user
          Subject subject = new Subject.Builder(x).setUser(initiatingUser).build();
          X initiatingUserX = x.put("subject", subject);

          ApprovalRequest approvalRequest = new AccountRoleApprovalRequest.Builder(x)
            .setClassificationEnum(ApprovalRequestClassificationEnum.forLabel(classification))
            .setObjId(objId)
            .setDaoKey(daoKey)
            .setOperation(Operation.CREATE)
            .setOutgoingAccount(accountId)
            .setStatus(ApprovalStatus.REQUESTED)
            .setDescription(description)
            .build();

          if ( approvers.size() == 1 && approvers.get(0) == initiatingUser.getId() ) {
            ((Logger) x.get("logger")).error(
              "ApprovalRuleActionOnCreate - The only approver for this level is the initiating user of the request.", classification, objId);
          } else if ( approvers.size() > 0) {
            // sending a tracking request to the initiating user
            if ( getIsTrackingRequestSent() ) {
              approvalRequest.clearId();
              approvalRequest.setApprover(initiatingUser.getId());
              approvalRequest.setIsTrackingRequest(true);
              approvalRequestDAO.inX(initiatingUserX).put(approvalRequest);
            }

            // tracking request sent, skip the initiating user as an approver
            approvers.remove(initiatingUser.getId());

            for ( Long approver : approvers ) {
              approvalRequest.clearId();
              approvalRequest.setIsTrackingRequest(false);
              approvalRequest.setApprover(approver);
              approvalRequestDAO.inX(initiatingUserX).put(approvalRequest);
            }
          } else if ( getDefaultApprover() > 0 ) {
            approvalRequest.setApprover(getDefaultApprover());
            approvalRequestDAO.inX(initiatingUserX).put(approvalRequest);
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
            Subject subject = new Subject.Builder(x).setUser(new User.Builder(x).setId(User.SYSTEM_USER_ID).build()).build();
            X system = x.put("subject", subject);

            AccountRoleApprovalRequest approvalRequest = (AccountRoleApprovalRequest) obj;
            approvalRequest.setIsFulfilled(true);
            approvalRequestDAO.inX(system).put(approvalRequest);
          }
        });
      `
    }
  ]
});
