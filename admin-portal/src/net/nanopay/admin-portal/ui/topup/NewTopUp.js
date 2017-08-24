foam.CLASS({
  package: 'net.nanopay.admin.ui.topup',
  name: 'NewTopUp',
  extends: 'foam.u2.View',

  methods: [
    function initE() {
      this.SUPER();

      this
        .tag({
          class: 'net.nanopay.common.ui.PopUpView',
          title: 'Topup',
          messageView: this.TopUpMessageView
        });
    }
  ],

  classes: [
    {
      name: 'TopUpMessageView',
      extends: 'foam.u2.View',

      axioms: [
        foam.u2.CSS.create({
          code: `
          ^ .Next-Button {
            margin-top: -35px;
          }

          ^ .go-to-bank-acct {
            display: inline-block;
            float: left;
            padding-left: 20px;
            margin-top: 20;
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
          .start().addClass('input-container')
            .start('p').addClass('pDefault').add('Bank Account').end()
            .start('select')
              // TODO Populate verified bank accounts from DAO
              .start('option', { value: 'TD Investing'}).add('TD Investing').end()
              .start('option', { value: 'BMO Investing'}).add('BMO Investing').end()
              .addClass('input-Box')
          .end()
          .start().addClass('input-container')
            .start('p').addClass('pDefault').add('Amount').end()
            .start('input').addClass('input-Box').end()
          .end()
          .start().addClass('Button-Container')
            .start().add('Go to Bank Account').addClass('go-to-bank-acct').end()
            .start().addClass('Button').addClass('Next-Button').add('Next').end()
          .end();
        }
      ]
    }
  ]
})
