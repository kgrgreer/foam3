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
  package: 'net.nanopay.bank',
  name: 'AscendantFXBankAccountDAO',
  extends: `foam.dao.ProxyDAO`,
  documentation: `
    This DAO would create an AscendantFXUser if the owner of the
    has the required permission and also create notification for
    manual setup of organization.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.mlang.MLang',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'net.nanopay.fx.FXUserStatus',
    'net.nanopay.fx.ascendantfx.AscendantFXUser'
  ],

  messages: [
    { name: 'ORGANIZATION_SETUP_REQUIRED_ERROR_MSG', message: 'Organization setup on AscendantFX system is required for User with id: ' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AscendantFXBankAccountDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }  
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( !(obj instanceof BankAccount) ) {
          return getDelegate().put_(x, obj);
        }
    
        BankAccount account = (BankAccount) obj;
        AuthService auth = (AuthService) x.get("auth");
        DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
        User accountOwner = (User) localBusinessDAO.find(account.getOwner());
        boolean hasFXProvisionPayerPermission = false;
        if ( accountOwner != null ) {
          // accountOwner is null in some test cases
          hasFXProvisionPayerPermission = auth.checkUser(getX(), accountOwner, "fx.provision.payer");
        }
        if ( hasFXProvisionPayerPermission ) {
    
          DAO ascendantFXUserDAO = (DAO) getX().get("ascendantFXUserDAO");
          AscendantFXUser ascendantFXUser = (AscendantFXUser) ascendantFXUserDAO.find(
              MLang.EQ(AscendantFXUser.USER, accountOwner.getId()));
    
          if ( null == ascendantFXUser ) {
            ascendantFXUser = new AscendantFXUser();
            ascendantFXUser.setName(accountOwner.getLegalName());
            ascendantFXUser.setUser(accountOwner.getId());
            ascendantFXUser.setUserStatus(FXUserStatus.PENDING);
            ascendantFXUserDAO.put_(getX(), ascendantFXUser);
    
            //Create Ascendant Organization notification
            String message = ORGANIZATION_SETUP_REQUIRED_ERROR_MSG + accountOwner.getId() ;
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(message)
              .build();
          ((DAO) x.get("localNotificationDAO")).put(notification);
          ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
          }
        }
    
        return super.put_(x, obj);
      `
    }
  ]
});


