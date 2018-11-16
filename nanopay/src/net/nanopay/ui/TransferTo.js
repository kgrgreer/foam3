foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TransferTo',
  extends: 'net.nanopay.ui.transfer.TransferView',

  documentation: 'Payee account selection',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.ui.transfer.TransferUserCard',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'foam.nanos.auth.User',
    'net.nanopay.contacts.Contact',
    'net.nanopay.account.Account',
    'foam.nanos.auth.Group'
  ],

  imports: [
    'contactDAO',
    'currencyDAO',
    'findBalance',
    'formatCurrency',
    'accountDAO',
    'publicUserDAO',
    'balance',
    'user',
    'email',
    'userDAO',
    'type',
    'groupDAO'
  ],

  css: `
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

    ^ .property-accounts{
      margin-top: 20px;
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
  `,

  messages: [
    { name: 'TransferToLabel', message: 'Transfer to' },
    { name: 'PayeeLabel', message: 'Payee' },
    { name: 'TypeLabel', message: 'Type' },
    { name: 'DenominationLabel', message: 'Denomination' },
    { name: 'AccountLabel', message: 'Account' },
    { name: 'ToLabel', message: 'To' }
  ],

  properties: [
    'payee',
    {
      class: 'Boolean',
      name: 'accountCheck',
      value: true,
      preSet: function(oldValue, newValue) {
        if ( ! this.partnerCheck && ! this.contactCheck && oldValue ) {
          return oldValue;
        }
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        if ( this.partnerCheck ) this.partnerCheck = false;
        if ( this.contactCheck ) this.contactCheck = false;
      }
    },
    {
      class: 'Boolean',
      name: 'partnerCheck',
      value: false,
      preSet: function(oldValue, newValue) {
        if ( ! this.accountCheck && ! this.contactCheck && oldValue ) {
          return oldValue;
        }
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        if ( this.accountCheck ) this.accountCheck = false;
        if ( this.contactCheck ) this.contactCheck = false;
        if ( newValue ) {
          if ( this.accountOwner != this.partners ) this.accountOwner = this.partners;
        } else if ( this.accountCheck ) {
          if ( this.accountOwner != this.payeeList ) this.accountOwner = this.payeeList;
        } else {
          if ( this.accountOwner != this.contacts ) this.accountOwner = this.contacts;
        }
      }
    },
    {
      class: 'Boolean',
      name: 'contactCheck',
      value: false,
      preSet: function(oldValue, newValue) {
        if ( ! this.accountCheck && ! this.partnerCheck && oldValue ) {
          return oldValue;
        }
        return newValue;
      },
      postSet: function(oldValue, newValue) {
        if ( this.accountCheck ) this.accountCheck = false;
        if ( this.partnerCheck ) this.partnerCheck = false;
        if ( newValue ) {
          if ( this.accountOwner != this.contacts ) this.accountOwner = this.contacts;
        } else if ( this.accountCheck ) {
          if ( this.accountOwner != this.payeeList ) this.accountOwner = this.payeeList;
        } else {
          if ( this.accountOwner != this.partners ) this.accountOwner = this.partners;
        }
      }
    },
    {
      name: 'payeeList',
      postSet: function(oldValue, newValue) {
        if ( this.accountCheck && this.accountOwner != newValue ) {
          this.accountOwner = newValue;
        }
        var self = this;
        this.userDAO
          .where(
            this.AND(
              this.AND(
                this.NEQ(this.User.ID, this.user.id),
                this.NEQ(this.User.ID, this.viewData.payer)),
              this.AND(
                this.NEQ(this.User.ID, newValue),
                this.EQ(this.User.GROUP, 'business'))))
          .select()
          .then(function(u) {
            var partners = u.array;
            if ( partners.length == 0 ) return;
            self.partners = partners[0].id;
          });
      },
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.data.userDAO
            .where(
              X.data.AND(
                X.data.NEQ(X.data.User.ID, X.data.user.id),
                X.data.NEQ(X.data.User.ID, X.data.viewData.payer))),
          objToChoice: function(user) {
            return [user.id, user.label() + ' - (' + user.email + ')'];
          }
        });
      }
    },
    {
      name: 'partners',
      postSet: function(oldValue, newValue) {
        if ( this.partnerCheck && this.accountOwner != newValue ) {
          this.accountOwner = newValue;
        }
      },
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao$: X.data.slot(function(payeeList)  {
            var payeeId = payeeList === undefined ? '' : payeeList;
            return X.userDAO
              .limit(50).where(
                this.AND(
                  this.AND(
                    this.NEQ(this.User.ID, this.user.id),
                    this.NEQ(this.User.ID, this.viewData.payer)),
                  this.AND(
                    this.NEQ(this.User.ID, payeeId),
                    this.EQ(this.User.GROUP, 'business'))));
          }),
          objToChoice: function(user) {
            return [user.id, user.label() + ' - (' + user.email + ')'];
          }
        });
      }
    },
    {
      name: 'contacts',
      postSet: function(oldValue, newValue) {
        if ( this.contactCheck && this.accountOwner != newValue ) {
          this.accountOwner = newValue;
        }
      },
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao$: X.data.slot(function(payeeList)  {
            return X.user.contacts.limit(50);
          }),
          objToChoice: function(contact) {
            return [contact.id, contact.label() + ' - (' + contact.email + ')'];
          }
        });
      }
    },
    {
      name: 'accountOwner',
      postSet: function(oldValue, newValue) {
        this.viewData.payee = newValue;
        var self = this;
        if ( this.contactCheck ) {
          this.accountDAO
          .where(
            this.AND(
              this.EQ(this.Account.OWNER, newValue),
              this.EQ(this.Account.IS_DEFAULT, true)))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            self.accounts = accounts[0].id;
          });
        } else {
          this.accountDAO
          .where(
            this.AND(
              this.EQ(this.Account.OWNER, newValue),
              this.NEQ(this.Account.TYPE, 'TrustAccount')))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            self.types = accounts[0].type;
          });
        }
        this.userDAO
          .where(this.EQ(this.User.ID, newValue))
          .select()
          .then(function(u) {
            var users = u.array;
            if ( users.length > 0 ) self.payee = users[0];
          });
      }
    },
    {
      name: 'types',
      postSet: function(oldValue, newValue) {
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.EQ(this.Account.OWNER, this.accountOwner),
              this.EQ(this.Account.TYPE, newValue)))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            self.denominations = accounts[0].denomination;
          });
      },
      view: function(_, X) {
        var view = foam.u2.view.ChoiceView.create();
        X.data.typeChoices(view);
        X.data.accountOwner$.sub(function() {
          X.data.typeChoices(view);
        });
        return view;
      },
    },
    {
      name: 'denominations',
      postSet: function(oldValue, newValue) {  
        this.viewData.payeeDenomination = newValue;    
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.AND(
                this.EQ(this.Account.TYPE, this.types),
                this.EQ(this.Account.DENOMINATION, newValue)), 
              this.EQ(this.Account.OWNER, this.accountOwner)))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            self.accounts = accounts[0].id;
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
        this.viewData.payeeAccount = newValue;
      },
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao$: X.data.slot(function(accountOwner, types, denominations) {
            return X.data.accountDAO
              .where(
                X.data.AND(
                  X.data.EQ(X.data.Account.OWNER, accountOwner),
                  X.data.AND(
                    X.data.EQ(X.data.Account.DENOMINATION, denominations || ''),
                    X.data.EQ(X.data.Account.TYPE, types || ''))));
          }),
          objToChoice: function(account) {
            var choice = account.name;
            var type = account.type;
            if ( type == 'DigitalAccount' ) {
              choice = 'Digital Account';
            }
             if ( type.length >= 11 && type.substring(type.length - 11) == 'BankAccount')  {
              var length = account.accountNumber.length;
              choice = account.name + ' ' + '***' + account.accountNumber.substring(length - 4, length);
            }
            return [ account.id, choice ];
          }
        });
      }
    },
    {
      name: 'isAbliiUser',
      value: false
    }
  ],

  methods: [
    function init() {
      this.SUPER();
    },

    function initE() {
      this.isAbliiGroup();
      this.SUPER();
      
      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('p').add(this.TransferToLabel).addClass('bold').end()

          .start('p').add(this.PayeeLabel).hide(this.contactCheck$).end()
          .startContext({ data: this})
            .start(this.PAYEE_LIST).hide(this.contactCheck$).end()
          .endContext()
          .br()

          .start().addClass('choice')
            .start('div').addClass('confirmationContainer')
              .tag({ class: 'foam.u2.md.CheckBox', data$: this.accountCheck$ })
              .start('p').addClass('confirmationLabel').add('Transfer to payee account').end()
            .end()
            .start('div').addClass('confirmationContainer')
              .tag({ class: 'foam.u2.md.CheckBox', data$: this.partnerCheck$ })
              .start('p').addClass('confirmationLabel').add('Transfer to payee partner account').end()
            .end()
            .start('div').addClass('confirmationContainer').show(this.isAbliiUser$)
              .tag({ class: 'foam.u2.md.CheckBox', data$: this.contactCheck$ })
              .start('p').addClass('confirmationLabel').add('Transfer to my contact').end()
            .end()
          .end()

          .start('div').addClass('dropdownContainer').show(this.partnerCheck$)
            .start(this.PARTNERS).end()
            .start('div').addClass('caret').end()
          .end()

          .start('div').addClass('dropdownContainer').show(this.contactCheck$)
            .start(this.CONTACTS).end()
            .start('div').addClass('caret').end()
          .end()

          .start('p').add(this.TypeLabel).hide(this.contactCheck$).end()
          .start('div').addClass('dropdownContainer').hide(this.contactCheck$)
            .start(this.TYPES).end()
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.DenominationLabel).hide(this.contactCheck$).end()
          .start('div').addClass('dropdownContainer').hide(this.contactCheck$)
            .start(this.DENOMINATIONS).end()
            .start('div').addClass('caret').end()
          .end()
          .br()
          .start('p').add(this.AccountLabel).hide(this.contactCheck$).end()
          .start('div').addClass('dropdownContainer').hide(this.contactCheck$)
            .start(this.ACCOUNTS).end()
            .start('div').addClass('caret').end()
          .end()
        .end()
        
        .start('div').addClass('divider').end()
        .start('div').addClass('fromToCol')
          .start('p').add(this.ToLabel).addClass('bold').end()
          .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user$: this.payee$ })
        .end();
    },

    function isAbliiGroup() {
      var self = this;
      this.groupDAO.find(this.user.group).then((group) => {
        if ( group ) {
          group.isDescendantOf('sme', this.groupDAO).then((result) => {
            self.isAbliiUser = result;
          });
        } else {
          throw new Error(`User is in an invalid group: ${this.user.group}`);
        }
      });
    }
  ],

  listeners: [
    function typeChoices(view) {
      this.accountDAO
        .where(
          this.AND(
            this.EQ(this.Account.OWNER, this.accountOwner || ''),
            this.NEQ(this.Account.TYPE, 'TrustAccount')))
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
            this.EQ(this.Account.OWNER, this.accountOwner || ''),
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
