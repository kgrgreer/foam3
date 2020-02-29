foam.CLASS({
  package: 'net.nanopay.exchangeable',
  name: 'AssetClass',
  documentation: 'classifier for determining the haircuts of asset classes',
  ids: [
    'name'
  ],
  properties: [
    {
      class: 'String',
      name: 'name',
      required: true,
      documentation: 'name of the asset class'
    },
    {
      class: 'Long',
      name: 'haircut',
      documentation: ' the rate (as a percentage) by which to assign immediate value to an asset this is a multiplier',
      required: true
    }

  ],

  methods: [
    {
      name: 'cut',
      args: [
        {
          name: 'value',
          type: 'Long'
        }
      ],
      type: 'Long',
      javaCode: ` return ( (value * this.getHaircut()) / 100 );`,
      code: `return ( (value * this.haircut) / 100 );`
    }

  ]
})
