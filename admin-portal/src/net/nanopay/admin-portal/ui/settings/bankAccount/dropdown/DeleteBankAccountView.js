
foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount.dropdown',
  name: 'DeleteBankAccountView',
  extends: 'foam.u2.View',

methods: [
    function initE() {
      this.SUPER();

      this
        .tag({
          class: 'foam.u2.view.PopUpTitledView',
          title: 'Delete Account',
          messageView: this.DeleteBankAccountMessageView
        });
    }
  ],

  classes: [
    {
      name: 'DeleteBankAccountMessageView',
      extends: 'foam.u2.View',

      axioms: [
        foam.u2.CSS.create({
          code: `
        `
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
          .start().addClass('mainMessage-Text').add(this.Instructions).end()
          .start().addClass('Button-Container')
            .start()
              .addClass('cancel-Button')
              .add('Cancel')
            .end()
            .start()
              .addClass('Button')
              .add('Delete')
            .end()
          .end()
        },

        function delete_Account(){

        }
      ]
    }
  ]
})
