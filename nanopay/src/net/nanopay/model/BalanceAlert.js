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
          this.add(a ? a.firstName : '');
        }.bind(this));
      }
    },
    {
      class: 'Long',
      name: 'balance',
      tableCellFormatter: function(value, obj, rel){
        this.add('$', obj.balance.toFixed(2));
      }
    },
    {
      class: 'Long',
      name: 'minBalance',
      tableCellFormatter: function(value, obj, rel){
        this.add('$', obj.minBalance.toFixed(2));
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