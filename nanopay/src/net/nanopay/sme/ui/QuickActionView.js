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
          .where(this.STARTS_WITH(this.Menu.ID, 'sme.quickAction'));

      this
        .start().addClass('quick-actions')
          .select(dao, function(menu) {
            return this.E().addClass('sme-quick-action-wrapper').call(function() {
              var self = this;
              this.start()
                .start('img')
                  .addClass('icon').attr('src', menu.icon)
                .end()
                .start('a').addClass('menu-item').addClass('sme-noselect')
                  .add(menu.label)
                  .on('click', function() {
                    menu.launch_(self.__context__, self);
                  })
                .end()
              .end();
            });
          })
        .end();
    }
  ]

});
