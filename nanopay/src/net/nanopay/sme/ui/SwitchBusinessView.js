foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SwitchBusinessView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.UserUserJunction'
  ],

  imports: [
    'agentAuth',
    'businessDAO',
    'stack',
    'user'
  ],

  properties: [
    'business'
  ],

  css: `
    ^sme-business-choice {
      width: 500px;
    }
    ^ .sme-business-row-item {
      width: 504px;
      height: 80px;
      border-radius: 3px;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: solid 1px #e2e2e3;
      background-color: #ffffff;
    }
  `,

  methods: [
    function initE() {
      var self = this;

      this.start().addClass('block')
        .start()
          .add('Go back')
          .on('click', () => {
            this.stack.back();
          })
        .end()
        .start('h2').add('Select a company').end()
        .start('p').add(`You are currently signed in as ${this.user.email}`)
        .start()
          .add('Logout')
          .on('click', () => {
            this.stack.push({ class: 'foam.nanos.auth.SignOutView' });
          })
        .end()
        .start().addClass(this.myClass('sme-business-choice'))
          .select(this.user.entities.junctionDAO$proxy.where(
              this.EQ(this.UserUserJunction.SOURCE_ID, this.user.id)
            ), function(junction) {
              self.businessDAO
                .find(junction.targetId).then((business) => {
                  self.business = business;
                });
              
            return this.E()
              .start({
                class: 'net.nanopay.sme.ui.BusinessRowView',
                data: junction
              }).addClass('sme-business-row-item')
              .on('click', () => {
                self.agentAuth.actAs(self, self.business);
              })
            .end();
          })
        .end()
      .end();
    }
  ]

});
