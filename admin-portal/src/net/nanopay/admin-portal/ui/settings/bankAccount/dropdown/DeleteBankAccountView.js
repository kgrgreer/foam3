
foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount.dropdown',
  name: 'DeleteBankAccountView',
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
        height: 220px;
        border-radius: 2px;
        background-color: #ffffff;
        position: relative;
      }

      ^ .Delete-Container{
        width: 448px;
        height: 40.8px;
        background-color: #093649;
      }

      ^ .Delete-Text{
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
        height: 16px;
        font-family: Roboto;
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.2px;
        line-height: 1.33;
        color: #093649;
        margin-top: 39.5px;
        margin-bottom: 10px;
        text-align: center;
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

      ^ .Delete-Button{
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
        margin-top: 5px;
        margin-left: 293px;
        margin-right: 20px;

      }

      ^ .Button-Container{
        margin: 0;
        margin-bottom: 20px;
        padding: 0;
        overflow: hidden;
        position: absolute;
        bottom: 0;
      }

      ^ .Cancel-Button{
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: rgba(164, 179, 184, 0.1);
        box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
        margin-left: 20px;
        margin-top: 5px;
        text-align: center;
        position: fixed;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #093649;
      }


    */}
    })
  ],

  messages: [
    { name: 'Instructions', message: 'Do you want to delete the account name ***1234567'}
  ],

  methods: [
    function initE(){
    this.SUPER();
    var self = this;

    this
    .addClass(this.myClass())
      .start()
        .start().addClass('Message-Container')
          .start().addClass('Delete-Container')
            .start().addClass('Delete-Text').add("Delete Account").end()
            .start({class:'foam.u2.tag.Image', data: 'images/ic-cancelwhite.svg'}).addClass('close-Button')
              .on('click', function(){self.closeDialog()})
            .end()
          .end()
          .start().addClass('mainMessage-Text').add(this.Instructions).end()
          .start().addClass('Button-Container')
            .start()
              .addClass('Cancel-Button')
              .add('Cancel')
              .on('click', function(){self.closeDialog()})
            .end()
            .start()
              .addClass('Delete-Button')
              .add('Delete')
              .on('click', function(){self.delete_Account()})
            .end()
          .end()
        .end()
      .end()
    },

    function delete_Account(){

    }
  ]
})
