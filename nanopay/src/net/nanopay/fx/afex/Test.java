package net.nanopay.fx.afex;

import foam.core.ContextAgent;
import foam.core.X;

public class Test implements ContextAgent {

  @Override
  public void execute(X x) {
    AFEXService afexService = new AFEXService(x);
    testGetToken(afexService);
    testOnboardCorporateClient(afexService);
    testGetClientAccountStatus(afexService);
    testRetrieveClientAccountDetails(afexService);
    testCreateBeneficiary(afexService);
    testUpdateBeneficiary(afexService);
    testDisableBeneficiary(afexService);
    testFindBeneficiary(afexService);
    testFindBankByNationalID(afexService);
    testGetValueDate(afexService);
    testGetRate(afexService);
    testGetQuote(afexService);
    testCreateTrade(afexService);
    testCheckTradeStatus(afexService);
    testCreatePayment(afexService);
    testCheckPaymentStatus(afexService);
  }

  private void testGetToken(AFEXService afexService) {
    Token token = afexService.getToken("");
    System.out.println("parsed token: " + token.getAccess_token());
    System.out.println(token.getToken_type());
    System.out.println(token.getExpires_in());
  }

  private void testOnboardCorporateClient(AFEXService afexService) {
    OnboardAFEXClientRequest onboardCorporateClientRequest = new OnboardAFEXClientRequest();
    onboardCorporateClientRequest.setAccountEntityType(AccountEntityType.CORPORATE_CLIENT.getLabel());
    onboardCorporateClientRequest.setIDExpirationDate("01/01/2021");
    onboardCorporateClientRequest.setIDNo("123456789");
    onboardCorporateClientRequest.setIDType("Passport");
    onboardCorporateClientRequest.setBusinessAddress("300 king st");
    onboardCorporateClientRequest.setBusinessCity("Toronto");
    onboardCorporateClientRequest.setBusinessCountry("CA");
    onboardCorporateClientRequest.setLegalCompanyName("Nanopay");
    onboardCorporateClientRequest.setBusinessZip("M2B1N7");
    onboardCorporateClientRequest.setCompanyType("Partnership");
    onboardCorporateClientRequest.setBusinessTelephoneNo("1234567891");
    onboardCorporateClientRequest.setDateOfFormation("01/01/2001");
    onboardCorporateClientRequest.setFirstName("Test");
    onboardCorporateClientRequest.setLastName("Abc");
    onboardCorporateClientRequest.setEmail("test@abc.com");
    onboardCorporateClientRequest.setTermsAndConditions("True");

    OnboardAFEXClientResponse onboardAFEXClientResponse = afexService.onboardAFEXClient(onboardCorporateClientRequest, "", AccountEntityType.CORPORATE_CLIENT);
    System.out.println(onboardAFEXClientResponse.getAPIKey());
    System.out.println(onboardAFEXClientResponse.getAccountNumber());
    System.out.println(onboardAFEXClientResponse.getMessage());
  }

  private void testGetClientAccountStatus(AFEXService afexService) {
    GetClientAccountStatusResponse getClientAccountStatusResponse = afexService.getClientAccountStatus("000058C9V464e2c3a-a796-e911-be2f-0050569b0074","");
    System.out.println(getClientAccountStatusResponse.getAccountStatus());
  }

