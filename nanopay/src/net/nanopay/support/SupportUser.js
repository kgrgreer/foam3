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

  sections: [
    {
      name: 'userInformation'
    },
    {
      name: 'bankAccounts'
    }
  ],

  properties: [
    foam.nanos.auth.User.ID.clone().copyFrom({
      section: 'userInformation',
      order: 1
    }),
    foam.nanos.auth.User.FIRST_NAME.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 2
    }),
    foam.nanos.auth.User.LAST_NAME.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 3
    }),
    foam.nanos.auth.User.EMAIL.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 4
    }),
    foam.nanos.auth.User.PHONE_NUMBER.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 5
    }),
    foam.nanos.auth.User.ADDRESS.clone().copyFrom({
      section: 'userInformation',
      order: 6
    }),
    foam.nanos.auth.User.COMPLIANCE.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 7
    }),
    foam.nanos.auth.User.TWO_FACTOR_ENABLED.clone().copyFrom({
      label: 'Two Factor Auth Enabled',
      gridColumns:6,
      section: 'userInformation',
      order: 8
    }),
    foam.nanos.auth.User.GROUP.clone().copyFrom({
      hidden: false,
      view: {
        class: 'foam.u2.view.ReferenceView'
      },
      section: 'userInformation',
      order: 9
    }),
    foam.nanos.auth.User.ACCOUNTS.clone().copyFrom({
      hidden: false,
      section: 'bankAccounts'
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
      name: 'resetLoginAttempts',
      section: 'userInformation',
      code: async function(X) {
        var loginAttempts = await X.loginAttemptsDAO.find(this.id);
        if ( loginAttempts == undefined || loginAttempts.loginAttempts == 0 ) {
          X.notify('Login attempts already at 0', '', this.LogLevel.WARN, true);
        } else {
          loginAttempts.loginAttempts = 0;
          X.loginAttemptsDAO.put(loginAttempts)
            .then(result => {
              X.notify('Login attempts successfully reset', '', this.LogLevel.INFO, true);
            });
        }
      }
    },
    {
      name: 'disableTwoFactor',
      label: 'Disable TFA',
      section: 'userInformation',
      code: async function(X) {
        var user = await X.userDAO.find(this.id);
        if ( ! user.twoFactorEnabled ) {
          X.notify('Two factor authentication already disabled', '', this.LogLevel.WARN, true);
        } else {
          user.twoFactorEnabled = false;
          X.userDAO.put(user)
            .then(() => {
              X.notify('Two factor authentication successfully disabled', '', this.LogLevel.INFO, true);
            });
        }
      }
    }
  ]
});
