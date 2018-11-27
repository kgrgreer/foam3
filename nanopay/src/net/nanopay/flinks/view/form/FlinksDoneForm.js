foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksDoneForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  css: `
  ^ .net-nanopay-ui-ActionView-closeButton {
    margin-left: 264px;
    box-sizing: border-box;
    background-color: #59a5d5;
    outline: none;
    border:none;
    width: 136px;
    height: 40px;
    border-radius: 2px;
    font-size: 12px;
    font-weight: lighter;
    letter-spacing: 0.2px;
    color: #FFFFFF;
  }
  `,
  messages: [
    { name: 'Step', message: 'Step 6: You\'re all set! Connection is successful.' }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.nextLabel = 'See Accounts';
      if ( this.onComplete ) this.onComplete();
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
        .end();
    }
  ],
  actions: [
    {
      name: 'closeButton',
      label: 'Close',
      code: function(X) {
        this.onComplete ? this.onComplete(this.wizard) : X.form.stack.back();
      }
    },
  ]

});
