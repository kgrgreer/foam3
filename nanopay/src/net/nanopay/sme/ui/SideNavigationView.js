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
    'currentMenu',
    'lastMenuLaunched',
    'menuDAO',
    'window'
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
      margin: 8px 8px 8px 8px;
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
      display: block !important;
    }
    ^ .accordion-button {
      display: inline-block;
      border: none;
      padding: 0;
      margin: 8px 8px;
      font-size: 20px;
      // vertical-align: middle;
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
      class: 'Boolean',
      name: 'accordionCardShow',
      value: true
    },
    {
      name: 'menuName',
      value: '' // The root menu
    }
  ],

  methods: [
    function initE() {
      var Menu = this.Menu;
      var mainThis = this;
      var dao = this.menuDAO.orderBy(Menu.ORDER)
          .where(this.EQ(Menu.PARENT, this.menuName));

      this.addClass(this.myClass())
        .start().addClass('side-nav')
          .tag({ class: 'net.nanopay.ui.topNavigation.BusinessLogoView' })
          .select(dao, function(menu) {
            return this.E('div')
              .call(function() {
                var self = this;
                this.start('img')
                    .addClass('icon').attr('src', 'images/connected-logo.png')
                  .end()
                  .start('a').addClass('menuItem')
                    .add(menu.label)
                    .on('click', function() {
                      menu.children.select().then(function(temp) {
                        temp.array.length === 0 ?
                            menu.launch_(self.__context__, self) :
                            mainThis.myFunction();
                      });
                    })
                  .end();

                var X = this.__subContext__;
                mainThis.menuDAO.where(ctrl.EQ(Menu.PARENT, menu.id)).select(
                  function(submenu) {
                    self.start('div')
                      .addClass('accordion-card')
                      .addClass('accordion-card-hide')
                      .enableClass('accordion-card-show',
                          mainThis.accordionCardShow$)
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

    function myFunction() {
      ! this.accordionCardShow ? this.accordionCardShow= true :
          this.accordionCardShow = false;
    }
  ]
});
