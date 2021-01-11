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
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Themes',
    'foam.nanos.theme.Theme',
    'foam.util.SafetyUtil',
    'java.net.MalformedURLException',
    'java.net.URL',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        AuthService auth = (AuthService) x.get("auth");
        Themes themes = (Themes) x.get("themes");

        if ( ! SafetyUtil.isEmpty(user.getSpid())
          && auth.check(x, "capability.create." + user.getSpid())
        ) {
          return;
        }

        Theme theme = (Theme) themes.findTheme(x);

        user.setSpid(theme.getSpid());
      `
    }
  ]
});
