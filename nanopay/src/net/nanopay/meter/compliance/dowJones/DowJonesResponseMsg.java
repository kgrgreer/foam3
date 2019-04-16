package net.nanopay.meter.compliance.dowJones;

import foam.core.*;
import net.nanopay.meter.compliance.dowJones.*;
import net.nanopay.meter.compliance.dowJones.enums.*;

import java.io.*;
import java.lang.*;
import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.*;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

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
      BaseSearchResponse obj = new BaseSearchResponse();
      MetadataSearchResponse metadata = new MetadataSearchResponse();
      BaseSearchResponseBody responseBody = new BaseSearchResponseBody();
      List<Match> matchArrList = new ArrayList<Match>();

      try {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document document = db.parse(new ByteArrayInputStream(getXml().getBytes()));

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
          Node peid = matchElement.getElementsByTagName("peid").item(0);
          Node revision = matchElement.getElementsByTagName("revision").item(0);
          Node recordType = matchElement.getElementsByTagName("record-type").item(0);
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
          Node nameType = matchedName.getElementsByTagName("name-type").item(0);
          Node matchedDateOfBirth = payload.getElementsByTagName("matched-date-of-birth").item(0);
          Element datesOfBirth = (Element) payload.getElementsByTagName("dates-of-birth").item(0);
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
          Element countries = (Element) payload.getElementsByTagName("countries").item(0);
          NodeList countriesList = countries.getElementsByTagName("country");
          for ( int a = 0; a < countriesList.getLength(); a++ ) {
            Element countryElement = (Element) countriesList.item(a);
            Node countryType = countryElement.getElementsByTagName("country-type").item(0);
            Node countryCode2 = countryElement.getElementsByTagName("country-code").item(0); 
          }
          Node gender = payload.getElementsByTagName("gender").item(0);

          // set match data from body response
          Match match = new Match();
          MatchPayload matchPayload = new MatchPayload();

          MatchedName matchedNameObj = new MatchedName();
          matchedNameObj.setName(matchedName != null ? matchedName.getFirstChild().getNodeValue() : "");
          matchedNameObj.setNameType(nameType != null ? nameType.getFirstChild().getNodeValue() : "");

          String[] riskIconsArray = new String[ riskIconsArrList.size() ];
          matchPayload.setRiskIcons(riskIconsArrList.toArray(riskIconsArray));
          matchPayload.setPrimaryName(primaryName != null ? primaryName.getFirstChild().getNodeValue() : "");
          matchPayload.setCountryCode(countryCode != null ? countryCode.getFirstChild().getNodeValue() : "");
          matchPayload.setTitle(title != null ? title.getNodeValue() : "");
          matchPayload.setSubsidiary(Boolean.valueOf(subsidiary.getNodeValue()));
          matchPayload.setMatchedName(matchedNameObj);
          matchPayload.setMatchedDateOfBirth(matchedDateOfBirth != null ? matchedDateOfBirth.getFirstChild().getNodeValue() : "");

          String[] datesOfBirthArray = new String [ datesOfBirthArrList.size() ];
          matchPayload.setDatesOfBirth(datesOfBirthArrList.toArray(datesOfBirthArray));

          // TODO: Finish adding country data to array list
          String[] countriesArray = new String[ countryArrList.size() ];
          matchPayload.setCountries(countryArrList.toArray(countriesArray));
          matchPayload.setGender(gender != null ? gender.getFirstChild().getNodeValue() : ""); 

          match.setScore(score.getNodeValue());
          match.setMatchType(matchType != null ? matchType.getFirstChild().getNodeValue() : "");
          match.setPayload(matchPayload);
          match.setPeid(peid != null ? peid.getFirstChild().getNodeValue() : "");
          match.setRevision(revision != null ? revision.getFirstChild().getNodeValue() : "");
          match.setRecordType(recordType != null ? recordType.getFirstChild().getNodeValue() : "");

          matchArrList.add(match);
        }
        // set metadata from head response 
        metadata.setApiVersion(apiVersion.getNodeValue());
        metadata.setBackendVersion(backendVersion.getNodeValue());
        metadata.setTotalHits(Integer.parseInt(totalHits.getNodeValue()));
        metadata.setHitsFrom(Integer.parseInt(hitsFrom.getNodeValue()));
        metadata.setHitsTo(Integer.parseInt(hitsTo.getNodeValue()));
        metadata.setTruncated(Boolean.valueOf(truncated.getNodeValue()));
        metadata.setCachedResultsId(cachedResultsId.getNodeValue());

        Match[] matchArray = new Match[ matchArrList.size() ];
        responseBody.setMatchs(matchArrList.toArray(matchArray));

        // set metadata and response data
        obj.setMetadata(metadata);
        obj.setResponseBody(responseBody);

      } catch ( ParserConfigurationException | SAXException | IOException e ) {
        e.printStackTrace();
        System.out.println(e.getMessage());
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
