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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXContactDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',

    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.AuthService',
    'foam.nanos.logger.Logger',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business'
  ],

  messages: [
    { name: 'DISABLE_RECORD_ERROR_MSG', messages: 'Unexpected error disabling AFEX Beneficiary history record' },
    { name: 'CREATE_AFEX_BENF_ERROR_MSG', messages: 'Error creating AFEX beneficiary.' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AFEXContactDAO(X x, DAO delegate) {
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
        if ( ! (obj instanceof Contact) ) {
          return getDelegate().put_(x, obj);
        }
    
        DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
        DAO localAccountDAO = ((DAO) x.get("localAccountDAO")).inX(x);
        AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
        
        Contact contact = (Contact) obj;
        
        AuthService auth = (AuthService) x.get("auth");
        Business contactOwner = (Business) localBusinessDAO.find(contact.getOwner());
        if ( contactOwner == null ) {
          return getDelegate().put_(x, obj);
        }
        String contactOwnerCountryId = contactOwner.getAddress() == null ? "" : contactOwner.getAddress().getCountryId();
    
        // Check if contact has a bank account
        BankAccount contactBankAccount = foam.util.SafetyUtil.isEmpty(contact.getBankAccount()) ? 
          ((BankAccount) localAccountDAO.find(AND(EQ(BankAccount.OWNER, contact.getId()), INSTANCE_OF(BankAccount.class)))) 
          : ((BankAccount) localAccountDAO.find(contact.getBankAccount()));
        if ( contactBankAccount != null ) {
          // check contact owner has currency.read.x permission
          String currencyPermission = "currency.read." + contactBankAccount.getDenomination();
          boolean hasCurrencyPermission = auth.checkUser(getX(), contactOwner, currencyPermission);
          boolean isCadToCad = "CAD".equals(contactBankAccount.getDenomination()) && "CA".equals(contactOwnerCountryId);
          // Check if beneficiary already added
          if (  ! isCadToCad && hasCurrencyPermission && ! afexBeneficiaryExists(x, contact.getId(), contact.getOwner()) ) {
            createAFEXBeneficiary(x, contact.getId(), contactBankAccount.getId(),  contact.getOwner());
          }
        }
    
        // Check If Contact has business and create AFEX beneficiary for business also
        Business business = (Business) localBusinessDAO.find(contact.getBusinessId());
        if ( business != null ) {
          BankAccount businessBankAccount = ((BankAccount) localAccountDAO.find(AND(EQ(BankAccount.OWNER, business.getId()), INSTANCE_OF(BankAccount.class), EQ(BankAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE))));
          if ( null != businessBankAccount ) {
            String currencyPermission = "currency.read." + businessBankAccount.getDenomination();
            boolean hasCurrencyPermission = auth.checkUser(getX(), contactOwner, currencyPermission);
            boolean isCadToCad = "CAD".equals(businessBankAccount.getDenomination()) && "CA".equals(contactOwnerCountryId);
            if ( ! isCadToCad && hasCurrencyPermission && ! afexBeneficiaryExists(x, business.getId(), contact.getOwner()) ) {
              createAFEXBeneficiary(x, business.getId(), businessBankAccount.getId(),  contact.getOwner());
            }
          }
        }
    
        return super.put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        Contact contact = (Contact) obj;

        if ( contact == null ) return null;

        DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
        AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
        Business contactOwner = (Business) localBusinessDAO.find(contact.getOwner());
        if (null == contactOwner ) return super.remove_(x, obj);
        Business business = (Business) localBusinessDAO.find(contact.getBusinessId());
        long contactId = contact.getId();
        if ( business != null ) contactId = business.getId();
        
        try {
          afexServiceProvider.deletePayee(contactId, contactOwner.getId());
        } catch(Throwable t) {
          Logger l = (Logger) x.get("logger");
          l.error(DISABLE_RECORD_ERROR_MSG, t);
        }
        
        return super.remove_(x, obj);
    `
    },
    {
      name: 'afexBeneficiaryExists',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Long', name: 'contactId' },
        { type: 'Long', name: 'ownerId' }
      ],
      javaCode: `
        DAO afexBeneficiaryDAO = ((DAO) x.get("afexBeneficiaryDAO")).inX(x);
        AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
        AFEXBeneficiary afexBeneficiary = (AFEXBeneficiary) afexBeneficiaryDAO.find(
          AND(
            EQ(AFEXBeneficiary.CONTACT, contactId),
            EQ(AFEXBeneficiary.OWNER, ownerId)
          )
        );
        return null != afexBeneficiary;
      `
    },
    {
      name: 'createAFEXBeneficiary',
      visibility: 'protected',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Long', name: 'beneficiaryId' },
        { type: 'String', name: 'bankAccountId' },
        { type: 'Long', name: 'beneficiaryOwnerId' }
      ],
      javaCode: `
        AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
        try {
          new Thread(() -> afexServiceProvider.addPayee(beneficiaryId, bankAccountId,  beneficiaryOwnerId)).start();
        } catch(Throwable t) {
          ((Logger) x.get("logger")).error(CREATE_AFEX_BENF_ERROR_MSG, t);
        } 
      `
    }
  ]
});

