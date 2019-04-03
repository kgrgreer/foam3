foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'ModalTitleBar',
  extends: 'foam.u2.View',

  documentation: 'Modal Title Bar that holds the title along with the back and close actions.',

  imports: [
    'subStack',
    'closeDialog'
  ],

  css: `
    ^ {
      padding: 16px 24px;
    }

    ^elementAlignment {
      /* Probably change to flexbox during refinement */
      display: inline-block;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isBackEnabled',
      expression: function(subStack) {
        console.log('>>>>>>>>>>>>>>>>>>>> ', subStack);
        return subStack.pos > 0;
      }
    },
    {
      class: 'String',
      name: 'title'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.PREVIOUS).addClass(this.myClass('elementAlignment')).show(this.isBackEnabled$).end()
        .start('p').addClass(this.myClass('elementAlignment')).add(this.title).end()
        .start(this.CLOSE_MODAL).addClass(this.myClass('elementAlignment')).end();
    }
  ],

  actions: [
    {
      name: 'previous',
      label: 'Back',
      code: function(X) {
        X.subStack.back();
      }
    },
    {
      name: 'closeModal',
      label: 'Close',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
