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
  package: 'net.nanopay.flinks.external',
  name: 'FlinksLoginIdDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for processing FlinksLoginId requests.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.flinks.FlinksAuth',
    'net.nanopay.flinks.FlinksResponseService',
    'net.nanopay.flinks.model.AccountWithDetailModel',
    'net.nanopay.flinks.model.AddressModel',
    'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
    'net.nanopay.flinks.model.FlinksResponse',
    'net.nanopay.flinks.model.LoginModel',
    'net.nanopay.flinks.model.HolderModel',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        DAO userDAO = (DAO) x.get("localUserDAO");
        DAO businessDAO = (DAO) x.get("localBusinessDAO");
        FlinksAuth flinksAuth = (FlinksAuth) x.get("flinksAuth");
        FlinksResponseService flinksResponseService = (FlinksResponseService) x.get("flinksResponseService");
        User user = ((Subject) x.get("subject")).getUser();

        FlinksLoginId flinksLoginId = (FlinksLoginId) obj;
        FlinksResponse flinksResponse = (FlinksResponse) flinksResponseService.getFlinksResponse(x, flinksLoginId);
        if ( flinksResponse == null ) throw new RuntimeException("Flinks failed to provide a valid response when provided with login ID: " + flinksLoginId.getLoginId());
        
        FlinksAccountsDetailResponse flinksDetailResponse = (FlinksAccountsDetailResponse) flinksAuth.getAccountSummary(x, flinksResponse.getRequestId(), user);
        flinksLoginId.setFlinksAccountsDetails(flinksDetailResponse.getId());

        AccountWithDetailModel[] accounts = flinksDetailResponse.getAccounts();
        for ( int i = 0; i < accounts.length; i++ ) {
          AccountWithDetailModel accountDetail = accounts[i];
          if ( accountDetail.getCurrency().equals("CAD") ) {
            HolderModel holder = accountDetail.getHolder();
            AddressModel holderAddress = holder.getAddress();

            Address address = new Address.Builder(x)
              .setAddress1(holderAddress.getCivicAddress())
              .setRegionId(holderAddress.getProvince())
              .setCountryId(holderAddress.getCountry())
              .setCity(holderAddress.getCity())
              .setPostalCode(holderAddress.getPostalCode())
              .build();

            User newUser = new User.Builder(x)
              .setLegalName(holder.getName())
              .setEmail(holder.getEmail())
              .setAddress(address)
              .setPhoneNumber(holder.getPhoneNumber())
              .build();
            newUser = (User) userDAO.put(newUser);
            
            CABankAccount bankAccount = new CABankAccount();
            bankAccount.setOwner(newUser.getId());
            bankAccount.setAccountNumber(accountDetail.getAccountNumber());
            bankAccount.setBranchId(accountDetail.getTransitNumber());
            bankAccount.setDenomination(accountDetail.getCurrency());
            bankAccount.setInstitutionNumber(accountDetail.getInstitutionNumber());
            bankAccount.setName(accountDetail.getTitle());
            bankAccount.setType(accountDetail.getType());
            bankAccount.setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED);
            bankAccount.setVerifiedBy("FLINKS");

            bankAccount = (CABankAccount) accountDAO.put(bankAccount);
            flinksLoginId.setAccount(bankAccount.getId());
            break;
          }
        }

        return super.put_(x, flinksLoginId);
      `
    }
  ]
});
