/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.referral',
  name: 'BuildReferralCodeURLRuleAction',

  documentation: 'Construct the Referral code from website, menu, id, when manually created',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO referralCodeDAO = (DAO) ruler.getX().get("referralCodeDAO");
          ReferralCode referralCode = (ReferralCode) obj;
          if ( SafetyUtil.isEmpty(referralCode.getId()) ) return;
          String code = SafetyUtil.isEmpty(referralCode.getCustomReferralCode()) ? referralCode.getId() : referralCode.getCustomReferralCode();
          referralCode.setUrl(referralCode.getWebsite() + "/?" + referralCode.getQuery() + "=" + code + "#" + referralCode.getMenu());
        }
      }, "BuildReferralCodeUrl");
      `
    }
  ]
});
