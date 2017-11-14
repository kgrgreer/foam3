foam.CLASS({
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupErrorView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Success screen after set up',

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 100%;
          height: 100%;
          background: #f55a5a;
          margin-top: -56px;
        }
        ^ .error-view-div {
          padding-top: 70px;
          padding-left: 36px;
        }
        ^ .error-icon img {
          height: 76px;
          width: 76px;
        }
        ^ .error-message {
          font-family: Roboto;
          font-size: 32px;
          font-weight: 300;
          text-align: left;
          padding-top: 30px;
        }
        ^ .error-button-wrapper {
          padding-top: 50px;
        }
        ^ .error-next-button {
          height: 20px;
          font-size: 16px;
          line-height: 1.25;
          text-align: center;
        }
      */}
    })
  ],

  properties: [
    ['header', false]
  ],

  messages: [
    { name: 'provisionError', message: 'Provision failed. Please try again.' },
    { name: 'provisionButton', message: 'Start again >>' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.document.addEventListener('keydown', this.onKeyPressed);
      this.onDetach(function () {
        self.document.removeEventListener('keydown', self.onKeyPressed);
      });

      this
        .addClass(this.myClass())
        .start('div')
          .addClass('error-view-div')
          .start('div')
            .addClass('error-icon')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-error.png' })
          .end()
          .start()
            .addClass('error-message')
            .add(this.provisionError)
          .end()
          .start('div').addClass('error-button-wrapper')
            .start('button').addClass('error-next-button')
              .add(this.provisionButton)
              .on('click', this.onNextClicked)
            .end()
          .end()
        .end();
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      var key = e.key || e.keyCode;
      if ( key === 'Backspace' || key === 'Enter' || key === 'Escape' ||
          key === 8 || key === 13 || key === 27 ) {
        this.stack.back();
      }
    },

    function onNextClicked (e) {
      this.stack.back();
    }
  ]
})