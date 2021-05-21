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

// TODO: userDAO predicate and roleDAO predicate in a property
//       (like how accountDAO is right now)
foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery.ui',
  name: 'SelectOneSearchBar',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.crunch.LiquidCapability'
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
          this.queryRef.dao = this.accountDAO;
        }
        if ( nu === 'role' ) {
          this.queryRef.of = foam.nanos.crunch.Capability;
          this.queryRef.clearProperty("dao");
          this.queryRef.dao = this.__context__['localCapabilityDAO'].where(
              this.EQ(this.LiquidCapability.LIFECYCLE_STATE, this.LifecycleState.ACTIVE),
          );
        }
        if ( nu === 'user' ) {
          this.queryRef.of = foam.nanos.auth.User;
          this.queryRef.dao = this.__context__['liquiditySettingsUserDAO'].orderBy(this.User.LEGAL_NAME);
          this.queryRef.clearProperty("targetDAOKey");
        }
      },
    },
    {
      name: 'queryRef',
      class: 'net.nanopay.liquidity.ucjQuery.referencespec.ReferenceSpec'
    },
    {
      name: 'accountDAO',
      factory: function () {
        return this.__context__['accountDAO'].where(
          this.AND(
            this.EQ(this.Account.LIFECYCLE_STATE, this.LifecycleState.ACTIVE),
            this.OR(
              this.INSTANCE_OF(net.nanopay.account.AggregateAccount),
              foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' })
            )
          )
        );
      }
    }
  ],

  methods: [
    function initE() {
      // TODO: inherit initE?
      var self = this;
      self.queryRef.of = net.nanopay.account.Account;
      this.queryRef.dao = this.accountDAO;
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
