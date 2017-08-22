
foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount.error',
  name: 'BankAccountErrorView',
  extends: 'foam.u2.View',

  imports: [
    'stack',
    'closeDialog'
  ],

  documentation: 'Pop Up Demo',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      ^{
        width: 448px;
        margin: auto;
      }

      ^ .Message-Container{
        width: 448px;
        height: 200px;
        border-radius: 2px;
        background-color: #ffffff;
        position: relative;
      }

      ^ .Error-Container{
        width: 448px;
        height: 40.8px;
        background-color: #093649;
      }

      ^ .Error-Text{
        width: 100;
        height: 40px;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: left;
        color: #ffffff;
        margin-left: 19px;
        display: inline-block;
      }

      ^ .mainMessage-Text{
        width: 280px;
        height: 32px;
        font-family: Roboto;
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.3px;
        line-height: 1.33;
        color: #093649;
        float: right;
        margin-top: 34.5px;
        margin-right: 63px;
      }

      ^ .close-Button{
        width: 24px;
        height: 24px;
        margin-top: 8.5px;
        margin-right: 16px;
        float: right;
        cursor: pointer;
      }

      ^ .input-Box{
        width: 408px;
        height: 60px;
        backgroud-color: #ffffff;
        border: solod 1px rgba(!64, 179, 184, 0.5);
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 20px;
        padding-left: 5px;
        padding-right: 5px;
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.2px;
        font-family: Roboto;
        color: #093649;
        text-align: left;
      }

      ^ .Try-Again-Button{
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: #5e91cb;
        cursor: pointer;
        text-align: center;
        color: #ffffff;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        margin-top: 33px;
        margin-left: 165px;
        margin-right:147px;
        margin-bottom: 20px;
        position: absolute;
        bottom: 0;
      }

      ^ .fail-Image{
        margin-left: 35px;
        margin-top: 15px;
      }

      ^ .mainMessage-Container{
        padding: 0;
        margin: 0 auto;
        overflow: auto;
      }
    */}
    })
  ],

  messages: [
    { name: 'Error', message: 'Sorry, we couldn\'t find the action because of Internet connection. Please try again.'}
  ],

  methods: [
    function initE(){
    this.SUPER();
    var self = this;

    this
    .addClass(this.myClass())
      .start()
        .start().addClass('Message-Container')
          .start().addClass('Error-Container')
            .start().addClass('Error-Text').add("Error").end()
            .start({class:'foam.u2.tag.Image', data: 'images/ic-cancelwhite.svg'}).addClass('close-Button')
              .on('click', function(){self.closeDialog()})
            .end()
          .end()
          .start().addClass("mainMessage-Container").addClass('row')
            .start({class:'foam.u2.tag.Image', data: 'images/fail-30.svg'}).addClass('fail-Image').end()
            .start().addClass('mainMessage-Text')
              .add(this.Error)
            .end()
          .end()
          .start().addClass('Try-Again-Button').add('Try Again').end()
        .end()
      .end()
    }
  ]
})
