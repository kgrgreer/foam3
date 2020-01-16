foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery.ui',
  name: 'SelectTwoSearchBar',
  extends: 'foam.u2.Controller',

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
      name: 'SEARCHBYCHOICEUSER',
      message: 'User',
    },
    {
      name: 'SEARCHBYCHOICEROLE',
      message: 'Role',
    },
  ],

  properties: [
    {
      name: 'searchOption',
      view: {
        class: 'foam.u2.view.RadioView',
        isHorizontal: true,
        choices: [
          ['userAndRole','Accounts'],
          ['accountAndUser','Roles'],
          ['accountAndRole','Users'],
        ],
      },
      value: 'userAndRole',
      postSet: function(_, nu) {
        if ( nu === 'userAndRole' ) {
          this.accountOrUserRef.of = foam.nanos.auth.User;
          this.userOrRoleRef.of = foam.nanos.crunch.Capability;
          this.userOrRoleRef.targetDAOKey = "accountBasedLiquidCapabilityDAO";
        }
        if ( nu === 'accountAndUser' ) {
          this.accountOrUserRef.of = net.nanopay.account.Account;
          this.userOrRoleRef.of = foam.nanos.auth.User;
          this.userOrRoleRef.clearProperty("targetDAOKey");
        }
        if ( nu === 'accountAndRole' ) {
          this.accountOrUserRef.of = net.nanopay.account.Account;
          this.userOrRoleRef.of = foam.nanos.crunch.Capability;
          this.userOrRoleRef.targetDAOKey = "accountBasedLiquidCapabilityDAO";
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
      self.userOrRoleRef.of = foam.nanos.crunch.Capability;
      self.userOrRoleRef.targetDAOKey = "accountBasedLiquidCapabilityDAO";
      self.accountOrUserRef.of = foam.nanos.auth.User;
      self
        .addClass(self.myClass('query-container'))
        .start()
          .add(self.SEARCHBY)
        .end()
        .start()
          .addClass(self.myClass('radio-view'))
          .add(self.SEARCH_OPTION)
        .end()
        .add(self.ACCOUNT_OR_USER_REF)
        .add(self.USER_OR_ROLE_REF)
    }
  ]
});
