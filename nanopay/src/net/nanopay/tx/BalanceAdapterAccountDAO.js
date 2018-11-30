foam.CLASS({
  package: 'net.nanopay.tx',
  name:'BalanceAdapterAccountDAO',
  extends: 'foam.dao.AbstractDAO',
  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'currentAccount',
    'balanceDAO',
    'userDAO'
  ],

  requires: [
    'net.nanopay.account.Balance'
  ],

  methods: [
    function find_(x, id) {
      console.log("find method balanceadpater account dao");
    },
    function find(id) {
     balance = this.balanceDAO.where(this.AND(
        this.EQ(net.nanopay.account.Balance.ACCOUNT_ID, id),
        this.EQ(net.nanopay.account.Balance.CURRENCY_CODE, this.currentAccount)
      )).select().then(function(result){
        if ( result.array.length != 0 && id != 0 ) {
          return net.nanopay.account.Balance.create({
            id: result.array[0].accountId,
            balance: result.array[0].balance
          });
        } else {
          return net.nanopay.account.Balance.create({
            id: id,
            balance: 0
          });
        }
      });
      return balance;
    }
  ]
})
