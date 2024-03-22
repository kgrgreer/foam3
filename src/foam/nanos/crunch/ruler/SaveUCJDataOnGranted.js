/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'SaveUCJDataOnGranted',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Loggers',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.AuthService'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        final var clsName = getClass().getSimpleName();
        X systemX = ruler.getX();
        AuthService authService = (AuthService) x.get("auth");

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            UserCapabilityJunction oldUcj = (UserCapabilityJunction) oldObj;
 
            var capability = (Capability) ucj.findTargetId(systemX);
            var editBehaviour = capability.getEditBehaviour();
            var editor = (Subject) x.get("subject");

            if (ucj.getData() == null || ucj.getStatus() != CapabilityJunctionStatus.GRANTED || ucj.getData().equals(oldUcj.getData())) return;

            if (oldUcj.getData() == null || oldUcj.getStatus() == CapabilityJunctionStatus.GRANTED || ucj.getIsInRenewable()) {

              if ( ucj.getSkipEditBehaviour() == true ) {
                ucj.setSkipEditBehaviour(false);
                return;
              }

              editBehaviour.maybeApplyEdit(x, systemX, editor, ucj, ucj.getData()); 

              capability = (Capability) ucj.findTargetId(x);
              if ( capability == null ) {
                Loggers.logger(x, this, clsName).warning("Target capability not found", ucj.getTargetId(), "ucj", ucj.getId());
                throw new RuntimeException("Capability not found, data not saved to target");
              }

              if ( capability.getOf() != null && capability.getDaoKey() != null ) {
                ucj.saveDataToDAO(x, capability, true);
              }
            }
          }
        }, "");
      `
    }
  ]
});
