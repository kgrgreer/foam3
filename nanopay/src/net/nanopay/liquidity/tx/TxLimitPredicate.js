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
  package: 'net.nanopay.liquidity.tx',
  name: 'TxLimitPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the rule applies to the transaction',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'net.nanopay.account.Account',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.model.Business',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*',
    'foam.util.SafetyUtil'
  ],
  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.tx.TxLimitEntityType',
      name: 'entityType'
    },
    {
      class: 'Object',
      name: 'id',
      documentation: 'ID of the entity that is being limited. It could be accountId, userId, or businessId'
    },
    {
      class: 'Boolean',
      name: 'send'
    },
    {
      class: 'Boolean',
      name: 'includeChildAccounts',
      documentation: 'Whether to include child accounts when the entity type is ACCOUNT.'
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
        Transaction tx = (Transaction) NEW_OBJ.f(obj);

        // Only check digital transactions
        if ( ! ( tx instanceof DigitalTransaction ||
                 tx instanceof FXTransaction ) ) {
          return false;
        }

        // When there is no ID to match, always return false
        if (this.getId() == null) {
          return false;
        }

        // Retrieve the account
        Account account = getSend() ? tx.findSourceAccount((X) obj) : tx.findDestinationAccount((X) obj);
        if (this.getEntityType() == TxLimitEntityType.ACCOUNT) {
          // When including children, use the custom predicate
          if (this.getIncludeChildAccounts()) {
            IsChildAccountPredicate isChildAccountPredicate = new IsChildAccountPredicate.Builder((X) obj)
              .setParentId((String) this.getId())
              .build();
            return isChildAccountPredicate.f(account);
          }

          // Check if account IDs match exactly
          return SafetyUtil.equals(account.getId(), this.getId());
        }

        if (this.getSend()) {
          // When sending, retrieve the user/business from the context
          User user = ((Subject) ((X) obj).get("subject")).getUser();
          if (this.getEntityType() == TxLimitEntityType.BUSINESS) {
            return
              (user instanceof Business) ? SafetyUtil.equals((Long) user.getId(), this.getId()) :
              false;
          }

          // Retrieve the agent from the context
          User agent = ((Subject) ((X) obj).get("subject")).getRealUser();
          if (this.getEntityType() == TxLimitEntityType.USER) {
            return
              (user instanceof Business && agent != null) ? SafetyUtil.equals((Long) agent.getId(), this.getId()) :
              (user != null) ? SafetyUtil.equals((Long) user.getId(), this.getId()) :
              false;
          }
        } else {
          // When receiving, lookup the user or business from the account
          User user = account.findOwner((X) obj);
          if (this.getEntityType() == TxLimitEntityType.USER ||
             (this.getEntityType() == TxLimitEntityType.BUSINESS && user instanceof Business)) {
            return SafetyUtil.equals((Long) user.getId(), this.getId());
          }
        }

        // otherwise this is an unknown entity type
        return false;
      `
    }
  ]
});
