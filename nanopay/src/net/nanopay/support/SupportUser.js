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
  name: 'SupportUser',

  documentation: `This model represents a user from an external support perspective.`,

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'supportAccountDAO',
    'supportTransactionDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.PriorPassword',
    'foam.nanos.auth.Phone'
  ],

  searchColumns: [
    'id',
    'firstName',
    'lastName',
    'email',
    'phoneNumber'
  ],

  tableColumns: [
    'firstName',
    'lastName',
    'email',
    'compliance',
    'group'
  ],

  sections: [
    {
      name: 'userInformation'
    },
    {
      name: 'bankAccounts'
    },
    {
      name: 'transactionLimitsInformation',
      title: 'Transaction Limits'
    }
  ],

  messages: [
    { name: 'TWO_FACTOR_SUCCESS', message: 'Two factor authentication successfully disabled' },
    { name: 'TWO_FACTOR_INFO', message: 'Two factor authentication already disabled' },
    { name: 'RESET_LOGIN_SUCCESS', message: 'Login attempts successfully reset' },
    { name: 'RESET_LOGIN_INFO', message: 'Login attempts already reset' }
  ],

  properties: [
    foam.nanos.auth.User.ID.clone().copyFrom({
      label: 'User ID',
      section: 'userInformation',
      gridColumns: 12,
      order: 10
    }),
    foam.nanos.auth.User.FIRST_NAME.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 20
    }),
    foam.nanos.auth.User.MIDDLE_NAME.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 25
    }),
    foam.nanos.auth.User.LAST_NAME.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 30
    }),
    foam.nanos.auth.User.EMAIL.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 40
    }),
    foam.nanos.auth.User.PHONE_NUMBER.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 50
    }),
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      label: 'Date of Birth',
      gridColumns:6,
      section: 'userInformation',
      order: 55
    }),
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      section: 'userInformation',
      order: 60
    }),
    foam.nanos.auth.User.COMPLIANCE.clone().copyFrom({
      label: 'Compliance Status',
      gridColumns:6,
      section: 'userInformation',
      order: 100
    }),
    foam.nanos.auth.User.STATUS.clone().copyFrom({
      label: 'Registration Status',
      gridColumns:6,
      section: 'userInformation',
      order: 110
    }),
    foam.nanos.auth.User.GROUP.clone().copyFrom({
      hidden: false,
      view: {
        class: 'foam.u2.view.ReferenceView'
      },
      gridColumns: 6,
      section: 'userInformation',
      order: 130
    }),
    foam.nanos.auth.User.PEPHIORELATED.clone().copyFrom({
      label: 'Politically Exposed Person',
      gridColumns:6,
      section: 'userInformation',
      order: 140
    }),
    foam.nanos.auth.User.THIRD_PARTY.clone().copyFrom({
      label: "Acting on Behalf of Third Party",
      gridColumns:6,
      section: 'userInformation',
      order: 150
    }),
    foam.nanos.auth.User.JOB_TITLE.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 160
    }),
    foam.nanos.auth.User.CREATED_BY.clone().copyFrom({
      section: 'userInformation',
      order: 170,
      view: {
        class: 'foam.u2.view.ReferenceView'
      }
    }),
    foam.nanos.auth.User.CREATED.clone().copyFrom({
      section: 'userInformation',
      order: 180
    }),
    foam.nanos.auth.User.LAST_MODIFIED.clone().copyFrom({
      section: 'userInformation',
      order: 190
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
      return this.firstName + ' ' + this.lastName;
    },

    function getAccounts() {
      return this.supportAccountDAO.where(this.EQ(net.nanopay.support.SupportAccount.OWNER, this.id));
    },
  ],

  actions: [
    {
      name: 'viewTransactions',
      label: 'View Transactions',
      tableWidth: 160,
      section: 'userInformation',
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
    }
  ]
});
