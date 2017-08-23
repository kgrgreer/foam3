foam.CLASS({
  package: 'net.nanopay.admin.ui.settings',
  name: 'PopUp',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'stack'
  ],

  documentation: 'Approve Pop Up View',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      ^{
        width: 1000px;
        margin: auto;
      }

      ^ button{
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: #5e91cb;
        cursor: pointer;
        text-align: center;
        color: #ffffff;
        font-family: Roboto;
        font-size: 14px;
        letter-spacing: 0.2px;
        padding-bottom: 5px;
        margin-top: 300px;
        margin-left: 50px;
        display: inline-block;
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

        .start('button')
          .add('Error')
          .on('click', this.bankAccountErrorPopup)
        .end()

        .start('button')
          .add('Change Account')
          .on('click', this.changeAccountNamePopup)
        .end()

        .start('button')
          .add('Delete Account')
          .on('click', this.deleteBankAccountPopup)
        .end()

        .start('button')
          .add('New Top Up')
          .on('click', this.newTopUp)
        .end()

      .end()
    }
  ],
  
  listeners: [
    function bankAccountErrorPopup() {
      this.add(this.Popup.create().tag({class: 'net.nanopay.admin.ui.settings.bankAccount.error.BankAccountErrorView'}));
    },

    function changeAccountNamePopup() {
      this.add(this.Popup.create().tag({class: 'net.nanopay.admin.ui.settings.bankAccount.dropdown.ChangeAccountNameView'}));
    },

    function deleteBankAccountPopup() {
      this.add(this.Popup.create().tag({class: 'net.nanopay.admin.ui.settings.bankAccount.dropdown.DeleteBankAccountView'}));
    },

    function newTopUp() {
      this.add(this.Popup.create().tag({class: 'net.nanopay.admin.ui.topup.NewTopUp'}));
    }
  ]
})
