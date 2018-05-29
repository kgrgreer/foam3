package net.nanopay.invoice.xero;

import com.xero.api.XeroClient;

import foam.core.X;
import foam.nanos.http.WebAgent;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.PrintWriter;

public class XeroComplete
  implements WebAgent {

  XeroClient client_;

  public void execute( X x ) {

    try {
      HttpServletRequest req = ( HttpServletRequest ) x.get( HttpServletRequest.class );
      HttpServletResponse resp = ( HttpServletResponse ) x.get( HttpServletResponse.class );
      PrintWriter out = ( PrintWriter ) x.get( PrintWriter.class );
      TokenStorage store = ( TokenStorage ) x.get( "xeroStorage" );
      XeroConfig config = new XeroConfig();
      client_ = new XeroClient( config);

      client_.setOAuthToken( store.getToken(), store.getTokenSecret() );
    /*for (int i=0; i<client_.getContacts().size();i++)
      {
        if (client_.getContacts().get(i).getContactStatus() == ContactStatus.ARCHIVED.value()){
          continue;
        }
        int j;
        for(j=0; j<business.getBusinessContact().size(); j++)
        {
          if(client_.getContacts().get(i).getContactID() == business.getBusinessContact().get(j).getXeroId()){
            break;
          }
          if(client_.getContacts().get(i).getName() == business.getBusinessContact().get(j).getName()){
            business.getBusinessContact().get(j).setXeroID( client_.getContacts().get(i).getContactID());
            business.getBusinessContact().get(j)= mergeContactInfo(business.getBusinessContact().get(j),client_.getContacts().get(i));
            break;
          }
        }
        if (j>=business.getBusinessContact().size()) {
          business.getBusinessContact().add(addBusinessContact(client_.getContacts().get(i)));
        }
      }


      for (int i=0; i<client_.getAccounts().size();i++)
      {
        if (client_.getAccounts().get(i).getBankAccountType() != BankAccountType.BANK){
          continue;
        }
        int j;
        for(j=0; j<business.getBankAccount().size(); j++)
        {
          if(client_.getAccounts().get(i).getAccountID() == business.getBankAccount.get(j).getXeroId()){
            break;
          }
          if(client_.getAccounts().get(i).getName() == business.getBankAccount().get(j).setAccountName()){
            String temp = ""+business.getBankAccount().get(j).getBankNumber()+business.getBankAccount().get(j).getTransitNumber()+business.getBankAccount().get(j).getAccountNumber();
            if (temp.compareTo(client_.getAccounts().get(i).getBankAccountNumber())==0)
              business.getBankAccount().get(j).setXeroID( client_.getAccounts().get(i).getAccountID());
            break;
          }
        }
        if (j>=business.getBusinessContact().size()) {
          business.getBankAccount().add(addBankAccount(business.getAddress().get(0).getCountryId(),client_.getAccounts().get(i)));
        }
      }
      //business.businessContact()*/
    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }
 /* public Business mergeContactInfo (Business contact , Contact xero)
  {
    if (contact.getEmail() == null){contact.setEmail(xero.getEmailAddress());}
    return contact;
  }
  public Business addBusinessContact(Contact xero)
  {
    Business contact = new Business();
    contact.setXeroId(xero.getContactID());
    contact.setName(xero.getName());
    contact.setEmail(xero.getEmailAddress());
    return contact;
  }
  public BankAccount addBankAccount(String code, Account xero)
  {
    BankAccount account = new BankAccount();
    account.setXeroId(xero.getAccountID());
    account.setAccountName(xero.getName());
    account.setCurrencyCode(xero.getCurrencyCode().value());
    if ("US".equals(code) && xero.getCurrencyCode()== CurrencyCode.USD){
      account.setBankNumber("0");
      account.setTransitNumber(""+xero.getBankAccountNumber().substring(0,9));
      account.setAccountNumber(""+xero.getBankAccountNumber().substring(10));
      return account;
    }
    account.setBankNumber(""+xero.getBankAccountNumber().substring(0,4));
    account.setTransitNumber(""+xero.getBankAccountNumber().substring(5,10));
    account.setAccountNumber(""+xero.getBankAccountNumber().substring(11));
    return account;
  }*/
}