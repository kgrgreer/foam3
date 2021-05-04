package net.nanopay.meter.compliance.dowJones;

import foam.core.X;
import foam.nanos.logger.Logger;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class DowJonesResponseMsg
  extends DowJonesMsg
{
  private int httpStatusCode_;
  private boolean isModelSet_ = false;

  public DowJonesResponseMsg() {
    this(null);
  }

  public DowJonesResponseMsg(X x) {
    this(x, null);
  }

  public DowJonesResponseMsg(X x, String xml) {
    setXml(xml);
    setX(x);
  }

  public void setHttpStatusCode(int httpStatusCode) {
    httpStatusCode_ = httpStatusCode;
  }
  public int getHttpStatusCode() {
    return httpStatusCode_;
  }

  @Override
  public void setModel(DowJonesCall model) {
    isModelSet_ = true;
    model_ = model;
  }

  /*
  * Method to fetch the XML response from Dow Jones and parse the data into the DowJonesResponse model
  */
  @Override
  public DowJonesCall getModel() {
    if ( isModelSet_ == true ) {
      return model_;
    } else {
      if ( getX() == null ) {
        throw new RuntimeException("No Context Found");
      }
      if ( modelInfo_ == null ) {
        throw new RuntimeException("No Model ClassInfo Found");
      }
      if ( getXml() == null ) {
        throw new RuntimeException("No XML Found");
      }
      DowJonesResponse obj = new DowJonesResponse();
      MetadataSearchResponse metadata = new MetadataSearchResponse();
      DowJonesResponseBody responseBody = new DowJonesResponseBody();
      List<Match> matchArrList = new ArrayList<Match>();

      try {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document document = db.parse(new InputSource(new ByteArrayInputStream(getXml().getBytes("UTF-8"))));

        Element head = (Element) document.getElementsByTagName("head").item(0);
        Element body = (Element) document.getElementsByTagName("body").item(0);

        // head response data
        Node apiVersion = head.getElementsByTagName("api-version").item(0).getFirstChild();
        Node backendVersion = head.getElementsByTagName("backend-version").item(0).getFirstChild();
        Node totalHits = head.getElementsByTagName("total-hits").item(0).getFirstChild();
        Node hitsFrom = head.getElementsByTagName("hits-from").item(0).getFirstChild();
        Node hitsTo = head.getElementsByTagName("hits-to").item(0).getFirstChild();
        Node truncated = head.getElementsByTagName("truncated").item(0).getFirstChild();
        Node cachedResultsId = head.getElementsByTagName("cached-results-id").item(0).getFirstChild();

        // body response data
        NodeList matchList = body.getElementsByTagName("match");

        for ( int i = 0; i < matchList.getLength(); i++ ) {
          List<String> riskIconsArrList = new ArrayList<String>();
          List<String> datesOfBirthArrList = new ArrayList<String>();
          List<String> countryArrList = new ArrayList<String>();

          Element matchElement = (Element) matchList.item(i);
          String peid = matchElement.getAttribute("peid");
          String revision = matchElement.getAttribute("revision");
          String recordType = matchElement.getAttribute("record-type");
          Node score = matchElement.getElementsByTagName("score").item(0);
          Node matchType = matchElement.getElementsByTagName("match-type").item(0);
          Element payload = (Element) matchElement.getElementsByTagName("payload").item(0);

          Element riskIcons = (Element) payload.getElementsByTagName("risk-icons").item(0);
          NodeList riskIconList = riskIcons.getElementsByTagName("risk-icon");
          for ( int e = 0; e < riskIconList.getLength(); e++ ) {
            Element riskIconElement = (Element) riskIconList.item(e);
            Node riskIcon = riskIconElement.getFirstChild();
            riskIconsArrList.add(riskIcon.getNodeValue());
          }

          Node primaryName = payload.getElementsByTagName("primary-name").item(0);
          Node countryCode = payload.getElementsByTagName("country-code").item(0);
          Node title = payload.getElementsByTagName("title").item(0);
          Node subsidiary = payload.getElementsByTagName("subsidiary").item(0).getFirstChild();
          Element matchedName = (Element) payload.getElementsByTagName("matched-name").item(0);
          String nameType = matchedName != null ? matchedName.getAttribute("name-type") : "";
          Node matchedDateOfBirth = payload.getElementsByTagName("matched-date-of-birth").item(0);

          Element datesOfBirth = (Element) payload.getElementsByTagName("dates-of-birth").item(0);
          if (datesOfBirth != null) {
            NodeList dateOfBirthList = datesOfBirth.getElementsByTagName("date-of-birth");
            for ( int o = 0; o < dateOfBirthList.getLength(); o++ ) {
              Element dateOfBirthElement = (Element) dateOfBirthList.item(o);
              Node birthMonth = dateOfBirthElement.getElementsByTagName("month").item(0);
              Node birthYear = dateOfBirthElement.getElementsByTagName("year").item(0);
              Node birthDate = dateOfBirthElement.getElementsByTagName("day").item(0);
              StringBuilder formattedDateBuilder = new StringBuilder();
              if ( birthMonth != null ) {
                formattedDateBuilder.append("MM:" + birthMonth.getFirstChild().getNodeValue());
              }
              if ( birthDate != null ) {
                formattedDateBuilder.append("DD:" + birthDate.getFirstChild().getNodeValue());
              }
              if ( birthYear != null ) {
                formattedDateBuilder.append("YY:" + birthYear.getFirstChild().getNodeValue());
              }
              datesOfBirthArrList.add(formattedDateBuilder.toString());
            }
          }

          Element countries = (Element) payload.getElementsByTagName("countries").item(0);
          NodeList countriesList = countries.getElementsByTagName("country");
          for ( int a = 0; a < countriesList.getLength(); a++ ) {
            Element countryElement = (Element) countriesList.item(a);
            Node countryType = countryElement.getElementsByTagName("country-type").item(0);
            Node countryCode2 = countryElement.getElementsByTagName("country-code").item(0);
            StringBuilder formattedCountryBuilder = new StringBuilder();
            if ( countryType != null ) {
              formattedCountryBuilder.append("Country Type: " + countryType.getFirstChild().getNodeValue());
            }
            if ( countryCode2 != null ) {
              formattedCountryBuilder.append(", Country Code: " + countryCode2.getFirstChild().getNodeValue());
            }
            countryArrList.add(formattedCountryBuilder.toString());
          }

          Node gender = payload.getElementsByTagName("gender").item(0);

          // set match data from body response
          Match match = new Match();
          MatchPayload matchPayload = new MatchPayload();

          MatchedName matchedNameObj = new MatchedName();
          matchedNameObj.setName(matchedName != null ? matchedName.getFirstChild().getNodeValue() : "");
          matchedNameObj.setNameType(nameType);

          String[] riskIconsArray = new String[ riskIconsArrList.size() ];
          matchPayload.setRiskIcons(riskIconsArrList.toArray(riskIconsArray));
          matchPayload.setPrimaryName(primaryName != null ? primaryName.getFirstChild().getNodeValue() : "");
          matchPayload.setCountryCode(countryCode != null ? countryCode.getFirstChild().getNodeValue() : "");
          matchPayload.setTitle((title != null && title.getFirstChild() != null) ? title.getFirstChild().getNodeValue() : "");
          matchPayload.setSubsidiary(Boolean.valueOf(subsidiary.getNodeValue()));
          matchPayload.setMatchedName(matchedNameObj);
          matchPayload.setMatchedDateOfBirth((matchedDateOfBirth != null && matchedDateOfBirth.getFirstChild() != null) ? matchedDateOfBirth.getFirstChild().getNodeValue() : "");

          String[] datesOfBirthArray = new String [ datesOfBirthArrList.size() ];
          matchPayload.setDatesOfBirth(datesOfBirthArrList.toArray(datesOfBirthArray));

          String[] countriesArray = new String[ countryArrList.size() ];
          matchPayload.setCountries(countryArrList.toArray(countriesArray));
          matchPayload.setGender(gender != null ? gender.getFirstChild().getNodeValue() : "");

          match.setScore(score != null ? score.getFirstChild().getNodeValue() : "");
          match.setMatchType(matchType != null ? matchType.getFirstChild().getNodeValue() : "");
          match.setPayload(matchPayload);
          match.setPeid(peid);
          match.setRevision(revision);
          match.setRecordType(recordType);

          matchArrList.add(match);
        }
        // set metadata from head response
        obj.setTotalMatches(Integer.parseInt(totalHits.getNodeValue()));
        metadata.setApiVersion(apiVersion.getNodeValue());
        metadata.setBackendVersion(backendVersion.getNodeValue());
        metadata.setTotalHits(Integer.parseInt(totalHits.getNodeValue()));
        metadata.setHitsFrom(Integer.parseInt(hitsFrom.getNodeValue()));
        metadata.setHitsTo(Integer.parseInt(hitsTo.getNodeValue()));
        metadata.setTruncated(Boolean.valueOf(truncated.getNodeValue()));
        metadata.setCachedResultsId(cachedResultsId.getNodeValue());

        Match[] matchArray = new Match[ matchArrList.size() ];
        responseBody.setMatches(matchArrList.toArray(matchArray));

        // set metadata and response data
        obj.setMetadata(metadata);
        obj.setResponseBody(responseBody);

      } catch ( ParserConfigurationException | SAXException | IOException e ) {
        Logger logger = (Logger) getX().get("logger");
        logger.log("Error parsing DowJonesReponse",e);
        throw new RuntimeException("Could not parse xml string");
      }

      if ( obj == null ) {
        throw new RuntimeException("XML Parser Error: " + getXml());
      }
      setModel((DowJonesCall) obj);
      return (DowJonesCall) obj;
    }
  }

  @Override
  public void setXml(String xml) {
    xml_ = xml;
    isModelSet_ = false;
  }
}
