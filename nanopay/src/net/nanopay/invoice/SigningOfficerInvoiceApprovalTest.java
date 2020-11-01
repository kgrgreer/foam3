package net.nanopay.invoice;

import foam.dao.*;

import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.crunch.AgentCapabilityJunction;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.session.Session;
import foam.core.X;
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
import net.nanopay.crunch.onboardingModels.InitialBusinessData;
import net.nanopay.crunch.onboardingModels.CertifyDataReviewed;
import net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData;
import net.nanopay.crunch.onboardingModels.SigningOfficerQuestion;
import net.nanopay.crunch.onboardingModels.TransactionDetailsData;
import net.nanopay.crunch.onboardingModels.UserBirthDateData;
import net.nanopay.crunch.registration.UserRegistrationData;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.meter.compliance.dowJones.DowJonesMockService;
import net.nanopay.meter.compliance.dowJones.DowJonesService;
import net.nanopay.model.BeneficialOwner;
import net.nanopay.model.Business;
import net.nanopay.model.SigningOfficer;
import net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo;
import net.nanopay.tx.model.Transaction;

import java.lang.Exception;
import java.util.Arrays;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.stream.Collectors;

public class SigningOfficerInvoiceApprovalTest
  extends foam.nanos.test.Test
{
  public void runTest(X x) {

DAO accountDAO = (DAO) x.get("accountDAO");
DAO localUserDAO = (DAO) x.get("localUserDAO");
DAO userDAO = (DAO) x.get("userDAO");
DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
DAO invoiceDAO = (DAO) x.get("invoiceDAO");
DAO transactionDAO = (DAO) x.get("transactionDAO");
DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
DAO smeUserRegistrationDAO = (DAO) x.get("smeUserRegistrationDAO");

////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// SETUP ////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

// Mock dowJonesRestService
// TODO setup mock in deployment/test/services.jrl instead
DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
dowJonesService.setDowJonesRestService(new DowJonesMockService());

localUserDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "externalBusiness@example.com")).removeAll();
Business externalBusiness = new Business();
externalBusiness.setBusinessName("ExternalBusiness");
externalBusiness.setEmail("externalBusiness@example.com");
externalBusiness.setEmailVerified(true); // Required to send or receive money.
externalBusiness.setCompliance(ComplianceStatus.PASSED);
externalBusiness.setSpid("nanopay");
externalBusiness = (Business) localBusinessDAO.put(externalBusiness);

// Setup Admin User
User myAdmin = new User();
myAdmin.setUserName("Admin123");
myAdmin.setEmail("email@admin123.com");
myAdmin.setDesiredPassword("password");
myAdmin.setGroup("sme");
myAdmin.setOrganization("testBusiness");
myAdmin.setSpid("nanopay");

myAdmin = (User)  smeUserRegistrationDAO.put(myAdmin);
myAdmin.setEmailVerified(true);
myAdmin = (User) userDAO.put(myAdmin);

// nanopay admission : 554af38a-8225-87c8-dfdf-eeb15f71215e-18

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
ucjAC.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215e-18"); // use 242B00F8-C775-4899-AEBA-F287EC54E901 for treviso

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
ArraySink sink = (foam.dao.ArraySink) agentJunctionDAO.where(foam.mlang.MLang.EQ(UserUserJunction.SOURCE_ID, myAdmin.getId())).select(new foam.dao.ArraySink());
UserUserJunction agentJunction = (UserUserJunction) sink.getArray().get(0);
Business myBusiness = (Business)localBusinessDAO.find(agentJunction.getTargetId());

// Setup Approver and Employee Users
localUserDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "approver@example.com")).removeAll();
User myApprover = new User();
myApprover.setFirstName("MyApprover");
myApprover.setEmail("approver@example.com");
myApprover.setGroup(myBusiness.getBusinessPermissionId() + ".employee");
myApprover.setEmailVerified(true); // Required to send or receive money.
myApprover.setCompliance(ComplianceStatus.PASSED);
myApprover.setSpid("nanopay");
myApprover = (User) localUserDAO.put(myApprover);
X myApproverContext = Auth.sudo(x, myApprover);

localUserDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "employee@example.com")).removeAll();
User myEmployee = new User();
myEmployee.setFirstName("MyEmployee");
myEmployee.setEmail("employee@example.com");
myEmployee.setGroup(myBusiness.getBusinessPermissionId() + ".employee");
myEmployee.setEmailVerified(true); // Required to send or receive money.
myEmployee.setCompliance(ComplianceStatus.PASSED);
myEmployee.setSpid("nanopay");
myEmployee = (User) localUserDAO.put(myEmployee);
X myEmployeeContext = Auth.sudo(x, myEmployee);

