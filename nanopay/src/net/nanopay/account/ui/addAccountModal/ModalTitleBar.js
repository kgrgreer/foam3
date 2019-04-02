foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'ModalTitleBar',
  extends: 'foam.u2.View',

  imports: [
    'subStack',
    'closeDialog'
  ],

  css: `
    ^ {
      padding: 16px 24px;
    }

    ^ .elementAlignment {
      /* Probably change to flexbox during refinement */
      display: inline-block;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'title'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.BACK).addClass(this.myClass('elementAlignment')).end()
        .start(this.title).addClass(this.myClass('elementAlignment')).end()
        .start(this.CLOSE).addClass(this.myClass('elementAlignment')).end();
    }
  ],

  actions: [
    {
      name: 'back',
      isAvailable: function(subStack) {
        return subStack.pos == 0
      },
      code: function(X) {
        X.subStack.pop();
      }
    },
    {
      name: 'close',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
