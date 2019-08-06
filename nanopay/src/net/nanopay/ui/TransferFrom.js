foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TransferFrom',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Payer account selection',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.LoanAccount',
    'net.nanopay.bank.BankAccount',
    'foam.nanos.auth.User',
    'net.nanopay.ui.transfer.TransferUserCard',
    'foam.nanos.auth.UserUserJunction'
  ],

  imports: [
    'accountDAO',
    'userDAO',
    'user',
    'groupDAO',
    'type',
    'balanceDAO',
    'balance',
    'currencyDAO',
    'invoice',
    'invoiceMode',
    'partnerJunctionDAO'
  ],

  css: `
    ^ .property-notes {
      box-sizing: border-box;
      width: 320px;
      height: 66px;
      overflow-y: scroll;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      resize: vertical;

      padding: 8px;
      outline: none;
    }

    ^ .property-notes:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-tag-Select {
      width: 320px;
      height: 48px;
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

    ^ .choice{
      margin-bottom: 20px;
    }


    ^ .confirmationContainer {
      margin-top: 18px;
      width: 100%;
    }

    ^ .confirmationLabel {
      display: inline-block;
      vertical-align: top;
      width: 80%;
      margin-left: 20px;
      font-size: 12px;
      cursor: pointer;
    }

    // ^ input[type='checkbox'] {
    //   display: inline-block;
    //   vertical-align: top;
    //   margin:0 ;
    //   border: solid 1px rgba(164, 179, 184, 0.75);
    //   cursor: pointer;
    // }

    // ^ input[type='checkbox']:checked {
    //   background-color: black;
    // }

    ^ .half-small-input-box {
      width: 100%;
    }
    
    // ^ .dropdownContainer .foam-u2-view-RichChoiceView-container {
    //   z-index: 1;
    // }
    
    // ^ .dropdownContainer .foam-u2-view-RichChoiceView-selection-view {
    //   padding: 12px 20px;
    //   width: 320px; height: 40px;
    // }
    
    // ^ .dropdownContainer .foam-u2-view-RichChoiceView-chevron {
    //   display: none;
    // }
  `,

  messages: [
    { name: 'TransferFromLabel', message: 'Transfer from' },
    { name: 'TypeLabel', message: 'Type' },
    { name: 'DenominationLabel', message: 'Denomination' },
    { name: 'AccountLabel', message: 'Account' },
    { name: 'FromLabel', message: 'From' },
    { name: 'AmountLabel', message: 'Transfer Amount'},
    { name: 'InvoiceNoLabel', message: 'Invoice No.' },
    { name: 'PONoLabel', message: 'PO No.' }
  ],

  properties: [
    'payer',
    {
      class: 'Boolean',
      name: 'defaultAccountChosen', 
      value: false
    },

    // The only scenario for paying from a parner account is for )pentext. Will revisit for Opentext phase II

    // {
    //   class: 'Boolean',
    //   name: 'accountCheck',
    //   value: true,
    //   preSet: function(oldValue, newValue) {
    //     if ( ! this.partnerCheck && oldValue ) {
    //       return oldValue;
    //     }
    //     return newValue;
    //   },
    //   postSet: function(oldValue, newValue) {
    //     this.viewData.accountCheck = newValue;
    //     if ( this.partnerCheck ) this.partnerCheck = false;
    //   }
    // },
    // {
    //   class: 'Boolean',
    //   name: 'partnerCheck',
    //   value: false,
    //   preSet: function(oldValue, newValue) {
    //     if ( ! this.accountCheck && oldValue ) {
    //       return oldValue;
    //     }
    //     return newValue;
    //   },
    //   postSet: function(oldValue, newValue) {
    //     this.viewData.payerPartnerCheck = newValue;
    //     if ( this.accountCheck ) this.accountCheck = false;
    //     if ( newValue ) {
    //       if ( this.accountOwner != this.partners ) this.accountOwner = this.partners;
    //       if ( ! this.partners ) {
    //         this.payer = null;
    //         this.viewData.payerPartner = null;
    //       }
    //     } else if (this.accountOwner != this.user.id) {
    //       this.accountOwner = this.user.id;
    //     }
    //   }
    // },
    // {
    //   name: 'partners',
    //   postSet: function(oldValue, newValue) {
    //     this.viewData.payerPartner = newValue;
    //     if ( this.partnerCheck && this.accountOwner != newValue ) {
    //       this.accountOwner = newValue;
    //     }
    //   }
    // },
    // {
    //   name: 'partnersView',
    //   postSet: function(oldValue, newValue) {
    //     this.partners = newValue.id;
    //   },
    //   view: function(_, X) {
    //     let partnerDAO = foam.dao.ArrayDAO.create( {of: X.data.User} );

    //     X.data.user.partners.junctionDAO
    //       .where(X.data.EQ(X.data.UserUserJunction.TARGET_ID, X.data.user.id))
    //       .select().then( (junctions) => {
    //         junctions.array.forEach((junction) => {
    //           partnerDAO.put(junction.partnerInfo)
    //         })
    //       });

    //     return {
    //       class: 'foam.u2.view.RichChoiceView',
    //       rowView: { class: 'net.nanopay.ui.RowView' },
    //       selectionView: { class: 'net.nanopay.ui.SelectionView' },
    //       search: true,
    //       sections: [
    //         {
    //           heading: 'Users',
    //           dao: partnerDAO
    //         }
    //       ]
    //     }
    //   }
    // },
    {
      name: 'accountOwner',
      postSet: function(oldValue, newValue) {
        this.viewData.payer = newValue;
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.EQ(this.Account.OWNER, newValue || ''),
              this.AND(
                this.NOT(this.INSTANCE_OF(net.nanopay.account.AggregateAccount)),
                this.NOT(this.INSTANCE_OF(net.nanopay.account.TrustAccount))
              )
            )
          )
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) {
              self.viewData.payerAccount = null;
            }  else {
              if ( self.types === undefined && self.viewData.payerType ) {
                self.types = self.viewData.payerType;
              } else {
                self.types = accounts[0].type;
              }
            }
          });
        this.userDAO
          .where(this.EQ(this.User.ID, newValue))
          .select()
          .then(function(u) {
            var users = u.array;
            if ( users.length > 0 ) {
              self.payer = users[0];
              self.viewData.payerCard = users[0];;
            } else {
              self.payer = null;
            }
          });
      }
    },
    {
      name: 'types',
      postSet: function(oldValue, newValue) {
        this.viewData.payerType = newValue;
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.EQ(this.Account.OWNER, this.accountOwner),
              this.EQ(this.Account.TYPE, newValue || '')
            )
          )
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            if ( self.denominations === undefined && self.viewData.payerDenomination ) {
              self.denominations = self.viewData.payerDenomination;
            } else {
              self.denominations = accounts[0].denomination;
            }
          });
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.typeChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.typeChoices(view);
        });
        return view;
      }
    },
    {
      name: 'denominations',
      postSet: function(oldValue, newValue) {
        this.viewData.payerDenomination = newValue;     
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.AND(
                this.EQ(this.Account.TYPE, this.types),
                this.EQ(this.Account.DENOMINATION, newValue || '')), 
              this.EQ(this.Account.OWNER, this.accountOwner)))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            if ( self.accounts === undefined && self.viewData.payerAccount ) {
              self.accounts = self.viewData.payerAccount;
            } else {
              self.accounts = accounts[0].id;
            }
          });
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.denominationChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.denominationChoices(view);
        });
        X.data.types$.sub(function() {
          X.data.denominationChoices(view);
        });
        return view;
      }
    },
    {
      name: 'accounts',
      postSet: function(oldValue, newValue) {
        this.viewData.payerAccount = newValue;
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.accountChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.accountChoices(view);
        });
        X.data.types$.sub(function() {
          X.data.accountChoices(view);
        });
        X.data.denominations$.sub(function() {
          X.data.accountChoices(view);
        });
        return view;
      }
    },
    {
      class: 'Currency',
      name: 'transferAmount',
      postSet: function(oldValue, newValue) {
        this.viewData.fromAmount = newValue;
      }
    },
    // {
    //   name: 'hasPartnerPermission',
    //   value: false
    // }
  ],

  methods: [
    function init() {
      if ( this.viewData.fromAmount ) {
        this.transferAmount = this.viewData.fromAmount;
      } else {
        this.viewData.fromAmount = 0;
      }

      // if ( this.viewData.payerPartnerCheck === undefined ) {
      //   this.viewData.accountCheck = this.accountCheck;
      //   this.viewData.payerPartnerCheck = this.partnerCheck;
      //   this.accountOwner =  this.user.id;
      // } else if ( this.viewData.payerPartnerCheck ) {
      //   this.partners = this.viewData.payerPartner;
      //   this.partnerCheck = true;
      // } else {
      //   this.accountOwner =  this.user.id;
      // }
      this.accountOwner =  this.user.id;

      this.SUPER();
    },

    function initE() {
      // this.checkPermission();
      this.SUPER();

      this.accounts$.sub(this.onAccountUpdate);
      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('p').add(this.TransferFromLabel).addClass('bold').end()

          // .start().addClass('choice')
            // .start('div').addClass('confirmationContainer')
              // .tag({ class: 'foam.u2.md.CheckBox', data$: this.accountCheck$ })
              // .start('p').addClass('confirmationLabel').add('Pay with my account').end()
            // .end()
            // .start('div').addClass('confirmationContainer').show(this.hasPartnerPermission$)
            //   .tag({ class: 'foam.u2.md.CheckBox', data$: this.partnerCheck$ })
            //   .start('p').addClass('confirmationLabel').add('Pay with partner account').end()
            // .end()
          // .end()

          // .start('div').addClass('dropdownContainer').show(this.partnerCheck$)
          //   .start(this.PARTNERS_VIEW).end()
          //   .start('div').addClass('caret').end()
          // .end()
     
          .start('p').add(this.TypeLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.TYPES).end()
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.DenominationLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.DENOMINATIONS).end()
            .start('div').addClass('caret').end()
          .end()
          .br()

          .start('p').add(this.AccountLabel).end()
          .start('div').addClass('dropdownContainer')
            .start(this.ACCOUNTS).end()
            .start('div').addClass('caret').end()
          .end()

          .start().enableClass('hidden', this.invoice$, false)
            .start('p').add(this.AmountLabel).end()
            .start(this.TRANSFER_AMOUNT).addClass('half-small-input-box').end()
          .end()

        .end()
        
        .start('div').enableClass('divider', this.payer$).end()
        .start('div').addClass('fromToCol')
          .start('div').addClass('invoiceDetailContainer').enableClass('hidden', this.invoice$, true)
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.InvoiceNoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.invoiceNumber).end()
            .br()
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.PONoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.purchaseOrder).end()
          .end()
          .start().enableClass('hidden', this.payer$.map(function(value) {
            return value ? false : true;
          }))
            .start('p').add(this.FromLabel).addClass('bold').end()
            .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user$: this.payer$ })
          .end()
        .end();
    },
    
    // function checkPermission() {
    //   var self = this;
    //   this.groupDAO.find(this.user.group).then(function(group) {
    //     if ( group )  {
    //       var permissions = group.permissions;
    //       self.hasPartnerPermission = permissions.filter(function(p) {
    //         return p.id == '*' || p.id == 'menu.read.partners';
    //       }).length > 0;
    //     }
    //   })
    // }
  ],

  listeners: [
    {
      name: 'onAccountUpdate',
      code: function onAccountUpdate() {
        var self = this;
        this.balanceDAO.find(this.accounts).then(function(balance) {
          var amount = (balance != null ? balance.balance : 0);
          if ( ! self.defaultAccountChosen
            && self.types == 'DigitalAccount'
            && ( amount == 0 || ( self.invoice && amount < self.invoice.amount ))) {
              self.accountDAO
              .where(
                self.AND(
                  self.EQ(self.Account.OWNER, self.accountOwner),
                  self.AND(
                    self.INSTANCE_OF(self.BankAccount),
                    self.EQ(self.Account.IS_DEFAULT, true))))
              .select()
              .then(function(a) {
                var accounts = a.array;
                if ( accounts.length > 0 ) self.types = accounts[0].type;
              })
          }
          self.defaultAccountChosen = true;
          self.viewData.balance = amount;
        });
      }
    },

    async function accountChoices(view) {
      var a = await this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner || ''),
            this.AND(
              this.EQ(this.Account.DENOMINATION, this.denominations || ''),
              this.EQ(this.Account.TYPE, this.types || ''))))
        .select();
      var accounts = a.array;
      var length = accounts.length;
      var type = this.types;
      if ( type == 'DigitalAccount' ) {
        let choices = [];
        for ( var i = 0; i < length; ++i ) {
          let account = accounts[i];
          let balance = await account.findBalance(this);
          let currency = await this.currencyDAO.find(account.denomination);
          let name = account.name ? account.name : 'Digital Account';
          choices.push(
            [account.id,
            name + ': ' + currency.format(balance)]);
        }
        if ( this.types == 'DigitalAccount' ) view.choices = choices;
      }

      if ( type.length >= 11 && type.substring(type.length - 11) == 'BankAccount')  {
        view.choices = accounts.map(function(account) {
          var numLength = account.accountNumber.length;
          choice = account.name + ' ' + '***' + account.accountNumber.substring(numLength - 4, numLength);
          return [account.id, choice];
        });
      }

      if ( type == 'LoanAccount') {
        let choices = [];
        for ( var i = 0; i < length; ++i ) {
          let account = accounts[i];
          let balance = await account.findBalance(this);
          let currency = await this.currencyDAO.find(account.denomination);
          let name = account.name ? account.name : 'Loan Account';
          choices.push(
            [account.id,
            name + ' Limit Left: ' + currency.format(account.principal + balance)]);
        }
        if ( this.types == 'LoanAccount' ) view.choices = choices;
      }
    },

    function typeChoices(view) {
      this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner || ''),
            this.AND(
              this.NOT(this.INSTANCE_OF(net.nanopay.account.AggregateAccount)),
              this.NOT(this.INSTANCE_OF(net.nanopay.account.TrustAccount))
            )
          )
        )
        .select(this.GROUP_BY(net.nanopay.account.Account.TYPE, this.COUNT()))        
        .then(function(g) {
          view.choices = Object.keys(g.groups).map(function(t) {
            return [t, t.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")];
        });
      });
    },

    function denominationChoices(view) {
      this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner|| ''),
            this.EQ(this.Account.TYPE, this.types || '')))
        .select(this.GROUP_BY(net.nanopay.account.Account.DENOMINATION, this.COUNT()))        
        .then(function(g) {
          view.choices = Object.keys(g.groups).map(function(d) {
            return [d, d];
        });
      });
    }
  ]
});

// foam.CLASS({
//   package: 'net.nanopay.ui',
//   name: 'RowView',
//   extends: 'foam.u2.View',

//   properties: [
//     {
//       name: 'data',
//       documentation: 'The selected object.'
//     }
//   ],

//   methods: [
//     async function initE() {
//       return this
//         .start()
//         .addClass(this.myClass('row'))
//         .add(this.data.email)
//         .end();
//     }
//   ]
// });

// foam.CLASS({
//   package: 'net.nanopay.ui',
//   name: 'SelectionView',
//   extends: 'foam.u2.View',

//   properties: [
//     {
//       name: 'data',
//       documentation: 'The selected object.'
//     }
//   ],

//   methods: [
//     async function initE() {

//     let display = 'Choose from partners';

//     if ( this.data !== undefined ) {
//       display = this.data.email;
//     }

//       return this
//         .start()
//         .addClass(this.myClass('row'))
//         .add(display)
//         .end();
//     }
//   ]
// });
