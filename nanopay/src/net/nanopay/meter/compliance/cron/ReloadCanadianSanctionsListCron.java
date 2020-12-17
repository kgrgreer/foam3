package net.nanopay.meter.compliance.cron;

import com.google.common.hash.Hashing;
import com.google.common.hash.HashingInputStream;
import foam.core.ClassInfo;
import foam.core.ContextAgent;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import net.nanopay.meter.compliance.canadianSanction.Record;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClients;

import javax.xml.XMLConstants;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * ReloadCanadianSanctionsListCron reads data from the Consolidated Canadian
 * Autonomous Sanctions List on the Government of Canada's website and load
 * it into canadianSanctionDAO.
 *
 * Default URL of the sanctions list data is
 * https://www.international.gc.ca/world-monde/assets/office_docs/international_relations-relations_internationales/sanctions/sema-lmes.xml
 * but it is customizable as needed by providing a url string to its
 * constructor.
 *
 * The content of data (XML file) should be enclosed with "data-set" tag and
 * each sanction record is encoded within "record" tag like below:
 *
 *     <data-set xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 *       <record>
 *          <Country>Burma</Country>
 *         ...
 *       </record>
 *       <record>
 *         ...
 *       </record>
 *
 *       ...
 *
 *     </data-set>
 *
 * In case the data doesn't match the expected format it will throw
 * XMLStreamException and the error will be recorded in the logger.
 *
 */
public class ReloadCanadianSanctionsListCron implements ContextAgent {
  private String url;
  private DAO dao;
  private Logger logger;

  public ReloadCanadianSanctionsListCron() {
    this("https://www.international.gc.ca/world-monde/assets/office_docs/international_relations-relations_internationales/sanctions/sema-lmes.xml");
  }

  public ReloadCanadianSanctionsListCron(String url) {
    this.url = url;
  }

  @Override
  public void execute(X x) {
    dao = (DAO) x.get("canadianSanctionDAO");
    logger = (Logger) x.get("logger");

    HttpClient httpClient = HttpClients.createDefault();
    HttpGet get = new HttpGet(url);

    XMLStreamReader reader = null;
    try {
      HttpResponse response = httpClient.execute(get);
      try (InputStream in = response.getEntity().getContent()) {
        try (HashingInputStream his = new HashingInputStream(Hashing.goodFastHash(128), in)) {
          String checksum = his.hash().toString();

          //if ( ! Record.datasetChecksum.equals(checksum) ) {
          XMLInputFactory inputFactory = XMLInputFactory.newInstance();
          inputFactory.setProperty(XMLInputFactory.SUPPORT_DTD, false);

          reader = inputFactory.createXMLStreamReader(
            new InputStreamReader(in));

          reloadDataset(x, reader);
        }
      }
        // This value removed because it was a mutable checksum, replace with
        // something better
        //Record.datasetChecksum = checksum;
      //}
    } catch (IOException | XMLStreamException ex) {
      logger.error("Error reloading Canadian sanctions list", ex);
    } finally {
      if ( reader != null ) {
        try {
          reader.close();
        } catch (XMLStreamException e) { /* Ignore */ }
      }
    }
  }

  private void reloadDataset(X x, XMLStreamReader reader) throws XMLStreamException {
    dao.removeAll();
    while (reader.hasNext()) {
      int eventType = reader.next();
      switch (eventType) {
        case XMLStreamReader.START_ELEMENT:
          if (reader.getLocalName().equals("data-set")) {
            putRecords(x, reader);
            return;
          }
          break;
        case XMLStreamReader.END_ELEMENT:
          break;
      }
    }
    throw new XMLStreamException("Premature end of file. The XML content might not match the expected format.");
  }

  private void putRecords(X x, XMLStreamReader reader) throws XMLStreamException {
    while (reader.hasNext()) {
      int eventType = reader.next();
      switch (eventType) {
        case XMLStreamReader.START_ELEMENT:
          if (reader.getLocalName().equals("record")) {
            dao.put(createObj(x, reader));
          }
          break;
        case XMLStreamReader.END_ELEMENT:
          return;
      }
    }
    throw new XMLStreamException("Premature end of file. The XML content might not match the expected format.");
  }

  private Record createObj(X x, XMLStreamReader reader) throws XMLStreamException {
    Record obj = new Record();
    PropertyInfo prop = null;
    while ( reader.hasNext() ) {
      int eventType = reader.next();
      switch ( eventType ) {
        case XMLStreamReader.START_ELEMENT:
          ClassInfo cInfo = obj.getClassInfo();
          prop = (PropertyInfo) cInfo.getAxiomByName(reader.getLocalName());
          if ( prop != null ) {
            prop.set(obj, prop.fromXML(x, reader));
            prop = null;
          }
          break;
        case XMLStreamReader.END_ELEMENT:
          if ( reader.getLocalName().equals("record") ) {
            return obj;
          }
          break;
      }
    }
    throw new XMLStreamException("Premature end of file. The XML content might not match the expected format.");
  }
}