// Creating junctions for MyBusiness users
UserUserJunction approverToBusinessJunc = new UserUserJunction();
approverToBusinessJunc.setSourceId(myApprover.getId());
approverToBusinessJunc.setTargetId(myBusiness.getId());
approverToBusinessJunc.setGroup(myBusiness.getBusinessPermissionId() + ".employee");
agentJunctionDAO.put(approverToBusinessJunc);

UserUserJunction employeeToBusinessJunc = new UserUserJunction();
employeeToBusinessJunc.setSourceId(myEmployee.getId());
employeeToBusinessJunc.setTargetId(myBusiness.getId());
employeeToBusinessJunc.setGroup(myBusiness.getBusinessPermissionId() + ".employee");
agentJunctionDAO.put(employeeToBusinessJunc);

// Creating respective contexts with user-agent enabled in their sessions
Session sessionApprover = myApproverContext.get(Session.class);
sessionApprover.setUserId(myBusiness.getId());
sessionApprover.setAgentId(myApprover.getId());
myApproverContext = sessionApprover.applyTo(myApproverContext);

Session sessionEmployee = myEmployeeContext.get(Session.class);
sessionEmployee.setUserId(myBusiness.getId());
sessionEmployee.setAgentId(myEmployee.getId());
myEmployeeContext = sessionEmployee.applyTo(myEmployeeContext);

// Grant Approver Signing Officer Privileges Capability

// Signing Officer Question : 554af38a-8225-87c8-dfdf-eeb15f71215f-0
SigningOfficerQuestion soq = new SigningOfficerQuestion();
soq.setIsSigningOfficer(true);
AgentCapabilityJunction ucjSOQ = new AgentCapabilityJunction();
ucjSOQ.setSourceId(myApprover.getId());
ucjSOQ.setEffectiveUser(myBusiness.getId());
ucjSOQ.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-0");
ucjSOQ.setData(soq);
userCapabilityJunctionDAO.put(ucjSOQ);

// Signing Officer Privileges : 554af38a-8225-87c8-dfdf-eeb15f71215f-1a5
UserBirthDateData so1 = new UserBirthDateData();
so1.setBirthday(birthday);
AgentCapabilityJunction ucjSODOB = new AgentCapabilityJunction();
ucjSODOB.setSourceId(myApprover.getId());
ucjSODOB.setEffectiveUser(myBusiness.getId());
ucjSODOB.setTargetId("8bffdedc-5176-4843-97df-1b75ff6054fb");
ucjSODOB.setData(so1);
SigningOfficerPersonalData so = new SigningOfficerPersonalData();
so.setAddress(address);
so.setJobTitle("Accountant");
so.setCountryId("CA");
so.setPhoneNumber("2899998989");
AgentCapabilityJunction ucjSOP = new AgentCapabilityJunction();
ucjSOP.setSourceId(myApprover.getId());
ucjSOP.setEffectiveUser(myBusiness.getId());
ucjSOP.setTargetId("554af38a-8225-87c8-dfdf-eeb15f71215f-1a5");
ucjSOP.setData(so);
userCapabilityJunctionDAO.inX(myApproverContext).put(ucjSODOB);
userCapabilityJunctionDAO.inX(myApproverContext).put(ucjSOP);

// Grant Unlock Domestic Payments and Invoicing

// Add Business to Context
sessionAdmin = myAdminContext.get(Session.class);
sessionAdmin.setUserId(myBusiness.getId());
myAdminContext = sessionAdmin.applyTo(myAdminContext);

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

// Business ownership : 554af38a-8225-87c8-dfdf-eeb15f71215f-7
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

// Creating an account for my business and the external busienss I am sending to
accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "Approval Tests myBusiness test account")).removeAll();
CABankAccount myBusinessBankAccount = new CABankAccount();
myBusinessBankAccount.setName("Approval Tests myEmployee test account");
myBusinessBankAccount.setDenomination("CAD");
myBusinessBankAccount.setAccountNumber("87654321");
myBusinessBankAccount.setInstitution(1);
myBusinessBankAccount.setBranchId("54321");
myBusinessBankAccount.setOwner(myBusiness.getId());
myBusinessBankAccount.setStatus(BankAccountStatus.VERIFIED);
myBusinessBankAccount = (CABankAccount) myBusiness.getAccounts(x).put_(x, myBusinessBankAccount);

accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "Approval Tests externalBusiness test account")).removeAll();
CABankAccount externalBusinessBankAccount = new CABankAccount();
externalBusinessBankAccount.setName("Approval Tests external business test account");
externalBusinessBankAccount.setDenomination("CAD");
externalBusinessBankAccount.setAccountNumber("12345678");
externalBusinessBankAccount.setInstitution(1);
externalBusinessBankAccount.setOwner(externalBusiness.getId());
externalBusinessBankAccount.setBranchId("12345");
externalBusinessBankAccount.setStatus(BankAccountStatus.VERIFIED);

// previously, there where no permissions in place to prevent unauthorized groups from setting bank account statuses
// after adding bank account status permissions, this test would not work
// this is because in the normal .put method, despite the bank account status being set to verified in the lines above
// it goes through a cloning procedure in the permissionedPropertyDAO, where it checks if the employee1's group (sme)
// has permissions to read/write bank account status, since they do not it would instead reset the status property to unverified
// that is why we must use the override put_, in order to set the employee bank account using the global context permissions
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
invoice = (Invoice) invoiceDAO.inX(myEmployeeContext).put(invoice);
Boolean invoiceStatusIsCorrect = invoice.getStatus() == InvoiceStatus.UNPAID;
Boolean paymentStatusIsCorrect = invoice.getPaymentMethod() == PaymentStatus.NONE;
if ( ! invoiceStatusIsCorrect ) {
  print("DEBUG: Invoice status is " + invoice.getStatus());
}
if ( ! paymentStatusIsCorrect ) {
  print("DEBUG: Payment status is " + invoice.getPaymentMethod());
}
test(invoiceStatusIsCorrect && paymentStatusIsCorrect, "When an employee creates an invoice, the invoice status is UNPAID and the payment status is NONE.");


Transaction transaction = new Transaction();
transaction.setSourceAccount(invoice.getAccount());
transaction.setDestinationAccount(invoice.getDestinationAccount());
transaction.setPayerId(invoice.getPayerId());
transaction.setPayeeId(invoice.getPayeeId());
transaction.setAmount(invoice.getAmount());
transaction.setInvoiceId(invoice.getId());
Boolean threw = false;
String message = "";
try {
  transactionDAO.inX(myEmployeeContext).put(transaction);
  invoice = (Invoice) invoiceDAO.inX(myEmployeeContext).find(invoice.getId());
  invoiceStatusIsCorrect = invoice.getStatus() == InvoiceStatus.PENDING_APPROVAL;
  paymentStatusIsCorrect = invoice.getPaymentMethod() == PaymentStatus.PENDING_APPROVAL;
  if ( ! invoiceStatusIsCorrect ) {
    print("DEBUG: Invoice status is " + invoice.getStatus());
  }
  if ( ! paymentStatusIsCorrect ) {
    print("DEBUG: Payment status is " + invoice.getPaymentMethod());
  }
} catch (Throwable t) {
  threw = true;
  message = t.getMessage();
  print("DEBUG: " + message);
}
test(! threw && invoiceStatusIsCorrect && paymentStatusIsCorrect, "When an employee tries to pay an invoice the invoice is set to a PENDING_APPROVAL state.");


invoice = new Invoice();
invoice.setAmount(1);
invoice.setPayerId(myBusiness.getId());
invoice.setPayeeId(externalBusiness.getId());
invoice.setDestinationCurrency("CAD");
invoice.setAccount(myBusinessBankAccount.getId());
invoice = (Invoice) invoiceDAO.inX(myApproverContext).put(invoice);
test(invoice.getStatus() == InvoiceStatus.UNPAID && invoice.getPaymentMethod() == PaymentStatus.NONE, "When an approver creates an invoice, the invoice status is UNPAID and the payment status is NONE.");


transaction = new Transaction();
transaction.setSourceAccount(invoice.getAccount());
transaction.setDestinationAccount(invoice.getDestinationAccount());
transaction.setPayerId(invoice.getPayerId());
transaction.setPayeeId(invoice.getPayeeId());
transaction.setAmount(invoice.getAmount());
transaction.setInvoiceId(invoice.getId());
threw = false;
message = "";
try {
  transactionDAO.inX(myApproverContext).put(transaction);
} catch (Throwable t) {
  threw = true;
  message = t.getMessage();
  print("DEBUG: " + message);
}
test(! threw, "When an approver tries to pay an invoice, it works as expected.");
  }
}
