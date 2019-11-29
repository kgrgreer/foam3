foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'ProgressBarData',
  properties: [
    {
      class: 'String',
      name: 'id',
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
      class: 'Long',
      name: 'state',
      expression: function(value, maxValue){
        return Math.floor(( (value / maxValue) * 100))
      }
    },
    {
      class: 'String',
      name: 'status'
    }
  ]

})
