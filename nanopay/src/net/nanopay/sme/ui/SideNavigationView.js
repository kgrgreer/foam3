foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SideNavigationView',
  extends: 'foam.u2.View',

  documentation: 'Side navigation bar for self serve',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.menu.Menu'
  ],

  imports: [
    'menuDAO'
  ],

  css: `
    ^ .side-nav {
      height: 100%;
      width: 200px;
      position
      z-index: 1;
      top: 0;
      left: 0;
      overflow-x: hidden;
      background-color: white;
      display: inline-block;
    }
    ^ .nav-row {
      display: block;
    }
    ^ .side-nav a {
      display: inline-block;
      margin: 8px;
      text-decoration: none;
      font-size: 20px;
      transition: 0.3s;
    }
    ^ .icon {
      display: inline-block;
      height: 18px;
      width: 18px;
      margin-left: 16px;
      margin-top: 8px;
    }
    ^ .side-nav a:hover {
      color: #f1f1f1;
    }
    ^ .accordion-card a {
      font-size: 16px;
      margin: 8px 8px 8px 50px;
    }
    ^ .accordion-card-hide {
      display: none;
    }
    ^ .accordion-card-show {
      display: block;
    }
    ^ .accordion-button {
      display: inline-block;
      border: none;
      padding: 0;
      margin: 8px 8px;
      font-size: 20px;
      overflow: hidden;
      text-decoration: none;
      text-align: left;
      cursor: pointer;
      white-space: nowrap;
    }
    ^ .accordion-button:focus {
      outline: 0;
    }
    ^ .net-nanopay-ui-topNavigation-BusinessLogoView {
      width: 200px;
      display: inline-block;
      text-align: center;
      padding: 0;
    }
  `,

  properties: [
    {
      name: 'accordionCardShowDict',
      value: {}
    },
    {
      class: 'Boolean',
      name: 'accordionCardShow',
      value: true
    },
    {
      class: 'String',
      name: 'menuName',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.menuDAO.orderBy(this.Menu.ORDER)
            .where(this.EQ(this.Menu.PARENT, this.menuName));
      }
    }
  ],

  methods: [
    function initE() {
      var Menu = this.Menu;
      var mainThis = this;

      this.addClass(this.myClass())
        .start().addClass('side-nav')
          .tag({ class: 'net.nanopay.ui.topNavigation.BusinessLogoView' })
          .select(this.dao, function(menu) {
            mainThis.accordionCardShowDict[menu.id] = true;
            return this.E()
              .call(function() {
                var self = this;
                this.start('img')
                    // Todo: replace the place holder images
                    .addClass('icon').attr('src', 'images/connected-logo.png')
                  .end()
                  .start('a').addClass('menuItem')
                    .add(menu.label)
                    .on('click', function() {
                      menu.children.select().then(function(temp) {
                        // Only display submenu is array length is longer than 0
                        temp.array.length === 0 ?
                            menu.launch_(self.__context__, self) :
                            mainThis.accordianToggle(menu.id);
                      });
                    })
                  .end();

                /*
                  Genearete submenu: retrieve the submenu items
                  related to their parent menu item
                */
                var X = this.__subContext__;
                var expr = foam.mlang.Expressions.create();
                mainThis.menuDAO.where(expr.EQ(Menu.PARENT, menu.id)).select(
                  function(submenu) {
                    var accordianSlot = mainThis.accordionCardShowDict$.map(
                      function( keypair ) {
                        return keypair[submenu.parent];
                      }
                    );
                    // If accordion-card-show is disabled, then the submenu will be hidden
                    self.start()
                      .addClass('accordion-card')
                      .addClass('accordion-card-hide')
                      .enableClass('accordion-card-show',
                      accordianSlot)
                      .call(function() {
                        this.start('a').add(submenu.label)
                        .on('click', function() {
                          submenu.launch_(X, self);
                        }).end();
                      })
                    .end();
                  }
                );
              });
          })
        .end();
    },

    function accordianToggle(menuId) {
      var oldDict = this.accordionCardShowDict;
      oldDict[menuId] = ! oldDict[menuId];
      // accordianSlot won't be triggered if removed the next line
      this.accordionCardShowDict = undefined;
      this.accordionCardShowDict = oldDict;
    }
  ]
});
