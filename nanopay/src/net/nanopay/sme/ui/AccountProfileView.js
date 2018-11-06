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
      width: 150px;
      background-color: white;
      padding: 5px;
      position: absolute;
      z-index: 1200;
    }
    ^ .account-profile-item {
      margin: 10px 5px;
    }
    ^ .account-profile-items-detail {
      font-size: 10px;
      color: gray;
      margin-top: 5px;
      margin-bottom: 0px;
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
      z-index: 1100;
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
