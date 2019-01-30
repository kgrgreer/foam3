foam.CLASS({
  package: 'net.nanopay.meter.compliance.validator',
  name: 'CanadianSanctionsListValidator',

  documentation: `Validator that checks user and business against
    Canadian Sanctions List.
    
    Data is obtained from The Government of Canada's website
    - Consolidated Canadian Autonomous Sanctions List.
    URL: https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx.`,

  implements: [
    'net.nanopay.meter.compliance.ComplianceValidator'
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.meter.compliance.ComplianceValidationStatus'
  ],

  methods: [
    {
      name: 'canValidate',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: `
        return obj instanceof User;
      `
    },
    {
      name: 'validate',
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: `
        // Check Canadian sanctions list
        return ComplianceValidationStatus.INVESTIGATING;
      `
    }
  ]
});