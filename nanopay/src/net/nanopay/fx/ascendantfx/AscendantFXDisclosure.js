
foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXDisclosure',
  extends: 'net.nanopay.disclosure.Disclosure',

  documentation: `Hold Ascendant FX specific disclosures`,

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: 'For Country specific disclosures,'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Region',
      name: 'state',
      documentation: 'For State/Province/Region specific disclosures'
    },

  ],

});
