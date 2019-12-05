foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'ProgressBarData',
  plural: 'PBDs',
  properties: [
    {
      class: 'String',
      name: 'id',
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Long',
      name: 'value'
    },
    {
      class: 'Long',
      name: 'maxValue',
      value: 100
    },
    {
      class: 'Double',
      name: 'state',
      expression: function(value, maxValue){
        return ( (value / maxValue) * 100);
      }
    },
    {
      class: 'String',
      name: 'status'
    }
  ]

})
