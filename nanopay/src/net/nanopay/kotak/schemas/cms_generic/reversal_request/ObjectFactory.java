
package net.nanopay.kotak.schemas.cms_generic.reversal_request;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the net.nanopay.kotak.schemas.cms_generic.reversal_request package.
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {

    private final static QName _ClientCode_QNAME = new QName("http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", "Client_Code");
    private final static QName _DatePost_QNAME = new QName("http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", "Date_Post");
    private final static QName _MsgId_QNAME = new QName("http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", "Msg_Id");
    private final static QName _ReqId_QNAME = new QName("http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", "Req_Id");
    private final static QName _MsgSrc_QNAME = new QName("http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", "Msg_Src");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: net.nanopay.kotak.schemas.cms_generic.reversal_request
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link Details }
     * 
     */
    public Details createDetails() {
        return new Details();
    }

    /**
     * Create an instance of {@link Header }
     * 
     */
    public Header createHeader() {
        return new Header();
    }

    /**
     * Create an instance of {@link Reversal }
     * 
     */
    public Reversal createReversal() {
        return new Reversal();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     * 
     * @param value
     *     Java instance representing xml element's value.
     * @return
     *     the new instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     */
    @XmlElementDecl(namespace = "http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", name = "Client_Code")
    public JAXBElement<String> createClientCode(String value) {
        return new JAXBElement<String>(_ClientCode_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     * 
     * @param value
     *     Java instance representing xml element's value.
     * @return
     *     the new instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     */
    @XmlElementDecl(namespace = "http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", name = "Date_Post")
    public JAXBElement<String> createDatePost(String value) {
        return new JAXBElement<String>(_DatePost_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     * 
     * @param value
     *     Java instance representing xml element's value.
     * @return
     *     the new instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     */
    @XmlElementDecl(namespace = "http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", name = "Msg_Id")
    public JAXBElement<String> createMsgId(String value) {
        return new JAXBElement<String>(_MsgId_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     * 
     * @param value
     *     Java instance representing xml element's value.
     * @return
     *     the new instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     */
    @XmlElementDecl(namespace = "http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", name = "Req_Id")
    public JAXBElement<String> createReqId(String value) {
        return new JAXBElement<String>(_ReqId_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     * 
     * @param value
     *     Java instance representing xml element's value.
     * @return
     *     the new instance of {@link JAXBElement }{@code <}{@link String }{@code >}
     */
    @XmlElementDecl(namespace = "http://www.kotak.com/schemas/CMS_Generic/Reversal_Request.xsd", name = "Msg_Src")
    public JAXBElement<String> createMsgSrc(String value) {
        return new JAXBElement<String>(_MsgSrc_QNAME, String.class, null, value);
    }

}
