foam.CLASS({
  package: 'net.nanopay.admin.ui.topup',
  name: 'NewTopUp',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'newTopUpActiveView'
    },
    {
      class: 'String',
      name: 'newTopUpBankAccount'
    },
    {
      class: 'Currency',
      name: 'newTopUpAmount'
    }
  ],

  exports: [
    'TopUpFormMessageView',
    'TopUpConfirmMessageView',
    'TopUpSuccessMessageView',
    'newTopUpActiveView',
    'newTopUpBankAccount',
    'newTopUpAmount'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.newTopUpActiveView = this.TopUpFormMessageView;

      this
        .tag({
          class: 'net.nanopay.common.ui.PopUpView',
          title: 'Topup',
          messageView$: this.newTopUpActiveView$
        });
    }
  ],

  classes: [
    {
      name: 'TopUpFormMessageView',
      extends: 'foam.u2.Controller',

      requires: [
        'foam.u2.view.TextField'
      ],

      imports: [
        'TopUpConfirmMessageView',
        'newTopUpActiveView',
        'newTopUpBankAccount',
        'newTopUpAmount'
      ],

      axioms: [
        foam.u2.CSS.create({
          code: `
          ^ {
            display: inline-block;
          }

          ^ .foam-u2-ActionView-next {
            margin-top: -35px;
          }

          ^ .foam-u2-ActionView-goToBankAccount {
            display: inline-block;
            float: left;
            padding-left: 20px;
            margin-top: 20;
            background: transparent;
            color: #5e91cb;
            width: auto;
            float: left;
            margin: 0;
            position: relative;
            top: 15;
            left: 5;
          }

          ^ .foam-u2-ActionView-goToBankAccount:hover {
            background: transparent;
            color: #5e91cb;
            outline: none;
          }

          ^ input[type=number] {
            margin-left: -3px;
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
            .tag({
              class: 'foam.u2.view.ChoiceView',

              // TODO Remove below, populate verified bank accounts from DAO
              // Will need to set 'dao' and 'objToChoice' 
              choices: [
                '',
                'TD Investing',
                'BMO Investing'
              ],

              data$: self.newTopUpBankAccount$
            })
          .start().addClass('input-container')
            .start('p').addClass('pDefault').add('Amount').end()
            .start(this.TextField, { data$: self.newTopUpAmount$, 'type': 'number' }).addClass('input-Box').end()
          .end()
          .start().addClass('Button-Container')
            .add(self.GO_TO_BANK_ACCOUNT)
            .add(self.NEXT)
          .end();
        }
      ],

      actions: [
        {
          name: 'goToBankAccount',
          label: 'Go to Bank Account',
          code: function() {
            // TODO: Go to bank account logic
          }
        },
        {
          name: 'next',
          label: 'Next',
          code: function() {
            if ( this.newTopUpBankAccount != '' && this.newTopUpAmount ) {
              this.newTopUpActiveView = this.TopUpConfirmMessageView;
            }
          }
        }
      ]
    },

    {
      name: 'TopUpConfirmMessageView',
      extends: 'foam.u2.Controller',

      imports: [
        'TopUpFormMessageView',
        'TopUpSuccessMessageView',
        'newTopUpActiveView',
        'newTopUpBankAccount',
        'newTopUpAmount'
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
            .start('p').addClass('pDefault').add(self.newTopUpBankAccount).end()
          .end()
          .start('div')
            .start('p').addClass('summary-heading').add('Amount').end()
            .start('p')
              .addClass('pDefault')
              .style({ 'padding-left': '39px' })
              .add('$ ', self.newTopUpAmount)
            .end()
          .end()
          .start().addClass('Button-Container')
            .add(self.BACK)
            .add(self.TOP_UP_BUTTON)
          .end()
        }
      ],

      actions: [
        {
          name: 'back',
          label: 'Back',
          code: function() {
            this.newTopUpActiveView = this.TopUpFormMessageView;
          }
        },
        {
          name: 'topUpButton',
          label: 'Top Up',
          code: function() {
            this.newTopUpActiveView = this.TopUpSuccessMessageView;
          }
        }
      ]
    },

    {
      name: 'TopUpSuccessMessageView',
      extends: 'foam.u2.Controller',

      imports: [
        'closeDialog',
        'newTopUpAmount'
      ],

      properties: [
        // TODO: Hookup with DAO
        {
          name: 'advisorNumber',
          value: '416-900-1111'
        }
      ],

      axioms: [
        foam.u2.CSS.create({
          code: `
          ^ {
            height: 250px;
          }

          ^ .foam-u2-ActionView-ok {
            margin-top: 225;
            margin-left: 65;
          }

          ^ .success-Image {
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

      messages: [
        {
          name: 'TopUpAmount',
          message: `You have successfully topped up $`
        },
        {
          name: 'ProcessTime',
          message: 'Please be advised that it will take around 2 business days for you to see the balance in the portal.'
        },
        {
          name: 'AdvisorContact',
          message: `If you don\'t see your balance after 5 business days, please contact our advisor at `
        }
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
              .add(self.TopUpAmount, self.newTopUpAmount, '.')
              .tag('br').tag('br').tag('br')
              .add(self.ProcessTime)
              .tag('br').tag('br')
              .add(self.AdvisorContact, self.advisorNumber, '.')
            .end()
          .end()
          .add(self.OK)
        }
      ],

      actions: [
        {
          name: 'ok',
          label: 'OK',
          code: function (X) {
            X.closeDialog();
          }
        }
      ]
    }
  ]
})
