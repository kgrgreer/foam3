
foam.CLASS({
  package: 'net.nanopay.admin.ui.topup',
  name: 'NewTopUp',
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
        height: 288px;
        border-radius: 2px;
        background-color: #ffffff;
      }

      ^ .Change-Container{
        width: 448px;
        height: 40.5px;
        background-color: #14375d;
      }

      ^ .Change-Text{
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
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-algin: left;
        color: #093649;
        margin-left: 20px;
        margin-top: 19.5px;
        margin-right: 64px;
        margin-bottom: 10px;
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
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(!64, 179, 184, 0.5);
        margin-left: 20px;
        margin-right: 20px;
        padding-left: 5px;
        padding-right: 5px;
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.2px;
        font-family: Roboto;
        color: #093649;
        text-align: left;
      }

      ^ .Update-Button{
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
        margin-bottom: 20px;
        float: left;
      }

      ^ .Button-Container{
        margin: 0;
        margin-top: 20px;
        padding: 0;
        overflow: hidden;
      }

      ^ .cancel-Button{
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: rgba(164, 179, 184, 0.1);
        box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
        cursor: pointer;
        text-align: center;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        margin-top: 5px;
        margin-left: 20px;
        margin-bottom: 20px;
        position: fixed;
      }

      ^ .input-container{
        margin-top: 20px;
      }

      ^ .pDefault {
        margin-bottom: 8px;
        margin-top: 0;
        margin-left: 20px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
      }
    */}
    })
  ],

  methods: [
    function initE(){
    this.SUPER();
    var self = this;

    this
    .addClass(this.myClass())
      .start()
        .start().addClass('Message-Container')
          .start().addClass('Change-Container')
            .start().addClass('Change-Text').add("Topup").end()
            .start({class:'foam.u2.tag.Image', data: 'images/ic-cancelwhite.svg'}).addClass('close-Button')
              .on('click', function(){self.closeDialog()})
            .end()
          .end()
          .start().addClass('input-container')
            .start('p').addClass('pDefault').add('Bank Account').end()
            .start('input').addClass('input-Box').end()
          .end()
          .start().addClass('input-container')
            .start('p').addClass('pDefault').add('Amount').end()
            .start('input').addClass('input-Box').end()
          .end()
          .start().addClass('Button-Container')
            .start().add('Go to Bank Account').end()
            .start().addClass('Update-Button').add('Update').end()
          .end()
        .end()
      .end()
    }
  ]
})
