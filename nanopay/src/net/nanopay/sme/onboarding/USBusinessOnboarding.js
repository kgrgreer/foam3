foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'USBusinessOnboarding',

  requires: [
    'net.nanopay.model.PersonalIdentification',
    'foam.nanos.auth.Country',
  ],

  imports: [
    'countryDAO',
  ],

  properties: [
    // {
    //   class: 'String',
    //   name: 'legalEntityIdentifier',
    //   documentation: 'Legal Entity Identifier (LEI)'
    // },
    // {
    //   class: 'String',
    //   name: 'legalEntityIdentifierExpDate',
    //   documentation: 'Legal Entity Identifier (LEI) Expiration Date'
    // }, 
    {
      section: 'personalIdentificationSection',
      class: 'FObjectProperty',
      name: 'signingOfficerIdentification',
      of: 'net.nanopay.model.PersonalIdentification',
      view: { class: 'net.nanopay.ui.PersonalIdentificationView' },
      factory: function() {
        return this.PersonalIdentification.create({});
      },
    },
    {
      class: 'Date',
      name: 'businessFormationDate',
      documentation: 'Date of Business Formation or Incorporation.'
    },   
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryOfBusinessFormation',
      documentation: 'Country or Jurisdiction of Formation or Incorporation.',
      view: function(args, X) {
        var self = this;
        var m = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: '- Please select -',
          dao: X.countryDAO.where(m.OR(
            m.EQ(foam.nanos.auth.Country.NAME, 'Canada'),
            m.EQ(foam.nanos.auth.Country.NAME, 'USA')
          )),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        };
      },
    },
    {
      class: 'String',
      name: 'businessRegistrationNumber',
      documentation: 'Federal Tax ID Number (EIN) or Business Registration Number'
    },
  ]
});
