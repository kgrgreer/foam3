foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount',
  name: 'ManageAccountModal',
  extends: 'foam.u2.Controller',

  documentation: 'Pop up modal for verifying or deleting a bank account',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.model.BankAccount'
  ],

  imports: [
    'bankAccountDAO', 
    'closeDialog', 
    'manageAccountNotification',
    'selectedAccount',
    'verifyAccount',
    'user'  
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 448px;
          height: 200px;
          margin: auto;
        }
        ^ .deleteVerifyContainer {
          width: 448px;
          height: 200px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
          position: relative;
        }
        ^ .popUpHeader {
          width: 448px;
          height: 40px;
          background-color: %PRIMARYCOLOR%;
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
          width: 136px;
          height: 40px;
          background: rgba(164, 179, 184, 0.1);
          border: solid 1px #ebebeb;
          display: inline-block;
          color: #093649;
          margin: 0;
          float: left;
        }
        ^ .net-nanopay-ui-ActionView-deleteButton:hover {
          background: lightgray;
        }
        ^ .net-nanopay-ui-ActionView-verifyButton {
          width: 136px;
          height: 40px;
          background: %SECONDARYCOLOR%;
          border: solid 1px %SECONDARYCOLOR%;
          display: inline-block;
          color: white;
          margin: 0;
          outline: none;
          float: right;
        }
        ^ .net-nanopay-ui-ActionView-verifyButton:hover {
          background: %SECONDARYCOLOR%;
          border-color: %SECONDARYCOLOR%;
          opacity: 0.9;
        }
        ^ .net-nanopay-ui-ActionView-toggleDefaultButton {
          position: relative;
          bottom: 41;
          width: 136px;
          height: 40px;
          background: %SECONDARYCOLOR%;
          border: solid 1px %SECONDARYCOLOR%;
          display: inline-block;
          color: white;
          margin: 0;
          outline: none;
          float: right;
        }
        ^ .net-nanopay-ui-ActionView-toggleDefaultButton:hover {
          background: %SECONDARYCOLOR%;
          border-color: %SECONDARYCOLOR%;
          opacity: 0.9;
        }
        ^ .descriptionStyle {
          text-align: center;
          margin-top: 45px;
        }
        ^ .button-container {
          width: 344px;
          height: 40px;
          position: absolute;
          bottom: 0;
          padding-left: 52px;
          padding-right: 52px;
          margin-bottom: 20px;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'userVerifiedAccounts',
      factory: function() {
        return this.bankAccountDAO.where(
          this.AND(
            this.EQ(this.BankAccount.OWNER, this.user.id),
            this.EQ(this.BankAccount.STATUS, "Verified")
          )
        );
      }
    }
  ],

  messages: [
    { name: 'Title', message: 'Manage Account' },
    { name: 'Description', message: 'Please select an option to manage your bank account.' }
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
        .start().add(this.Description).addClass('descriptionStyle').end()
        .start().addClass('button-container')
          .add(this.DELETE_BUTTON)
          .add(this.VERIFY_BUTTON)
          .add(this.TOGGLE_DEFAULT_BUTTON)
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
      isAvailable: function() {
        var self = this;
        return self.selectedAccount.status == 'Unverified';
      },
      code: function(X) {
        X.closeDialog();
        X.verifyAccount();
      }
    },
    {
      name: 'toggleDefaultButton',
      label: 'Toggle Default',
      isAvailable: function() {
        var self = this;
        return self.selectedAccount.status == "Verified"
      },
      code: function(X) {
        var self = this;
        if ( ! X.selectedAccount.setAsDefault ) {
          self.userVerifiedAccounts.select().then( function(a) {
            a.array.forEach( function(t) { 
              t.setAsDefault = false;
              X.bankAccountDAO.put(t).then(function(response) {
                X.selectedAccount.setAsDefault = true;
                X.bankAccountDAO.put(X.selectedAccount).then(function(response) {
                  X.manageAccountNotification('Bank account successfully set as default.', '');
                  X.closeDialog();
                }); 
              });
            });
          }).catch(function(error) {
            X.manageAccountNotification(error.message, 'error');
          });
        } else {
          X.selectedAccount.setAsDefault = false;
          X.bankAccountDAO.put(X.selectedAccount).then(function(response) {
            X.manageAccountNotification('Bank account removed as default.', '');
            X.closeDialog();
          }).catch(function(error) {
            X.manageAccountNotification(error.message, 'error');
          });
        }
      }
    },
    {
      name: 'deleteButton',
      label: 'Delete',
      confirmationRequired: true,
      isAvailable: function() {
        var self = this;
        return self.selectedAccount.status != 'Unverified';
      },
      code: function(X) {
        var self = this;
        X.bankAccountDAO.remove(X.selectedAccount).then(function(response) {
          X.manageAccountNotification('Bank account successfully deleted', '');
          X.closeDialog();
        }).catch(function(error) {
          X.manageAccountNotification(error.message, 'error');
        });
      }
    }
  ]
});