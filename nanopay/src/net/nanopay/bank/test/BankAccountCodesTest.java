package net.nanopay.bank.test;

import foam.nanos.auth.User;
import foam.core.X;
import foam.dao.DAO;
import static foam.mlang.MLang.*;

import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.USBankAccount;
import net.nanopay.bank.CABankAccount;

public class BankAccountCodesTest
  extends foam.nanos.test.Test {

  public void runTest(X x) {
    User u = setupUser(x);
    DAO d = (DAO) x.get("localAccountDAO");
    String branchId = "12345";
    String accountId = "99999";
    BankAccount b = new USBankAccount.Builder(x).setBranchId(branchId).setAccountNumber(accountId).setOwner(u.getId()).build();
    b = (BankAccount) d.put(b);
    test(b.getInstitutionNumber().equals(""), "Invalid InstitutionNumber");
    test(b.getRoutingCode(x).equals(branchId), "Invalid RoutingCode");
    //test(b.getIban().equals(accountId), "Invalid IBAN/Account");

    String institutionNumber = "002";
    branchId = "54321";
    accountId = "99999";
    b = new CABankAccount.Builder(x).setInstitutionNumber(institutionNumber).setBranchId(branchId).setAccountNumber(accountId).setOwner(u.getId()).setStatus(BankAccountStatus.VERIFIED).build();
    b = (BankAccount) d.put(b);
    test(b.getBankCode(x).equals(institutionNumber), "Invalid InstitutionNumber");
    test(b.getRoutingCode(x).equals("0" + branchId + b.getInstitutionNumber()), "Invalid RoutingCode");
    //test(b.getIban().equals(accountId), "Invalid IBAN/Account");
  }

  public User setupUser(X x) {
    User user = (User) ((DAO)x.get("localUserDAO")).find(EQ(User.EMAIL,"bankaccountcodes@nanopay.net" ));
    if ( user == null ) {
      user = new User();
      user.setEmail("bankaccountcodes@nanopay.net");
      user.setFirstName("Francis");
      user.setLastName("Filth");
    }
    user = (User) user.fclone();
    user.setEmailVerified(true);
    user = (User) (((DAO) x.get("localUserDAO")).put_(x, user));
    return user;
  }
}
