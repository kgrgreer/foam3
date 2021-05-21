// TODO: Going to be reworked

/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.settlement',
  name: 'SettlementDashboard',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.dao.MDAO',
    'net.nanopay.account.Account',
    'net.nanopay.settlement.BiLateralAccount',
    'net.nanopay.settlement.SettlementAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.DigitalTransaction'
  ],

  imports: [
    'accountDAO',
    'currencyDAO',
    'scriptDAO',
    'settlementDAO',
    'stack',
    'transactionDAO'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  constants: {
  },

  classes: [
    {
      name: 'SimpleTxn',
      ids: [ 'from', 'to' ],
      tableColumns: [ 'from', 'to', 'amount' ],
      properties: [
        'sourceAccount',
        'destinationAccount',
        'from',
        'to',
        {
          //class: 'Currency',
          name: 'amount'
        }
      ]
    }
  ],

  css: `
    ^ {
      padding: 20px;
    }

    ^ thead th {
      background: white;
      padding: 0;
      text-align: center;
    }

    ^ tbody td {
      text-align: center;
    }

    tbody {
       overflow: auto;
       width: 100%;
       height: 150px;
     }

    ^ tbody tr { background: white; }

    ^ table {
       box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
       width: auto;
       border: 0;
      }

    ^header {
      box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
      background: white;
      padding: 8px;
      margin: 8px 0;
    }

    ^header input { float: right }

    ^ .permissionHeader {
      color: #444;
      text-align: left;
      padding-left: 6px;
    }

    ^ .property-groupQuery {
      margin-left: 8px;
    }
  `,

  properties: [
    {
      name: 'banks'
    },
    {
      name: 'currency'
    },
    {
      name: 'biLateral',
      factory: function() { return this.MDAO.create({of: this.SimpleTxn})},
      view: { class: 'foam.u2.view.TableView' }
    },
    {
      name: 'multiLateral',
      factory: function() { return this.MDAO.create({of: this.SimpleTxn})},
      view: { class: 'foam.u2.view.TableView' }
    },
    {
      name: 'multiLateralNet',
      factory: function() { return this.MDAO.create({of: this.SimpleTxn})},
      view: { class: 'foam.u2.view.TableView' }
    }
  ],

  methods: [
    async function initData() {
      this.currency = await this.currencyDAO.find('CAD');
      var s = await this.accountDAO.where(this.INSTANCE_OF(this.SettlementAccount)).select();
      this.banks = s.array;
      for ( var i = 0 ; i < this.banks.length ; i++ ) {
        var b = this.banks[i];
        var owner = await b.owner$find;
        b.name = owner.firstName.replace(' LIMITED', '').replace('THE ', '').replace(' PLC.', '').replace(' PVT. LTD','');
      }
    },

    function formatCurrency(amount) {
      return this.currency.format(amount);
    },

    async function getBalance(b1, b2) {
      var acct = await this.accountDAO.find(this.AND(
        this.INSTANCE_OF(this.BiLateralAccount),
        this.EQ(this.Account.OWNER, b2.owner),
        this.EQ(this.BiLateralAccount.SEND_TO_ACCOUNT, b1.id-10)
      ));
      if ( ! acct ) return 0;
      var balance = await acct.findBalance(this.__subContext__);
      b2.balance += balance;
      if ( balance != 0 ) {
        this.biLateral.put(this.SimpleTxn.create({
          sourceAccount: balance < 0 ? b2.id : b1.id,
          destinationAccount: balance < 0 ? b1.id : b2.id,
          from:   balance < 0 ? b2.name : b1.name,
          to:     balance < 0 ? b1.name : b2.name,
          amount: this.formatCurrency(Math.abs(balance))
        }));
      }
      return balance;
    },

    function formatAmount(e, amount) {
      if ( ! amount ) { e.add(' '); return  }
      e.add(this.formatCurrency(Math.abs(amount)).replace(' CAD', ''));
      e.style({color: amount < 0 ? 'red' : '#333'});
    },

    async function addBalance(e, b1, b2) {
      if ( b1 == b2 ) { e.add(' '); return; }
      var balance = await this.getBalance(b1, b2);
      this.formatAmount(e, balance);
    },

    async function addBank(e, b) {
      e.add(b.name);
    },

    async function settle(dao, type) {
      var settlement = net.nanopay.settlement.Settlement.create({
        type: type
      });

      // TODO: add in a spinner
      
      this.settlementDAO.put(settlement).then(settlement => {
        this.refresh();
      })

      /*
      TODO: think this code was left for actual implementation
      await dao.select(t => {
        var amount = parseFloat(t.amount.replace('Rf','').replace(' CAD','').replace(',',''))*100;
        console.log('txn', t.sourceAccount, t.from, t.destinationAccount, t.to, t.amount, amount);
        // trust accounts
        this.transactionDAO.put(this.DigitalTransaction.create({
          amount:              amount,
          sourceAccount:       t.sourceAccount,
          destinationAccount:  t.destinationAccount,
          destinationCurrency: 'MVR',
          sourceCurrency:      'MVR',
          name:                name
        }));
        // settlement accounts
        this.transactionDAO.put(this.DigitalTransaction.create({
          amount:              amount,
          sourceAccount:       t.sourceAccount-10,
          destinationAccount:  t.destinationAccount-10,
          destinationCurrency: 'MVR',
          sourceCurrency:      'MVR',
          name:                name
        }));
      });*/
    },

    async function initE() {
      var self = this;
      this.SUPER();
      await this.initData();

      var banks = this.banks;

      this
      .br()
      .addClass(this.myClass())
      .start('table').attrs({border: '1'})
        .start('thead')
          .start('tr')
            .start('th').end()
            .forEach(banks, function(b) {
              this.start('td').style({width:'12%', background:'white', 'vertical-align': 'baseline', 'text-align': 'center'}).add(b.name).end();
            }).
          end()
        .end()
        .start('tbody')
          .forEach(banks, function(b) {
            this.start('tr')
              .start('td').style({'text-align': 'left'}).call(function() { self.addBank(this, b); }).end()
              .forEach(banks, function(b2) {
                this.start('td').style({'white-space': 'nowrap', 'text-align': 'right'}).call(
                  function() { self.addBalance(this, b, b2); }
                ).end();
              })
            .end();
          })
          .start('tr')
            .start('td').style({"text-align": 'right', width: '100%'}).add('Net ').end()
            .forEach(banks, function(b) {
              this.start('th').style({'white-space': 'nowrap', 'text-align': 'right', color: b.balance$.map(function(b) { return b < 0 ? 'red' : 'black'; })}).add(b.balance$.map(function(b) { return self.formatCurrency(Math.abs(b)).replace(' MVR', ''); })).end();
            }).
          end()
      .end()
    .end()
    .br()
    .add(this.REFRESH);

    this.populateTxns();
  }
  ],


  listeners: [
    {
      name: 'populateTxns',
      isMerged: true,
      mergeDelay: 2000,
      code: async function() {
        var centralBankPoolAccountId = 15;

        var centralBankPoolAccount = await this.accountDAO.find(centralBankPoolAccountId);

        var banks2 = foam.Array.clone(this.banks);
        var s = 0;
        var e = banks2.length-1;
        banks2 = banks2.sort(function(b1, b2) { return foam.Number.compare(b1.balance, b2.balance); });
        while ( s < e ) {
          var amt = Math.min(Math.abs(banks2[s].balance), banks2[e].balance);
          if ( amt ) {
            this.multiLateralNet.put(this.SimpleTxn.create({
              sourceAccount:      banks2[s].id,
              destinationAccount: banks2[e].id,
              from:               banks2[s].name,
              to:                 banks2[e].name,
              amount:             this.formatCurrency(amt)
            }));
            banks2[s].balance += amt;
            banks2[e].balance -= amt;
          }
          if ( banks2[s].balance == 0 && s < e ) s++;
          if ( banks2[e].balance == 0 && s < e ) e--;
        }

        this.banks.forEach(b => {
          if ( b.balance != 0 ) {
            this.multiLateral.put(this.SimpleTxn.create({
              sourceAccount:      b.balance < 0 ? b.id : centralBankPoolAccountId,
              destinationAccount: b.balance < 0 ? centralBankPoolAccountId : b.id,
              from:               b.balance < 0 ? b.name : centralBankPoolAccount.name,
              to:                 b.balance < 0 ? centralBankPoolAccount.name : b.name,
              amount:             this.formatCurrency(Math.abs(b.balance))
            }));
          }
        });

      var mCount = await this.multiLateral.select(this.COUNT());
      var bCount = await this.biLateral.select(this.COUNT());
      var nCount = await this.multiLateralNet.select(this.COUNT());

      this.br()
      .br()
      .start('h2').add('Multilateral Settlement').end()
      .add(this.MULTI_LATERAL)
      .br()
      .add(mCount.value, ' transactions')
      .br()
      .br()
      .add(this.SETTLE_MULTILATERALLY)
      .br()
      .br()
      .start('h2').add('Bilateral Settlement').end()
      .add(this.BI_LATERAL)
      .br()
      .add(bCount.value, ' transactions')
      .br()
      .br()
      .add(this.SETTLE_BILATERALLY)
      .br()
      .br()
      .start('h2').add('Bilateral Net Settlement').end()
      .add(this.MULTI_LATERAL_NET)
      .br()
      .add(nCount.value, ' transactions')
      .br()
      .br()
      .add(this.SETTLE_BILATERALLY_NET);
    }
    }
  ],

  actions: [
    function refresh() {
      this.stack.push(this.cls_);
    },

    function settleMultilaterally() {
      this.settle(this.multiLateral, net.nanopay.settlement.SettlementTypes.MULTILATERAL);
    },

    function settleBilaterally() {
      this.settle(this.biLateral, net.nanopay.settlement.SettlementTypes.BILATERAL);
    },

    function settleBilaterallyNet() {
      this.settle(this.multiLateralNet, net.nanopay.settlement.SettlementTypes.BILATERAL_NET);
    }
  ]
});