  private void testRetrieveClientAccountDetails(AFEXService afexService) {
    RetrieveClientAccountDetailsResponse retrieveClientAccountDetailsResponse = afexService.retrieveClientAccountDetails("000058C9V464e2c3a-a796-e911-be2f-0050569b0074", "");
    System.out.println(retrieveClientAccountDetailsResponse.getAccountStatus());
    System.out.println(retrieveClientAccountDetailsResponse.getCitizenship());
    System.out.println(retrieveClientAccountDetailsResponse.getBusinessCity());
    System.out.println(retrieveClientAccountDetailsResponse.getBusinessAddress());
    System.out.println(retrieveClientAccountDetailsResponse.getBusinessCountry());
    // not sure what these are supposed to be yet,
    // not included in api accountfind response
    // System.out.println(retrieveClientAccountDetailsResponse.getIDExpirationDate());
    // System.out.println(retrieveClientAccountDetailsResponse.getIssueJurisdiction());
    // System.out.println(retrieveClientAccountDetailsResponse.getIDNo());
    // System.out.println(retrieveClientAccountDetailsResponse.getIDType());
    System.out.println(retrieveClientAccountDetailsResponse.getBusinessState());
    System.out.println(retrieveClientAccountDetailsResponse.getBusinessZip());
    System.out.println(retrieveClientAccountDetailsResponse.getDateOfBirth());
    System.out.println(retrieveClientAccountDetailsResponse.getExpectedMonthlyPayments());
    System.out.println(retrieveClientAccountDetailsResponse.getExpectedMonthlyVolume());
    System.out.println(retrieveClientAccountDetailsResponse.getFirstName());
    System.out.println(retrieveClientAccountDetailsResponse.getJobTitle());
    System.out.println(retrieveClientAccountDetailsResponse.getLastName());
    System.out.println(retrieveClientAccountDetailsResponse.getMiddleName());
    System.out.println(retrieveClientAccountDetailsResponse.getBusinessTelephoneNo());
    System.out.println(retrieveClientAccountDetailsResponse.getPrimaryEmailAddress());
    // System.out.println(retrieveClientAccountDetailsResponse.getTaxIdentificationNumber());
    System.out.println(retrieveClientAccountDetailsResponse.getTermsAndConditions());
  }

  private void testCreateBeneficiary(AFEXService afexService) {
    CreateBeneficiaryRequest createBeneficiaryRequest = new CreateBeneficiaryRequest();
    createBeneficiaryRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    createBeneficiaryRequest.setBankAccountNumber("58926481025163");
    createBeneficiaryRequest.setBankCountryCode("US");
    createBeneficiaryRequest.setBankName("Associated Bank, National");
    createBeneficiaryRequest.setBankRoutingCode("075900575");
    createBeneficiaryRequest.setBeneficiaryAddressLine1("200 King St");
    createBeneficiaryRequest.setBeneficiaryCity("New York");
    createBeneficiaryRequest.setBeneficiaryCountryCode("US");
    createBeneficiaryRequest.setBeneficiaryName("Jack2");
    createBeneficiaryRequest.setBeneficiaryPostalCode("10019");
    createBeneficiaryRequest.setBeneficiaryRegion("New York");
    createBeneficiaryRequest.setCurrency("USD");

    CreateBeneficiaryResponse createBeneficiaryResponse = afexService.createBeneficiary(createBeneficiaryRequest,"");
    System.out.println("Add beneficiary response: ");
    System.out.println(createBeneficiaryResponse.getName());
    System.out.println(createBeneficiaryResponse.getCode());
    System.out.println(createBeneficiaryResponse.getInformationMessage());
    System.out.println(createBeneficiaryResponse.getInformationCode());
    System.out.println(createBeneficiaryResponse.getStatus());
  }

  private void testUpdateBeneficiary(AFEXService afexService) {
    UpdateBeneficiaryRequest updateBeneficiaryRequest = new UpdateBeneficiaryRequest();
    updateBeneficiaryRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    updateBeneficiaryRequest.setBankAccountNumber("58926481025162");
    updateBeneficiaryRequest.setBankCountryCode("US");
    updateBeneficiaryRequest.setBankName("Associated Bank, National");
    updateBeneficiaryRequest.setBankRoutingCode("075900575");
    updateBeneficiaryRequest.setBeneficiaryAddressLine1("100 King St");
    updateBeneficiaryRequest.setBeneficiaryCity("New York");
    updateBeneficiaryRequest.setBeneficiaryCountryCode("US");
    updateBeneficiaryRequest.setBeneficiaryName("Olivia");
    updateBeneficiaryRequest.setBeneficiaryPostalCode("10019");
    updateBeneficiaryRequest.setBeneficiaryRegion("New York");
    updateBeneficiaryRequest.setCurrency("USD");
    updateBeneficiaryRequest.setVendorId("USD636964592845797184");

    UpdateBeneficiaryResponse updateBeneficiaryResponse = afexService.updateBeneficiary(updateBeneficiaryRequest,"");
    System.out.println("Update Payee response: ");
    System.out.println(updateBeneficiaryResponse.getName());
    System.out.println(updateBeneficiaryResponse.getCode());
    System.out.println(updateBeneficiaryResponse.getInformationMessage());
    System.out.println(updateBeneficiaryResponse.getInformationCode());
    System.out.println(updateBeneficiaryResponse.getStatus());
  }

