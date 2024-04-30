/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.edit',
  name: 'OnlyOnboardingEditBehaviour',
  extends: 'foam.nanos.crunch.edit.AbstractEditBehaviour',
  documentation: "Allows user to edit only during onboarding before general capability has been granted",

  javaImports: [
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.auth.Group',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'maybeApplyEdit',
      javaCode: `
        User user = (User) ((DAO)systemX.get("userDAO")).find(foam.mlang.MLang.EQ(User.ID, ucj.getSourceId()));
        Group userGroup = (Group) ((DAO) systemX.get("groupDAO")).find(user.getGroup());

        CrunchService crunchService = (CrunchService) systemX.get("crunchService");
        var genCapUCJ = crunchService.getJunction(userX, userGroup.getGeneralCapability());
        if (genCapUCJ == null || genCapUCJ.getStatus() != CapabilityJunctionStatus.GRANTED) { 
          ucj.setData(newData);
          return true;
        } else {
          return false;
        }
      `
    }
  ]
});
