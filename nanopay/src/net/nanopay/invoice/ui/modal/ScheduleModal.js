
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
    'bankAccountDAO'
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
      name: 'selectedAccount'
    },
    {
      name: 'accounts',
      postSet: function(oldValue, newValue) {
        var self = this;
        this.bankAccountDAO.where(this.EQ(this.BankAccount.ID, newValue)).select().then(function(a){
          self.selectedAccount = a.array[0];
        });
      },
      view: function(_,X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.data.bankAccountDAO.where(X.data.EQ(X.data.BankAccount.OWNER, X.data.user.id)),
          objToChoice: function(account) {
            return [account.id, 'Account No. ' +
                                '***' + account.accountNumber.substring(account.accountNumber.length - 4, account.accountNumber.length)
                    ];
          }
        });
      }
    },
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
    ^ .foam-u2-tag-Select{
      width: 90%;
      margin: 0 0 20px 20px;
      height: 40px;
    }
  `,
  
  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      
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
              .start().addClass('value').add(this.invoice.currencyType, ' ', this.invoice.amount.toFixed(2)).end()
            .end()
          .end()
          // .start().addClass('label').add("Payment Method").end()
          // .start('select').addClass('full-width-input').end()
          .start().addClass('label').add("Payment Method").end()
          .start('div').addClass('dropdownContainer')
            .add(this.ACCOUNTS)
            .start('div').addClass('caret').end()
          .end()
          .start().addClass('label').add("Schedule a Date").end()
          .start(this.PAYMENT_DATE).addClass('full-width-input').end()
          .start().addClass('label').add("Note").end()
          .start(this.NOTE).addClass('input-box').end()
          .start(this.SCHEDULE).addClass('blue-button btn').end()
        .end()
      .end()
    } 
  ],

  actions: [
    {
      name: 'schedule',
      label: 'Confirm',
      code: function(X){        
        // if(!this.paymentDate){
        //   this.add(this.NotificationMessage.create({ message: 'Please select a Schedule Date.', type: 'error' }));
        //   return;
        // } else if (this.paymentDate < Date.now()){
        //   this.add(this.NotificationMessage.create({ message: 'Cannot schedule a payment date for the past. Please try again.', type: 'error' }));
        //   return;
        // }

        var offsetDate = this.paymentDate.setMinutes(this.paymentDate.getMinutes() + new Date().getTimezoneOffset());
        this.invoice.accountId = this.accounts
        this.invoice.paymentDate = offsetDate;
        this.invoice.note = this.note;

        this.invoiceDAO.put(this.invoice);
        ctrl.add(this.NotificationMessage.create({ message: 'Invoice payment has been scheduled.', type: ''}));
        X.closeDialog();
      }
    }
  ]
})