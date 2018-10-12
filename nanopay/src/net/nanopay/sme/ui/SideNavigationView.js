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
      text-decoration: none;
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
      height: 18px;
      width: 18px;
      margin-left: 16px;
      margin-top: 8px;
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
      float: left;
      width: 40px;
      padding-left: 15px;
    }
    ^ .account-button {
      margin-bottom: 20px;
      width: 200px;
    }
    ^ .account-button-info-block {
      display: inline-block;
      margin-top: 14px;
    }
    ^ .account-button-info-detail {
      font-size: 14px;
    }
    ^ .quick-actions {
      margin-bottom: 20px;
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
    },
    {
      class: 'Boolean',
      name: 'expanded',
    },
    'accountProfile',
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
                .add(this.user.firstName + ' ' + this.user.lastName)
              .end()
              .start().addClass('account-button-info-detail')
                .add(this.user.organization)
              .end()
            .end()
            .start({ class: 'foam.u2.tag.Image',
                data: 'images/ic-arrow-right.svg' }).end()
            .on('click', () => {
              this.start({ class: 'net.nanopay.sme.ui.AccountProfileView' }).end();
            })
          .end()
          .start().addClass('quick-actions')
            .start().addClass('sme-noselect').style({ 'margin-left': '16px' })
              .add('Quick actions')
            .end()
            .start()
              .start('img')
                // Todo: replace the place holder images
                .addClass('icon').attr('src', 'images/connected-logo.png')
              .end()
              .start('a').addClass('menu-item').addClass('sme-noselect')
                .add('Send money')
                .on('click', () => {
                  this.stack.push({
                    class: 'net.nanopay.invoice.ui.InvoiceDetailView'
                  });
                })
              .end()
            .end()
            .start()
              .start('img')
                // Todo: replace the place holder images
                .addClass('icon').attr('src', 'images/connected-logo.png')
              .end()
              .start('a').addClass('menu-item').addClass('sme-noselect')
                .add('Request money')
                .on('click', () => {
                  this.stack.push({
                    class: 'net.nanopay.invoice.ui.InvoiceDetailView'
                  });
                })
              .end()
            .end()
          .end()
          .select(this.dao, function(menu) {
            mainThis.accordionCardShowDict[menu.id] = true;
            return this.E()
              .call(function() {
                var self = this;
                this.start('img')
                    // Todo: replace the place holder images
                    .addClass('icon').attr('src', 'images/connected-logo.png')
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
