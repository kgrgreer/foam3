foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'QuickActionView',
  extends: 'foam.u2.View',

  documentation: 'Quick action view',

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
  `,

  methods: [
    function initE() {
      var dao = this.menuDAO.orderBy(this.Menu.ORDER)
          .where(this.EQ(this.Menu.PARENT, 'quickAction'));

      this
        .start().addClass('quick-actions')
          .start().addClass('sme-noselect').style({ 'margin-left': '16px' })
            .add('Quick actions')
          .end()
          .select(dao, function(menu) {
            return this.E().addClass('account-profile-item').call(function() {
              var self = this;
              this.start('img')
              // Todo: replace the place holder images
                .addClass('icon').attr('src', 'images/connected-logo.png')
              .end()
              .start('a').addClass('menu-item').addClass('sme-noselect')
                .add(menu.label)
                .on('click', function() {
                  menu.launch_(self.__context__, self);
                })
              .end();
            });
          })
        .end();
    }
  ]

});
