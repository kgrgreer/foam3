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
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.canadianSanction.Record',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'canValidate',
      args: [
        {
          name: 'obj',
          type: 'foam.core.FObject'
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
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        User user = (User) obj;
        Predicate predicate = obj instanceof Business
          ? new ContainsIC.Builder(x)
            .setArg1(MLang.prepare(Record.ENTITY))
            .setArg2(MLang.prepare(user.getBusinessName()))
            .build()
          // TODO: Add support for fuzzy string matching for name search
          : MLang.AND(
              MLang.EQ(Record.LAST_NAME, user.getLastName().toUpperCase()),
              MLang.EQ(Record.GIVEN_NAME, user.getFirstName().toUpperCase())
          );
        Count found = (Count) ((DAO) x.get("canadianSanctionDAO"))
          .where(predicate).limit(1).select(new Count());

        return found.getValue() == 0
          ? ComplianceValidationStatus.VALIDATED
          : ComplianceValidationStatus.REJECTED;
      `
    }
  ]
});