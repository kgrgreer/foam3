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
  package: 'net.nanopay.liquidity.ucjQuery.ui',
  name: 'SelectTwoSearchBar',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.LifecycleState',
    'net.nanopay.account.Account'
  ],

  // TODO: CSS axiom?
  css: `
    ^query-container {
      height: 40pt;
      line-height: 40pt;
      padding-left: 16px;
    }
    ^query-container > div {
      display: inline-block;
    }
    ^query-container > div:not(:last-child) {
      margin-right: 16pt;
    }
    ^radio-view .foam-u2-view-RadioView:not(:last-child) {
      margin-right: 16pt;
    }
  `,

  messages: [
    {
      name: 'ACCOUNT',
      message: 'Account:',
    },
    {
      name: 'SEARCHFOR',
      message: 'Search For:',
    },
    {
      name: 'BY',
      message: 'by ',
    },
    // TODO: can i18n messages have templates?
    {
      name: 'BYEND',
      message: ': ',
    },
  ],

  properties: [
    {
      name: 'searchOption',
      view: {
        class: 'foam.u2.view.RadioView',
        isHorizontal: true,
        choices: [
          // TODO: need to fix afterwards, a problem with passing the argument into the skeleton
          // ['userAndRole','Accounts'],
          ['accountAndUser','Roles'],
          ['accountAndRole','Users'],
        ],
      },
      value: 'accountAndUser',
      postSet: function(_, nu) {
        if ( nu === 'userAndRole' ) {
          this.accountOrUserRef.of = foam.nanos.auth.User;
          this.accountOrUserRef.clearProperty("dao");
          this.userOrRoleRef.of = foam.nanos.crunch.Capability;
          this.userOrRoleRef.targetDAOKey = "localCapabilityDAO";
        }
        if ( nu === 'accountAndUser' ) {
          this.accountOrUserRef.of = net.nanopay.account.Account;
          this.accountOrUserRef.dao = this.__context__['accountDAO'].where(
            this.EQ(this.Account.LIFECYCLE_STATE, this.LifecycleState.ACTIVE)
          );
          this.userOrRoleRef.of = foam.nanos.auth.User;
          this.userOrRoleRef.clearProperty("targetDAOKey");
        }
        if ( nu === 'accountAndRole' ) {
          this.accountOrUserRef.of = net.nanopay.account.Account;
          this.accountOrUserRef.dao = this.__context__['accountDAO'].where(
            this.EQ(this.Account.LIFECYCLE_STATE, this.LifecycleState.ACTIVE)
          );
          this.userOrRoleRef.of = foam.nanos.crunch.Capability;
          this.userOrRoleRef.targetDAOKey = "localCapabilityDAO";
        }
      },
    },
    {
      name: 'accountOrUserRef',
      class: 'net.nanopay.liquidity.ucjQuery.referencespec.ReferenceSpec'
    },
    {
      name: 'userOrRoleRef',
      class: 'net.nanopay.liquidity.ucjQuery.referencespec.ReferenceSpec'
    },
  ],

  methods: [
    function initE() {
      // TODO: inherit initE?
      var self = this;
      self.accountOrUserRef.of = net.nanopay.account.Account;
      this.accountOrUserRef.dao = this.__context__['accountDAO'].where(
        this.EQ(this.Account.LIFECYCLE_STATE, this.LifecycleState.ACTIVE)
      );
      self.userOrRoleRef.of = foam.nanos.auth.User;
      self
        .addClass(self.myClass('query-container'))
        .start()
          .add(self.SEARCHFOR)
        .end()
        .start()
          .addClass(self.myClass('radio-view'))
          .add(self.SEARCH_OPTION)
        .end()
        .add(self.slot(function(accountOrUserRef$of) {
          return self.E()
            .add(self.BY)
            .add(self.refLabelFilter(accountOrUserRef$of.name))
            .add(self.BYEND)
        }))
        .add(self.ACCOUNT_OR_USER_REF)
        .add(self.slot(function(userOrRoleRef$of) {
          return self.E()
            .add(self.BY)
            .add(self.refLabelFilter(userOrRoleRef$of.name))
            .add(self.BYEND)
        }))
        .add(self.USER_OR_ROLE_REF)
        ;
    },

    function refLabelFilter(str) {
      str = str.toLowerCase();
      if ( str === 'capability' ) {
        str = 'role';
      }
      return str;
    }
  ],
});
