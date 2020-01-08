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
    'ucjQueryService'
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
      postSet: function(ol, nu) {
        console.log({
          ol: ol,
          nu: nu,
        });
      }
    },
    {
      name: 'searchChoices',
      class: 'foam.dao.DAOProperty',
      documentation: `
        DAO containing either roles or users depending on the value of
        searchOption
      `,
      expression: function(searchOption) {
        if ( searchOption === 'user' ) {
          return this.ArrayDAO.create({array: [1,2,3,4,5]});
        } else {
          return this.ArrayDAO.create({array: [6,7,8,9,0]});
        }
      }
    },
    {
      name: 'referenceToUser',
      class: 'Reference',
      of: 'foam.nanos.auth.User'
    },
    {
      name: 'referenceToCapability',
      class: 'Reference',
      of: 'foam.nanos.crunch.Capability',
      // of: 'net.nanopay.liquidity.crunch.LiquidCapability'
    },
    {
      name: 'searchChoice',
      expression: function(searchOption, referenceToUser, referenceToCapability) {
        if ( searchOption === 'user' ) {
          return referenceToUser;
        } else {
          return referenceToCapability;
        }
      }
    },
    {
      name: 'searchResults',
      class: 'foam.dao.DAOProperty',
      documentation: `
      `,
      expression: function(searchChoice) {
        var self = this;
        console.log('SEARCH CHOICE');
        console.log(this);
        console.log(searchChoice);
        switch ( self.searchOption ) {
          case 'user':
            console.log('---user');
            return self.ucjQueryService.getRoles(searchChoice)
              .then(function (arry) {
                return self.ArrayDAO.create({
                  array: arry,
                  of: 'net.nanopay.liquidity.crunch.LiquidCapability'
                });
              });
          case 'role':
            console.log('---role');
            return self.ucjQueryService.getUsers(searchChoice)
              .then(function (arry) {
                return self.ArrayDAO.create({
                  array: arry,
                  of: 'foam.nanos.auth.User'
                });
              });
        }
        return this.ArrayDAO.create({
          array: [],
        });
      }
    }
  ],

  methods: [
    function init() {
      console.log(this);
    },
    function initE() {
      console.log('updated');
      window.lastRQV = this;
      this.SUPER();
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
            console.log('SLOT');
            console.log(searchOption);
            switch (searchOption) {
              case 'user': return self.E().tag(self.REFERENCE_TO_USER);
              case 'role': return self.E().tag(self.REFERENCE_TO_CAPABILITY);
            }
            return self.E().add('ERROR');
          }))
        .end()
        .tag(self.ScrollTableView, {
          data$: self.searchResults$,
          columns: ['id']
        });
        ;
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
