/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.nanos.dig.exception.GeneralException',
    'foam.nanos.logger.Logger',
    'foam.nanos.dao.Operation',
    'java.util.List',
    'net.nanopay.meter.compliance.ComplianceItem',
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
    'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.Business',
    'net.nanopay.tx.model.Transaction'
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
      of: 'foam.nanos.dao.Operation',
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
        try {
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              if(CreateRemoveComplianceItemRule.this.getOperation() == Operation.CREATE) {
                if ( obj instanceof DowJonesResponse ) {
                  DowJonesResponse response = (DowJonesResponse) obj;
                  // entity could be User or Beneficial Owner
                  DAO entityDAO = (DAO) x.get(response.getDaoKey());
                  FObject entity = (FObject) entityDAO.find(response.getUserId());
                  String label = "";
                  if ( entity instanceof User ) { label = ((User) entity).toSummary(); }
                  if ( entity instanceof BeneficialOwner ) { label = ((BeneficialOwner) entity).toSummary(); }
                  ComplianceItem complianceItem = new ComplianceItem.Builder(x)
                    .setDowJones(response.getId())
                    .setType(response.getSearchType())
                    .setUser(response.getUserId())
                    .setEntityId(response.getUserId())
                    .setEntityLabel(label)
                    .build();
                  DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
                  complianceItemDAO.inX(x).put(complianceItem);
                } else if ( obj instanceof IdentityMindResponse ) {
                  IdentityMindResponse response = (IdentityMindResponse) obj;
                  // entity could be User, Beneficial Owner, or transaction
                  DAO entityDAO = (DAO) x.get(response.getDaoKey());
                  FObject entity = (FObject) entityDAO.find(response.getEntityId().toString());
                  String label = "";
                  if ( entity instanceof User ) { label = ((User) entity).toSummary(); }
                  if ( entity instanceof BeneficialOwner ) { label = ((BeneficialOwner) entity).toSummary(); }
                  ComplianceItem complianceItem;
                  if ( entity instanceof Transaction ) {
                    complianceItem = new ComplianceItem.Builder(x)
                      .setIdentityMind(response.getId())
                      .setType("IdentityMind (" + response.getApiName() + ")")
                      .setTransaction(response.getEntityId().toString())
                      .setTransactionId(response.getEntityId().toString())
                      .setEntityLabel(((Transaction) entity).getSummary())
                      .build();
                  } else {
                    complianceItem = new ComplianceItem.Builder(x)
                      .setIdentityMind(response.getId())
                      .setType("IdentityMind (" + response.getApiName() + ")")
                      .setUser(Long.parseLong(response.getEntityId().toString()))
                      .setEntityId(Long.parseLong(response.getEntityId().toString()))
                      .setEntityLabel(label)
                      .build();
                  }
                  DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
                  complianceItemDAO.inX(x).put(complianceItem);
                } else if ( obj instanceof LEVResponse ) {
                  LEVResponse response = (LEVResponse) obj;
                  DAO businessDAO = (DAO) x.get("businessDAO");
                  Business business = (Business) businessDAO.find(response.getEntityId());
                  ComplianceItem complianceItem = new ComplianceItem.Builder(x)
                    .setLevResponse(response.getId())
                    .setType("Secure Fact (LEV)")
                    .setUser(response.getEntityId())
                    .setEntityId(response.getEntityId())
                    .setEntityLabel(business.toSummary())
                    .build();
                  DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
                  complianceItemDAO.inX(x).put(complianceItem);
                } else if ( obj instanceof SIDniResponse ) {
                  SIDniResponse response = (SIDniResponse) obj;
                  DAO userDAO = (DAO) x.get("userDAO");
                  User user = (User) userDAO.find(response.getEntityId());
                  ComplianceItem complianceItem = new ComplianceItem.Builder(x)
                    .setSidniResponse(response.getId())
                    .setType("Secure Fact (SIDni)")
                    .setUser(response.getEntityId())
                    .setEntityId(response.getEntityId())
                    .setEntityLabel(user.toSummary())
                    .build();
                  DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
                  complianceItemDAO.inX(x).put(complianceItem);
                }
              } else if(CreateRemoveComplianceItemRule.this.getOperation() == Operation.REMOVE && obj != null) {
                if ( obj instanceof DowJonesResponse ) {
                  DowJonesResponse response = (DowJonesResponse) obj;
                  DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
                  List <ComplianceItem> complianceItems = ((ArraySink) complianceItemDAO
                    .where(MLang.EQ(ComplianceItem.DOW_JONES, response.getId()))
                    .select(new ArraySink()))
                    .getArray();
                  for(int i = 0; i < complianceItems.size(); i++) {
                    complianceItemDAO.inX(x).remove((ComplianceItem) complianceItems.get(i));
                  }
                } else if ( obj instanceof IdentityMindResponse ) {
                  IdentityMindResponse response = (IdentityMindResponse) obj;
                  DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
                  List <ComplianceItem> complianceItems = ((ArraySink) complianceItemDAO
                    .where(MLang.EQ(ComplianceItem.IDENTITY_MIND, response.getId()))
                    .select(new ArraySink()))
                    .getArray();
                  for(int i = 0; i < complianceItems.size(); i++) {
                    complianceItemDAO.inX(x).remove((ComplianceItem) complianceItems.get(i));
                  }
                } else if ( obj instanceof LEVResponse ) {
                  LEVResponse response = (LEVResponse) obj;
                  DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
                  List <ComplianceItem> complianceItems = ((ArraySink) complianceItemDAO
                    .where(MLang.EQ(ComplianceItem.LEV_RESPONSE, response.getId()))
                    .select(new ArraySink()))
                    .getArray();
                  for(int i = 0; i < complianceItems.size(); i++) {
                    complianceItemDAO.inX(x).remove((ComplianceItem) complianceItems.get(i));
                  }
                } else if ( obj instanceof SIDniResponse ) {
                  SIDniResponse response = (SIDniResponse) obj;
                  DAO complianceItemDAO = (DAO) x.get("complianceItemDAO");
                  List <ComplianceItem> complianceItems = ((ArraySink) complianceItemDAO
                    .where(MLang.EQ(ComplianceItem.SIDNI_RESPONSE, response.getId()))
                    .select(new ArraySink()))
                    .getArray();
                  for(int i = 0; i < complianceItems.size(); i++) {
                    complianceItemDAO.inX(x).remove((ComplianceItem) complianceItems.get(i));
                  }
                }
              } else {
                /** To-do: possibly return error if compliance item is being
                  * updated since compliance items should not be edit
                  */
              }
            }
          }, "Create Remove Compliance Item Rule");
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("CreateRemoveComplianceItemRule Error: ", e);
        }
      `
    }
  ]
});
