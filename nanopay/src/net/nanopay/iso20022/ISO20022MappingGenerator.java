package net.nanopay.iso20022;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import foam.util.SafetyUtil;
import org.apache.commons.text.StringEscapeUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.io.FileWriter;
import java.io.Writer;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class ISO20022MappingGenerator {

  protected static List<Element> getChildElements(NodeList children) {
    return getChildElements(children, null);
  }

  protected static List<Element> getChildElements(NodeList children, String name) {
    return IntStream.range(0, children.getLength())
      .mapToObj(children::item)
      .filter(node -> node.getNodeType() == Node.ELEMENT_NODE)
      .filter(node -> SafetyUtil.isEmpty(name) || name.equals(node.getNodeName()))
      .map(node -> (Element) node)
      .collect(Collectors.toList());
  }

  protected static void processBusinessProcessCatalogue(Document doc, StringBuilder sb) {
    // parse businessProcessCatalogue
    Node catalogue = doc.getElementsByTagName("businessProcessCatalogue").item(0);
    NodeList catalogueChildNodes = catalogue.getChildNodes();

    List<Element> entries = getChildElements(catalogueChildNodes);
    Iterator entriesI = entries.iterator();

    while ( entriesI.hasNext() ) {
      Element entry = (Element) entriesI.next();

      NodeList entryChildNodes = entry.getChildNodes();
      List<Element> elements = getChildElements(entryChildNodes, "messageDefinition");
      if ( elements.size() == 0 ) {
        continue;
      }

      Iterator elementsI = elements.iterator();
      while ( elementsI.hasNext() ) {
        Element element = (Element) elementsI.next();
        String elementName = element.getAttribute("name");
        String elementDefinition = element.getAttribute("definition");
        String elementXmlTag = element.getAttribute("xmlTag");

        sb.append("\"")
          .append(StringEscapeUtils.escapeJson(elementName))
          .append("\":{\"documentation\":\"")
          .append(StringEscapeUtils.escapeJson(elementDefinition))
          .append("\",\"properties\":{");

        // parse message building blocks
        NodeList elementChildNodes = element.getChildNodes();
        List<Element> messageElements = getChildElements(elementChildNodes, "messageBuildingBlock");

        Iterator messageElementsI = messageElements.iterator();
        while ( messageElementsI.hasNext() ) {
          Element messageElement = (Element) messageElementsI.next();
          String messageElementName = messageElement.getAttribute("name");
          String messageElementDefinition = messageElement.getAttribute("definition");
          String messageElementXmlTag = messageElement.getAttribute("xmlTag");

          sb.append("\"")
            .append(StringEscapeUtils.escapeJson(messageElementXmlTag))
            .append("\":{")
            .append("\"name\":\"")
            .append(StringEscapeUtils.escapeJson(messageElementName))
            .append("\",")
            .append("\"documentation\":\"")
            .append(StringEscapeUtils.escapeJson(messageElementDefinition))
            .append("\"}");

          if ( messageElementsI.hasNext() ) {
            sb.append(",");
          }
        }

        sb.append("}}");
        if ( elementsI.hasNext() ) {
          sb.append(",");
        }
      }

      if ( entriesI.hasNext() ) {
        sb.append(",");
      }
    }
  }

  protected static void processDataDictionary(Document doc, StringBuilder sb) {
    // parse dataDictionary
    Node dictionary = doc.getElementsByTagName("dataDictionary").item(0);
    NodeList dictionaryChildNodes = dictionary.getChildNodes();

    // iterate through top level dictionary
    List<Element> entries = getChildElements(dictionaryChildNodes);
    Iterator entriesI = entries.iterator();

    while ( entriesI.hasNext() ) {
      Element entry = (Element) entriesI.next();
      String entryName = entry.getAttribute("name");
      String entryDefinition = entry.getAttribute("definition");

      sb.append("\"")
        .append(StringEscapeUtils.escapeJson(entryName))
        .append("\":{\"documentation\":\"")
        .append(StringEscapeUtils.escapeJson(entryDefinition))
        .append("\",\"properties\":{");

      NodeList elementChildNodes = entry.getChildNodes();
      List<Element> elements = getChildElements(elementChildNodes, "messageElement");

      Iterator elementsI = elements.iterator();
      while ( elementsI.hasNext() ) {
        Element element = (Element) elementsI.next();
        String elementName = element.getAttribute("name");
        String elementDefinition = element.getAttribute("definition");
        String elementXmlTag = element.getAttribute("xmlTag");

        sb.append("\"")
          .append(StringEscapeUtils.escapeJson(elementXmlTag))
          .append("\":{")
          .append("\"name\":\"")
          .append(StringEscapeUtils.escapeJson(elementName))
          .append("\",")
          .append("\"documentation\":\"")
          .append(StringEscapeUtils.escapeJson(elementDefinition))
          .append("\"}");

        if ( elementsI.hasNext() ) {
          sb.append(",");
        }
      }

      sb.append("}}");

      if ( entriesI.hasNext() ) {
        sb.append(",");
      }
    }
  }

  public static void main(String[] args) throws Exception {
    File file = new File("tools/xsd/iso20022/20180314_ISO20022_2013_eRepository.iso20022");
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    DocumentBuilder builder = factory.newDocumentBuilder();
    Document doc = builder.parse(file);

    // normalize document
    doc.getDocumentElement().normalize();

    StringBuilder sb = new StringBuilder().append("{");
    processBusinessProcessCatalogue(doc, sb);
    processDataDictionary(doc, sb);
    sb.append("}");


    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    JsonParser parser = new JsonParser();
    JsonElement json = parser.parse(sb.toString());

    try (Writer writer = new FileWriter("tools/xsd/iso20022/mapping.json")) {
      gson.toJson(json, writer);
      writer.flush();
    }
  }
}
