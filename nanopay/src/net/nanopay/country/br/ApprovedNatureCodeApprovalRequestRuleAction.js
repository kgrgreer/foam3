/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.country.br',
  name: 'ApprovedNatureCodeApprovalRequestRuleAction',

  documentation: `
    TODO:
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.country.br.NatureCode',
    'net.nanopay.country.br.NatureCodeApprovalRequest',
    'foam.nanos.auth.Subject',
    'java.util.Map',
    'java.util.HashMap',
    'foam.util.SafetyUtil',
    'foam.nanos.logger.Logger'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        Logger logger = (Logger) x.get("logger");

        NatureCodeApprovalRequest ncarObj = (NatureCodeApprovalRequest) obj;

        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
            DAO approvableDAO = (DAO) getX().get("approvableDAO");
            DAO natureCodeDataDAO = (DAO) getX().get("natureCodeDataDAO");

            Approvable approvable = (Approvable) approvableDAO.find(ncarObj.getObjId());
            NatureCodeData natureCodeDataToAdd = (NatureCodeData) natureCodeDataDAO.find(ncarObj.getNatureCodeData());
            
            Map propertiesToUpdate = (HashMap) approvable.getPropertiesToUpdate();

            propertiesToUpdate.put("data", natureCodeDataToAdd);

            approvableDAO.put(approvable);
          }

        }, "Sent out approval requests for needed payloads and granted the others");
      `
    }
  ]
});
