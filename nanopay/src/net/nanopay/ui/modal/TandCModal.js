
foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'TandCModal',
  extends: 'foam.u2.View',

  documentation: 'Terms and Condition Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
  ],
  
  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],
 
  css:`
    ^ .container{
      height: 600px;
      background-color: #093649;
      margin-bottom: 20px;
    }
    ^ .attachment-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }
    ^ .box-for-drag-drop {
      margin: 20px;
      border: dashed 4px #edf0f5;
      height: 300px;
      width: 560px;
      overflow: scroll;
    }

    ^ .dragText{
      text-align: center;
      padding: 120px 190px  0px 191px;
    }
    ^ .inputImage{
      height: 60px;
      opacity: 1;
      margin-bottom: 10px;
      margin-top: -60px;
    }
    ^ .inputText{
      width: 177px;
      height: 40px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.43;
      letter-spacing: 0.2px;
      text-align: center;
      color: #093649;
    }
    ^ .inputRestrictText{
      width: 480px;
      height: 16px;
      opacity: 0.7;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-left: -140px;
    }
    ^ .buttonBox{
      width: 100%;
      height: 8%;
    }
    ^ .net-nanopay-ui-modal-ModalHeader {
      width: 100%;
    } 
    ^ .net-nanopay-ui-ActionView-submitButton {
      font-family: Roboto;
      width: 136px;
      height: 40px;
      border-radius: 2px;
      background: %SECONDARYCOLOR%;
      border: solid 1px %SECONDARYCOLOR%;
      display: inline-block;
      color: white;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
      margin: 5px 20px 10px 0px;;
      outline: none;
      float: right;
      box-shadow: none;
      font-weight: normal;
    }
    ^ .net-nanopay-ui-ActionView-cancelButton {
      font-family: Roboto;
      width: 136px;
      height: 40px;
      border-radius: 2px;
      background: rgba(164, 179, 184, 0.1);
      border: solid 1px #8C92AC;
      display: inline-block;
      color: #093649;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
      margin: 5px 0px 10px 20px;;
      outline: none;
      float: left;
      box-shadow: none;
      font-weight: normal;
    }
  `,
  methods: [
    function initE(){
      this.SUPER();
      var self = this;
          
      this
      .tag(this.ModalHeader.create({
        title: 'Terms and Conditions'
      }))
      .addClass(this.myClass())
      .start()
      .end()
    } ,
  ],
});