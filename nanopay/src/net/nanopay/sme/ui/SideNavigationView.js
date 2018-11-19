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
    'user',
    'currentMenu'
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
      width: 220px;
      top: 0;
      left: 0;
      background-color: white;
      display: inline-block;
      overflow-x: hidden;
      position: fixed;
      z-index: 800;
      box-shadow: 0 1px 1px 0 #dae1e9;
      color: #525455;
      border-right: 1px solid #e2e2e3;
    }
    ^ .nav-row {
      display: block;
    }
    ^ .side-nav a {
      display: inline-block;
      vertical-align: middle;
      font-size: 16px;
      font-family: lato;
    }
    ^ .menu-item {
      margin: 14px 16px;
    }
    ^ .icon {
      display: inline-block;
      vertical-align: middle;
      height: 14px;
      width: 14px;
      margin-left: 24px;
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
      padding-left: 0px;
      padding-top: 0px;
      vertical-align: middle;
    }
    ^ .net-nanopay-ui-topNavigation-BusinessLogoView img {
      padding-top: 0px;
      height: 24px;
    }
    ^ .account-button {
      border-radius: 3px;
      margin: 10px 0 16px 20px;
      padding: 8px 6px 8px 4px;
    }
    ^ .account-button:hover {
      cursor: pointer;
      background: #f2f2f2;
    }
    ^ .account-button-info-block {
      display: inline-block;
      vertical-align: middle;
      width: 100px;
      margin-left: 4px;
    }
    ^ .account-button-info-detail {
      font-size: 16px;
      line-height: 24px;
      color: #2b2b2b;
    }
    ^ .account-button-info-detail-small {
      font-size: 10px;
      color: #525455;
    }
    ^ .quick-actions {
      margin-bottom: 16px;
    }
    ^ .text-fade-out {
      background-image: linear-gradient(90deg, #000000 70%, rgba(0,0,0,0));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      overflow: hidden;
      white-space: nowrap;
    }
    ^ .divider-line {
      border-bottom: solid 1px #e2e2e3;
      margin: 0px 24px 12px;
    }
    ^ .divider-line-2 {
      border-bottom: solid 1px #e2e2e3;
      margin: 0px 20px 23px;
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
                .add(this.user.firstName)
              .end()
              .start().addClass('account-button-info-detail-small')
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
          .start().addClass('divider-line').end()
          .tag({ class: 'net.nanopay.sme.ui.QuickActionView' })
          .start().addClass('divider-line-2').end()
          .select(this.dao, function(menu) {
            mainThis.accordionCardShowDict[menu.id] = true;
            return this.E()
              .call(function() {
                var self = this;
                this.start().addClass('sme-sidenav-item-wrapper')
                .on('click', function() {
                  menu.children.select().then(function(temp) {
                    // Only display submenu is array length is longer than 0
                    temp.array.length === 0 ?
                        menu.launch_(self.__context__, self) :
                        mainThis.accordianToggle(menu.id);
                  });
                })
                .start('img')
                    .addClass('icon').attr('src', menu.icon)
                  .end()
                  .start('a').addClass('menu-item').addClass('sme-noselect')
                    .add(menu.label)
                  .end()
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
    },
  ]
});
