foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery.ui',
  name: 'SelectOneSearchBar',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.User',
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
      name: 'SEARCHBY',
      message: 'Search By:',
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
          ['account','Account'],
          ['role','Role'],
          ['user','User'],
        ],
      },
      value: 'account',
      postSet: function(_, nu) {
        if ( nu === 'account' ) {
          this.queryRef.of = net.nanopay.account.Account;
          this.queryRef.clearProperty("targetDAOKey");
          this.queryRef.dao = this.__context__['accountDAO'].where(
            this.EQ(this.Account.LIFECYCLE_STATE, this.LifecycleState.ACTIVE)
          );
        }
        if ( nu === 'role' ) {
          this.queryRef.of = foam.nanos.crunch.Capability;
          this.queryRef.clearProperty("dao");
          this.queryRef.targetDAOKey = "accountBasedLiquidCapabilityDAO";
        }
        if ( nu === 'user' ) {
          this.queryRef.of = foam.nanos.auth.User;
          this.queryRef.dao = this.__context__['userDAO'].where(
            this.EQ(this.User.GROUP, 'liquidBasic')
          ).orderBy(this.User.LEGAL_NAME);
          this.queryRef.clearProperty("targetDAOKey");
        }
      },
    },
    {
      name: 'queryRef',
      class: 'net.nanopay.liquidity.ucjQuery.referencespec.ReferenceSpec'
    },
  ],

  methods: [
    function initE() {
      // TODO: inherit initE?
      var self = this;
      self.queryRef.of = net.nanopay.account.Account;
      self
        .addClass(self.myClass('query-container'))
        .start()
          .add(self.SEARCHBY)
        .end()
        .start()
          .addClass(self.myClass('radio-view'))
          .add(self.SEARCH_OPTION)
        .end()
        .add(self.QUERY_REF)
    }
  ]
});
