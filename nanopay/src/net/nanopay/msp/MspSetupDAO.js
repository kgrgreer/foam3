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

  imports: [
    'DAO localCapabilityDAO',
    'DAO prerequisiteCapabilityJunctionDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.User',
    'foam.nanos.auth.ruler.EnsurePropertyOnCreateRule',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.ThemeDomain',
    'foam.nanos.ruler.Rule',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.ServiceProviderURL',
    'net.nanopay.auth.UserCreateServiceProviderURLRule',
    'net.nanopay.auth.UserCreateServiceProviderURLRuleAction',
    'net.nanopay.tx.fee.TransactionFeeRule',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.List',
    'org.apache.commons.lang.ArrayUtils'
  ],

  properties: [
    {
      class: 'String',
      name: 'spidUrlRule',
      value: '68afcf0c-c718-98f8-0841-75e97a3ad16d4',
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        MspInfo mspInfo = (MspInfo) obj;
        String spid = mspInfo.getSpid();
        DAO spidDAO = (DAO) x.get("localServiceProviderDAO");

        // if the spid already exists, just simply return
        ServiceProvider sp = (ServiceProvider) spidDAO.find(spid);
        if ( sp != null ) throw new RuntimeException("Spid already exists");

        spidDAO.put(
          new ServiceProvider.Builder(x)
            .setEnabled(true)
            .setId(spid)
            .setDescription(spid + " spid")
            .setPermissionsGranted(mspInfo.getCapabilityPermissions())
            .build()
        );
        addCapabilityPrerequisite(x, spid, "serviceProviderCapability");

        mspInfo = (MspInfo) getDelegate().put_(x, obj);

        DAO groupDAO = (DAO) x.get("localGroupDAO");
        DAO userDAO = (DAO) x.get("localUserDAO");
        DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
        DAO themeDAO = (DAO) x.get("themeDAO");
        DAO themeDomainDAO = (DAO) x.get("themeDomainDAO");
        DAO ruleDAO = (DAO) x.get("localRuleDAO");

        // Add spid prerequisites
        addSpidPrerequisites(x, spid, mspInfo.getMenuPermissions(), "menuCapability");
        addSpidPrerequisites(x, spid, mspInfo.getCountryPermissions(), "countryCapability");
        addSpidPrerequisites(x, spid, mspInfo.getCurrencyPermissions(), "currencyCapability");
        addSpidPrerequisites(x, spid, mspInfo.getCorridorPermissions(), "corridorCapability");
        addSpidPrerequisites(x, spid, mspInfo.getPlannerPermissions(), "plannerCapability");

        // Add theme for the client side - not for back-office
        Theme clientTheme = (Theme) themeDAO.find(mspInfo.getTheme());
        clientTheme = clientTheme == null ? new Theme() : (Theme) clientTheme.fclone();
        clientTheme.clearId();
        clientTheme.clearSupportConfig();
        clientTheme.setName(mspInfo.getSpid());
        clientTheme.setAppName(mspInfo.getAppName());
        clientTheme.setDescription(mspInfo.getDescription());
        clientTheme.setDomains(mspInfo.getDomain());
        clientTheme = (Theme) themeDAO.put(clientTheme);

        // Add themeDomain
        for (String domain : mspInfo.getDomain()) {
          ThemeDomain themeDomain = new ThemeDomain();
          themeDomain.setId(domain);
          themeDomain.setTheme(clientTheme.getId());
          themeDomainDAO.put(themeDomain);
        }

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
          // Add the particular permissions to the spid-admin group
          GroupPermissionJunction junction = new GroupPermissionJunction();
          junction.setSourceId(mspInfo.getSpid() + "-admin");
          junction.setTargetId(permissionArray.get(i));
          groupPermissionJunctionDAO.put(junction);
        }

        // Create new serviceProviderURL
        ServiceProviderURL serviceProviderURL = new ServiceProviderURL();
        serviceProviderURL.setSpid(mspInfo.getSpid());
        serviceProviderURL.setUrls(mspInfo.getDomain());

        ServiceProviderURL[] configList = new ServiceProviderURL[1];
        configList[0] = serviceProviderURL;

        // find the UserCreateServiceProviderURLRule and update the configList
        UserCreateServiceProviderURLRule rule =
          (UserCreateServiceProviderURLRule) ruleDAO.find(this.getSpidUrlRule());
        rule.setConfig((ServiceProviderURL[]) ArrayUtils.addAll(configList, rule.getConfig()));
        ruleDAO.put(rule);

        // Create spid-admin's default digital account
        var digitalAccount = DigitalAccount.findDefault(x, adminUser, mspInfo.getDenomination());

        // Create rule to auto-fill feeAccount for TransactionFeeRule created in the spid
        var ensureFeeAccountRule = new EnsurePropertyOnCreateRule();
        ensureFeeAccountRule.setName("Auto-fill feeAccount for TransactionFeeRule - " + spid);
        ensureFeeAccountRule.setDaoKey("localRuleDAO");
        ensureFeeAccountRule.setRuleGroup("TransactionFeeRule");
        ensureFeeAccountRule.setTargetClass(TransactionFeeRule.getOwnClassInfo());
        ensureFeeAccountRule.setPropName("feeAccount");
        ensureFeeAccountRule.setPropValue(digitalAccount.getId());
        ensureFeeAccountRule.setSpid(spid);
        ruleDAO.put(ensureFeeAccountRule);

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
          junction.setTargetId(fraudPermissionArray.get(i));
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
    },
    {
      name: 'addSpidPrerequisites',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'spid', type: 'String' },
        { name: 'permissions', type: 'String[]' },
        { name: 'baseCapability', type: 'String' }
      ],
      javaCode: `
        var capability = (Capability) getLocalCapabilityDAO().put(
          new Capability.Builder(x)
            .setId(spid + baseCapability.substring(0, 1).toUpperCase() + baseCapability.substring(1))
            .setPermissionsGranted(permissions)
            .build()
        );

        addCapabilityPrerequisite(x, spid, capability.getId());
      `
    },
    {
      name: 'addCapabilityPrerequisite',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'sourceId', type: 'String' },
        { name: 'targetId', type: 'String' }
      ],
      javaCode: `
        getPrerequisiteCapabilityJunctionDAO().put(
          new CapabilityCapabilityJunction.Builder(x)
            .setSourceId(sourceId)
            .setTargetId(targetId)
            .build()
        );
      `
    }
  ]
});