  private void testDisableBeneficiary(AFEXService afexService) {
    DisableBeneficiaryRequest disableBeneficiaryRequest = new DisableBeneficiaryRequest();
    disableBeneficiaryRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    disableBeneficiaryRequest.setVendorId("USD636972300819485746");

    String response = afexService.disableBeneficiary(disableBeneficiaryRequest,"");
    System.out.println(response);
  }

  private void testFindBeneficiary(AFEXService afexService) {
    FindBeneficiaryRequest findBeneficiaryRequest = new FindBeneficiaryRequest();
    findBeneficiaryRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    findBeneficiaryRequest.setVendorId("USD636952327284361125");

    FindBeneficiaryResponse findBeneficiaryResponse = afexService.findBeneficiary(findBeneficiaryRequest,"");
    System.out.println("find beneficiary response: ");
    System.out.println(findBeneficiaryResponse.getCurrency());
    System.out.println(findBeneficiaryResponse.getVendorId());
    System.out.println(findBeneficiaryResponse.getBeneficiaryName());
    System.out.println(findBeneficiaryResponse.getBeneficiaryAddressLine1());
    System.out.println(findBeneficiaryResponse.getBeneficiaryCity());
    System.out.println(findBeneficiaryResponse.getBeneficiaryCountryCode());
  }

  private void testFindBankByNationalID(AFEXService afexService) {
    FindBankByNationalIDRequest findBankByNationalIDRequest = new FindBankByNationalIDRequest();
    findBankByNationalIDRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    findBankByNationalIDRequest.setCity("Acme");
    findBankByNationalIDRequest.setCountryCode("CA");
    findBankByNationalIDRequest.setInstitution("0002");
    findBankByNationalIDRequest.setNationalID("000125039");

    FindBankByNationalIDResponse findBankByNationalIDResponse = afexService.findBankByNationalID(findBankByNationalIDRequest,"");
    System.out.println("FindBankByNationalIDResponse: ");
    System.out.println(findBankByNationalIDResponse.getNationalIdentifier());
    System.out.println(findBankByNationalIDResponse.getNationalIdType());
    System.out.println(findBankByNationalIDResponse.getInstitutionName());
    System.out.println(findBankByNationalIDResponse.getBranchInformation());
    System.out.println(findBankByNationalIDResponse.getStreetAddress1());
    System.out.println(findBankByNationalIDResponse.getStreetAddress2());
    System.out.println(findBankByNationalIDResponse.getStreetAddress3());
    System.out.println(findBankByNationalIDResponse.getStreetAddress4());
    System.out.println(findBankByNationalIDResponse.getCity());
    System.out.println(findBankByNationalIDResponse.getZipCode());
    System.out.println(findBankByNationalIDResponse.getCountryName());
    System.out.println(findBankByNationalIDResponse.getIsoCountryCode());
  }

  private void testGetValueDate(AFEXService afexService) {
    String response = afexService.getValueDate("USDCAD", "SPOT", "","");
    System.out.println("value date response: " + response);
  }

  private void testGetQuote(AFEXService afexService) {
    GetQuoteRequest getQuoteRequest = new GetQuoteRequest();
    getQuoteRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    getQuoteRequest.setCurrencyPair("USDCAD");
    getQuoteRequest.setValueDate("2019/07/02");
    getQuoteRequest.setOptionDate("2019/06/27");
    getQuoteRequest.setAmount("100");

    Quote quote = afexService.getQuote(getQuoteRequest,"");
    System.out.println("quote: ");
    System.out.println(quote.getRate());
    System.out.println(quote.getInvertedRate());
    System.out.println(quote.getValueDate());
    System.out.println(quote.getOptionDate());
    System.out.println(quote.getQuoteId());
    System.out.println(quote.getTerms());
    System.out.println(quote.getAmount());
    System.out.println(quote.getIsAmountSettlement());
  }

  private void testGetRate(AFEXService afexService) {
    GetRateRequest getRateRequest = new GetRateRequest();
    getRateRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    getRateRequest.setCurrencyPair("USDCAD");

    GetRateResponse getRateResponse = afexService.getRate(getRateRequest,"");
    System.out.println("rate: ");
    System.out.println(getRateResponse.getRate());
    System.out.println(getRateResponse.getInvertedRate());
    System.out.println(getRateResponse.getTerms());
  }

