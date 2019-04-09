foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'ModalTitleBar',
  extends: 'foam.u2.Element',

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
      expression: function(subStack$pos) {
        return subStack$pos > 0;
      }
    },
    {
      class: 'Boolean',
      name: 'forceBackHidden'
    },
    {
      class: 'String',
      name: 'title'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.PREVIOUS, { data: this }).addClass(this.myClass('elementAlignment'))
          .show(this.isBackEnabled$)
          .hide(this.forceBackHidden$)
        .end()
        .start('p').addClass(this.myClass('elementAlignment')).add(this.title$).end()
        .start(this.CLOSE_MODAL).addClass(this.myClass('elementAlignment')).end();
    }
  ],

  actions: [
    {
      name: 'previous',
      label: 'Back',
      // TODO: There is a bug with this where the action does not hide itself.
      // isAvailable: function(forceBackHidden) {
      //   return ! forceBackHidden;
      // },
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
