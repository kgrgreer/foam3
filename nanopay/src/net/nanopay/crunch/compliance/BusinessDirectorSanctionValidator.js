foam.CLASS({
  package: 'net.nanopay.crunch.compliance',
  name: 'BusinessDirectorSanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates business directors using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.List',
    'net.nanopay.crunch.onboardingModels.BusinessDirectorsData',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.*',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessDirector',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'response',
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        BusinessDirectorsData data = (BusinessDirectorsData) ucj.getData();

        User user = (User) ucj.findSourceId(x);
        String group = user.getSpid() + "-fraud-ops";

        List<BusinessDirector> businessDirectors = new ArrayList<BusinessDirector>(Arrays.asList(data.getBusinessDirectors()));

        ComplianceValidationStatus rulerResult = ComplianceValidationStatus.VALIDATED;
        BusinessDirector director = null;

        String filterRegion = "";
        Date filterLRDFrom = fetchLastExecutionDate(x, ucj.getSourceId(), "Dow Jones Entity");

        Calendar calendar = Calendar.getInstance();
        if ( filterLRDFrom != null ) calendar.setTime(filterLRDFrom);
        calendar.add(Calendar.DATE, -1);
        Date dayBefore = calendar.getTime();

        boolean autoValidated = true;
        for ( int i = 0 ; i < businessDirectors.size() ; i++ ) {

          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          try {
            director = (BusinessDirector) businessDirectors.get(i);
            status = checkDirectorCompliance(x, director, dayBefore);
          } catch (Exception e) {
            status = ComplianceValidationStatus.PENDING;
          }
          if ( status != ComplianceValidationStatus.VALIDATED ) {
            DowJonesResponse response = getResponse();
            rulerResult = ComplianceValidationStatus.PENDING;
            autoValidated = false;

            String directorName = (new StringBuilder(director.getFirstName())
              .append(" ")
              .append(director.getLastName()))
              .toString();

            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x,
                  new DowJonesApprovalRequest.Builder(x)
                    .setObjId(ucj.getId())
                    .setDaoKey("userCapabilityJunctionDAO")
                    .setCauseId(response != null ? response.getId() : 0L)
                    .setCauseDaoKey("dowJonesResponseDAO")
                    .setClassificationEnum(ApprovalRequestClassificationEnum.BUSINESS_DIRECTOR_DOW_JONES)
                    .setMatches(response != null ? response.getResponseBody().getMatches() : null)
                    .setComments("Further investigation needed for director: " + directorName)
                    .setGroup(group)
                    .setCreatedFor(user.getId())
                    .build());
              }
            }, "Business Director Sanction Validator");
          }
        }
        if ( autoValidated ) {
          X userX = ruler.getX().put("subject", ucj.getSubject(x));
          ((CrunchService) userX.get("crunchService")).updateJunction(
            userX,
            ucj.getTargetId(),
            null,
            CapabilityJunctionStatus.APPROVED);
        }

        ruler.putResult(rulerResult);
      `
    },
    {
      name: 'checkDirectorCompliance',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'businessDirector', javaType: 'net.nanopay.model.BusinessDirector' },
        { name: 'dayBefore', javaType: 'java.util.Date' }
      ],
      javaType: 'net.nanopay.meter.compliance.ComplianceValidationStatus',
      javaCode: `
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");

        try {
          String firstName = businessDirector.getFirstName();
          String lastName = businessDirector.getLastName();

          PersonNameSearchData directorSearchData = new PersonNameSearchData.Builder(x)
            .setFirstName(firstName)
            .setSurName(lastName)
            .setFilterLRDFrom(dayBefore)
            .build();

          setResponse(dowJonesService.personNameSearch(x, directorSearchData));

          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          DowJonesResponse response = getResponse();

          if ( response.getTotalMatches() > 0 ) status = ComplianceValidationStatus.INVESTIGATING;

          return status;
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("BeneficialOwnerSanctionValidator failed.", e);
          return ComplianceValidationStatus.PENDING;
        }
      `
    }
  ]
});

