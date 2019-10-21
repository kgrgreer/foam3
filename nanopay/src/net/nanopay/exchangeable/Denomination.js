foam.CLASS({
  package: 'net.nanopay.exchangeable',
  name: 'Denomination',
  abstract: true,

  documentation: `The abstract model for fungible digitized assets`,

  ids: [
    'alphabeticCode'
  ],

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'name of the asset',
      required: true
    },
    {
      class: 'String',
      name: 'alphabeticCode',
      label: 'Code',
      documentation: 'The alphabetic code associated with the asset. Used as an ID.',
      required: true
    },
    {
      class: 'Int',
      name: 'precision',
      documentation: 'Defines the number of digits that come after the decimal point. ',
      required: true
    }
  ],

  methods: [
    {
      name: 'toSummary',
      documentation: `When using a reference to the currencyDAO, the labels associated
        to it will show a chosen property rather than the first alphabetical string
        property. In this case, we are using the alphabeticCode.
      `,
      code: function(x) {
        return this.alphabeticCode;
      }
    },
    {
      name: 'format',
      args: [
        {
          class: 'foam.core.Currency',
          name: 'amount'
        }
      ],
      type: 'String'
    }
  ]
});
