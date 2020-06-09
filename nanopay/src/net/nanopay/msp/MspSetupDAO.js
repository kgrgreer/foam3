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

foam.CLASS({
  package: 'net.nanopay.msp',
  name: 'MspSetupDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A decorator to create msp groups and admin',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.ruler.Rule',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.ThemeDomain',
    'foam.nanos.auth.User',
    'net.nanopay.auth.ServiceProviderURL',
    'net.nanopay.auth.UserCreateServiceProviderURLRule',
    'net.nanopay.auth.UserCreateServiceProviderURLRuleAction',
    'net.nanopay.admin.model.AccountStatus',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        String spid = ((MspInfo) obj).getSpid();
        DAO spidDAO = (DAO) x.get("localServiceProviderDAO");
        spidDAO.put(
          new ServiceProvider.Builder(x)
            .setEnabled(true)
            .setId(spid)
            .setDescription(spid + " spid")
            .build()
        );

        MspInfo mspInfo = (MspInfo) getDelegate().put_(x, obj);

        DAO groupDAO = (DAO) x.get("localGroupDAO");
        DAO userDAO = (DAO) x.get("localUserDAO");
        DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
        DAO themeDAO = (DAO) x.get("themeDAO");
        DAO themeDomainDAO = (DAO) x.get("themeDomainDAO");
        DAO ruleDAO = (DAO) x.get("localRuleDAO");

        // Create spid-admin group
        Group adminGroup = new Group();
        adminGroup.setId(mspInfo.getSpid() + "-admin");
        adminGroup.setParent("msp-admin");
        adminGroup.setDefaultMenu("users");
        adminGroup.setDescription(mspInfo.getSpid() +" admin");
        groupDAO.put(adminGroup);

        // Create spid-admin user
        User adminUser = new User();
        adminUser.setEmail(mspInfo.getAdminUserEmail());
        adminUser.setDesiredPassword(mspInfo.getAdminUserPassword());
        adminUser.setFirstName(mspInfo.getAdminUserFirstname());
        adminUser.setLastName(mspInfo.getAdminUserLastname());
        adminUser.setGroup(mspInfo.getSpid() + "-admin");
        adminUser.setSpid(mspInfo.getSpid());
        adminUser.setEmailVerified(true);
        adminUser.setStatus(AccountStatus.ACTIVE);
        userDAO.put(adminUser);

        List<String> permissionArray = new ArrayList<>();
        permissionArray.add("group.update." + mspInfo.getSpid() + "-admin");
        permissionArray.add("group.update." + mspInfo.getSpid() + "-fraud-ops");
        permissionArray.add("group.update." + mspInfo.getSpid() + "-payment-ops");
        permissionArray.add("group.update." + mspInfo.getSpid() + "-support");
        permissionArray.add("group.read." + mspInfo.getSpid() + "-admin");
        permissionArray.add("group.read." + mspInfo.getSpid() + "-fraud-ops");
        permissionArray.add("group.read." + mspInfo.getSpid() + "-payment-ops");
        permissionArray.add("group.read." + mspInfo.getSpid() + "-support");

        for ( int i = 0; i < permissionArray.size(); i++ ) {
          // Add the permissions of spid's groups to the spid-admin group
          GroupPermissionJunction junction = new GroupPermissionJunction();
          junction.setSourceId(mspInfo.getSpid() + "-admin");
          junction.setTargetId(permissionArray.get(i));
          groupPermissionJunctionDAO.put(junction);

          // Add the permissions of spid's groups to the msp-admin group
          GroupPermissionJunction mspAdminJunction = new GroupPermissionJunction();
          junction.setSourceId("msp-admin");
          junction.setTargetId(permissionArray.get(i));
          groupPermissionJunctionDAO.put(mspAdminJunction);
        }

        // Add theme
        Theme theme = new Theme();
        theme.setName(mspInfo.getSpid());
        theme.setAppName(mspInfo.getAppName());
        theme.setDescription(mspInfo.getDescription());
        themeDAO.put(theme);

        // Add themeDomain
        for (String domain : mspInfo.getDomain()) {
            ThemeDomain themeDomain = new ThemeDomain();
            themeDomain.setId(domain);
            themeDomain.setTheme(theme.getId());
            themeDomainDAO.put(themeDomain);
        }

        // Create new serviceProviderURL
        ServiceProviderURL serviceProviderURL = new ServiceProviderURL();
        serviceProviderURL.setSpid(mspInfo.getSpid());
        serviceProviderURL.setUrls(mspInfo.getDomain());

        ServiceProviderURL[] configList = new ServiceProviderURL[1];
        configList[0] = serviceProviderURL;

        // Create new UserCreateServiceProviderURLRule
        UserCreateServiceProviderURLRule rule = new UserCreateServiceProviderURLRule();
        rule.setConfig(configList);
        rule.setName(mspInfo.getSpid() + "UserCreateServiceProviderURLRule");
        rule.setPriority(100);
        rule.setRuleGroup("UserCreate");
        rule.setDocumentation("Set ServiceProvider on User Create based on AppConfig URL for " + mspInfo.getSpid());
        rule.setDaoKey("localUserDAO");
        rule.setOperation(foam.nanos.ruler.Operations.CREATE);
        rule.setAfter(false);
        rule.setEnabled(true);
        rule.setSaveHistory(false);
        rule.setLifecycleState(foam.nanos.auth.LifecycleState.ACTIVE);
        UserCreateServiceProviderURLRuleAction ruleAction = new UserCreateServiceProviderURLRuleAction();
        rule.setAction(ruleAction);
        ruleDAO.put(rule);

        // Create spid-fraud-ops group
        Group fraudOpsGroup = new Group();
        fraudOpsGroup.setId(mspInfo.getSpid() + "-fraud-ops");
        fraudOpsGroup.setParent("fraud-ops");
        fraudOpsGroup.setDefaultMenu("accounts");
        fraudOpsGroup.setDescription(mspInfo.getSpid() + " fraud-ops group");
        groupDAO.put(fraudOpsGroup);

        // Create spid-payment-ops group
        Group paymentOpsGroup = new Group();
        paymentOpsGroup.setId(mspInfo.getSpid() + "-payment-ops");
        paymentOpsGroup.setParent("payment-ops");
        paymentOpsGroup.setDefaultMenu("accounts");
        paymentOpsGroup.setDescription(mspInfo.getSpid() + " payment-ops group");
        groupDAO.put(paymentOpsGroup);

        List<String> fraudPermissionArray = new ArrayList<>();
        fraudPermissionArray.add("group.update." + mspInfo.getSpid() + "-fraud-ops");
        fraudPermissionArray.add("group.update." + mspInfo.getSpid() + "-payment-ops");

        for ( int i = 0; i < fraudPermissionArray.size(); i++ ) {
          GroupPermissionJunction junction = new GroupPermissionJunction();
          junction.setSourceId(mspInfo.getSpid() + "-fraud-ops");
          junction.setTargetId(permissionArray.get(i));
          groupPermissionJunctionDAO.put(junction);
        }

        // Create spid-support group
        Group supportGroup = new Group();
        supportGroup.setId(mspInfo.getSpid() + "-support");
        supportGroup.setParent("support");
        supportGroup.setDefaultMenu("contacts");
        supportGroup.setDescription(mspInfo.getSpid() + " support group");
        groupDAO.put(supportGroup);

        return mspInfo;
      `
    }
  ]
});
