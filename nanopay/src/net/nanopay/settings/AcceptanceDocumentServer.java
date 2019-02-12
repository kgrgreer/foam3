package net.nanopay.settings;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.NanoService;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import foam.util.SafetyUtil;

public class AcceptanceDocumentServer extends ContextAwareSupport implements AcceptanceDocumentService, NanoService {

  private DAO acceptanceDocumentDAO_;

  @Override
  public void start() {
    this.acceptanceDocumentDAO_ = (DAO) getX().get("acceptanceDocumentDAO");
  }

  public AcceptanceDocument getAcceptanceDocument(String name, String version) throws RuntimeException {
    AcceptanceDocument acceptanceDocument = null;
    if ( SafetyUtil.isEmpty(version) ) {
      acceptanceDocument = (AcceptanceDocument) acceptanceDocumentDAO_
          .where(
              EQ(AcceptanceDocument.NAME, name)
          ).orderBy(new foam.mlang.order.Desc(AcceptanceDocument.ISSUED_DATE))
          .limit(1);

    } else {
      acceptanceDocument = (AcceptanceDocument) acceptanceDocumentDAO_.find(AND(EQ(AcceptanceDocument.NAME, name), EQ(AcceptanceDocument.VERSION, version)));
    }
    return acceptanceDocument;
  }

  public AcceptanceDocument getTransactionAcceptanceDocument(String name, String version, String transactionType) throws RuntimeException {
    AcceptanceDocument acceptanceDocument = null;
    if ( SafetyUtil.isEmpty(version) ) {
      acceptanceDocument = (AcceptanceDocument) acceptanceDocumentDAO_
          .where(
              AND(
                  EQ(AcceptanceDocument.NAME, name), 
                  EQ(AcceptanceDocument.TRANSACTION_TYPE, transactionType))
          ).orderBy(new foam.mlang.order.Desc(AcceptanceDocument.ISSUED_DATE))
          .limit(1);

    } else {
      acceptanceDocument = (AcceptanceDocument) acceptanceDocumentDAO_.find(
          AND(
              EQ(AcceptanceDocument.NAME, name), 
              EQ(AcceptanceDocument.VERSION, version), 
              EQ(AcceptanceDocument.TRANSACTION_TYPE, transactionType)
          ));
    }
    return acceptanceDocument;
  }

}
