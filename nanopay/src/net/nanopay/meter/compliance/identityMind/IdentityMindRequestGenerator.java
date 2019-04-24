package net.nanopay.meter.compliance.identityMind;

import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.Address;
import foam.nanos.auth.Phone;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import foam.util.SecurityUtil;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.auth.LoginAttempt;
import net.nanopay.bank.BankAccount;
import net.nanopay.model.BeneficialOwner;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessUserJunction;
import net.nanopay.tx.cico.CITransaction;

import javax.servlet.http.HttpServletRequest;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import java.util.UUID;

public class IdentityMindRequestGenerator {
  public static IdentityMindRequest getConsumerKYCRequest(X x, FObject obj) {
    if ( obj instanceof User ) {
      return getConsumerKYCRequest(x, (User) obj);
    }
    if ( obj instanceof BusinessUserJunction ) {
      return getConsumerKYCRequest(x, (BusinessUserJunction) obj);
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
      .setMan(String.valueOf(login.getLoginAttemptedFor()))
      .setTea(login.getEmail())
      .setIp(login.getIpAddress())
      .setBfn(prepareString(user.getFirstName()))
      .setBln(prepareString(user.getLastName()))
      .build();
  }

  public static IdentityMindRequest getMerchantKYCRequest(X x, Business business) {
    IdentityMindRequest request = new IdentityMindRequest.Builder(x)
      .setEntityType(business.getClass().getName())
      .setEntityId(business.getId())
      .setMan(String.valueOf(business.getId()))
      .setTid(getUUID(business))
      .setTea(business.getEmail())
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
    Phone phone = business.getBusinessPhone();
    if ( phone != null ) {
      request.setPhn(prepareString(phone.getNumber()));
    }
    request.setWebsite(prepareString(business.getWebsite()));
    return request;
  }

  public static IdentityMindRequest getFundingRequest(X x, CITransaction transaction) {
    Account sourceAccount = transaction.findSourceAccount(x);
    Account destinationAccount = transaction.findDestinationAccount(x);
    User sender = sourceAccount.findOwner(x);
    User receiver = destinationAccount.findOwner(x);
    IdentityMindRequest request = new IdentityMindRequest.Builder(x)
      .setEntityType(transaction.getClass().getName())
      .setEntityId(prepareString(transaction.getId()))
      .setIp(getRemoteAddr(x))
      .build();

    // Sender information
    request.setMan(String.valueOf(sender.getId()));
    request.setTea(sender.getEmail());
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
    Phone senderPhone = sender.getPhone();
    if (senderPhone != null) {
      request.setPhn(prepareString(senderPhone.getNumber()));
    }
    request.setPach(getBankAccountHash(x, (BankAccount) sourceAccount));

    // Receiver information
    request.setDman(String.valueOf(receiver.getId()));
    request.setDemail(receiver.getEmail());
    request.setSfn(prepareString(receiver.getFirstName()));
    request.setSln(prepareString(receiver.getLastName()));
    Address receiverAddress = sender.getAddress();
    if ( receiverAddress != null ) {
      request.setSsn(prepareString(receiverAddress.getStreetNumber(), receiverAddress.getStreetName(), receiverAddress.getSuite()));
      request.setSc(prepareString(receiverAddress.getCity()));
      request.setSco(prepareString(receiverAddress.getCountryId()));
      request.setSs(prepareString(receiverAddress.getRegionId()));
      request.setSz(prepareString(receiverAddress.getPostalCode()));
    }
    Phone receiverPhone = sender.getPhone();
    if (receiverPhone != null) {
      request.setDph(prepareString(receiverPhone.getNumber()));
    }
    request.setDphash(getDigitalAccountHash(x, (DigitalAccount) destinationAccount));

    return request;
  }

  public static String getUUID(FObject obj) {
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
      .setMan(String.valueOf(user.getId()))
      .setTid(getUUID(user))
      .setTea(user.getEmail())
      .setIp(getRemoteAddr(x))
      .setBfn(prepareString(user.getFirstName()))
      .setBln(prepareString(user.getLastName()))
      .setAccountCreationTime(formatDate(user.getCreated()))
      .build();

    Address address = user.getAddress();
    if ( address != null ) {
      request.setBsn(prepareString(address.getStreetNumber(), address.getStreetName(), address.getSuite()));
      request.setBc(prepareString(address.getCity()));
      request.setBco(prepareString(address.getCountryId()));
      request.setBs(prepareString(address.getRegionId()));
      request.setBz(prepareString(address.getPostalCode()));
    }
    Phone phone = user.getPhone();
    if (phone != null) {
      request.setPhn(prepareString(phone.getNumber()));
    }
    request.setTitle(prepareString(user.getJobTitle()));
    request.setDob(formatDate(user.getBirthday(), "yyyy-MM-dd"));
    return request;
  }

  private static IdentityMindRequest getConsumerKYCRequest(X x, BusinessUserJunction officer) {
    User user = officer.findTargetId(x);
    Business business = officer.findSourceId(x);

    IdentityMindRequest request = getConsumerKYCRequest(x, user);
    request.setMerchantAid(getUUID(business));
    return request;
  }

  private static IdentityMindRequest getConsumerKYCRequest(X x, BeneficialOwner owner) {
    IdentityMindRequest request = new IdentityMindRequest.Builder(x)
      .setEntityType(owner.getClass().getName())
      .setEntityId(owner.getId())
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
    request.setOwnership(owner.getOwnershipPercent() / 100.0);
    request.setTitle(prepareString(owner.getJobTitle()));
    request.setDob(formatDate(owner.getBirthday(), "yyyy-MM-dd"));
    return request;
  }

  private static User getRealUser(X x) {
    User agent = (User) x.get("agent");
    if ( agent != null ) {
      return agent;
    }
    return (User) x.get("user");
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
    HttpServletRequest request = x.get(HttpServletRequest.class);
    if ( request != null ) {
      return request.getRemoteAddr();
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

  private static String getBankAccountHash(X x, BankAccount bankAccount) {
    try {
      MessageDigest sha = MessageDigest.getInstance("SHA-1");
      IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");

      sha.update(bankAccount.getAccountNumber().getBytes());
      sha.update(identityMindService.getHashingSalt().getBytes());
      sha.update(bankAccount.getRoutingCode(x).getBytes());
      return SecurityUtil.ByteArrayToHexString(sha.digest());
    } catch ( Throwable t ) {
      ((Logger) x.get("logger")).warning(
        "Cannot generate hash for bank account: ", bankAccount.getId(), "." , t);
      return null;
    }
  }

  private static String getDigitalAccountHash(X x, DigitalAccount digitalAccount) {
    try {
      MessageDigest sha = MessageDigest.getInstance("SHA-1");
      IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");

      sha.update(identityMindService.getHashingSalt().getBytes());
      sha.update(String.valueOf(digitalAccount.getId()).getBytes());
      return SecurityUtil.ByteArrayToHexString(sha.digest());
    } catch ( Throwable t ) {
      ((Logger) x.get("logger")).warning(
        "Cannot generate hash for digital account: ", digitalAccount.getId(), "." , t);
      return null;
    }
  }
}
