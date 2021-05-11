/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
  name: 'UCJApprovableValidateAction',

  documentation: `
    Handles calling the Validatable.validate(X) on a UCJ approvable
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.Map'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {

          @Override
          public void execute(X x) {
            Approvable approvable = (Approvable) obj;
            DAO approvableDAO = (DAO) getX().get(approvable.getServerDaoKey());

            try {
              FObject objectInDAO = approvableDAO.find(approvable.getObjId());
              
              FObject objectWithDiff = objectInDAO.fclone();

              Map propsToUpdate = approvable.getPropertiesToUpdate();

              for ( Object propName : propsToUpdate.keySet() ){
                String propNameString = (String) propName;
                objectWithDiff.setProperty(propNameString,propsToUpdate.get(propNameString));
              }

              // validate the diff'd object so that the validators can update properties
              UserCapabilityJunction ucjWithDiff = (UserCapabilityJunction) objectWithDiff;
              ucjWithDiff.getData().validate(x);

              Map validatedPropsToUpdate = objectInDAO.diff(objectWithDiff);

              if ( ! validatedPropsToUpdate.isEmpty() ){
                propsToUpdate.putAll(validatedPropsToUpdate);
                approvableDAO.put_(getX(), approvable);
              }
            } catch (Exception e){
              throw new RuntimeException(e);
            }
          }
        }, "Update approvable data with validate diff");
      `
    }
  ]
});
