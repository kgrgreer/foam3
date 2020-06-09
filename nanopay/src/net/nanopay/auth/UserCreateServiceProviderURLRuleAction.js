/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'UserCreateServiceProviderURLRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Set ServiceProvider on User Create based on AppConfig URL',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.net.URL',
    'java.net.MalformedURLException',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        AuthService auth = (AuthService) x.get("auth");

        if ( ! SafetyUtil.isEmpty(user.getSpid())
          && auth.check(x, "spid.create." + user.getSpid())
        ) {
          return;
        }

        final ServiceProviderURL spu_ = new ServiceProviderURL();

        UserCreateServiceProviderURLRule myRule = (UserCreateServiceProviderURLRule) rule;
        if ( myRule.getConfig() == null ||
             myRule.getConfig().length == 0 ) {
          return;
        }

        AppConfig app = (AppConfig) x.get("appConfig");
        URL url = null;
        try {
          url = new URL(app.getUrl());
        } catch ( MalformedURLException e ) {
          throw new RuntimeException(e);
        }

        String host = url.getHost();
        outerLoop:
        for ( ServiceProviderURL spu : myRule.getConfig() ) {
          for ( String u : spu.getUrls() ) {
            if ( u.equals(host) ) {
              spu_.setSpid(spu.getSpid());
              break outerLoop;
            }
          }
        }
        if ( SafetyUtil.isEmpty(spu_.getSpid()) ) {
          return;
        }

        user.setSpid(spu_.getSpid());
      `
    }
  ]
});
