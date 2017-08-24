foam.CLASS({
  package: 'net.nanopay.admin.ui.topup',
  name: 'NewTopUp',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'activeView'
    }
  ],

  exports: [
    'TopUpFormMessageView',
    'TopUpConfirmMessageView',
    'TopUpSuccessMessageView',
    'activeView'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.activeView = this.TopUpFormMessageView;

      this
        .tag({
          class: 'net.nanopay.common.ui.PopUpView',
          title: 'Topup',
          messageView$: this.activeView$
        });
    }
  ],

  classes: [
    {
      name: 'TopUpFormMessageView',
      extends: 'foam.u2.View',

      imports: [
        'TopUpConfirmMessageView',
        'activeView'
      ],

      axioms: [
        foam.u2.CSS.create({
          code: `
          ^ {
            display: inline-block;
          }

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
            .start()
              .addClass('Button')
              .addClass('Next-Button')
              .add('Next')
              .on('click', () => self.activeView = self.TopUpConfirmMessageView)
            .end()
          .end();
        }
      ]
    },

    {
      name: 'TopUpConfirmMessageView',
      extends: 'foam.u2.View',

      imports: [
        'TopUpFormMessageView',
        'TopUpSuccessMessageView',
        'activeView'
      ],

      axioms: [
        foam.u2.CSS.create({
          code: `
          ^ .pDefault {
            display: inline-block;
          }

          ^ .summary-heading {
            display: inline-block;
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
          .start('div')
            .start('p').addClass('summary-heading').add('Bank Account').end()
            .start('p').addClass('pDefault').add('TD Investing').end()
          .end()
          .start('div')
            .start('p').addClass('summary-heading').add('Amount').end()
            .start('p')
              .addClass('pDefault')
              .style({ 'padding-left': '39px' })
              .add('$ 30000.00')
            .end()
          .end()
          .start().addClass('Button-Container')
            .start()
              .addClass('cancel-Button')
              .add('Back')
              .on('click', () => self.activeView = self.TopUpFormMessageView)
            .end()
            .start()
              .addClass('Button')
              .add('Top Up')
              .on('click', () => self.activeView = self.TopUpSuccessMessageView)
            .end()
          .end()
        }
      ]
    },
    {
      name: 'TopUpSuccessMessageView',
      extends: 'foam.u2.View',

      axioms: [
        foam.u2.CSS.create({
          code: `
          ^ {
            height: 250px;
          }

          ^ .OK-Button{
            margin-top: 160px;
            margin-left: 165px;
            margin-right:147px;
            margin-bottom: 20px;
          }

          ^ .success-Image{
            margin-left: 35px;
            margin-top: 15px;
            float: left;
          }

          ^ .mainMessage-Text {
            position: absolute;
            margin-top: 40;
            margin-left: 120;
            width: 300;
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
          .start()
            .start({class:'foam.u2.tag.Image', data: 'images/done-30.svg'})
              .addClass('success-Image')
            .end()
            .start()
              .addClass('mainMessage-Text')
              .add('You have successfully topped up $183.12.')
              .tag('br').tag('br').tag('br')
              .add('Please be advised that it will take around 2 business days for you to see the balance in the portal.')
              .tag('br').tag('br')
              .add('If you don\'t see your balance after 5 business days, please contact our advisor at xxx-xxx-xxxx.')
            .end()
          .end()
          .start()
            .addClass('Button')
            .addClass('OK-Button')
            .add('OK')
          .end()
        }
      ]
    }
  ]
})
