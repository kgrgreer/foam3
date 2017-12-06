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
      name: 'bank'
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
        obj.bank$find(function(a){
          this.add(a.organization)
        }.bind(this));
      }
    },
    {
      class: 'String',
      name: 'balance',
      tableCellFormatter: function(value, obj, rel){
        var total;
        obj.bank$find(function(a){
          a.accounts.forEach(function(acc){
            total = total + acc.balance
          })
          this.add('$ ',total)
        }.bind(this));
      }
    },
    {
      class: 'String',
      name: 'minBalance',
      tableCellFormatter: function(value, obj, rel){
        obj.threshold$find(function(a){
          this.add('$ ', a);          
        }.bind(this));
      }
    },
    {
      class: 'String',
      name: 'status',
      tableCellFormatter: function(value, obj, rel){
        obj.bank$find(function(a){
          this.add(a);                    
        }.bind(this));
      }
    }
  ]
});