foam.CLASS({
  package: 'net.nanopay.crunch.test',
  name: 'TestCapableDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    A DAO decorator that returns a Capable object to do testing with.
  `,

  javaImports: [
    'foam.nanos.crunch.lite.Capable'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        Capable capable = new TestCapable.Builder(x)
          .setId((String) id)
          .build();
        
        // Add arbitrary capability BusinessAddressData as user requirement
        capable.setUserCapabilityRequirements(new String[]{
          // Unlock payments in Brazil
          "554af38a-8225-87c8-dfdf-eeb15f71215f-49"
        });

        // Add NatureCode capability as object requirement
        capable.setRequirements(x, new String[]{
          // Test an arbitrary nature code;
          // TODO: replace with nature code selection when ready
          "cbb67837-54ac-49dc-a596-9fdddbc6d806-br-naturecode-1"
        });
        
        return (foam.core.FObject) capable;
      `
    },
  ],
});