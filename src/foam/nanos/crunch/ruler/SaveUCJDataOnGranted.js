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

            // NOTE: explicit test for GRANTED, as the same test on
            // the rule predicate fails some capability updates.
            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED ) {
              return;
            }

            if ( ucj.getData() == null ) {
              return;
            }

            //UCJ Edit permission check
            if ( ! authService.check(x, "usercapabilityjunction.update.*") ) {
              if (oldUcj.getStatus() == CapabilityJunctionStatus.GRANTED && ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {

                if ( ucj.getSkipEditBehaviour() == true ) {
                  ucj.setSkipEditBehaviour(false);
                  return;
                }
    
                // If edit behaviour does nothing we will keep old data
                var newData = ucj.getData();
                ucj.setData(oldUcj.getData());
    
                var capability = (Capability) ucj.findTargetId(systemX);
                var editBehaviour = capability.getEditBehaviour();
                var editor = (Subject) x.get("subject");
    
                editBehaviour.maybeApplyEdit(x, systemX, editor, ucj, newData);
              }
            }

            if ( oldUcj != null &&
                 oldUcj.getStatus() == CapabilityJunctionStatus.GRANTED &&
                 ! oldUcj.getIsInRenewable() &&
                 ucj.getData().equals(oldUcj.getData()) ) {
              return;
            }

            Capability capability = (Capability) ucj.findTargetId(x);
            if ( capability == null ) {
              Loggers.logger(x, this, clsName).warning("Target capability not found", ucj.getTargetId(), "ucj", ucj.getId());
              throw new RuntimeException("Capability not found, data not saved to target");
            }

            if ( capability.getOf() != null && capability.getDaoKey() != null ) {
              ucj.saveDataToDAO(x, capability, true);
            }
          }
        }, "");
      `
    }
  ]
});
