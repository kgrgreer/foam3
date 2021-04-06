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
  name: 'RoleAssignment',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions',
    'foam.nanos.approval.ApprovableAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  imports: [
    "accountTemplateDAO"
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'java.util.ArrayList',
    'net.nanopay.account.Account',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'static foam.mlang.MLang.*'
  ],

  tableColumns: [
    'id',
    'lifecycleState',
    'lastModified'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.crunch.RoleTemplate',
      name: 'roleTemplate'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.crunch.AccountTemplate',
      name: 'accountTemplate'
    },
    {
      class: 'List',
      name: 'users',
      javaType: 'java.util.List<Long>',
      javaFactory: `
        return new ArrayList<Long>();
      `,
      factory: function() {
        return [];
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      label: 'Status',
      value: foam.nanos.auth.LifecycleState.PENDING,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subContext__.userDAO
          .find(value)
          .then((user) => {
            this.add(user.toSummary());
          })
          .catch((error) => {
            console.log('user: ' + value +' error last mod capR: ' + error);
            this.add(value);
          });
      },
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subContext__.userDAO
          .find(value)
          .then((user) => {
            this.add(user.toSummary());
          })
          .catch((error) => {
            console.log('user: ' + value +' error last mod capR: ' + error);
            this.add(value);
          });
      },
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'checkerPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function(){
        return `(Capability Request #${this.id}) ${this.requestType.label}`
      },
      javaCode: `
        return ! foam.util.SafetyUtil.isEmpty(getId()) ? "Capability Request #" + getId() + ")" : "";
      `
    },
    {
      name: 'validate',
      javaCode: `
        // if the object is deleted or rejected, do not validate
        if ( getLifecycleState() == foam.nanos.auth.LifecycleState.DELETED ) return;
        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        List<ApprovalRequest> rejectedApprovalRequests = ((ArraySink) approvalRequestDAO
          .where(
            AND(
              EQ(ApprovalRequest.DAO_KEY, "roleAssignmentDAO"),
              EQ(ApprovalRequest.OBJ_ID, getId()),
              EQ(ApprovalRequest.OPERATION, foam.nanos.dao.Operation.CREATE),
              EQ(ApprovalRequest.IS_FULFILLED, false),
              EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED)
            )
          ).select(new ArraySink())).getArray();
        if ( rejectedApprovalRequests.size() > 0 ) return;

        // 1. check users
        DAO userDAO = (DAO) x.get("localUserDAO");
        User user;
        for ( Long userId : getUsers() ) {
          user = (User) userDAO.find(userId);
          if ( user == null || user.getLifecycleState() != foam.nanos.auth.LifecycleState.ACTIVE )
            throw new IllegalStateException("One or more users being assigned this capability is no longer available");
        }

        // 2. check role template
        DAO roleTemplateDAO  = (DAO) x.get("roleTemplateDAO");
        RoleTemplate roleTemplate = (RoleTemplate) roleTemplateDAO.find(getRoleTemplate());
        if ( roleTemplate == null )
          throw new IllegalStateException("The role template to be assigned is no longer available");

        if ( ! roleTemplate.getIsAccountGroupRequired() ) return;

        // 3. check account template
        DAO accountTemplateDAO = (DAO) x.get("accountTemplateDAO");
        AccountTemplate accountTemplate = (AccountTemplate) accountTemplateDAO.find(getAccountTemplate());

        if ( accountTemplate == null )
          throw new IllegalStateException("The account template to be assigned is no longer available");
      `
    }
  ]
});
