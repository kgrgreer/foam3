foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'QuickActionView',
  extends: 'foam.u2.View',

  documentation: 'Quick action view',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'menuDAO',
    'pushMenu'
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
      var self = this;
      var dao = this.menuDAO
        .orderBy(this.Menu.ORDER)
        .where(this.STARTS_WITH(this.Menu.ID, 'sme.quickAction'));

      this
        .start()
          .addClass('quick-actions')
          .select(dao, function(menu) {
            return this.E()
              .addClass('sme-quick-action-wrapper')
              .call(function() {
                this
                  .start()
                    .addClass((menu.label).replace(/[^\w]/g,'').toLowerCase())
                    .start('img')
                      .addClass('icon')
                      .attr('src', menu.icon)
                    .end()
                    .start('a')
                      .addClass('menu-item')
                      .addClass('sme-noselect')
                      .add(menu.label)
                    .end()
                    .on('click', () => {
                      self.quickActionRedirect(menu);
                    })
                  .end();
              });
          })
        .end();
    }
  ],

  listeners: [
    function quickActionRedirect(menu) {
      var checkAndNotifyAbility;

      var checkAndNotifyAbility = menu.id === 'sme.quickAction.send' ?
        this.checkAndNotifyAbilityToPay :
        this.checkAndNotifyAbilityToReceive;

      checkAndNotifyAbility().then((result) => {
        if ( result ) {
          this.pushMenu(menu.id);
        }
      });
    }
  ]
});
