foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount.dropdown',
  name: 'ChangeAccountNameView',
  extends: 'foam.u2.View',

  methods: [
    function initE() {
      this.SUPER();

      this
        .tag({
          class: 'net.nanopay.common.ui.PopUpView',
          title: 'Change Name',
          messageView: this.ChangeAccountNameMessageView
        });
    }
  ],

  classes: [
    {
      name: 'ChangeAccountNameMessageView',
      extends: 'foam.u2.View',

      axioms: [
        foam.u2.CSS.create({
          code: `
          ^ .input-Box {
            margin-top: 22px;
          }
        `
        })
      ],

      methods: [
        function initE(){
          this.SUPER();
          var self = this;

          this
            .addClass(this.myClass())
            .start('input').addClass('input-Box').end()
            .start().addClass('Button-Container')
              .start().addClass("cancel-Button").add('Cancel')
                .on('click', function(){self.closeDialog()})
              .end()
              .start().addClass('Button').add('Update').end()
            .end();
        }
      ]
    }
  ]
})
