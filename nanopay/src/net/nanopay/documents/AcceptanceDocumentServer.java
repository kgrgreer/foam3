package net.nanopay.documents;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.dao.ArraySink;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import foam.util.SafetyUtil;
import javax.servlet.http.HttpServletRequest;

public class AcceptanceDocumentServer extends ContextAwareSupport implements AcceptanceDocumentService, NanoService {

  private DAO acceptanceDocumentDAO_;
  private DAO userAcceptanceDocumentDAO_;

  @Override
  public void start() {
    this.acceptanceDocumentDAO_ = (DAO) getX().get("acceptanceDocumentDAO");
    this.userAcceptanceDocumentDAO_ = (DAO) getX().get("userAcceptanceDocumentDAO");
  }

  public AcceptanceDocument getAcceptanceDocument(X x, String name, String version) throws RuntimeException {
    acceptanceDocumentDAO_.inX(x);
    AcceptanceDocument acceptanceDocument = null;
    if ( SafetyUtil.isEmpty(version) ) {
      ArraySink listSink = (ArraySink) acceptanceDocumentDAO_
          .where(
            AND(
              EQ(AcceptanceDocument.NAME, name),
              EQ(AcceptanceDocument.ENABLED, true)
              )
          ).orderBy(new foam.mlang.order.Desc(AcceptanceDocument.ISSUED_DATE))
          .limit(1).select(new ArraySink());

          if ( listSink.getArray().size() > 0 ) acceptanceDocument = (AcceptanceDocument) listSink.getArray().get(0);

    } else {
      acceptanceDocument = (AcceptanceDocument) acceptanceDocumentDAO_.find(
        AND(
          EQ(AcceptanceDocument.NAME, name),
          EQ(AcceptanceDocument.VERSION, version),
          EQ(AcceptanceDocument.ENABLED, true)
        ));
    }
    return acceptanceDocument;
  }

  public AcceptanceDocument getTransactionAcceptanceDocument(X x, String name, String version, String transactionType) throws RuntimeException {
    AcceptanceDocument acceptanceDocument = null;
    acceptanceDocumentDAO_.inX(x);
    if ( SafetyUtil.isEmpty(version) ) {
      ArraySink listSink = (ArraySink) acceptanceDocumentDAO_
          .where(
              AND(
                  EQ(AcceptanceDocument.NAME, name),
                  EQ(AcceptanceDocument.TRANSACTION_TYPE, transactionType),
                  EQ(AcceptanceDocument.ENABLED, true)
                )
          ).orderBy(new foam.mlang.order.Desc(AcceptanceDocument.ISSUED_DATE))
          .limit(1).select(new ArraySink());

          if ( listSink.getArray().size() > 0 ) acceptanceDocument = (AcceptanceDocument) listSink.getArray().get(0);

    } else {
      acceptanceDocument = (AcceptanceDocument) acceptanceDocumentDAO_.find(
          AND(
              EQ(AcceptanceDocument.NAME, name),
              EQ(AcceptanceDocument.VERSION, version),
              EQ(AcceptanceDocument.TRANSACTION_TYPE, transactionType),
              EQ(AcceptanceDocument.ENABLED, true)
          ));
    }
    return acceptanceDocument;
  }

  public AcceptanceDocument getTransactionRegionDocuments(X x, String transactionType, AcceptanceDocumentType documentType, String country, String state) throws RuntimeException {
    AcceptanceDocument acceptanceDocument = null;
    acceptanceDocumentDAO_.inX(x);
    ArraySink listSink = (ArraySink) acceptanceDocumentDAO_
      .where(
          AND(
              EQ(AcceptanceDocument.TRANSACTION_TYPE, transactionType),
              EQ(AcceptanceDocument.DOCUMENT_TYPE, documentType),
              EQ(AcceptanceDocument.COUNTRY, country),
              EQ(AcceptanceDocument.STATE, state),
              EQ(AcceptanceDocument.ENABLED, true)
            )
      ).select(new ArraySink());

    if ( listSink.getArray().size() > 0 ) {
      acceptanceDocument = (AcceptanceDocument) listSink.getArray().get(0);
    }

    return acceptanceDocument;
  }

  public void updateUserAcceptanceDocument(X x, long user, long business, long acceptanceDocument, boolean accepted) {
    userAcceptanceDocumentDAO_.inX(x);
    HttpServletRequest request = x.get(HttpServletRequest.class);
    String ipAddress = request.getRemoteAddr();
    UserAcceptanceDocument acceptedDocument = (UserAcceptanceDocument) userAcceptanceDocumentDAO_.find(
      AND(
        EQ(UserAcceptanceDocument.USER, user),
        EQ(UserAcceptanceDocument.ACCEPTED_DOCUMENT, acceptanceDocument)
        )
      );

    if ( null == acceptedDocument ) {
      if(business != -1)
        acceptedDocument = new UserAcceptanceDocument.Builder(x).setUser(user).setCreatedBy(business).setAcceptedDocument(acceptanceDocument).build();
      else
        acceptedDocument = new UserAcceptanceDocument.Builder(x).setUser(user).setAcceptedDocument(acceptanceDocument).build();
    }

    acceptedDocument = (UserAcceptanceDocument) acceptedDocument.fclone();
    acceptedDocument.setAccepted(accepted);
    acceptedDocument.setIpAddress(request.getRemoteAddr());
    userAcceptanceDocumentDAO_.put_(x, acceptedDocument);
  }

}
