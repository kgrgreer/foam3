
foam.CLASS({
  package: 'net.nanopay.b2b.ui.modals',
  name: 'EmailModal',
  extends: 'foam.u2.View',

  documentation: 'Email Modal',

  requires: [
    'net.nanopay.b2b.ui.modals.ModalHeader'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      ^{
        width: 448px;
        margin: auto;
      }

      ^ .Email-Container{
        width: 448px;
        height: 40.8px;
        background-color: #093649;
      }

      ^ .Email-Text{
        width: 57px;
        height: 40px;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: left;
        color: #ffffff;
        margin-left: 19px;
        margin-right: 332px;
        display: inline-block;
      }

      ^ .eMailAdd-Text{
        width: 165px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        margin-left: 20px;
        margin-top: 19.5px;
        margin-right: 64px;
        margin-bottom: 10px;
      }

      ^ .note-Text{
        width: 31px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        margin-bottom: 8px;
        margin-left: 20px;
      }

      ^ .input-Box{
        width: 408px;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(!64, 179, 184, 0.5);
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

      ^ .noteInput-Box{
        width: 408px;
        height: 60px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 10px;
        margin-top: 5px;
        padding-left: 5px;
        padding-right: 5px;
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.2px;
        font-family: Roboto;
        color: #093649;
        text-align: left;
      }

      ^ .Confirm-Button{
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: #59aadd;
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
      }
    */}
    })
  ],
  
  methods: [
    function initE(){
      this.SUPER();
      var self = this;
          
      this
      .tag(this.ModalHeader.create({
        title: 'Email'
      }))
      .addClass(this.myClass())
      .start()
        .start().addClass('eMailAdd-Text').add("Email Address").end()
        .start('input').addClass('input-Box').end()
        .start().addClass('note-Text').add("Note").end()
        .start('input').addClass('noteInput-Box').end()
        .start().addClass('Confirm-Button').add('Confirm').end()
      .end()
    } 
  ]
})