foam.CLASS({
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupSuccessView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Success screen after set up',

  imports: [
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 480px;
          background: #35c38d;
        }
        ^ .success-view-div {
          padding-top: 70px;
          padding-left: 36px;
        }
        ^ .success-icon img {
          height: 76px;
          width: 76px;
        }
        ^ .success-message {
          font-family: Roboto;
          font-size: 32px;
          font-weight: 300;
          text-align: left;
          padding-top: 30px;
        }
        ^ .success-button-wrapper {
          padding-top: 50px;
        }
        ^ .success-next-button {
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
    { name: 'provisionSuccess', message: 'Your device has been successfully provisioned!' },
    { name: 'provisionButton', message: 'Start accepting payments! >>' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div')
          .addClass('success-view-div')
          .start('div')
            .addClass('success-icon')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-success.png' })
          .end()
          .start()
            .addClass('success-message')
            .add(this.provisionSuccess)
          .end()
          .start('div').addClass('success-button-wrapper')
            .start('button').addClass('success-next-button')
              .add(this.provisionButton)
              .on('click', this.onNextClicked)
            .end()
          .end()
        .end();
    }
  ],

  listeners: [
    function onNextClicked (e) {
      this.stack.push({ class: 'net.nanopay.merchant.ui.HomeView' });
    }
  ]
})