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

            var capability = (Capability) ucj.findTargetId(x);
            if ( capability == null ) {
              Loggers.logger(x, this, clsName).warning("Target capability not found", ucj.getTargetId(), "ucj", ucj.getId());
              throw new RuntimeException("Capability not found, data not saved to target");
            }
        
            // NOTE: explicit test for GRANTED, as the same test on
            // the rule predicate fails some capability updates.
            if ( (capability.getOf() != null && capability.getDaoKey() != null) ||
                  ucj.getData() == null ||
                  ucj.getStatus() != CapabilityJunctionStatus.GRANTED ||
                  (oldUcj != null && ucj.getData().equals(oldUcj.getData())) ) {
              return;
            }

            var save = authService.check(x, "usercapabilityjunction.update.*");

            if ( ! save ) {
              // NOT GRANTED -> GRANTED
              if ( oldUcj == null ||
                    oldUcj.getStatus() != CapabilityJunctionStatus.GRANTED ) {
                save = true;
              }

              // GRANTED -> GRANTED
              if ( ! save &&
                    oldUcj != null &&
                    oldUcj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
                // ! isInRenewable -> isInRenewable
                if ( ! oldUcj.getIsInRenewable() &&
                      ucj.getIsInRenewable() ) {
                  save = true;
                } else {
                  // editBehaviour
                  if ( ucj.getSkipEditBehaviour() == true ) {
                    // REVIEW: this update is not persisted
                    ucj.setSkipEditBehaviour(false);
                  } else {
                    save = capability.getEditBehaviour().maybeApplyEdit(x, systemX, (Subject) x.get("subject"), ucj, ucj.getData());
                  }
                }
              }
            }
            
            if ( save ) {
              ucj.saveDataToDAO(x, capability, true);
            }
          }
        }, "");
      `
    }
  ]
});