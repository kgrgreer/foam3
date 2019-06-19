package net.nanopay.fx.afex;

import foam.core.ContextAgent;
import foam.core.X;

public class Test implements ContextAgent {

  @Override
  public void execute(X x) {
    AFEXService afexService = new AFEXService(x);

    // testGetToken(afexService);
    testOnboardCorporateClient(afexService);
    // testCreateBeneficiary(afexService);
    // testUpdateBeneficiary(afexService);
    // testDisableBeneficiary(afexService);
    // testFindBeneficiary(afexService);
    // testGetValueDate(afexService);
    // testGetQuote(afexService);
//    testCreateTrade(afexService);
//    testCreatePayment(afexService);


  }

  private void testGetToken(AFEXService afexService) {
    afexService.getToken();
  }

  private void testOnboardCorporateClient(AFEXService afexService) {
    OnboardCorporateClientRequest onboardCorporateClientRequest = new OnboardCorporateClientRequest();
    onboardCorporateClientRequest.setAccountPrimaryIdentificationExpirationDate("01/01/2021");
    onboardCorporateClientRequest.setAccountPrimaryIdentificationNumber("123456789");
    onboardCorporateClientRequest.setAccountPrimaryIdentificationType("Passport");
    onboardCorporateClientRequest.setBusinessAddress1("300 king st");
    onboardCorporateClientRequest.setBusinessCity("Toronto");
    onboardCorporateClientRequest.setBusinessCountryCode("CA");
    onboardCorporateClientRequest.setBusinessName("Nanopay");
    onboardCorporateClientRequest.setBusinessZip("M2B1N7");
    onboardCorporateClientRequest.setCompanyType("Partnership");
    onboardCorporateClientRequest.setContactBusinessPhone("1234567891");
    onboardCorporateClientRequest.setDateOfIncorporation("01/01/2001");
    onboardCorporateClientRequest.setFirstName("Test");
    onboardCorporateClientRequest.setGender("Male");
    onboardCorporateClientRequest.setLastName("Abc");
    onboardCorporateClientRequest.setPrimaryEmailAddress("test@abc.com");
    onboardCorporateClientRequest.setTermsAndConditions("True");

    afexService.onboardCorporateClient(onboardCorporateClientRequest);
  }

  private void testCreateBeneficiary(AFEXService afexService) {
    CreateBeneficiaryRequest createBeneficiaryRequest = new CreateBeneficiaryRequest();
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

    afexService.createBeneficiary(createBeneficiaryRequest);
  }

  private void testUpdateBeneficiary(AFEXService afexService) {
    UpdateBeneficiaryRequest updateBeneficiaryRequest = new UpdateBeneficiaryRequest();
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

    afexService.updateBeneficiary(updateBeneficiaryRequest);
  }

  private void testDisableBeneficiary(AFEXService afexService) {
    afexService.disableBeneficiary("USD636954086321337916");
  }

  private void testFindBeneficiary(AFEXService afexService) {
    afexService.findBeneficiary("USD636952327284361125");
  }

  private void testGetValueDate(AFEXService afexService) {
    afexService.getValueDate("USDCAD", "CASH");
  }

  private void testGetQuote(AFEXService afexService) {
    GetQuoteRequest getQuoteRequest = new GetQuoteRequest();
    getQuoteRequest.setCurrencyPair("USDCAD");
    getQuoteRequest.setValueDate("2019/06/19");
    getQuoteRequest.setOptionDate("2019/06/17");
    getQuoteRequest.setAmount("100");

    afexService.getQuote(getQuoteRequest);
  }

  private void testCreateTrade(AFEXService afexService) {
    CreateTradeRequest createTradeRequest = new CreateTradeRequest();
    createTradeRequest.setAmount("100");
    createTradeRequest.setSettlementCcy("CAD");
    createTradeRequest.setTradeCcy("USD");

    afexService.createTrade(createTradeRequest);
  }

  private void testCreatePayment(AFEXService afexService) {
    CreatePaymentRequest createPaymentRequest = new CreatePaymentRequest();
    createPaymentRequest.setAmount("50");
    createPaymentRequest.setCurrency("USD");
    createPaymentRequest.setVendorId("CADAmy");

    afexService.createPayment(createPaymentRequest);
  }

}
