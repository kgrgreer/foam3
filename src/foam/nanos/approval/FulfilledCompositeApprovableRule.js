/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'FulfilledCompositeApprovableRule',

  documentation: `
    A rule which will auto approve the sub approvables of the 
    composite approvable
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.approval.CompositeApprovable',
    'foam.mlang.MLang',
    'java.util.ArrayList'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            CompositeApprovable compositeApprovable = (CompositeApprovable) obj;
            DAO approvableDAO = (DAO) getX().get("approvableDAO");

            approvableDAO.where(
              MLang.IN(
                  Approvable.ID,
                  compositeApprovable.getApprovableIds()
              )
            ).select(new AbstractSink() {
              @Override
              public void put(Object obj, Detachable sub) {
                Approvable approvable = (Approvable) obj;
                approvable.setStatus(ApprovalStatus.APPROVED);
                approvableDAO.put_(getX(), approvable);
              }
            });
          }
        }, "Approve the all of the composite's sub approvals");
      `
    }
  ]
});
