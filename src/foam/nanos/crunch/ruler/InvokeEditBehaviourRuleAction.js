/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'InvokeEditBehaviourRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        var ucj    = (UserCapabilityJunction) obj;
        var oldUCJ = (UserCapabilityJunction) oldObj;

        X systemX = ruler.getX();

        agency.submit(x, new ContextAgent () {
          @Override
          public void execute (X x) {

            if ( ucj.getSkipEditBehaviour() == true ) {
              ucj.setSkipEditBehaviour(false);
              return;
            }

            AuthService authService = (AuthService) x.get("auth");

            var capability = (Capability) ucj.findTargetId(systemX);
            if (authService.check(x, "usercapabilityjunction.update." + capability.getId())) {
              return;
            }

            // If edit behaviour does nothing we will keep old data
            var newData = ucj.getData();
            ucj.setData(oldUCJ.getData());

            var editBehaviour = capability.getEditBehaviour();

            var editor = (Subject) x.get("subject");

            editBehaviour.maybeApplyEdit(x, systemX, editor, ucj, newData);
          }
        }, "invoke edit behaviour");
      `
    }
  ]
});
