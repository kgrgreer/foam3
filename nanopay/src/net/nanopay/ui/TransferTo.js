/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TransferTo',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Payee account selection',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'net.nanopay.account.Account',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.ui.transfer.TransferUserCard'
  ],

  imports: [
    'accountDAO',
    'group',
    'userDAO',
    'user',
    'type',
    'groupDAO',
    'invoice',
    'invoiceMode',
    'auth'
  ],

  css: `
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

    /*
      TODO: Need to merge all these rich choice view changes instead of custom styling
      The base in SectionedPropertyDetailView have not been merged to the
      actual foam-u2-view-RichChoiceView file
    */

    ^ .foam-u2-view-RichChoiceView-container {
      z-index: 1;
    }
    
    ^ .foam-u2-view-RichChoiceView-selection-view {
      padding: 12px 20px;
      width: 320px; height: 40px;
    }
    
    ^  .foam-u2-view-RichChoiceView-chevron {
      display: none;
    }

    ^ .foam-u2-view-RichChoiceView .search img {
      top: 8px;
    }

    ^ .foam-u2-view-RichChoiceView-heading {
      padding: 8px 16px;
    }

    ^ .foam-u2-view-RichChoiceView .search input {
      padding: 8px 16px;
    }

    ^ .DefaultRowView-row {
      background: white;
      padding: 8px 16px;
      font-size: 12px;
      color: #424242;
    }

    ^ .DefaultRowView-row:hover {
      background: #f4f4f9;
      cursor: pointer;
    }
  `,

  messages: [
    { name: 'TransferToLabel', message: 'Transfer to' },
    { name: 'PayeeLabel', message: 'Payee' },
    { name: 'TypeLabel', message: 'Type' },
    { name: 'DenominationLabel', message: 'Denomination' },
    { name: 'AccountLabel', message: 'Account' },
    { name: 'ToLabel', message: 'To' },
    { name: 'InvoiceNoLabel', message: 'Invoice No.' },
    { name: 'PONoLabel', message: 'PO No.' }
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
        this.viewData.payeeAccountCheck = newValue;
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
        this.viewData.payeePartnerCheck = newValue;
        if ( this.accountCheck ) this.accountCheck = false;
        if ( this.contactCheck ) this.contactCheck = false;
        if ( newValue ) {
          if ( this.accountOwner != this.partners ) this.accountOwner = this.partners;
          if ( ! this.partners ) this.payee = null;
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
        this.viewData.payeeContactCheck = newValue;
        if ( this.accountCheck ) this.accountCheck = false;
        if ( this.partnerCheck ) this.partnerCheck = false;
        if ( newValue ) {
          if ( this.accountOwner != this.contacts ) this.accountOwner = this.contacts;
          if ( ! this.contacts ) this.payee = null;
        } else if ( this.accountCheck ) {
          if ( this.accountOwner != this.payeeList ) this.accountOwner = this.payeeList;
        } else {
          if ( this.accountOwner != this.partners ) this.accountOwner = this.partners;
        }
      }
    },
    {
      name: 'payeeList',
      factory: function() {
        if ( this.invoiceMode ) {
          return this.invoice.payeeId;
        }
      },
      postSet: function(oldValue, newValue) {
        this.viewData.payeeList = newValue;
        if ( this.accountCheck && this.accountOwner != newValue ) {
          this.accountOwner = newValue;
        }
        var self = this;
        this.user.partners.junctionDAO
          .where(this.EQ(this.UserUserJunction.TARGET_ID, newValue))
          .select()
          .then(function(result) {
            var junctions = result.array;
            if ( junctions.length == 0 ) {
              self.partners = null;
            } else {
              self.partners = junctions[0].partnerId;
            }
          });
      }
    },
    {
      name: 'payeeListView',
      postSet: function(oldValue, newValue) {
        this.payeeList = newValue;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.tx.ui.PayeeSelectionView', viewData: X.data.viewData },
          search: true,
          sections: [
            {
              heading: 'Select a payee',
              dao: X.data.userDAO
              .where(
                X.data.OR(
                  X.data.EQ(X.data.User.ID, X.data.user.id),
                  X.data.NEQ(X.data.User.ID, X.data.viewData.payer)))
            }
          ]
        }
      }
    },
    {
      name: 'partners',
      postSet: function(oldValue, newValue) {
        this.viewData.payeePartner = newValue;
        if ( this.partnerCheck && this.accountOwner != newValue ) {
          this.accountOwner = newValue;
        }
      },
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao$: X.data.slot(function(payeeList)  {
            var payeeId = payeeList === undefined ? '' : payeeList;
            var mdao = foam.dao.MDAO.create({ of: this.PublicUserInfo });
            this.user.partners.junctionDAO
              .limit(50)
              .where(this.EQ(this.UserUserJunction.TARGET_ID, payeeId))
              .select()
              .then(function(result) {
                result.array.map(function(junction) {
                  mdao.put(junction.partnerInfo);
                })
              });
            return mdao;
          }),
          objToChoice: function(user) {
            return [user.id, user.toSummary() + ' - (' + user.email + ')'];
          }
        });
      }
    },
    {
      name: 'contacts',
      postSet: function(oldValue, newValue) {
        this.viewData.payeeContact = newValue;
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
            return [contact.id, contact.toSummary() + ' - (' + contact.email + ')'];
          }
        });
      }
    },
    {
      name: 'accountOwner',
      postSet: function(oldValue, newValue) {
        this.viewData.payee = newValue;
        var self = this;
        if ( this.partnerCheck || this.contactCheck ) {
          this.viewData.payeeAccount = null;

          var self = this;
          this.accountDAO
            .where(
              this.AND(
                this.NEQ(this.Account.ID, this.viewData.payerAccount),
                this.EQ(this.Account.OWNER, newValue)))
            .select()
            .then(function(a) {
              var accounts = a.array;
              if ( accounts.length != 0 ) {
                if ( self.denominations === undefined && self.viewData.payeeDenomination ) {
                  self.denominations = self.viewData.payeeDenomination;
                } else {
                  self.denominations = accounts[0].denomination;
                }
              }
            });
          
        } else {
          this.accountDAO
          .where(
            this.AND(
              this.NEQ(this.Account.ID, this.viewData.payerAccount),
              this.AND(
                this.EQ(this.Account.OWNER, newValue || ''),
                this.AND(
                  this.NOT(this.INSTANCE_OF(net.nanopay.account.AggregateAccount)),
                  this.NOT(this.INSTANCE_OF(net.nanopay.account.TrustAccount))
                )
              )
            )
          )
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) {
              self.viewData.payeeAccount = null;
            }  else {
              if ( self.types === undefined && self.viewData.payeeType ) {
                self.types = self.viewData.payeeType;
              } else {
                self.types = accounts[0].type;
              }
            } 
          });
        }

        if ( this.contactCheck ) {
          this.user.contacts
          .where(this.EQ(this.Contact.ID, newValue || ''))
          .select()
          .then(function(u) {
            var contacts = u.array;
            if ( contacts.length > 0 ) {
              self.payee = contacts[0];
              self.viewData.payeeCard = contacts[0];
            }
          });
        } else {
          this.userDAO
          .where(this.EQ(this.User.ID, newValue))
          .select()
          .then(function(u) {
            var users = u.array;
            if ( users.length > 0 ) {
              self.payee = users[0];
              self.viewData.payeeCard = users[0];
            } else {
              self.payee = null;
            }
          });
        }
      }
    },
    {
      name: 'types',
      postSet: function(oldValue, newValue) {
        this.viewData.payeeType = newValue;
        var self = this;
        this.accountDAO
          .where(
            this.AND(
              this.NEQ(this.Account.ID, this.viewData.payerAccount),
              this.AND(
                this.EQ(this.Account.OWNER, this.accountOwner || ''),
                this.EQ(this.Account.TYPE, newValue))))
          .select()
          .then(function(a) {
            var accounts = a.array;
            if ( accounts.length == 0 ) return;
            if ( self.denominations === undefined && self.viewData.payeeDenomination ) {
              self.denominations = self.viewData.payeeDenomination;
            } else if ( self.accountCheck ) {
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
      },
    },
    {
      name: 'denominations',
      postSet: function(oldValue, newValue) {  
        this.viewData.payeeDenomination = newValue;    
        if ( this.accountCheck ) {
          var self = this;
          this.accountDAO
            .where(
              this.AND(
                this.AND(
                  this.EQ(this.Account.TYPE, this.types),
                  this.EQ(this.Account.DENOMINATION, newValue)), 
                this.AND(
                  this.NEQ(this.Account.ID, this.viewData.payerAccount),
                  this.EQ(this.Account.OWNER, this.accountOwner || ''))))
            .select()
            .then(function(a) {
              var accounts = a.array;
              if ( accounts.length == 0 ) return;
              if ( self.accounts === undefined && self.viewData.payeeAccount ) {
                self.accounts = self.viewData.payeeAccount;
              } else {
                self.accounts = accounts[0].id;
              }
            });
          }
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
                  X.data.AND(
                    X.data.NEQ(X.data.Account.ID, X.data.viewData.payerAccount),
                    X.data.EQ(X.data.Account.OWNER, X.data.accountOwner || '')),
                  X.data.AND(
                    X.data.EQ(X.data.Account.DENOMINATION, denominations || ''),
                    X.data.EQ(X.data.Account.TYPE, types || ''))));
          }),
          objToChoice: function(account, obj) {
            var choice = account.name;
            var type = account.type;
            if ( type == 'DigitalAccount' ) {
              choice = account.name ? account.name : 'Digital Account';
            }
            if ( type.length >= 11 && type.substring(type.length - 11) == 'BankAccount')  {
              var length = account.accountNumber.length;
              choice = `${account.name} ${obj.BankAccount.mask(account.accountNumber)}`;
            }
            return [ account.id, choice ];
          }
        });
      }
    },
    {
      name: 'hasContactPermission',
      value: false
    }
  ],

  methods: [
    function init() {
      if ( this.viewData.payeePartnerCheck === undefined ) {
        this.viewData.payeeAccountCheck = this.accountCheck;;
        this.viewData.payeePartnerCheck = this.partnerCheck;
        this.viewData.payeeContactCheck = this.contactCheck;
      } else if ( this.viewData.payeePartnerCheck ) {
        this.payeeList = this.viewData.payeeList;
        this.partners = this.viewData.payeePartner;
        this.partnerCheck = true;
      } else if ( this.viewData.payeeContactCheck ) {
        this.payeeList = this.viewData.payeeList;
        this.contacts = this.viewData.payeeContact;
        this.contactCheck = true;
      } else {
        this.payeeList = this.viewData.payeeList;
      }

      this.SUPER();
    },

    function initE() {
      this.auth.check(null, 'transfer.to.contact').then((result) => {
        this.hasContactPermission = result;
      });
      this.SUPER();
      
      this
        .addClass(this.myClass())
        .start('div').addClass('detailsCol')
          .start('p').add(this.TransferToLabel).addClass('bold').end()

          .start().hide(this.slot(function(partnerCheck,  contactCheck, invoiceMode) {
            return partnerCheck || contactCheck || invoiceMode;
          }))
            .start('p').add(this.PayeeLabel).end()
            .startContext({ data: this})
              .start(this.PAYEE_LIST_VIEW).end()
            .endContext()
            .br()
          .end()

          .start().addClass('choice')
            .start('div').addClass('confirmationContainer')
              .tag({ class: 'foam.u2.md.CheckBox', data$: this.accountCheck$ })
              .start('p').addClass('confirmationLabel').add('Transfer to payee account').end()
            .end()
            .start('div').addClass('confirmationContainer')
              .tag({ class: 'foam.u2.md.CheckBox', data$: this.partnerCheck$ })
              .start('p').addClass('confirmationLabel').add('Transfer to payee partner account').end()
            .end()
            .start('div').addClass('confirmationContainer').show(this.slot(function(hasContactPermission, invoiceMode) {
              return hasContactPermission && ! invoiceMode;
            }))
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

          .start()
            .start().hide(this.slot(function(partnerCheck,  contactCheck, invoiceMode) {
              return partnerCheck || contactCheck || invoiceMode;
            }))
              .start('p').add(this.TypeLabel).end()
              .start('div').addClass('dropdownContainer')
                .start(this.TYPES).end()
                .start('div').addClass('caret').end()
              .end()
            .end()


            .start('p').add(this.DenominationLabel).end()
            .start('div').addClass('dropdownContainer')
              .start(this.DENOMINATIONS).end()
              .start('div').addClass('caret').end()
            .end()
            .br()
            .start().hide(this.slot(function(partnerCheck,  contactCheck, invoiceMode) {
              return partnerCheck || contactCheck || invoiceMode;
            }))
              .start('p').add(this.AccountLabel).end()
              .start('div').addClass('dropdownContainer')
                .start(this.ACCOUNTS).end()
                .start('div').addClass('caret').end()
              .end()
            .end()

          .end()
        .end()
        .start('div').enableClass('divider', this.payee$).end()
        .start('div').addClass('fromToCol')
          .start('div').addClass('invoiceDetailContainer').enableClass('hidden', this.invoiceMode$, true)
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.InvoiceNoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.invoiceNumber).end()
            .br()
            .start('p').addClass('invoiceLabel').addClass('bold').add(this.PONoLabel).end()
            .start('p').addClass('invoiceDetail').add(this.viewData.purchaseOrder).end()
          .end()
          .start().enableClass('hidden', this.payee$.map(function(value) {
            return value ? false : true;
          }))
            .start('p').add(this.ToLabel).addClass('bold').end()
            .tag({ class: 'net.nanopay.ui.transfer.TransferUserCard', user$: this.payee$ })
          .end()
        .end();
    }
  ],

  listeners: [
    function typeChoices(view) {
      this.accountDAO
        .where(
          this.AND(
            this.NEQ(this.Account.ID, this.viewData.payerAccount),
            this.AND(
              this.EQ(this.Account.OWNER, this.accountOwner || ''),
              this.AND(
                this.NOT(this.INSTANCE_OF(net.nanopay.account.AggregateAccount)),
                this.NOT(this.INSTANCE_OF(net.nanopay.account.TrustAccount))
              )
            )
          )
        )
        .select(this.GROUP_BY(net.nanopay.account.Account.TYPE, this.COUNT()))        
        .then(function(g) {
          view.choices = Object.keys(g.groups).map(function(t) {
            var strArray = t.match(/[A-Z][a-z]+|[0-9]+/g);
            var accountType = strArray.join(" ");
            var index = t.indexOf(strArray[0]);
            if ( index > 0 ) accountType = t.substr(0, index) + " " + accountType;
            return [t, accountType];
        });
      });
    },

    function denominationChoices(view) {
      this.accountDAO
        .where(
          this.AND(
            this.NEQ(this.Account.ID, this.viewData.payerAccount),
            this.AND(
              this.EQ(this.Account.OWNER, this.accountOwner || ''),
              this.EQ(this.Account.TYPE, this.types || ''))))
        .select(this.GROUP_BY(net.nanopay.account.Account.DENOMINATION, this.COUNT()))        
        .then(function(g) {
          view.choices = Object.keys(g.groups).map(function(d) {
            return [d, d];
        });
      });
    }
  ]
});
