foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksFailForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'form',
    'isConnecting',
    'rollBackView'
  ],

  css: `
    ^ {
      padding-left: 2px;
      width: 497px;
    }
    ^ .net-nanopay-ui-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }
    ^ .net-nanopay-ui-ActionView-closeButton {
      float: left;
      margin: 0;
      outline: none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      margin-right: 40px;
      margin-left: 1px;
    }
  `,

  messages: [
    { name: 'Step', message: 'Error: Please try again later' }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.complete = true;
    },

    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitleFlinks')
          .add(this.Step)
        .end()
        .start('div').style({ 'margin-top': '15px', 'height': '40px' })
          .tag(this.CLOSE_BUTTON)
        .end()
        .start('div').style({ 'clear': 'both' }).end();
    }
  ],

  actions: [
    {
      name: 'closeButton',
      label: 'Cancel',
      code: function(X) {
        X.form.stack.back();
      }
    }
  ]

});
