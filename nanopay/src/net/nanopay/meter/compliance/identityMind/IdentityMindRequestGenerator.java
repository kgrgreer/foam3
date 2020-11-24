package net.nanopay.meter.compliance.identityMind;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import foam.util.SecurityUtil;
import net.nanopay.account.Account;
import net.nanopay.auth.LoginAttempt;
import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.model.BeneficialOwner;
import net.nanopay.model.Business;
import net.nanopay.tx.model.Transaction;

import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import java.util.UUID;

public class IdentityMindRequestGenerator {
  protected final static ThreadLocal<SimpleDateFormat> isoDateSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
      sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
      return sdf;
    }
  };

  protected final static ThreadLocal<SimpleDateFormat> timestampSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
      sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
      return sdf;
    }
  };

  public static IdentityMindRequest getConsumerKYCRequest(X x, FObject obj) {
    if ( obj instanceof User ) {
      return getConsumerKYCRequest(x, (User) obj);
    }
    if (obj instanceof BeneficialOwner) {
      return getConsumerKYCRequest(x, (BeneficialOwner) obj);
    }

    throw new IllegalArgumentException(
      String.format("Invalid obj type: %s", obj.getClass().getName()));
  }

  public static IdentityMindRequest getEntityLoginRequest(X x, LoginAttempt login) {
    User user = login.findLoginAttemptedFor(x);
    return new IdentityMindRequest.Builder(x)
      .setEntityType(user.getClass().getName())
      .setEntityId(user.getId())
      .setDaoKey("localUserDAO")
      .setMan(Long.toString(login.getLoginAttemptedFor()))
      .setTea(user.getEmail())
      .setIp(login.getIpAddress())
      .setBfn(prepareString(user.getFirstName()))
      .setBln(prepareString(user.getLastName()))
      .build();
  }

  public static IdentityMindRequest getMerchantKYCRequest(X x, Business business) {
    IdentityMindRequest request = new IdentityMindRequest.Builder(x)
      .setEntityType(business.getClass().getName())
      .setEntityId(business.getId())
      .setDaoKey("businessDAO")
      .setMan(Long.toString(business.getId()))
      .setTid(getUUID(business))
      .setIp(getRemoteAddr(x))
      .build();

    // NOTE: Use organization if available because organization is
    // the registered business name, otherwise use businessName.
    String businessName = business.getOrganization();
    if ( SafetyUtil.isEmpty(businessName) ) {
      businessName = business.getBusinessName();
    }
    request.setAmn(prepareString(businessName));

    User user = getRealUser(x);
    if ( user != null ) {
      request.setAfn(prepareString(user.getFirstName()));
      request.setAln(prepareString(user.getLastName()));
    }

    Address address = business.getAddress();
    if ( address != null ) {
      request.setAsn(prepareString(address.getStreetNumber(), address.getStreetName(), address.getSuite()));
      request.setAc(prepareString(address.getCity()));
      request.setAco(prepareString(address.getCountryId()));
      request.setAs(prepareString(address.getRegionId()));
      request.setAz(prepareString(address.getPostalCode()));
    }
    String phoneNumber = business.getPhoneNumber();
    if ( phoneNumber != null ) {
      request.setPhn(prepareString(phoneNumber));
    }
    request.setWebsite(prepareString(business.getWebsite()));
    return request;
  }

  public static IdentityMindRequest getTransferRequest(X x, Transaction transaction) {
    DAO localUserDAO = (DAO) x.get("localUserDAO");
    Account sourceAccount = transaction.findSourceAccount(x);
    Account destinationAccount = transaction.findDestinationAccount(x);
    // The owner of destination account is a business but we need to know
    // the person who actually sends the payment therefore uses agent as sender.
    User sender = ((Subject) x.get("subject")).getRealUser();
//    if ( sender == null ) {
//      // REVIEW: it is not always the case that a user is logged in when
//      // Transactions are created. Also, this logic fails the transaction
//      // pipeline during non-ablii tests as they have no knowledge of
//      // user/agent setup.
//      ((Logger) x.get("logger")).warning("IdentityMindRequestGenerator.getTransferRequest agent not found in context, using sourceAccount owner.");
//      sender = (User) localUserDAO.inX(x).find(sourceAccount.getOwner());
//    }
    User receiver = (User) localUserDAO.inX(x).find(destinationAccount.getOwner());

    IdentityMindRequest request = new IdentityMindRequest.Builder(x)
      .setEntityType(transaction.getClass().getName())
      .setDaoKey("transactionDAO")
      .setEntityId(transaction.getId())
      .setTid(transaction.getId())
      .setIp(getRemoteAddr(x))
      .build();

    request.setAmt(Double.toString(transaction.getAmount() / 100.0));
    request.setCcy(sourceAccount.getDenomination());

    boolean isDomestic = sourceAccount.getClass() == destinationAccount.getClass();
    String[] tags = new String[] {
      isDomestic ? "Domestic" : "X-Border"
    };
    request.setMemo1(isDomestic);
    request.setTags(tags);

    // Sender information
    User owner = (User) localUserDAO.find(sourceAccount.getOwner());
    request.setMerchantAid(getUUID(owner));
    request.setMan(Long.toString(sender.getId()));
    if ( sourceAccount instanceof BankAccount ) {
      request.setPach(getBankAccountHash(x, (BankAccount) sourceAccount));
    } else {
      request.setPhash(getDigitalAccountHash(x, sourceAccount));
    }
    request.setBfn(prepareString(sender.getFirstName()));
    request.setBln(prepareString(sender.getLastName()));
    Address senderAddress = sender.getAddress();
    if ( senderAddress != null ) {
      request.setBsn(prepareString(senderAddress.getStreetNumber(), senderAddress.getStreetName(), senderAddress.getSuite()));
      request.setBc(prepareString(senderAddress.getCity()));
      request.setBco(prepareString(senderAddress.getCountryId()));
      request.setBs(prepareString(senderAddress.getRegionId()));
      request.setBz(prepareString(senderAddress.getPostalCode()));
    }
    String senderPhoneNumber = sender.getPhoneNumber();
    if (senderPhoneNumber != null) {
      request.setPhn(prepareString(senderPhoneNumber));
    }

    // Receiver information
    request.setDman(Long.toString(receiver.getId()));
    if ( destinationAccount instanceof BankAccount ) {
      request.setDpach(getBankAccountHash(x, (BankAccount) destinationAccount));
    } else {
      request.setDphash(getDigitalAccountHash(x, destinationAccount));
    }

    // External contact extra information
    if ( receiver instanceof Contact ) {
      request.setMemo(receiver.getOrganization());
      request.setDemail(receiver.getEmail());
      request.setSfn(prepareString(receiver.getFirstName()));
      request.setSln(prepareString(receiver.getLastName()));
      Address receiverAddress = receiver.getAddress();
      if (receiverAddress != null) {
        request.setSsn(prepareString(receiverAddress.getStreetNumber(), receiverAddress.getStreetName(), receiverAddress.getSuite()));
        request.setSc(prepareString(receiverAddress.getCity()));
        request.setSco(prepareString(receiverAddress.getCountryId()));
        request.setSs(prepareString(receiverAddress.getRegionId()));
        request.setSz(prepareString(receiverAddress.getPostalCode()));
      }
      String receiverPhoneNumber = receiver.getPhoneNumber();
      if (receiverPhoneNumber != null) {
        request.setDph(prepareString(receiverPhoneNumber));
      }
    }
    return request;
  }

  private static String getUUID(FObject obj) {
    long id = (Long) obj.getProperty("id");
    Date created = (Date) obj.getProperty("created");
    long createdTime = created != null ? created.getTime() : id;

    UUID uuid = UUID.nameUUIDFromBytes(
      String.format("%s.%d.%d",
        obj.getClass().getSimpleName(), id, createdTime).getBytes());
    return uuid.toString();
  }

  private static IdentityMindRequest getConsumerKYCRequest(X x, User user) {
    IdentityMindRequest request = new IdentityMindRequest.Builder(x)
      .setEntityType(user.getClass().getName())
      .setEntityId(user.getId())
      .setDaoKey("userDAO")
      .setMan(Long.toString(user.getId()))
      .setTid(getUUID(user))
      .setTea(user.getEmail())
      .setIp(prepareString(getRemoteAddr(x)))
      .setBfn(prepareString(user.getFirstName()))
      .setBln(prepareString(user.getLastName()))
      .setAccountCreationTime(timestampSdf.get().format(user.getCreated()))
      .build();

    Address address = user.getAddress();
    if ( address != null ) {
      request.setBsn(prepareString(address.getStreetNumber(), address.getStreetName(), address.getSuite()));
      request.setBc(prepareString(address.getCity()));
      request.setBco(prepareString(address.getCountryId()));
      request.setBs(prepareString(address.getRegionId()));
      request.setBz(prepareString(address.getPostalCode()));
    }
    String phoneNumber = user.getPhoneNumber();
    if (phoneNumber != null) {
      request.setPhn(prepareString(phoneNumber));
    }
    request.setTitle(prepareString(user.getJobTitle()));
    Date birthDay = user.getBirthday();
    if ( birthDay != null ) {
      request.setDob(isoDateSdf.get().format(birthDay));
    }
    return request;
  }

  private static IdentityMindRequest getConsumerKYCRequest(X x, BeneficialOwner owner) {
    IdentityMindRequest request = new IdentityMindRequest.Builder(x)
      .setEntityType(owner.getClass().getName())
      .setEntityId(owner.getId())
      .setDaoKey("beneficialOwnerDAO")
      .setMan("owner." + owner.getId())
      .setIp(getRemoteAddr(x))
      .setBfn(prepareString(owner.getFirstName()))
      .setBln(prepareString(owner.getLastName()))
      .setMerchantAid(getUUID(owner.findBusiness(x)))
      .build();

    Address address = owner.getAddress();
    if ( address != null ) {
      request.setBsn(prepareString(address.getStreetNumber(), address.getStreetName(), address.getSuite()));
      request.setBc(prepareString(address.getCity()));
      request.setBco(prepareString(address.getCountryId()));
      request.setBs(prepareString(address.getRegionId()));
      request.setBz(prepareString(address.getPostalCode()));
    }
    request.setOwnership(owner.getOwnershipPercent());
    request.setTitle(prepareString(owner.getJobTitle()));
    request.setDob(isoDateSdf.get().format(owner.getBirthday()));
    return request;
  }

  private static User getRealUser(X x) {
    User agent = ((Subject) x.get("subject")).getRealUser();
    if ( agent != null ) {
      return agent;
    }
    return ((Subject) x.get("subject")).getUser();
  }

  private static String formatDate(Date date) {
    return formatDate(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
  }

  private static String formatDate(Date date, String pattern) {
    if ( date != null ) {
      SimpleDateFormat dateFormat = new SimpleDateFormat(pattern);
      dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
      return dateFormat.format(date);
    }
    return null;
  }

  private static String getRemoteAddr(X x) {
    Session session = x.get(Session.class);
    if ( session != null ) {
      return session.getRemoteHost();
    }

    return null;
  }

  private static String prepareString(String... args) {
    String result = String.join(" ", args).trim();
    if ( ! SafetyUtil.isEmpty(result) ) {
      return result;
    }
    return null;
  }

  /**
   * Generate IdentityMind payment instrument hash
   * https://edoc.identitymind.com/reference#payment-instrument-hashing.
   */
  private static String generateHash(X x, Object... data) throws Throwable {
    MessageDigest messageDigest = MessageDigest.getInstance("SHA-1");
    IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");

    messageDigest.update(identityMindService.getHashingSalt().getBytes());
    for ( int i = 0; i < data.length; i++ ) {
      messageDigest.update(String.valueOf(data[i]).getBytes());
    }
    return SecurityUtil.ByteArrayToHexString(messageDigest.digest());
  }

  private static String getBankAccountHash(X x, BankAccount bankAccount) {
    try {
      return generateHash(x, bankAccount.getRoutingCode(x), bankAccount.getAccountNumber());
    } catch ( Throwable t ) {
      ((Logger) x.get("logger")).warning(
        "Cannot generate hash for bank account: ", bankAccount.getId(), "." , t);
      return null;
    }
  }

  private static String getDigitalAccountHash(X x, Account account) {
    try {
      return generateHash(x, account.getId());
    } catch ( Throwable t ) {
      ((Logger) x.get("logger")).warning(
        "Cannot generate hash for account: ", account.getId(), "." , t);
      return null;
    }
  }
}
