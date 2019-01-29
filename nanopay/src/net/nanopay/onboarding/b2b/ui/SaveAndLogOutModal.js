
foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'SaveAndLogOutModal',
  extends: 'foam.u2.Controller',

  documentation: 'B2B Onboarding Log Out Modal',

  imports: [
    'closeDialog',
    'logOutHandler?'
  ],

  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
    }

    ^ .content {
      padding: 20px;
      margin-top: -20px;
    }

    ^ .description {
      font-size: 12px;
      text-align: center;
      margin-bottom: 60px;
    }

    ^ .net-nanopay-ui-ActionView {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      overflow: hidden;
      zoom: 1;
    }

    ^ .net-nanopay-ui-ActionView-logOut {
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
    }

    ^ .net-nanopay-ui-ActionView-logOut:hover,
    ^ .net-nanopay-ui-ActionView-logOut:focus {
      background-color: rgba(164, 179, 184, 0.3);
    }

    ^ .rightContainer {
      display: inline-block;
      float:right;
    }

    ^ .net-nanopay-ui-ActionView-cancel {
      width: 73px;
      color: #59a5d5;
      margin-right: 5px;
      border: none;
      background-color: transparent;
      box-shadow: none;
    }

    ^ .net-nanopay-ui-ActionView-cancel:hover,
    ^ .net-nanopay-ui-ActionView-cancel:focus {
      border-radius: 2px;
      background-color: rgba(89, 165, 213, 0.3);
    }

    ^ .net-nanopay-ui-ActionView-saveAndLogOut {
      background-color: #59a5d5;
      color: white;
    }

    ^ .net-nanopay-ui-ActionView-saveAndLogOut:hover,
    ^ .net-nanopay-ui-ActionView-saveAndLogOut:focus {
      background-color: #357eac;
    }
  `,

  messages: [
    { name: 'Description', message: 'Are you sure you want to logout? Any unsaved data will be lost.' }
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .tag(this.ModalHeader.create({ title: 'Log Out' }))

        .start('div').addClass('content')
          .start('p').addClass('description').add(this.Description).end()
          .start('div')
            .start(this.LOG_OUT).end()
            .start('div').addClass('rightContainer')
              .start(this.CANCEL).end()
              .start(this.SAVE_AND_LOG_OUT).end()
            .end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'logOut',
      code: function(X) {
        X.logOutHandler && X.logOutHandler(0);
        X.closeDialog();
      }
    },
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'saveAndLogOut',
      code: function(X) {
        X.logOutHandler && X.logOutHandler(1);
        X.closeDialog();
      }
    }
  ]
});
