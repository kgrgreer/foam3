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

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      background-color: #f9fbff;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      text-align: center;
    }
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
      margin-bottom: 8px;
    }
    ^sme-side-block {
      display: inline-block;
      width: 200px;
      height: 100vh;
      vertical-align: top;
      text-align: center;
    }
    ^sme-left-side-block {
      text-align: left;
    }
    ^sme-right-side-block {
      text-align: right;
    }
    ^sme-middle-block {
      display: inline-block;
      width: 504px;
      height: 100vh;
      text-align: left;
    }
    ^button {
      margin-top: 56px;
      cursor: pointer;
    }
    ^header {
      margin-top: 45px;
    }
    ^current-signin {
      display: inline-block;
      color: #8e9090;
      margin-bottom: 20px;
    }
    ^current-signin-email {
      display: inline-block;
      color: #2b2b2b;
    }
    ^horizontal-flip {
      -moz-transform: scale(-1, 1);
      -webkit-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
    ^inline-block {
      display: inline-block;
    }
  `,

  methods: [
    function initE() {
      var self = this;

      this.start().addClass(this.myClass())
        .start().addClass(this.myClass('sme-side-block'))
        .addClass(this.myClass('sme-left-side-block'))
          .start().addClass(this.myClass('button'))
            .start()
              .addClass(this.myClass('horizontal-flip'))
              .addClass(this.myClass('inline-block'))
              .add('➔')
            .end()
            .add('\nGo back')
            .on('click', () => {
              this.stack.back();
            })
          .end()
        .end()

        .start().addClass(this.myClass('sme-middle-block'))
          .start('h2').addClass(this.myClass('header'))
            .add('Select a company')
          .end()

          .start('div').addClass(this.myClass('current-signin'))
            .add('You are currently signed in as ')
            .start('div').addClass(this.myClass('current-signin-email'))
              .add(this.user.email)
            .end()
          .end()
          .start()
            .select(this.user.entities.junctionDAO$proxy.where(
                this.EQ(this.UserUserJunction.SOURCE_ID, this.user.id)
              ), function(junction) {
                var business;
                self.businessDAO.find(junction.targetId).then((result) => {
                  business = result;
                });

              return this.E()
                .start({
                  class: 'net.nanopay.sme.ui.BusinessRowView',
                  data: junction
                }).addClass('sme-business-row-item')
                .on('click', () => {
                  self.agentAuth.actAs(self, business);
                  window.location.reload();
                })
              .end();
            })
          .end()
        .end()

        .start().addClass(this.myClass('sme-right-side-block'))
          .addClass(this.myClass('sme-side-block'))
          .start().addClass(this.myClass('button'))
            .add('Sign out')
            .on('click', () => {
              this.stack.push({ class: 'foam.nanos.auth.SignOutView' });
            })
          .end()
        .end()
      .end();
    }
  ]

});
