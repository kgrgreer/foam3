
foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount.error',
  name: 'BankAccountErrorView',
  extends: 'foam.u2.View',

  methods: [
    function initE() {
      this.SUPER();

      this
        .tag({
          class: 'foam.u2.view.PopUpTitledView',
          title: 'Error',
          messageView: this.ErrorMessageView
        });
    }
  ],

  classes: [
    {
      name: 'ErrorMessageView',
      extends: 'foam.u2.View',

      axioms: [
        foam.u2.CSS.create({
          code: `
          ^ .Try-Again-Button{
            margin-top: 20px;
            margin-left: 165px;
            margin-right:147px;
            margin-bottom: 20px;
            bottom: 0;
          }

          ^ .fail-Image{
            margin-left: 35px;
            margin-top: 15px;
            float: left;
          }

          ^ .mainMessage-Text {
            top: 30;
            position: relative;
            margin-top: 0;
          }
        `
        })
      ],

      messages: [
        {
          name: 'Error',
          message: 'Sorry, we couldn\'t find the action because of Internet connection. Please try again.'
        }
      ],

      methods: [
        function initE(){
        this.SUPER();
        var self = this;

        this
          .addClass(this.myClass())
          .start()
            .start({class:'foam.u2.tag.Image', data: 'images/fail-30.svg'})
              .addClass('fail-Image')
            .end()
            .start().addClass('mainMessage-Text')
              .add(this.Error)
            .end()
          .end()
          .start()
            .addClass('Button')
            .addClass('Try-Again-Button')
            .add('Try Again')
          .end()
        }
      ]
    }
  ]
})
