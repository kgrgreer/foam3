foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'Institution',
  documentation: 'Bank/Institution',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
    },
    {
      class: 'String',
      name: 'name',
      label: 'Name',
      documentation: 'Name of bank or institute.',
      required: true
    },
    {
      class: 'String',
      name: 'abbreviation',
      documentation: 'Abbreviated form of bank or institute.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryId',
      documentation: 'Bank or institutes primary country.',
      label: 'Country'
    },
    {
      class: 'String',
      name: 'institutionNumber',
      documentation: 'Financial system specific Institution' +
          ' number. Such as Canadian Financial Institution Number'
    },
    {
      class: 'String',
      name: 'swiftCode',
      label: 'SWIFT Code'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.institutionNumber == this.name ?
                null :
                this.abbreviation == '' ? this.name : `${this.name}(${this.abbreviation})`;
      },
      javaCode: `
        if ( this.getInstitutionNumber() == this.getName() ) {
          return null;
        } else {
          return  SafetyUtil.isEmpty(this.getAbbreviation()) ? this.getName() : this.getName() + "(" + this.getAbbreviation() + ")";
        }
      `
    }
  ]
});
