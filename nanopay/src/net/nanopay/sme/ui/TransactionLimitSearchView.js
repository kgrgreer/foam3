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
  package: 'net.nanopay.sme.ui',
  name: 'TransactionLimitSearchView',
  extends: 'foam.u2.Controller',
  documentation: `
    View detailing company/business transaction limit information.
  `,

  imports: [
    'user',
    'businessDAO',
    'accountDAO',
    'transactionLimitService',
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.view.RichChoiceView',
    'foam.u2.view.ChoiceView',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.detail.SectionView'
  ],

  css: `
    ^ {
      padding: 24px;
      min-height: 300px;
    }
    ^ .info-container {
      margin-top: 30px;
    }
    ^ .table-content {
      height: 21px;
    }
    ^ .foam-u2-view-RichChoiceView-selection-view {
      width : 300px
    }
   .card {
      display: flex;
      flex-direction: row;
    }
    ^ .limitDetail {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
    }
    ^ .foam-u2-detail-SectionView {
      width: 50%;
      margin-right: 30px;
    }
  `,

  sections: [
    {
      name: 'result',
      title: 'Your transaction limit details',
    },
    {
      name: 'detail',
      title: '',
    },
  ],

  messages: [
    { name: 'TITLE', message: 'Transaction limit' },
    { name: 'SOURCE_BUSINESS_PLACE_HOLDER', message: 'Please select a business' },
    { name: 'SOURCE_ACCOUNT_PLACE_HOLDER', message: 'Please select a bank account' },
  ],

  properties: [
    {
      class: 'Array',
      name: 'limitProbeDetail',
      documentation: 'An Array of the transaction limit probe informations',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'business',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.bank.BankAccount',
      name: 'sourceBankAccount',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'sourceFilteredDAO',
      expression: function(business) {
        this.sourceBankAccount = 0;
        return this.accountDAO.where(
          this.AND(
            this.EQ(net.nanopay.bank.BankAccount.CREATED_BY, business),
            this.EQ(net.nanopay.bank.BankAccount.STATUS, net.nanopay.bank.BankAccountStatus.VERIFIED)
          )
        )
      }
    },
    {
      class: 'Array',
      name: 'sendOrReceiving',
      documentation: 'An array containing send or receive, send present true and receive present false'
    },
    {
      class:'Boolean',
      name: 'send',
      label: 'Sending or Receiving',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices$: X.data.sendOrReceiving$,
          isHorizontal: true,
        }
      },
      section: 'result'
    },
    {
      class: 'Array',
      name: 'groupApplyTo',
    },
    {
      class: 'String',
      name: 'applyTo',
      label: 'Limit apply to',
      documentation: 'limit on Account, Business, User',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: X.data.groupApplyTo$,
          defaultValue$: X.data.groupApplyTo$.map((choices) => {
            return Array.isArray(choices) && choices.length > 0 ? choices[0][0] : '';
          })
        }
      },
      section: 'result'
    },
    {
      class: 'Array',
      name: 'frequency',
      documentation: 'choices for transaction limit period'
    },
    {
      class: 'String',
      name: 'limitFrequency',
      label: 'Transaction limit period',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices$: X.data.frequency$,
          defaultValue$: X.data.frequency$.map((choices) => {
            return Array.isArray(choices) && choices.length > 0 ? choices[0][0] : '';
          })
        }
      },
      section: 'result'
    },
    {
      class: 'String',
      name: 'transactionType',
      label:'type of Transaction',
      documentation: 'Source Currency to Destination Currency',
      visibility: 'RO',
      section: 'detail'
    },
    {
      class: 'String',
      name: 'ruleDescription',
      visibility: 'RO',
      preSet: function(o, n) {
        if ( n == '' ) {
          return 'There is no description';
        }
        return n;
      },
      section: 'detail'
    },
    {
      class: 'String',
      name: 'remainLimit',
      label: 'Remaining Limit',
      visibility: 'RO',
      section: 'detail'
    },
    {
      class: 'String',
      name: 'limitAmount',
      visibility: 'RO',
      section: 'detail'
    },
    {
      class: 'FObjectProperty',
      of:'net.nanopay.tx.model.TransactionLimitDetail',
      name: 'currentSelect',
      documentation: 'Current displayed rule',
      postSet: function(o, n) {
        this.send = n.send;
        this.applyTo = n.applyTo.name;
        this.period = n.period.name;
        this.limitAmount = `${n.destinationCurrency} ${n.limitAmount}`;
        this.ruleDescription = n.ruleDescription;
        this.remainLimit = `${n.destinationCurrency}  ${n.remainLimit}`;
        this.transactionType = `${n.sourceCurrency} to ${n.destinationCurrency}`
      }
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this.business = this.user.id;
      this.sourceBankAccount$.sub(this.setTransactionLimit);
      this.send$.sub(this.onGroupApplyToUpdate);
      this.applyTo$.sub(this.onFrequency);
      this.limitFrequency$.sub(this.updateCurrentRule);
      this.addClass(this.myClass()).addClass('card')
        .start()
          .start().addClass('sub-heading').add(this.TITLE).end()
            .start().style({margin: 40})
              .tag(this.RichChoiceView, {
                data$: this.business$,
                sections: [
                  {
                    heading: 'Business',
                    dao: this.businessDAO,
                  }
                ],
                search: true,
                searchPlaceholder: 'Search...',
                choosePlaceholder: this.SOURCE_BUSINESS_PLACE_HOLDER
              })
            .end()
            .start().style({ margin: 40 })
              .add(this.business$.map(() => {
                return this.E()
                  .tag(this.RichChoiceView, {
                    data$: this.sourceBankAccount$,
                    sections: [
                      {
                        heading: 'Bank Account',
                        dao: this.sourceFilteredDAO$proxy
                      }
                    ],
                    search: true,
                    searchPlaceholder: 'Search...',
                    choosePlaceholder: this.SOURCE_ACCOUNT_PLACE_HOLDER
                  });
              }))
            .end()
        .end()
        this.start().style({ flex: '2', 'margin-left': '40px' })
        .add(this.slot(function(limitProbeDetail) {
          if ( limitProbeDetail.length === 0 ) return;
          return self.E().addClass('limitDetail')
                    .tag(self.SectionView, {
                    data: self,
                    sectionName: 'result',
                    showTitle: false
                  })
                    .tag(self.SectionView, {
                    data: self,
                    sectionName: 'detail',
                    showTitle: false
                  })
              }))
        .end()
      .end()
    }
  ],

  listeners: [
    {
      name: 'setTransactionLimit',
      code: async function(X) { 
        if ( this.sourceBankAccount ) {
          try {
            let result = await this.transactionLimitService.getTransactionLimit(X,
              this.sourceBankAccount,
            );
            if ( result.length != 0 ) {
              this.currentSelect = result[0];
              this.limitProbeDetail= result;
              let temp = [];
              for ( rule of this.limitProbeDetail ) {
                if ( temp.length == 2 ) {
                  break;
                } else {
                  let str = rule.send ? 'send' : 'receive'
                  if ( temp.length != 0 ) {
                    temp[0][0] == rule.send ? '' : temp.push([rule.send,str]);
                  } else {
                    temp.push([rule.send,str]);
                  }
                }
              }
              this.sendOrReceiving = temp;
              this.onGroupApplyToUpdate();
            }
          } catch (error) {
            console.log('error')
          }
      }
      }
    },

    function onGroupApplyToUpdate() {
      let temp = []
      for ( rule of this.limitProbeDetail ) {
        if ( temp.length == 3 ) {
          break;
        } else {
          if ( ! temp.includes(rule.applyTo.name) && rule.send === this.send ) { 
            temp.push(rule.applyTo.name)
          };
        }
      }
      this.groupApplyTo = temp;
      this.onFrequency();
    },

    function onFrequency() {
      let temp = []
      for ( rule of this.limitProbeDetail ) {
        if ( temp.length == 3 ) {
          break;
        } else {
          let condition = rule.send === this.send && rule.applyTo.name === this.applyTo;
          if ( ! temp.includes(rule.period.name) && condition ) { temp.push(rule.period.name) };
        }
      }
      this.frequency = temp;
      this.updateCurrentRule();
    },

    function updateCurrentRule() {
      for( rule of this.limitProbeDetail ) {
        if ( rule.send === this.send && rule.applyTo.name === this.applyTo && rule.period.name === this.limitFrequency ) {
          this.currentSelect = rule;
          break;
        }
      }
    },
  ]
});