  private void testCreateTrade(AFEXService afexService) {
    CreateTradeRequest createTradeRequest = new CreateTradeRequest();
    createTradeRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    createTradeRequest.setAmount("100");
    createTradeRequest.setSettlementCcy("CAD");
    createTradeRequest.setTradeCcy("USD");

    CreateTradeResponse createTradeResponse = afexService.createTrade(createTradeRequest,"");
    System.out.println("CreateTrade response: ");
    System.out.println(createTradeResponse.getTradeNumber());
    System.out.println(createTradeResponse.getAmount());
    System.out.println(createTradeResponse.getRate());
    System.out.println(createTradeResponse.getTradeCcy());
    System.out.println(createTradeResponse.getSettlementAmt());
    System.out.println(createTradeResponse.getSettlementCcy());
    System.out.println(createTradeResponse.getValueDate());
  }

  private void testCheckTradeStatus(AFEXService afexService) {
    CheckTradeStatusRequest checkTradeStatusRequest = new CheckTradeStatusRequest();
    checkTradeStatusRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    checkTradeStatusRequest.setId("357496");

    CheckTradeStatusResponse checkTradeStatusResponse = afexService.checkTradeStatus(checkTradeStatusRequest,"");
    System.out.println("Trade status: ");
    System.out.println(checkTradeStatusResponse.getTradeNumber());
    System.out.println(checkTradeStatusResponse.getAmount());
    System.out.println(checkTradeStatusResponse.getRemainingBalance());
    System.out.println(checkTradeStatusResponse.getRate());
    System.out.println(checkTradeStatusResponse.getBeneficiaryName());
    System.out.println(checkTradeStatusResponse.getTradeCcy());
    System.out.println(checkTradeStatusResponse.getSettlementAmt());
    System.out.println(checkTradeStatusResponse.getSettlementCcy());
    System.out.println(checkTradeStatusResponse.getTradeDate());
    System.out.println(checkTradeStatusResponse.getValueDate());
    System.out.println(checkTradeStatusResponse.getStatus());
    System.out.println(checkTradeStatusResponse.getFunded());
    System.out.println(checkTradeStatusResponse.getNote());
  }

  private void testCreatePayment(AFEXService afexService) {
    CreatePaymentRequest createPaymentRequest = new CreatePaymentRequest();
    createPaymentRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    createPaymentRequest.setPaymentDate("2019/07/02");
    createPaymentRequest.setAmount("50");
    createPaymentRequest.setCurrency("USD");
    createPaymentRequest.setVendorId("CADAmy");

    CreatePaymentResponse createPaymentResponse = afexService.createPayment(createPaymentRequest,"");
    System.out.println("CreatePayment response: ");
    System.out.println(createPaymentResponse.getReferenceNumber());
    System.out.println(createPaymentResponse.getAmount());
    System.out.println(createPaymentResponse.getCcy());
    System.out.println(createPaymentResponse.getPaymentDate());
    System.out.println(createPaymentResponse.getMessage());
  }

  private void testCheckPaymentStatus(AFEXService afexService) {
    CheckPaymentStatusRequest checkPaymentStatusRequest = new CheckPaymentStatusRequest();
    checkPaymentStatusRequest.setClientAPIKey("00005838Ve1b47397-8772-e911-9608-892613e8802f");
    checkPaymentStatusRequest.setId("243809");

    CheckPaymentStatusResponse checkPaymentStatusResponse = afexService.checkPaymentStatus(checkPaymentStatusRequest,"");
    System.out.println("Payment status: ");
    System.out.println(checkPaymentStatusResponse.getReferenceNumber());
    System.out.println(checkPaymentStatusResponse.getPaymentStatus());
    System.out.println(checkPaymentStatusResponse.getCurrency());
    System.out.println(checkPaymentStatusResponse.getAmount());
    System.out.println(checkPaymentStatusResponse.getValueDate());
    System.out.println(checkPaymentStatusResponse.getBeneficiaryName());
    System.out.println(checkPaymentStatusResponse.getScheduledDate());
    System.out.println(checkPaymentStatusResponse.getSubmittedDate());
    System.out.println(checkPaymentStatusResponse.getModifiedDate());
    System.out.println(checkPaymentStatusResponse.getTradeNumber());
    System.out.println(checkPaymentStatusResponse.getStatus());
    System.out.println(checkPaymentStatusResponse.getNote());
  }
}
