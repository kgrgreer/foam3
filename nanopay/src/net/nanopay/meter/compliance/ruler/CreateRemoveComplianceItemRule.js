foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'CreateRemoveComplianceItemRule',

  documentation: 'Creates or removes ComplianceItems to reflect existence of compliance responses.',

  implements: ['foam.nanos.ruler.RuleAction'],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.dao.DAO'
  ],

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.nanos.dig.exception.GeneralException',
    'net.nanopay.meter.compliance.ComplianceItem',
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
    'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
    'foam.nanos.auth.User',
    'foam.nanos.ruler.Operations'
  ],

  messages: [
    {
      name: 'DESCRIBE_TEXT',
      message: 'Creates or removes ComplianceItem based on creation or removal of compliance response.'
    },
    {
      name: 'ILLEGAL_ACTION',
      message: 'Modification or other illegal action is occuring on compliance item.'
    }
  ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      documentation: `
        Describes whether a compliance item is being created or removed. Only
        supports create or remove at the moment.
      `
    },
    {
      class: 'String',
      name: 'responseType',
      documentation: `
        The type of the compliance response that has just been added (eg.
        DowJones, identityMind, etc.).
      `
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if(this.getOperation() == Operations.CREATE) {
          if ( obj instanceof DowJonesResponse ) {
            DowJonesResponse response = (DowJonesResponse) obj;
            DAO userDAO = (DAO) x.get("localUserDAO");
            User user = (User) userDAO.find(response.getUserId());
            ComplianceItem complianceItem = new ComplianceItem.Builder(x)
              .setDowJones(response.getId())
              .setUser(response.getUserId())
              .setUserLabel(user.label())
              .build();
            DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
            complianceItemDAO.inX(x).put(complianceItem);
          } else if ( obj instanceof IdentityMindResponse ) {
            IdentityMindResponse response = (IdentityMindResponse) obj;
            ComplianceItem complianceItem = new ComplianceItem.Builder(x)
              .setIdentityMind(response.getId())
              .setUser(Long.parseLong(response.getEntityId().toString()))
              .build();
            DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
            complianceItemDAO.inX(x).put(complianceItem);
          } else if ( obj instanceof LEVResponse ) {
            LEVResponse response = (LEVResponse) obj;
            ComplianceItem complianceItem = new ComplianceItem.Builder(x)
              .setLevResponse(response.getId())
              .setUser(response.getEntityId())
              .build();
            DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
            complianceItemDAO.inX(x).put(complianceItem);
          } else if ( obj instanceof SIDniResponse ) {
            SIDniResponse response = (SIDniResponse) obj;
            ComplianceItem complianceItem = new ComplianceItem.Builder(x)
              .setSidniResponse(response.getId())
              .setUser(response.getEntityId())
              .build();
            DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
            complianceItemDAO.inX(x).put(complianceItem);
          }
        } else if(this.getOperation() == Operations.REMOVE) {
          if ( obj instanceof DowJonesResponse ) {
            DowJonesResponse response = (DowJonesResponse) obj;
            ComplianceItem complianceItem = new ComplianceItem.Builder(x)
              .setDowJones(response.getId())
              .setUser(response.getUserId())
              .build();
            DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
            complianceItemDAO.inX(x).remove(complianceItem);
          } else if ( obj instanceof IdentityMindResponse ) {
            IdentityMindResponse response = (IdentityMindResponse) obj;
            ComplianceItem complianceItem = new ComplianceItem.Builder(x)
              .setIdentityMind(response.getId())
              .setUser(Long.parseLong(response.getEntityId().toString()))
              .build();
            DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
            complianceItemDAO.inX(x).remove(complianceItem);
          } else if ( obj instanceof LEVResponse ) {
            LEVResponse response = (LEVResponse) obj;
            ComplianceItem complianceItem = new ComplianceItem.Builder(x)
              .setLevResponse(response.getId())
              .setUser(response.getEntityId())
              .build();
            DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
            complianceItemDAO.inX(x).remove(complianceItem);
          } else if ( obj instanceof SIDniResponse ) {
            SIDniResponse response = (SIDniResponse) obj;
            ComplianceItem complianceItem = new ComplianceItem.Builder(x)
              .setSidniResponse(response.getId())
              .setUser(response.getEntityId())
              .build();
            DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
            complianceItemDAO.inX(x).remove(complianceItem);
          }
        } else {
          /*this.NotificationMessage.create({
            message: ILLEGAL_ACTION,
            type: 'error'
          });
          DigErrorMessage = new GeneralException.Builder(x)
            .setMessage(ILLEGAL_ACTION)
            .build();*/
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '// No-op'
    },
    {
      name: 'canExecute',
      javaCode: `return true;`
    },
    {
      name: 'describe',
      javaCode: `return DESCRIBE_TEXT;`
    }
  ]
});
