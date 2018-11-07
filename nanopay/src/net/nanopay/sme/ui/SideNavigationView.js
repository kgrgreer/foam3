foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SideNavigationView',
  extends: 'foam.u2.View',

  documentation: 'Side navigation bar for self serve',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'menuDAO',
    'stack',
    'user'
  ],

  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.SubMenuView'
  ],

  css: `
    ^ {
      width: 400px;
      position: fixed;
      z-index: 790;
    }
    ^ .side-nav {
      height: 100vh;
      width: 200px;
      top: 0;
      left: 0;
      background-color: white;
      display: inline-block;
      overflow-x: hidden;
      position: fixed;
      z-index: 800;
    }
    ^ .nav-row {
      display: block;
    }
    ^ .side-nav a {
      display: inline-block;
      vertical-align: middle;
      font-size: 20px;
      transition: 0.3s;
    }
    ^ .side-nav a:hover {
      color: gray;
      cursor:pointer;
    }
    ^ .menu-item {
      margin: 8px;
    }
    ^ .icon {
      display: inline-block;
      vertical-align: middle;
      height: 18px;
      width: 18px;
      margin-left: 16px;
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
    ^ .net-nanopay-sme-ui-AccountProfileView {
      margin-left: 200px;
    }
    ^ .accountProfileView-hidden {
      display: none;
    }
    ^ .net-nanopay-ui-topNavigation-BusinessLogoView {
      display: inline-block;
      width: 40px;
      padding-left: 15px;
      padding-top: 0px;
      vertical-align: middle;
    }
    ^ .net-nanopay-ui-topNavigation-BusinessLogoView img {
      padding-top: 0px;
    }
    ^ .account-button {
      margin-top: 15px;
      margin-bottom: 20px;
      width: 200px;
    }
    ^ .account-button-info-block {
      display: inline-block;
      vertical-align: middle;
      width: 100px
    }
    ^ .account-button-info-detail {
      font-size: 14px;
    }
    ^ .quick-actions {
      margin-bottom: 20px;
    }
    ^ .text-fade-out {
      background-image: linear-gradient(90deg, #000000 70%, rgba(0,0,0,0));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      overflow: hidden;
      white-space: nowrap;
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
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.menuDAO
          .orderBy(this.Menu.ORDER)
          .where(
            this.AND(
              this.STARTS_WITH(this.Menu.ID, 'sme.main'),
              this.EQ(this.Menu.PARENT, 'sme')
            )
          );
      }
    },
    {
      class: 'Boolean',
      name: 'expanded',
    },
  ],

  methods: [
    function initE() {
      var Menu = this.Menu;
      var mainThis = this;

      this.addClass(this.myClass())
        .start().addClass('side-nav')
          .start('a').addClass('account-button').addClass('sme-noselect')
            .tag({ class: 'net.nanopay.ui.topNavigation.BusinessLogoView' })
            .start().addClass('account-button-info-block')
              .start().addClass('account-button-info-detail')
                .addClass('text-fade-out')
                .add(this.user.firstName + ' ' + this.user.lastName)
              .end()
              .start().addClass('account-button-info-detail')
                .addClass('text-fade-out')
                .add(this.user.organization)
              .end()
            .end()
            .start({ class: 'foam.u2.tag.Image',
                data: 'images/ic-arrow-right.svg' })
              .style({ 'vertical-align': 'middle' })
            .end()
            .on('click', () => {
              this.tag({ class: 'net.nanopay.sme.ui.AccountProfileView' });
            })
          .end()
          .tag({ class: 'net.nanopay.sme.ui.QuickActionView' })
          .select(this.dao, function(menu) {
            mainThis.accordionCardShowDict[menu.id] = true;
            return this.E()
              .call(function() {
                var self = this;
                this.start('img')
                    .addClass('icon').attr('src', menu.icon)
                  .end()
                  .start('a').addClass('menu-item').addClass('sme-noselect')
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
                    /*
                      If accordion-card-show is disabled,
                      then the submenu will be hidden
                    */
                    self.start()
                      .addClass('accordion-card')
                      .addClass('accordion-card-hide')
                      .enableClass('accordion-card-show', accordianSlot)
                      .call(function() {
                        this.start('a').addClass('sme-noselect')
                          .add(submenu.label)
                          .on('click', function() {
                            submenu.launch_(X, self);
                          })
                        .end();
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
      // accordianSlot won't be triggered if the next line is removed
      this.accordionCardShowDict = undefined;
      this.accordionCardShowDict = oldDict;
    }
  ]
});
