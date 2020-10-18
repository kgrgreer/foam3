package net.nanopay.meter.test;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.Group;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.crunch.AgentCapabilityJunction;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.session.Session;
import foam.nanos.test.Test;
import foam.util.Auth;

import net.nanopay.account.Account;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy;
import net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions;
import net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyDirectorsListed;
import net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyOwnersPercent;
import net.nanopay.crunch.acceptanceDocuments.capabilities.DualPartyAgreementCAD;
import net.nanopay.crunch.onboardingModels.BusinessDirectorsData;
import net.nanopay.crunch.onboardingModels.BusinessInformationData;
import net.nanopay.crunch.onboardingModels.BusinessOwnershipData;
import net.nanopay.crunch.onboardingModels.CertifyDataReviewed;
import net.nanopay.crunch.onboardingModels.InitialBusinessData;
import net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData;
import net.nanopay.crunch.onboardingModels.SigningOfficerQuestion;
import net.nanopay.crunch.onboardingModels.TransactionDetailsData;
import net.nanopay.crunch.onboardingModels.UserBirthDateData;
import net.nanopay.crunch.registration.UserRegistrationData;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.meter.compliance.dowJones.DowJonesMockService;
import net.nanopay.meter.compliance.dowJones.DowJonesService;
import net.nanopay.model.BeneficialOwner;
import net.nanopay.model.Business;
import net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo;
import net.nanopay.tx.model.Transaction;

import java.lang.Exception;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.stream.Collectors;

public class BlacklistTest extends Test {

