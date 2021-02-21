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
  package: 'net.nanopay.support',
  name: 'SupportBusiness',

  documentation: `This model represents a business from an external support perspective.`,

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'agentJunctionDAO',
    'supportAccountDAO',
    'supportTransactionDAO',
    'supportUserDAO'
  ],

  requires: [
    'foam.nanos.auth.Address'
  ],

  sections: [
    {
      name: 'businessInformation'
    },
    {
      name: 'bankAccounts'
    },
    {
      name: 'transactionLimitsInformation',
      title: 'Transaction Limits'
    }
  ],

  properties: [
    foam.nanos.auth.User.ID.clone().copyFrom({
      label: 'Business ID',
      section: 'businessInformation',
      gridColumns:6,
      order: 1
    }),
    foam.nanos.auth.User.EXTERNAL_ID.clone().copyFrom({
      label: 'External ID',
      section: 'businessInformation',
      gridColumns:6,
      order: 1,
      visibility: 'RO'
    }),
    net.nanopay.model.Business.BUSINESS_NAME.clone().copyFrom({
      gridColumns:6,
      visibility: 'RO',
      section: 'businessInformation',
      order: 2
    }),
    net.nanopay.model.Business.BUSINESS_TYPE_ID.clone().copyFrom({
      label: 'Business Type',
      gridColumns:6,
      view: {
        class: 'foam.u2.view.ReferenceView'
      },
      section: 'businessInformation',
      order: 3
    }),
    net.nanopay.model.Business.EMAIL.clone().copyFrom({
      gridColumns:6,
      section: 'businessInformation',
      order: 4
    }),
    net.nanopay.model.Business.PHONE_NUMBER.clone().copyFrom({
      gridColumns:6,
      section: 'businessInformation',
      order: 5
    }),
    net.nanopay.model.Business.ADDRESS.clone().copyFrom({
      section: 'businessInformation',
      order: 6
    }),
    net.nanopay.model.Business.CREATED.clone().copyFrom({
      section: 'businessInformation',
      order: 7
    }),
    net.nanopay.model.Business.LAST_MODIFIED.clone().copyFrom({
      section: 'businessInformation',
      order: 8
    }),
    net.nanopay.model.Business.CREATED_BY.clone().copyFrom({
      section: 'businessInformation',
      order: 9,
      view: {
        class: 'foam.u2.view.ReferenceView'
      }
    }),
    net.nanopay.model.Business.LAST_MODIFIED_BY.clone().copyFrom({
      section: 'businessInformation',
      order: 10,
      view: {
        class: 'foam.u2.view.ReferenceView'
      }
    }),
    foam.nanos.auth.User.COMPLIANCE.clone().copyFrom({
      label: 'Compliance Status',
      gridColumns: 6,
      section: 'businessInformation',
      order: 11
    }),
    foam.nanos.auth.User.STATUS.clone().copyFrom({
      label: 'Registration Status',
      gridColumns: 6,
      section: 'businessInformation',
      order: 12
    }),
    foam.nanos.auth.User.ACCOUNTS.clone().copyFrom({
      hidden: false,
      section: 'bankAccounts'
    }),
    foam.nanos.auth.User.TRANSACTION_LIMITS.clone().copyFrom({
      section: 'transactionLimitsInformation'
    })
  ],

  methods: [
    function toSummary() {
      return this.businessName;
    },

    function getAccounts() {
      var m = foam.mlang.ExpressionsSingleton.create({});
      return this.supportAccountDAO.where(m.EQ(net.nanopay.support.SupportAccount.OWNER, this.id));
    },
  ],

  actions: [
    {
      name: 'viewTransactions',
      label: 'View Transactions',
      section: 'businessInformation',
      tableWidth: 160,
      availablePermissions: ['net.nanopay.support.SupportBusiness.permission.viewTransactions'],
      code: async function(X) {
        var ids = await X.accountDAO
          .where(this.EQ(net.nanopay.account.Account.OWNER, this.id))
          .select(this.MAP(net.nanopay.account.Account.ID))
          .then((sink) => sink.delegate.array);
        var dao = X.supportTransactionDAO.where(
          this.OR(
            this.IN(net.nanopay.support.SupportTransaction.SOURCE_ACCOUNT, ids),
            this.IN(net.nanopay.support.SupportTransaction.DESTINATION_ACCOUNT, ids)
          )
        );

        if ( X.memento ) {
          X = X.createSubContext({memento: X.memento.tail});
        }

        X.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.False,
            deletePredicate: foam.mlang.predicate.False,
            browseTitle: `${this.toSummary()}'s Transactions`
          }
        }, X);
      }
    },
    {
      name: 'viewUsers',
      label: 'View Users',
      tableWidth: 135,
      section: 'businessInformation',
      availablePermissions: ['net.nanopay.support.SupportBusiness.permission.viewUsers'],
      code: async function(X) {
        var junctionSourceIds = await X.agentJunctionDAO
          .where(this.EQ(foam.nanos.auth.UserUserJunction.TARGET_ID, this.id))
          .select(this.MAP(foam.nanos.auth.UserUserJunction.SOURCE_ID))
          .then((sink) => sink.delegate.array);
        var dao = X.supportUserDAO.where(this.IN(net.nanopay.support.SupportUser.ID, junctionSourceIds));

        if ( X.memento ) {
          X = X.createSubContext({memento: X.memento.tail});
        }

        X.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            deletePredicate: foam.mlang.predicate.False,
            browseTitle: `${this.businessName}'s Users`
          }
        }, X);
      }
    }
  ]
});
