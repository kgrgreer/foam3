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
    }
  ],

  properties: [
    foam.nanos.auth.User.ID.clone().copyFrom({
      section: 'businessInformation',
      order: 1
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
    foam.nanos.auth.User.COMPLIANCE.clone().copyFrom({
      section: 'businessInformation',
      order: 7
    }),
    foam.nanos.auth.User.ACCOUNTS.clone().copyFrom({
      hidden: false,
      section: 'bankAccounts'
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
        var dao = X.summaryTransactionDAO.where(
          this.OR(
            this.IN(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, ids),
            this.IN(net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT, ids)
          )
        );
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
        });
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
        var dao = X.userDAO.where(this.IN(foam.nanos.auth.User.ID, junctionSourceIds));
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
        });
      }
    }
  ]
});
