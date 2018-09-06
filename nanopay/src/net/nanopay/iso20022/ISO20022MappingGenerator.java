package net.nanopay.iso20022;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
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

  public static void main(String[] args) throws Exception {
    File file = new File("tools/xsd/iso20022/20180314_ISO20022_2013_eRepository.iso20022");
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    DocumentBuilder builder = factory.newDocumentBuilder();
    Document doc = builder.parse(file);

    // normalize document
    doc.getDocumentElement().normalize();

    Node dictionary = doc.getElementsByTagName("dataDictionary").item(0);
    NodeList dictionaryChildNodes = dictionary.getChildNodes();

    // get child elements
    List<Element> entries = IntStream.range(0, dictionaryChildNodes.getLength())
      .mapToObj(dictionaryChildNodes::item)
      .filter(node -> node.getNodeType() == Node.ELEMENT_NODE)
      .map(node -> (Element) node)
      .collect(Collectors.toList());

    // iterate through top level dictionary
    StringBuilder sb = new StringBuilder().append("{");

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
      List<Element> elements = IntStream.range(0, elementChildNodes.getLength())
        .mapToObj(elementChildNodes::item)
        .filter(node -> node.getNodeType() == Node.ELEMENT_NODE)
        .filter(node -> "messageElement".equals(node.getNodeName()))
        .map(node -> (Element) node)
        .collect(Collectors.toList());


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
