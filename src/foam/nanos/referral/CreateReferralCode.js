/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.referral',
  name: 'CreateReferralCode',

  documentation: `Create a referral code on user creation.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          User user = (User) obj;
          DAO referralCodeDAO = (DAO) x.get("referralCodeDAO");
          ReferralCode referralCode = new ReferralCode();
          referralCode.setReferrer(user.getId());
          referralCode.setSpid(user.getSpid());
          referralCode = (ReferralCode) referralCodeDAO.put_(x, referralCode);

          AppConfig config = (AppConfig) x.get("appConfig");
          String url = config.getUrl()+ "/?referral=" + referralCode.getId() + "/#sign-up";
          referralCode.setUrl(url);
          referralCodeDAO.put_(x, referralCode);
        }
      }, "Creating a referral code");
      `
    }
  ]
});
