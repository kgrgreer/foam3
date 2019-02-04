foam.CLASS({
  package: 'net.nanopay.meter.compliance.validator',
  name: 'CanadianSanctionsListValidator',

  documentation: `Validator that checks user and business against
    Canadian Sanctions List.
    
    Data is obtained from The Government of Canada's website
    - Consolidated Canadian Autonomous Sanctions List.
    URL: https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx.
    
    Assuming that the sanction list data is already loaded into
    canadianSanctionDAO, The validator matches a given user's
    business name, first name and last name against the records
    in the DAO.`,

  implements: [
    'net.nanopay.meter.compliance.ComplianceValidator'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.canadianSanction.Record'
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
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: `
        User user = (User) obj;
        Count found = (Count) ((DAO) x.get("canadianSanctionDAO")).where(
          MLang.OR(
            new ContainsIC(MLang.prepare(Record.ENTITY), MLang.prepare(user.getBusinessName())),
            MLang.AND(
              new ContainsIC(MLang.prepare(Record.LAST_NAME), MLang.prepare(user.getLastName())),
              new ContainsIC(MLang.prepare(Record.GIVEN_NAME), MLang.prepare(user.getFirstName()))
            )
          )
        ).limit(1).select(new Count());

        return found.getValue() == 0
          ? ComplianceValidationStatus.VALIDATED
          : ComplianceValidationStatus.REJECTED;
      `
    }
  ]
});