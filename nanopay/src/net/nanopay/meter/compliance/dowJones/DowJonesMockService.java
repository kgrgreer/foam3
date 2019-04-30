package net.nanopay.meter.compliance.dowJones;

import foam.core.*;
import net.nanopay.meter.compliance.dowJones.*;

public class DowJonesMockService
  extends ContextAwareSupport
  implements DowJonesRestInterface
  {

    public DowJonesResponseMsg serve(DowJonesRequestMsg msg, String requestInfo) {
      if ( ! requestInfo.equals("") ) {
        return baseSearchService(msg);
      } else {
        return null;
      }
    }
  
    public DowJonesResponseMsg baseSearchService(DowJonesRequestMsg msg) {
      DowJonesResponseMsg response = request(msg);
  
      if ( response.getHttpStatusCode() == 200 ) {
        response.setModelInfo(BaseSearchResponse.getOwnClassInfo());
      } else {
        response.setModelInfo(BaseSearchInvalidResponse.getOwnClassInfo());
      }
      return response;
    }

    private DowJonesResponseMsg request(DowJonesRequestMsg msg) {
      String mockXML = "<?xml version='1.0' encoding='UTF-8'?>" +
      "<search-results>" +
          "<head>" +
              "<api-version>1.5.4</api-version>" +
              "<backend-version>djrc-1.8.5</backend-version>" +
              "<total-hits>1</total-hits>" +
              "<hits-from>0</hits-from>" +
              "<hits-to>1</hits-to>" +
              "<truncated>false</truncated>" +
              "<cached-results-id>60d5b33f-6f4a-4e92-be63-88cfdc5fe2f8</cached-results-id>" +
          "</head>" +
          "<body>" +
              "<match peid='2910092' revision='2014-03-01 10:50:46.363' record-type='PERSON'>" +
                  "<score>1.0</score>" +
                  "<match-type linguistic-variation='false' non-linguistic-variation='false' structural-variation='false'>PRECISE</match-type>" +
                  "<payload>" +
                      "<risk-icons>" +
                          "<risk-icon>SI-LT</risk-icon>" +
                      "</risk-icons>" +
                      "<primary-name>Green, Blake J.</primary-name>" +
                      "<country-code>USA</country-code>" +
                      "<title />" +
                      "<subsidiary>false</subsidiary>" +
                      "<matched-name name-type='Primary Name'>Blake J. Green</matched-name>" +
                      "<dates-of-birth>" +
                          "<date-of-birth>" +
                              "<year>1993</year>" +
                          "</date-of-birth>" +
                          "<date-of-birth>" +
                              "<year>1992</year>" +
                          "</date-of-birth>" +
                      "</dates-of-birth>" +
                      "<countries>" +
                          "<country>" +
                              "<country-type>Citizenship</country-type>" +
                              "<country-code>USA</country-code>" +
                          "</country>" +
                          "<country>" +
                              "<country-type>Country of Reported Allegation</country-type>" +
                              "<country-code>USA</country-code>" +
                          "</country>" +
                          "<country>" +
                              "<country-type>Resident of</country-type>" +
                              "<country-code>USA</country-code>" +
                          "</country>" +
                      "</countries>" +
                      "<gender>MALE</gender>" +
                  "</payload>" +
              "</match>" +
          "</body>" +
      "</search-results>";
      DowJonesResponseMsg response = new DowJonesResponseMsg(getX(), mockXML);
      response.setHttpStatusCode(200);
      return response;
    }

  }