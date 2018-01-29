foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksFailForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'form',
    'isConnecting',
    'complete'
  ],

  css: `
    ^ {
      width: 497px;
    }

    ^ .net-nanopay-ui-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }

    ^ .net-nanopay-ui-ActionView-closeButton {
      float: left;
      margin: 0;
      outline: none;
      border:none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      background-color: #A93226;
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      color: #FFFFFF;
      margin-right: 40px;
    }
  `,

  messages: [
    { name: 'Step', message: 'Error: Please try again later'}
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
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').style({'margin-top' : '15px', 'height' : '40px'})
          .tag(this.CLOSE_BUTTON)
        .end()
        .start('div').style({'clear' : 'both'}).end();
    }
  ],

  actions: [
    {
      name: 'closeButton',
      label: 'Close',
      code: function(X) {
        X.form.goBack();
      }
    }
  ]

})