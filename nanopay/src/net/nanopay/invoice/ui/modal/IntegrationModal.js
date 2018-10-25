
foam.CLASS({
  package: 'net.invoice.ui.modal',
  name: 'IntegrationModal',
  extends: 'foam.u2.Controller',

  documentation: 'Terms and Conditions Modal',

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  css: `
  ^{
    margin: auto;
    width: 509px;
    padding: 17px 18px 18px 28px;
  }
  ^ .labelContent {
    font-family: Roboto;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: #093649;
    min-height: 15px;
  }
  ^ .headerTitle{
    width: 510px;
    height: 33px;
    font-family: Avenir;
    font-size: 24px;
    font-weight: 900;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #333333;
  }
  ^ .integrationImgDiv{
    width: 152px;
    height: 77px;
    border: solid 1px #dce0e7;
    display: inline-block;
    margin: 25px 16px 15px 0px;
    position: relative;
    box-sizing: border-box;
    background-color: #d8d8d8;
    cursor: pointer;
  }
  ^ .integrationImg{
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }
  ^ .last-integrationImgDiv{
    margin-right: 0;
  }
  ^ .intergration-Input{
    width: 320px;
    height: 36px;
    border: solid 1px rgba(164, 179, 184, 0.5);
    display: inline-block;
    margin-right: 8px;
  }
  ^ .submit-BTN{
    width: 160px;
    height: 36px;
    border-radius: 4px;
    border: solid 1px #000000;
    background-color: #ffffff;
  }
  ^ .submit-BTN:hover{
    background-color: #a9a9a9;
    color: white;
  }
  ^ .inputLine{
    margin-top: 8px;
  }
  ^ .net-nanopay-ui-modal-ModalHeader .container {
    margin-bottom: 0px;
  }
  ^ .close{
    background: 0;
    width: 24px;
    height: 24px;
    margin-top: 5px;
    cursor: pointer;
    position: relative;
    float: right;
  }
  ^ .integrationText{
    text-align: center;
  }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
      .start()
      .addClass(this.myClass())
          .start('div').addClass('Container')
            .start('div')
              .start().addClass('headerTitle').add('Connect to your accounting software.')
                .start(this.CANCEL_BUTTON).addClass('close').end()
              .end()
              .start().addClass('integrationImgDiv')
                .on('click', this.signXero)
                .start()
                  .add('Xero').addClass('integrationText')
                .end()
              .end()
              .start().addClass('integrationImgDiv')
                .on('click', this.signXero)
                .start()
                  .add('QuickBooks').addClass('integrationText')
                .end()
              .end()
              .start().addClass('integrationImgDiv').addClass('last-integrationImgDiv')
                .on('click', this.signXero)
                .start()
                  .add('FreshBooks').addClass('integrationText')
                .end()
              .end()
            .end()
            // .start().addClass('labelContent').add('Can’t find your software? Tell us about it.').end()
            // .start().addClass('inputLine')
            //   .start('input').addClass('intergration-Input').end()
            //   .start(this.SUBMIT_BUTTON).addClass('submit-BTN').end()
            // .end()
          .end()
        .end()
      .end();
    },

  ],
  actions: [
    {
      name: 'cancelButton',
      icon: 'images/ic-cancel.svg',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'submitButton',
      label: 'Submit',
      code: function(X) {
        console.log('PUSH');
      }
    }
  ],
  listeners: [

    function signXero() {
      window.location = window.location.origin + '/service/xero?portRedirect=' + window.location.hash.slice(1);
    },
    function syncXero() {
      window.location = window.location.origin + '/service/xeroComplete?portRedirect=' + window.location.hash.slice(1);
    },
  ]
});
