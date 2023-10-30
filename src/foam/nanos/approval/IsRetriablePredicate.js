/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'IsRetriablePredicate',
  documentation: 'A predicate for checking if an approval request has canRetry flag set to true',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.Identifiable',
    'foam.core.XLocator',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.NEW_OBJ',
  ],
  
  properties: [
    {
      class: 'String',
      name: 'classification'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        Identifiable newObj = (Identifiable) NEW_OBJ.f(obj);

        Count count = (Count) ApprovalRequestUtil.getAllApprovalRequests(XLocator.get(), ((Identifiable) newObj).getPrimaryKey(), getClassification())
          .where(EQ(ApprovalRequest.CAN_RETRY, true))
          .select(new Count());

        return count.getValue() > 0;
      `
    }
  ]
});
