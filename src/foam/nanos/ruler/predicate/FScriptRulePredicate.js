/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'FScriptRulePredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  documentation: 'FScript predicate to be used by the Rule engine',

  javaImports: [
    'foam.core.FObject',
    'foam.nanos.ruler.RulerData',
    'foam.mlang.predicate.FScript',
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'java.util.Date'
  ],

  implements: ['foam.core.Serializable'],

  properties: [
    {
      class: 'String',
      name: 'query'
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
      if ( ! ( obj instanceof X ) ) return false;
      var x = (X) obj;
      var fScriptExpr = new FScript();
      Subject subject = (Subject) x.get("subject");
      fScriptExpr.setQuery(getQuery());
      FObject olObj = (FObject) x.get("OLD");
      FObject newObj = (FObject) x.get("NEW");
      RulerData data = new RulerData();
      data.setO(olObj);
      data.setN(newObj);
      data.setUser(subject.getUser());
      data.setRealUser(subject.getRealUser());
      data.setSpid(subject.getUser().getSpid());
      data.setDateTime(new Date());
      return (boolean) fScriptExpr.f(data);
      `
    }
  ]
});
