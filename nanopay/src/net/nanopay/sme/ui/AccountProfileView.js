foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AccountProfileView',
  extends: 'foam.u2.View',

  documentation: 'Account profile view',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'menuDAO'
  ],

  requires: [
    'foam.nanos.menu.Menu',
  ],

  css: `
    {
      margin-left: 200px;
      background: white;
    }
    ^ .account-profile-menu {
      width: 252px !important;
      background-color: white;
      padding: 12px 0px;
      position: absolute;
      z-index: 900;
      margin-left: 28px;
      margin-top: 8px;
      border-radius: 3px;
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
    }
    ^ .account-profile-menu::before {
        width: 0; 
        height: 0; 
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent; 
        border-right:10px solid blue; 
        z-index: 999;
    }
    ^ .account-profile-item {
      padding: 8px 24px;
      font-size: 16px;
      line-height: 24px;
    }
    ^ .account-profile-item:hover {
      background: #f3f2ff;
      color: #604aff;
    }
    ^ .account-profile-items-detail {
      font-size: 10px;
      line-height: 15px;
      color: #8e9090;
      margin-bottom: 0px;
      margin-top: 1px;
    }
    ^ .sign-out {
      margin-left: 5px;
    }
    ^ .account-profile-item:hover {
      cursor:pointer;
    }
    ^background {
      bottom: 0;
      left: 0;
      opacity: 0.4;
      right: 0;
      top: 0;
      position: fixed;
      z-index: 850;
    }
  `,

  methods: [
    function initE() {
      var dao = this.menuDAO.orderBy(this.Menu.ORDER)
          .where(this.STARTS_WITH(this.Menu.ID, 'sme.accountProfile'));

      var self = this;
      this.addClass(this.myClass())
        .start().addClass('account-profile-menu')
          .select(dao, function(menu) {
            return this.E().addClass('account-profile-item').call(function() {
              this.start('a').addClass('sme-noselect')
                .add(menu.label)
                .start('p').addClass('account-profile-items-detail')
                  .add(menu.description)
                .end()
              .end();
            }).on('click', function() {
              self.remove();
              menu.launch_(self.__context__, self);
            });
          })
        .end()
        .start()
          .addClass(this.myClass('background'))
          .on('click', this.close)
        .end()
      .end();
    }
  ],

  listeners: [
    function close() {
      this.remove();
    }
  ]
});
