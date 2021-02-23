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
  name: 'UserOrRoleSearchBar',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.User'
  ],

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
          ['user','User'],
          ['role','Role'],
        ],
      },
      value: 'user',
      postSet: function(_, nu) {
        if ( nu === 'user' ) {
          this.userOrRoleRef.of = foam.nanos.auth.User;
          this.userOrRoleRef.clearProperty("targetDAOKey");
          this.userOrRoleRef.dao = this.__context__['liquiditySettingsUserDAO'].orderBy(this.User.LEGAL_NAME);
        }
        if ( nu === 'role' ) {
          this.userOrRoleRef.of = foam.nanos.crunch.Capability;
          this.userOrRoleRef.clearProperty("dao");
          this.userOrRoleRef.targetDAOKey = "localCapabilityDAO";
        }
      },
    },
    {
      name: 'userOrRoleRef',
      class: 'net.nanopay.liquidity.ucjQuery.referencespec.ReferenceSpec'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      self.userOrRoleRef.of = foam.nanos.auth.User;
      self.userOrRoleRef.dao = this.__context__['liquiditySettingsUserDAO'].orderBy(this.User.LEGAL_NAME);

      self
        .addClass(self.myClass('query-container'))
        .start()
          .add(self.SEARCHBY)
        .end()
        .start()
          .addClass(self.myClass('radio-view'))
          .add(self.SEARCH_OPTION)
        .end()
        .add(self.USER_OR_ROLE_REF);
    }
  ]
});
