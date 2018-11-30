package net.nanopay.fx.interac;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ProxyDAO;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
//import net.nanopay.fx.interac.model.PayoutOptions;
import net.nanopay.fx.interac.model.RequiredUserFields;
import net.nanopay.fx.interac.model.RequiredIdentificationFields;
import net.nanopay.fx.interac.model.RequiredDocumentFields;

public class ValidatePayoutOptionsDAO
  extends ProxyDAO
{

  public ValidatePayoutOptionsDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  // @Override
  // public FObject put_(X x, FObject obj) throws RuntimeException {
  //   PayoutOptions payoutOptions = (PayoutOptions) obj;
  //   RequiredUserFields[] requiredUserFieldsList = (RequiredUserFields[]) payoutOptions.getRequiredUserFields();
  //   for ( RequiredUserFields requiredUserFields : requiredUserFieldsList) {
  //     RequiredIdentificationFields requiredIdentificationFields = (RequiredIdentificationFields) requiredUserFields.getIdentification();
  //     RequiredDocumentFields requiredDocs = (RequiredDocumentFields) requiredIdentificationFields.getIdentificationDocuments();
  //     if ( requiredDocs.getRequired() ) {
  //       if ( ! requiredDocs.getAlienRegistrationNumber() &&
  //            ! requiredDocs.getPassportNumber() &&
  //            ! requiredDocs.getCustomerIdentificationNumber() &&
  //            ! requiredDocs.getDriversLicenseNumber() &&
  //            ! requiredDocs.getEmployeeIdentificationNumber() &&
  //            ! requiredDocs.getNationalIdentityNumber() &&
  //            ! requiredDocs.getSocialSecurityNumber() &&
  //            ! requiredDocs.getTaxIdentificationNumber() ) {
  //         throw new RuntimeException("At least one document type required.");
  //       }
  //     }
  //   }

  //   return super.put_(x, obj);
  // }
}