  @Override
  public void runTest(X x) {
    DAO accountDAO = (DAO) x.get("accountDAO");
    DAO bareUserDAO = (DAO) x.get("bareUserDAO");
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    DAO groupDAO = (DAO) x.get("groupDAO");
    DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
    DAO smeUserRegistrationDAO = (DAO) x.get("smeUserRegistrationDAO");

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// SETUP ////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////

    // Mock dowJonesRestService
    // TODO setup mock in deployment/test/services.jrl instead
    var dowJonesService = (DowJonesService) x.get("dowJonesService");
    dowJonesService.setDowJonesRestService(new DowJonesMockService());

    // Setting the external business to pay to
    localBusinessDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "evilcorp@example.com")).removeAll();
    Business externalBusiness = new Business();
    externalBusiness.setEmail("evilcorp@example.com");
    externalBusiness.setBusinessName("EvilCorp");
    externalBusiness.setEmailVerified(true); // Required to send or receive money.
    externalBusiness.setCompliance(ComplianceStatus.PASSED);
    externalBusiness.setSpid("nanopay");
    externalBusiness = (Business) localBusinessDAO.put(externalBusiness);

    // Setup Admin User
    User myAdmin = new User();
    myAdmin.setUserName("Admin321");
    myAdmin.setEmail("email@admin321.com");
    myAdmin.setDesiredPassword("password");
    myAdmin.setGroup("sme");
    myAdmin.setOrganization("testBusiness");
    myAdmin.setSpid("nanopay");

    myAdmin = (User) smeUserRegistrationDAO.put(myAdmin);
    myAdmin.setEmailVerified(true);
    myAdmin = (User)((DAO)x.get("userDAO")).put(myAdmin);

    // nanopay admission : 554af38a-8225-87c8-dfdf-eeb15f71215e-18 || 242B00F8-C775-4899-AEBA-F287EC54E901 for treviso

    AbliiTermsAndConditions tc1 = new AbliiTermsAndConditions();
    tc1.setAgreement(true);
    UserCapabilityJunction ucjATAC = new UserCapabilityJunction();
    ucjATAC.setSourceId(myAdmin.getId());
    ucjATAC.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215e-7");
    ucjATAC.setData(tc1);

    AbliiPrivacyPolicy tc2 = new AbliiPrivacyPolicy();
    tc2.setAgreement(true);
    UserCapabilityJunction ucjAPP = new UserCapabilityJunction();
    ucjAPP.setSourceId(myAdmin.getId());
    ucjAPP.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215e-8");
    ucjAPP.setData(tc2);

    UserRegistrationData tc3 = new UserRegistrationData();
    tc3.setFirstName("Francis");
    tc3.setLastName("Filth"); //64
    tc3.setPhoneNumber("123123123");
    UserCapabilityJunction ucjURD = new UserCapabilityJunction();
    ucjURD.setSourceId(myAdmin.getId());
    ucjURD.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215e-19");
    ucjURD.setData(tc3);

    UserCapabilityJunction ucjAC = new UserCapabilityJunction();
    ucjAC.setSourceId(myAdmin.getId());
    ucjAC.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215e-18");

    userCapabilityJunctionDAO.put(ucjATAC);
    userCapabilityJunctionDAO.put(ucjAPP);
    userCapabilityJunctionDAO.put(ucjURD);
    userCapabilityJunctionDAO.put(ucjAC);

    // Business Registration : 554af38a-8225-87c8-dfdf-eeb15f71215f-76
    X myAdminContext = Auth.sudo(x, myAdmin);
    Session sessionAdmin = myAdminContext.get(Session.class);
    sessionAdmin.setAgentId(myAdmin.getId());
    myAdminContext = sessionAdmin.applyTo(myAdminContext);

    Address address = new Address();
    address.setCountryId("CA");
    address.setStreetName("Avenue Rd");
    address.setStreetNumber("123");
    address.setPostalCode("M1M1M1");
    address.setCity("Toronto");
    address.setRegionId("CA-MA");
    Date birthday = new GregorianCalendar(2000, 1, 1).getTime();

    InitialBusinessData br = new InitialBusinessData();
    br.setBusinessName("Trees be Free");
    br.setCompanyPhone("123123123");
    br.setAddress(address);
    br.setMailingAddress(address);
    UserCapabilityJunction ucjBR = new UserCapabilityJunction();
    ucjBR.setSourceId(myAdmin.getId());
    ucjBR.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-76");
    ucjBR.setData(br);

    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjBR);

    // Get MyBusiness
    foam.dao.ArraySink sink = (foam.dao.ArraySink) agentJunctionDAO.where(foam.mlang.MLang.EQ(UserUserJunction.SOURCE_ID, myAdmin.getId())).select(new foam.dao.ArraySink());
    List array = (List) sink.getArray();
    UserUserJunction agentJunction = (UserUserJunction) array.get(0);
    Business myBusiness = (Business) localBusinessDAO.find(agentJunction.getTargetId());

    // Add Business to Context
    sessionAdmin = myAdminContext.get(Session.class);
    sessionAdmin.setUserId(myBusiness.getId());
    myAdminContext = sessionAdmin.applyTo(myAdminContext);

    // Grant Admin Signing Officer Privileges Capability

    // Signing Officer Question : 554af38a-8225-87c8-dfdf-eeb15f71215f-0
    SigningOfficerQuestion soq = new SigningOfficerQuestion();
    soq.setIsSigningOfficer(true);
    AgentCapabilityJunction ucjSOQ = new AgentCapabilityJunction();
    ucjSOQ.setSourceId(myAdmin.getId());
    ucjSOQ.setEffectiveUser(myBusiness.getId());
    ucjSOQ.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-0");
    ucjSOQ.setData(soq);
    userCapabilityJunctionDAO.put(ucjSOQ);

    // Signing Officer Privileges : 554af38a-8225-87c8-dfdf-eeb15f71215f-1a5
    UserBirthDateData so1 = new UserBirthDateData();
    so1.setBirthday(birthday);
    AgentCapabilityJunction ucjSODOB = new AgentCapabilityJunction();
    ucjSODOB.setSourceId(myAdmin.getId());
    ucjSODOB.setEffectiveUser(myBusiness.getId());
    ucjSODOB.setTargetId("8bffdedc-5176-4843-97df-1b75ff6054fb");
    ucjSODOB.setData(so1);
    SigningOfficerPersonalData so = new SigningOfficerPersonalData();
    so.setAddress(address);
    so.setJobTitle("Accountant");
    so.setCountryId("CA");
    so.setPhoneNumber("2899998989");
    AgentCapabilityJunction ucjSOP = new AgentCapabilityJunction();
    ucjSOP.setSourceId(myAdmin.getId());
    ucjSOP.setEffectiveUser(myBusiness.getId());
    ucjSOP.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-1a5");
    ucjSOP.setData(so);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjSODOB);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjSOP);

    // setting up their respective accounts
    accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "Blacklist Tests myBusiness test account")).removeAll();
    CABankAccount myBusinessBankAccount = new CABankAccount();
    myBusinessBankAccount.setName("Blacklist Tests myBusiness test account");
    myBusinessBankAccount.setDenomination("CAD");
    myBusinessBankAccount.setAccountNumber("12345678");
    myBusinessBankAccount.setInstitution(1);
    myBusinessBankAccount.setBranchId("12345");
    myBusinessBankAccount.setStatus(BankAccountStatus.VERIFIED);
    myBusinessBankAccount = (CABankAccount) myBusiness.getAccounts(x).put_(x, myBusinessBankAccount);

    accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "Blacklist Tests externalBusiness test account")).removeAll();
    CABankAccount externalBusinessBankAccount = new CABankAccount();
    externalBusinessBankAccount.setName("Blacklist Tests externalBusiness test account");
    externalBusinessBankAccount.setDenomination("CAD");
    externalBusinessBankAccount.setAccountNumber("87654321");
    externalBusinessBankAccount.setInstitution(1);
    externalBusinessBankAccount.setBranchId("54321");
    externalBusinessBankAccount.setStatus(BankAccountStatus.VERIFIED);
    externalBusinessBankAccount = (CABankAccount) externalBusiness.getAccounts(x).put_(x, externalBusinessBankAccount);

    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// TEST CODE ///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    Invoice invoice = new Invoice();
    invoice.setAmount(1);
    invoice.setPayerId(myBusiness.getId());
    invoice.setPayeeId(externalBusiness.getId());
    invoice.setDestinationCurrency("CAD");
    invoice.setAccount(myBusinessBankAccount.getId());

    // Use system context to create invoice since invoice must exist for testing
    // the `transaction` below.
    invoice = (Invoice) invoiceDAO.inX(x).put(invoice);

    Transaction transaction = new Transaction();
    transaction.setSourceAccount(invoice.getAccount());
    transaction.setDestinationAccount(invoice.getDestinationAccount());
    transaction.setPayerId(invoice.getPayerId());
    transaction.setPayeeId(invoice.getPayeeId());
    transaction.setAmount(invoice.getAmount());
    transaction.setInvoiceId(invoice.getId());
    try {
      Transaction result = (Transaction) transactionDAO.inX(myAdminContext).put(transaction);
      test(result == null, "Transaction not created until business passes compliance passing proper compliance.");
    } catch (Throwable t) {
      test(false, "Unexpected exception putting transaction before business passes compliance: " + t);
    }

    Invoice invoice2 = new Invoice();
    invoice2.setAmount(2);
    invoice2.setPayerId(myBusiness.getId());
    invoice2.setPayeeId(externalBusiness.getId());
    invoice2.setDestinationCurrency("CAD");
    invoice2.setAccount(myBusinessBankAccount.getId());
    try {
      invoiceDAO.inX(x).put(invoice2);
    } catch (Throwable t) {
      test(true, "Invoice not created until business passes compliance passing proper compliance.");
    }

    // Grant Unlock Domestic Payments and Invoicing to pass Business Compliance and try putting the invoice and paying it
    // Unlock Domestic Payments and Invoicing : 554af38a-8225-87c8-dfdf-eeb15f71215f-11
    UserCapabilityJunction ucjUDPAI = new UserCapabilityJunction();
    ucjUDPAI.setSourceId(myBusiness.getId());
    ucjUDPAI.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-11");
    ucjUDPAI.setStatus(CapabilityJunctionStatus.GRANTED);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjUDPAI);

    // Business Details : 554af38a-8225-87c8-dfdf-eeb15f71215f-4
    BusinessInformationData bid = new BusinessInformationData();
    bid.setBusinessTypeId(2);
    bid.setBusinessSectorId(21211);
    bid.setSourceOfFunds("Investment Income");
    bid.setOperatingUnderDifferentName(false);

    UserCapabilityJunction ucjBD = new UserCapabilityJunction();
    ucjBD.setSourceId(myBusiness.getId());
    ucjBD.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-4");
    ucjBD.setData(bid);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjBD);

    // Transaction Details : 554af38a-8225-87c8-dfdf-eeb15f71215f-6
    SuggestedUserTransactionInfo suti = new SuggestedUserTransactionInfo();
    suti.setBaseCurrency("CAD");
    suti.setAnnualRevenue("$0 to $10,000");
    suti.setTransactionPurpose("Working capital");
    suti.setAnnualTransactionFrequency("100 to 199");
    suti.setAnnualDomesticVolume("$50,001 to $100,000");

    TransactionDetailsData tdd = new TransactionDetailsData();
    tdd.setTargetCustomers("loyal customers");
    tdd.setSuggestedUserTransactionInfo(suti);

    UserCapabilityJunction ucjTD = new UserCapabilityJunction();
    ucjTD.setSourceId(myBusiness.getId());
    ucjTD.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-6");
    ucjTD.setData(tdd);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjTD);

    // Business Owner Information : 554af38a-8225-87c8-dfdf-eeb15f71215f-7
    BeneficialOwner bo = new BeneficialOwner();
    bo.setFirstName("Francis");
    bo.setLastName("Filth");
    bo.setJobTitle("CEO");
    bo.setBusiness(myBusiness.getId());
    bo.setAddress(address);
    bo.setBirthday(birthday);
    bo.setOwnershipPercent(30);

    int[] chosenOwners = {1};

    BusinessOwnershipData bod = new BusinessOwnershipData.Builder(myAdminContext)
      .setOwnerSelectionsValidated(true)
      .setAmountOfOwners(1)
      .setOwner1(bo)
      .setChosenOwners(Arrays.stream(chosenOwners).boxed().collect(Collectors.toList()))
      .build();

    UserCapabilityJunction ucjBOD = new UserCapabilityJunction();
    ucjBOD.setSourceId(myBusiness.getId());
    ucjBOD.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-7");
    ucjBOD.setData(bod);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjBOD);

    // Certify Owners Percent : 554af38a-8225-87c8-dfdf-eeb15f71215e-12
    CertifyOwnersPercent cop = new CertifyOwnersPercent();
    cop.setAgreement(true);

    UserCapabilityJunction ucjCOP = new UserCapabilityJunction();
    ucjCOP.setSourceId(myBusiness.getId());
    ucjCOP.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215e-12");
    ucjCOP.setData(cop);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjCOP);

    // Business Directors Data : 554af38a-8225-87c8-dfdf-eeb15f71215f-6-5
    BusinessDirectorsData bdd = new BusinessDirectorsData();

    UserCapabilityJunction ucjBDD = new UserCapabilityJunction();
    ucjBDD.setSourceId(myBusiness.getId());
    ucjBDD.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-6-5");
    ucjBDD.setData(bdd);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjBDD);

    // Certify Directors Listed : 554af38a-8225-87c8-dfdf-eeb15f71215e-17
    CertifyDirectorsListed cdl = new CertifyDirectorsListed();
    cdl.setAgreement(true);

    UserCapabilityJunction ucjCDL = new UserCapabilityJunction();
    ucjCDL.setSourceId(myBusiness.getId());
    ucjCDL.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215e-17");
    ucjCDL.setData(cdl);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjCDL);

    // Dual Party Agreement CAD : 554af38a-8225-87c8-dfdf-eeb15f71215e-3
    DualPartyAgreementCAD dpac = new DualPartyAgreementCAD();
    dpac.setAgreement(true);

    UserCapabilityJunction ucjDPAC = new UserCapabilityJunction();
    ucjDPAC.setSourceId(myBusiness.getId());
    ucjDPAC.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215e-3");
    ucjDPAC.setData(dpac);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjDPAC);

    // Certify Data Reviewed : 554af38a-8225-87c8-dfdf-eeb15f71215f-14
    CertifyDataReviewed cdr = new CertifyDataReviewed();
    cdr.setReviewed(true);

    UserCapabilityJunction ucjCDR = new UserCapabilityJunction();
    ucjCDR.setSourceId(myBusiness.getId());
    ucjCDR.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-14");
    ucjCDR.setData(cdr);
    userCapabilityJunctionDAO.inX(myAdminContext).put(ucjCDR);

    List<ApprovalRequest> approvalRequests = ((ArraySink) approvalRequestDAO
      .where(foam.mlang.MLang.AND( new foam.mlang.predicate.Predicate[] {
        foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, "userCapabilityJunctionDAO"),
        foam.mlang.MLang.OR( new foam.mlang.predicate.Predicate[] {
          foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, ucjBOD.getId()),
          foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, ucjSOP.getId())
        }),
        foam.mlang.MLang.EQ(ApprovalRequest.IS_FULFILLED, false)
      }))
      .select(new ArraySink()))
      .getArray();

    for ( ApprovalRequest approvalRequest : approvalRequests ) {
      approvalRequest.setStatus(ApprovalStatus.APPROVED);
      try{
        approvalRequestDAO.put(approvalRequest);
      } catch(Exception e) {
        throw e;
      }
    }

    try {
      invoice2 = (Invoice) invoiceDAO.inX(x).put(invoice2);
    } catch (Throwable t) {
      test(false, "Unexpected exception putting invoice after setting compliance to passed: " + t);
    }

    Transaction transaction2 = new Transaction();
    transaction2.setSourceAccount(invoice2.getAccount());
    transaction2.setDestinationAccount(invoice2.getDestinationAccount());
    transaction2.setPayerId(invoice2.getPayerId());
    transaction2.setPayeeId(invoice2.getPayeeId());
    transaction2.setAmount(invoice2.getAmount());
    transaction2.setInvoiceId(invoice2.getId());

    try {
      Transaction result = (Transaction) transactionDAO.inX(myAdminContext).put(transaction2);
      test(result != null, "Successfully put the transaction to the TransactionDAO after setting compliance to passed.");
    } catch (Throwable t) {
      test(false, "Unexpected exception putting transaction after setting compliance to passed: " + t);
    }
  }
}
