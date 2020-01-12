foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'RoleQueryViewGlobal',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.ArrayDAO',
    'foam.nanos.crunch.Capability',
    'foam.u2.view.ChoiceView',
    'foam.u2.view.RadioView',
    'foam.u2.view.ScrollTableView',
  ],

  imports: [
    'ucjQueryService',
    'userDAO',
    'capabilityDAO'
  ],

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
          this.updateSearchForUser(this.referenceToUser);
        }
        if ( nu === 'role' ) {
          this.updateSearchForRole(this.referenceToCapability);
        }
      },
    },
    {
      name: 'referenceToUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      postSet: function(_, nu) {
        if ( this.searchOption === 'user' ) {
          this.updateSearchForUser(nu);
        }
      }
    },
    {
      name: 'referenceToCapability',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      postSet: function(_, nu) {
        if ( this.searchOption === 'role' ) {
          this.updateSearchForRole(nu);
        }
      }
      // of: 'net.nanopay.liquidity.crunch.LiquidCapability'
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

  methods: [
    function initE() {
      // this.SUPER();
      var self = this;

      self
        .start()
          .addClass(self.myClass('query-container'))
          .start()
            .add(self.SEARCHBY)
          .end()
          .start()
            .addClass(self.myClass('radio-view'))
            .add(self.SEARCH_OPTION)
          .end()
          .add(self.slot(function (searchOption) {
            switch (searchOption) {
              case 'user': return self.E().tag(self.REFERENCE_TO_USER);
              case 'role': return self.E().tag(self.REFERENCE_TO_CAPABILITY);
            }
            return self.E().add('ERROR');
          }))
        .end()
        .add(self.slot(function(searchResults) {
          return self.E()
           .tag(foam.u2.view.ScrollTableView.create({
             data: searchResults,
            //  columns: ['id']
           }))
        }))
        ;
    },
    function updateSearchForUser(userId) {
      var self = this;
      self.ucjQueryService.getRoles(userId).then(function (arry) {
        self.searchResults = self.capabilityDAO.where(
          self.IN(foam.nanos.crunch.Capability.ID, arry)
        );
      });
    },
    function updateSearchForRole(roleId) {
      var self = this;
      self.ucjQueryService.getUsers(roleId).then(function (arry) {
        self.searchResults = self.userDAO.where(
          self.IN(foam.nanos.auth.User.ID, arry)
        );
      });
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'RoleQueryView',
  extends: 'foam.u2.Controller',

  requires: [
    'net.nanopay.liquidity.ucjQuery.RoleQueryViewGlobal',

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
          ['globalRoles', 'Global Roles'],
          ['accountRoles', 'Account Roles'],
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
            .start().add(self.cls_.name).addClass(self.myClass('header')).end()
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
