/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailMessagePropertyServiceRule',
  extends: 'foam.nanos.ruler.Rule',

  documentation: 'Rule for passing EmailMessage through EmailPropertyService',

  // Predicate shall predicate on status == DRAFT
  properties: [
    {
      name: 'action',
      transient: true,
      visibility: 'HIDDEN',
      javaGetter: 'return new EmailMessagePropertyServiceRuleAction(getX());'
    }
  ]
});
