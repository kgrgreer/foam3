foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount',
  name: 'DeleteVerifyModal',
  extends: 'foam.u2.Controller',

  documentation: 'Pop up modal for verifying or deleting a bank account',

  imports: [ 'closeDialog' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 448px;
          height: 288px;
          margin: auto;
        }
        ^ .deleteVerifyContainer {
          width: 448px;
          height: 288px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
          position: relative;
        }
        ^ .popUpHeader {
          width: 448px;
          height: 40px;
          background-color: #093649;
        }
        ^ .popUpTitle {
          width: 198px;
          height: 40px;
          font-family: Roboto;
          font-size: 14px;
          line-height: 40.5px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #ffffff;
          margin-left: 20px;
          display: inline-block;
        }
        ^ .net-nanopay-ui-ActionView-closeButton {
          width: 24px;
          height: 24px;
          margin: 0;
          margin-top: 7px;
          margin-right: 20px;
          cursor: pointer;
          display: inline-block;
          float: right;
          outline: 0;
          border: none;
          background: transparent;
          box-shadow: none;
        }
        ^ .net-nanopay-ui-ActionView-closeButton:hover {
          background: transparent;
          background-color: transparent;
        }
        ^ .net-nanopay-ui-ActionView-deleteButton {
          font-family: Roboto;
          width: 136px;
          height: 40px;
          position: static;
          background: rgba(164, 179, 184, 0.1);
          border-radius: 2px;
          border: solid 1px #ebebeb;
          display: inline-block;
          color: #093649;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          margin: 0;
          outline: none;
          float: left;
          box-shadow: none;
          font-weight: normal;
        }
        ^ .net-nanopay-ui-ActionView-deleteButton:hover {
          background: lightgray;
        }
        ^ .net-nanopay-ui-ActionView-verifyButton {
          font-family: Roboto;
          width: 136px;
          height: 40px;
          position: static;
          border-radius: 2px;
          background: #59a5d5;
          border: solid 1px #59a5d5;
          display: inline-block;
          color: white;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          margin: 0;
          outline: none;
          float: right;
          box-shadow: none;
          font-weight: normal;
        }
        ^ .net-nanopay-ui-ActionView-verifyButton:hover {
          background: #3783b3;
          border-color: #3783b3;
        }
      */}
    })
  ],

  properties: [],

  messages: [
    { name: 'Title', message: 'Delete/Verify' },
    { name: 'Description', message: 'Please select if you would like to delete or verify your account.'}
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
      .start()
        .start().addClass('deleteVerifyContainer')
          .start().addClass('popUpHeader')
          .start().add(this.Title).addClass('popUpTitle').end()
          .add(this.CLOSE_BUTTON)
        .end()
        .start().add(this.Description).end()
        .start().addClass('modal-button-container')
          .add(this.DELETE_BUTTON)
          .add(this.VERIFY_BUTTON)
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'verifyButton',
      label: 'Verify',
      code: function(X) {

      }
    },
    {
      name: 'deleteButton',
      label: 'Delete',
      code: function(X) {

      }
    }
  ]
})