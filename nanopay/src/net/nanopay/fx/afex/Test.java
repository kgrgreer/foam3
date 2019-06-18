package net.nanopay.fx.afex;

import foam.core.ContextAgent;
import foam.core.X;

public class Test implements ContextAgent {

  @Override
  public void execute(X x) {
    AFEXService afexService = new AFEXService(x);

    // testGetToken(afexService);
    // testAddPayee(afexService);
    // testUpdatePayee(afexService);
    // testDeletePayee(afexService);
    // testGetPayeeInfo(afexService);
    // testGetValueDate(afexService);
    // testGetQuote(afexService);
    testCreateTrade(afexService);
    testCreatePayment(afexService);

  }

  private void testGetToken(AFEXService afexService) {
    afexService.getToken();
  }

  private void testAddPayee(AFEXService afexService) {
    AddPayeeRequest addPayeeRequest = new AddPayeeRequest();
    addPayeeRequest.setBankAccountNumber("58926481025163");
    addPayeeRequest.setBankCountryCode("US");
    addPayeeRequest.setBankName("Associated Bank, National");
    addPayeeRequest.setBankRoutingCode("075900575");
    addPayeeRequest.setBeneficiaryAddressLine1("200 King St");
    addPayeeRequest.setBeneficiaryCity("New York");
    addPayeeRequest.setBeneficiaryCountryCode("US");
    addPayeeRequest.setBeneficiaryName("Jack2");
    addPayeeRequest.setBeneficiaryPostalCode("10019");
    addPayeeRequest.setBeneficiaryRegion("New York");
    //addPayeeRequest.setCorporate("true");
    addPayeeRequest.setCurrency("USD");
    //addPayeeRequest.setHighLowValue("1");

    afexService.addPayee(addPayeeRequest);
  }

  private void testUpdatePayee(AFEXService afexService) {
    UpdatePayeeRequest updatePayeeRequest = new UpdatePayeeRequest();
    updatePayeeRequest.setBankAccountNumber("58926481025162");
    updatePayeeRequest.setBankCountryCode("US");
    updatePayeeRequest.setBankName("Associated Bank, National");
    updatePayeeRequest.setBankRoutingCode("075900575");
    updatePayeeRequest.setBeneficiaryAddressLine1("100 King St");
    updatePayeeRequest.setBeneficiaryCity("New York");
    updatePayeeRequest.setBeneficiaryCountryCode("US");
    updatePayeeRequest.setBeneficiaryName("Olivia");
    updatePayeeRequest.setBeneficiaryPostalCode("10019");
    updatePayeeRequest.setBeneficiaryRegion("New York");
    updatePayeeRequest.setCurrency("USD");
    updatePayeeRequest.setVendorId("USD636953226987573100");

    afexService.updatePayee(updatePayeeRequest);
  }

  private void testDeletePayee(AFEXService afexService) {
    afexService.deletePayee("USD636952334062247928");
  }

  private void testGetPayeeInfo(AFEXService afexService) {
    afexService.getPayeeInfo("USD636954085609328569");
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
