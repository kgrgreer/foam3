foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'ScheduleModal',
  extends: 'foam.u2.Controller',

  documentation: 'Schedule Payment Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.model.BankAccount'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling',
    'foam.mlang.Expressions'
  ],

  imports: [
    'user',
    'invoiceDAO',
    'account'
  ],

  properties: [
    'invoice',
    {
      name: 'type',
      expression: function(invoice, user){
        return user.id != invoice.payeeId;
      }
    },
    {
      class: 'Date',
      name: 'paymentDate',
      expression: function(invoice) {
        return invoice.paymentDate;
      }
    },
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    },
    {
      class: 'Boolean',
      name: 'digitalCash',
      documentation: 'UI toggle choice between payments using account or digital cash.',
      value: true,
      preSet: function (oldValue, newValue) {
        if ( ! this.accountCheck && oldValue ) {
          return oldValue;
        }
        return newValue;
      },
      postSet: function (oldValue, newValue) {
        if ( this.accountCheck ) this.accountCheck = false;
      }
    },
    {
      class: 'Boolean',
      name: 'accountCheck',
      documentation: 'UI toggle choice between payments using account or digital cash. Used to set bankAccountId on transaction on create.',
      value: false,
      preSet: function (oldValue, newValue) {
        if ( ! this.digitalCash && oldValue ) {
          return oldValue;
        }
        return newValue;
      },
      postSet: function (oldValue, newValue) {
        if ( this.digitalCash ) this.digitalCash = false;
      }
    },
    {
      name: 'accounts',
      postSet: function(oldValue, newValue) {
        var self = this;
        this.user.bankAccounts.where(this.EQ(this.BankAccount.ID, newValue)).select().then(function(a){
          var account = a.array[0];
        });
      },
      view: function(_,X) {
        var expr = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.user.bankAccounts.where(expr.EQ(net.nanopay.model.BankAccount.STATUS, net.nanopay.model.BankAccountStatus.VERIFIED)),
          objToChoice: function(account) {
            return [account.id, account.accountName + ' ' +
                                '***' + account.accountNumber.substring(account.accountNumber.length - 4, account.accountNumber.length)
                    ];
          }
        });
      }
    }
  ],

  css: `
    ^{
      width: 448px;
      margin: auto;
      font-family: Roboto;
    }
    ^ .blue-button{
      margin: 20px 20px;
      float: right;
    }
    ^key-value{
      margin-top: 10px;
      margin-bottom: 25px;
    }
    ^ .foam-u2-tag-Select {
      width: 320px;
      height: 40px;
      border-radius: 0;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      padding: 12px 20px;
      padding-right: 35px;
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      background-color: white;
      outline: none;
      cursor: pointer;
    }
    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }
    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }
    ^ .dropdownContainer {
      position: relative;
      margin-bottom: 20px;
    }
    ^ .caret {
      position: relative;
      pointer-events: none;
    }
    ^ .caret:before {
      content: '';
      position: absolute;
      top: -23px;
      left: 295px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }
    ^ .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }
    ^ .confirmationContainer {
      margin-top: 18px;
      width: 100%;
    }
    ^ input[type='checkbox'] {
      display: inline-block;
      vertical-align: top;
      margin:0 ;
      border: solid 1px rgba(164, 179, 184, 0.75);
      cursor: pointer;
    }
    ^ input[type='checkbox']:checked {
      background-color: black;
    }
    ^ .confirmationLabel {
      margin-top: 0;
      display: inline-block;
      vertical-align: top;
      width: 80%;
      margin-left: 20px;
      font-size: 12px;
      cursor: pointer;
    }
    ^ .choice {
      margin: 30px;
    }
  `,
  
  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      this.getDefaultBank();

      this
      .tag(this.ModalHeader.create({
        title: 'Schedule'
      }))
      .addClass(this.myClass())
        .start()
          .start().addClass('key-value-container')
            .start()
              .start().addClass('key').add("Company").end()
              .start().addClass('value').add(this.type ? this.invoice.payeeName : this.invoice.payerName).end()
            .end()
            .start()
              .start().addClass('key').add("Amount").end()
              .start().addClass('value').add(this.invoice.currencyType, ' $', (this.invoice.amount/100).toFixed(2)).end()
            .end()
          .end()
          .start().addClass("choice")
            .start('div').addClass('confirmationContainer')
              .tag({ class: 'foam.u2.md.CheckBox' , data$: this.digitalCash$ })
              .start('p').addClass('confirmationLabel').add('Digital Cash Balance: $', (this.account.balance/100).toFixed(2))
              .end()
            .end()
            .start('div').addClass('confirmationContainer')
              .tag({ class: 'foam.u2.md.CheckBox' , data$: this.accountCheck$ })
              .start('p').addClass('confirmationLabel').add('Pay from account')
              .end()
            .end()
            .start('div').addClass('dropdownContainer').show(this.accountCheck$)
              .start(self.ACCOUNTS).end()
              .start('div').addClass('caret').end()
            .end()
          .end()

          // .start().addClass('label').add("Payment Method").end()
          // .start('select').addClass('full-width-input').end()
          .start().addClass('label').add("Schedule a Date").end()
          .start(this.PAYMENT_DATE).addClass('full-width-input').end()
          .start().addClass('label').add("Note").end()
          .start(this.NOTE).addClass('input-box').end()
          .start(this.SCHEDULE).addClass('blue-button btn').end()
        .end()
      .end()
    },

    function getDefaultBank() {
      var self = this;
      this.user.bankAccounts.where(
        this.AND(
          this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED),
          this.EQ(this.BankAccount.SET_AS_DEFAULT, true)
        )
      ).select().then(function (a) {
        if ( a.array.length == 0 ) return;
        self.accounts = a.array[0].id;
        self.account = a.array[0];
      });
    }
  ],

  actions: [
    {
      name: 'schedule',
      label: 'Confirm',
      code: function(X){     
        var paymentDate = X.data.paymentDate;   
        if(!X.data.paymentDate){
          this.add(this.NotificationMessage.create({ message: 'Please select a Schedule Date.', type: 'error' }));
          return;
        } else if (X.data.paymentDate < Date.now()){
          this.add(this.NotificationMessage.create({ message: 'Cannot schedule a payment date for the past. Please try again.', type: 'error' }));
          return;
        }

        if( isNaN(paymentDate) && paymentDate != null ){
          this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Valid Due Date yyyy-mm-dd.', type: 'error' }));            
          return;  
        }

        if (this.accountCheck) this.invoice.accountId = this.accounts;

        if ( this.paymentDate ){
          this.paymentDate = this.paymentDate.setMinutes(this.paymentDate.getMinutes() + new Date().getTimezoneOffset());
        }

        this.invoice.paymentDate = this.paymentDate;
        this.invoice.note = this.note;

        this.invoiceDAO.put(this.invoice);
        ctrl.add(this.NotificationMessage.create({ message: 'Invoice payment has been scheduled.', type: ''}));
        X.closeDialog();
      }
    }
  ]
});