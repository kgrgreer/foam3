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
      class: 'String',
      name: 'status'
    }
  ],
  methods: [
    {
      name: 'getState',
      type: 'Long',
      code: `
        return (long) math.floor(( (this.value / this.maxValue) * 100)) ;
      `,
      javaCode: `
        return (long) java.lang.Math.floor(( (getValue() / getMaxValue()) * 100)) ;
      `
    },
  ]

})
