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
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'RoleQueryViewBase',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.liquidity.ucjQuery.ui.UserOrRoleSearchBar',
  ],

  imports: [
    'ucjQueryService',
    'userDAO',
    'capabilityDAO'
  ],

  properties: [
    {
      name: 'searchBar',
      factory: function () {
        return this.UserOrRoleSearchBar.create();
      }
    },
    {
      name: 'userOrRole',
      postSet: function(_, nu) {
        this.updateSearch(nu);
      }
    },
    {
      name: 'searchResults',
      class: 'foam.dao.DAOProperty',
      factory: function () {
        return foam.dao.NullDAO.create({
          // of: 'net.nanopay.liquidity.crunch.LiquidCapability'
          of: 'foam.nanos.crunch.Capability'
        });
      },
    }
  ],

});

foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'RoleQueryViewGlobal',
  extends: 'net.nanopay.liquidity.ucjQuery.RoleQueryViewBase',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [

    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.u2.view.ScrollTableView',
  ],

  imports: [
    'ucjQueryService',
    'userDAO',
    'capabilityDAO'
  ],

  methods: [
    function initE() {
      var self = this;

      self.userOrRole$.follow(
        self.searchBar.userOrRoleRef$.dot('target'));

      self
        .start()
          .add(self.searchBar)
        .end()
        .add(self.slot(function(searchResults) {
          return self.E()
           .tag(foam.u2.view.ScrollTableView.create({
             data: searchResults,
           }))
        }))
        ;
    },
    function updateSearch(userOrRoleId) {
      if ( userOrRoleId === null ) return;

      var self = this;
      switch ( self.searchBar.searchOption ) {
      case 'user':
        self.ucjQueryService.getRoles(null, userOrRoleId).then(function (arry) {
          self.searchResults = self.capabilityDAO.where(
            self.IN(self.Capability.ID, arry)
          );
        });
        break;
      case 'role':
        self.ucjQueryService.getUsers(null, userOrRoleId).then(function (arry) {
          self.searchResults = self.userDAO.where(
            self.IN(self.User.ID, arry)
          );
        });
        break;
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'RoleQueryViewSelectTwo',
  extends: 'net.nanopay.liquidity.ucjQuery.RoleQueryViewBase',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.u2.view.ScrollTableView',

    'net.nanopay.account.Account',
    'net.nanopay.liquidity.ucjQuery.ui.SelectTwoSearchBar',
  ],

  imports: [
    'accountUcjQueryService',
    'userDAO',
    'capabilityDAO',
    'accountDAO',
  ],

  properties: [
    {
      name: 'searchBar',
      factory: function () {
        return this.SelectTwoSearchBar.create();
      }
    },
    {
      name: 'accountOrUser',
      postSet: function(_, nu) {
        this.updateSearch(nu);
      }
    },
  ],

  methods: [
    function initE() {
      var self = this;

      self.accountOrUser$.follow(
        self.searchBar.accountOrUserRef$.dot('target'));
      self.userOrRole$.follow(
        self.searchBar.userOrRoleRef$.dot('target'));

      self
        .start()
          .add(self.searchBar)
        .end()
        .add(self.slot(function(searchResults) {
          return self.E()
           .tag(foam.u2.view.ScrollTableView.create({
             data: searchResults,
           }))
        }))
        ;
    },
    function updateSearch() {
      var self = this;
      var userOrRole = self.userOrRole;
      var accountOrUser = self.accountOrUser;
      switch ( self.searchBar.searchOption ) {
      case 'accountAndUser':
        console.log(userOrRole);
        console.log(accountOrUser);
        self.accountUcjQueryService.getRoles(null, userOrRole, accountOrUser).then(function (arry) {
          self.searchResults = self.capabilityDAO.where(
            self.IN(self.Capability.ID, arry)
          );
        });
        break;
      case 'accountAndRole':
        console.log(userOrRole);
        console.log(accountOrUser);
        self.accountUcjQueryService.getUsers(null, userOrRole, accountOrUser).then(function (arry) {
          self.searchResults = self.userDAO.where(
            self.IN(self.User.ID, arry)
          );
        });
        break;
      case 'userAndRole':
        console.log(accountOrUser);
        console.log(userOrRole);
        self.accountUcjQueryService.getAccounts(null, userOrRole, accountOrUser).then(function (arry) {
          self.searchResults = self.accountDAO.where(
            self.IN(self.Account.ID, arry)
          );
        });
        break;
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'RoleQueryViewSelectOne',
  extends: 'net.nanopay.liquidity.ucjQuery.RoleQueryViewBase',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.ArrayDAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.u2.layout.Card',
    'foam.u2.layout.Grid',
    'foam.u2.view.ScrollTableView',

    'net.nanopay.account.Account',
    'net.nanopay.liquidity.ucjQuery.ui.SelectOneSearchBar',

    'net.nanopay.liquidity.ucjQuery.ui.UserRoleRow',
    'net.nanopay.liquidity.ucjQuery.ui.AccountUserRow',
    'net.nanopay.liquidity.ucjQuery.ui.AccountRoleRow',
  ],

  imports: [
    'accountUcjQueryService',
    'userDAO',
    'capabilityDAO',
    'accountDAO',
  ],

  properties: [
    {
      name: 'searchBar',
      factory: function () {
        return this.SelectOneSearchBar.create();
      }
    },
    {
      name: 'queryId',
      postSet: function(_, nu) {
        this.updateSearch(nu);
      }
    },
    {
      name: 'searchResults',
      class: 'foam.dao.DAOProperty',
      factory: function () {
        return foam.dao.NullDAO.create({
          of: 'net.nanopay.liquidity.ucjQuery.ui.AccountRoleRow'
        });
      },
    }
  ],

  methods: [
    function initE() {
      var self = this;

      self.queryId$.follow(
        self.searchBar.queryRef$.dot('target'));

      self
        .start()
          .add(self.searchBar)
        .end()
        .add(self.slot(function(searchResults) {
          return self.E()
            .tag(foam.u2.view.ScrollTableView.create({
              data: searchResults,
            }))
            ;
        }))
        ;
    },
    function updateSearch() {
      var self = this;
      var queryId = self.queryId;

      if ( queryId === null ) return;

      switch ( self.searchBar.searchOption ) {
      case 'account':
        self.accountUcjQueryService.getUsersAndRoles(queryId).then(function (arry) {
          var dao = self.ArrayDAO.create({ of: self.UserRoleRow });
          for ( let i=0; i < arry.length; i++ ) {
            dao.put(self.UserRoleRow.create({
              user: arry[i][0],
              role: arry[i][1]
            }));
          }
          self.searchResults = dao;
        });
        break;
      case 'user':
        self.accountUcjQueryService.getRolesAndAccounts(queryId).then(function (arry) {
          var dao = self.ArrayDAO.create({ of: self.AccountRoleRow });
          for ( let i=0; i < arry.length; i++ ) {
            dao.put(self.AccountRoleRow.create({
              account: arry[i][1],
              role: arry[i][0]
            }));
          }
          self.searchResults = dao;
        });
        break;
      case 'role':
        self.accountUcjQueryService.getUsersAndAccounts(queryId).then(function (arry) {
          var dao = self.ArrayDAO.create({ of: self.AccountUserRow });
          for ( let i=0; i < arry.length; i++ ) {
            dao.put(self.AccountUserRow.create({
              account: arry[i][1],
              user: arry[i][0]
            }));
          }
          self.searchResults = dao;
        });
        break;
      }
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'RoleQueryView',
  extends: 'foam.u2.Controller',

  requires: [
    'net.nanopay.liquidity.ucjQuery.RoleQueryViewGlobal',
    'net.nanopay.liquidity.ucjQuery.RoleQueryViewSelectTwo',
    'net.nanopay.liquidity.ucjQuery.RoleQueryViewSelectOne',

    'foam.u2.borders.CardBorder',
    'foam.u2.view.TabChoiceView'
  ],

  css: `
    ^header-container {
      padding-top: 32px;
      padding-bottom: 16px;
    }

    ^tabs-container {
      padding: 0 16px;
    }

    ^header {
      font-size: 36px;
      font-weight: 600;
      line-height: 1.33;
    }
  `,

  properties: [
    {
      name: 'currentTab',
      value: 'globalRoles',
      view: {
        class: 'foam.u2.view.TabChoiceView',
        choices: [
          ['globalRoles', 'Admin Roles'],
          // ['selectTwo', 'Account Roles (Specific)'],
          ['selectOne', 'Transactional Roles'],
        ],
      },
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      self
        .start().addClass(self.myClass('header-container'))
          .start().style({'align-items': 'baseline'})
            .start().add("Role Query").addClass(self.myClass('header')).end()
          .end()
        .end()
        .start(self.CardBorder)
          .start().addClass(self.myClass('tabs-container'))
            .tag(self.CURRENT_TAB)
          .end()
          .add(self.slot(function (currentTab) {
            if ( currentTab === 'globalRoles' ) {
              return self.E()
                .tag(self.RoleQueryViewGlobal)
            } else if ( currentTab === 'selectTwo' ) {
              return self.E()
                .tag(self.RoleQueryViewSelectTwo)
            } else if ( currentTab === 'selectOne' ) {
              return self.E()
                .tag(self.RoleQueryViewSelectOne)
            } else {
              return self.E()
                .add('Not yet implemented')
            }
          }))
        .end()
        ;
    }
  ]
});
