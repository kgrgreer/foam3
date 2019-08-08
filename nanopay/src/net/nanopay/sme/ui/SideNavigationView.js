foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SideNavigationView',
  extends: 'foam.u2.View',

  documentation: 'Side navigation bar for self serve',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'agent',
    'currentMenu',
    'menuDAO',
    'pushMenu',
    'stack',
    'user'
  ],

  requires: [
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.SubMenuView'
  ],

  css: `
    ^ {
      position: sticky;
      top: 0;
      align-self: flex-start;
      z-index: 790;
    }
    ^ .side-nav {
      height: 100vh;
      width: 220px;
      background-color: white;
      display: inline-block;
      overflow-x: hidden;
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
      position: absolute;
      top: 0;
      left: 200px;
    }
    ^ .accountProfileView-hidden {
      display: none;
    }
    ^ img {
      padding-top: 0px;
      height: 24px;
      display: inline-block;
      width: 40px;
      padding-left: 0px;
      padding-top: 0px;
      vertical-align: middle;
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
      color: /*%BLACK%*/ #1e1f21;
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
      var self = this;

      this.addClass(this.myClass())
        .start()
          .addClass('side-nav')
          .start('a')
            .addClass('account-button')
            .addClass('sme-noselect')
            .tag({ class: 'foam.u2.tag.Image', data: '/images/ablii-logo.svg' })
            .start()
              .addClass('account-button-info-block')
              .start()
                .addClass('account-button-info-detail')
                .add(this.user$.dot('businessName'))
              .end()
              .start()
                .addClass('account-button-info-detail-small')
                .add(this.agent$.dot('firstName'))
              .end()
            .end()
            .start({
              class: 'foam.u2.tag.Image',
              data: 'images/ic-arrow-right.svg'
            })
              .style({ 'vertical-align': 'middle' })
            .end()
            .on('click', () => {
              this.tag({ class: 'net.nanopay.sme.ui.AccountProfileView' });
            })
          .end()
          .start()
            .addClass('divider-line')
          .end()
          .tag({ class: 'net.nanopay.sme.ui.QuickActionView' })
          .start()
            .addClass('divider-line-2')
          .end()
          .select(this.dao, function(menu) {
            return this.E()
              .call(function() {
                this
                  .start()
                    .attrs({name: menu.label})
                    .addClass('sme-sidenav-item-wrapper')
                    .enableClass('active-menu', self.currentMenu$.map((currentMenu) => {
                      return currentMenu != null && currentMenu.id === menu.id;
                    }))
                    .on('click', function() {
                      self.pushMenu(menu.id);
                    })
                    .start('img')
                      .addClass('icon')
                      .attr('src', menu.icon)
                    .end()
                    .start('a')
                      .addClass('menu-item')
                      .addClass('sme-noselect')
                      .add(menu.label)
                    .end()
                  .end();
              });
          })
        .end();
    }
  ]
});
