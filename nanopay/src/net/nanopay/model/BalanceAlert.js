foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BalanceAlert',

  tableColumns: [
    'bankName', 'balance', 'minBalance', 'status'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Threshold',
      name: 'threshold'
    },
    {
      class: 'String',
      name: 'bankName',
      tableCellFormatter: function(value, obj, rel){
        obj.owner$find.then(function(a){
          this.add(a ? a.organization : '');
        }.bind(this));
      }
    },
    {
      class: 'Long',
      name: 'balance',
      tableCellFormatter: function(value, obj, rel){
        var total;
        obj.owner$find.then(function(a){
          if( a.accounts[0]){
            a.accounts.forEach(function(acc){
              total = total + acc.balance;
            });
          }
        });
        this.add(total ? total : '');
      }
    },
    {
      class: 'Long',
      name: 'minBalance',
      tableCellFormatter: function(value, obj, rel){
        obj.owner$find.then(function(a){
          this.add(a.balance ? '$ ' + a.balance : '');          
        }.bind(this));
      }
    },
    {
      class: 'String',
      name: 'status',
      tableCellFormatter: function(value, obj, rel){
        obj.owner$find.then(function(a){
          this.add(a.status ? a.status : '');                    
        }.bind(this));
      }
    }
  ]
});