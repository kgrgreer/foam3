
package net.nanopay.kotak.schemas.cms_generic.payment_request;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the net.nanopay.kotak.schemas.cms_generic.payment_request package.
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

    private final static QName _InitiateRequestRoot_QNAME = new QName("http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd", "InitiateRequestRoot");
    private final static QName _Payment_QNAME = new QName("http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd", "Payment");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: net.nanopay.kotak.schemas.cms_generic.payment_request
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link InitiateRequest }
     * 
     */
    public InitiateRequest createInitiateRequest() {
        return new InitiateRequest();
    }

    /**
     * Create an instance of {@link EnrichmentSetType }
     * 
     */
    public EnrichmentSetType createEnrichmentSetType() {
        return new EnrichmentSetType();
    }

    /**
     * Create an instance of {@link InstrumentListType }
     * 
     */
    public InstrumentListType createInstrumentListType() {
        return new InstrumentListType();
    }

    /**
     * Create an instance of {@link InstrumentType }
     * 
     */
    public InstrumentType createInstrumentType() {
        return new InstrumentType();
    }

    /**
     * Create an instance of {@link RequestHeaderType }
     * 
     */
    public RequestHeaderType createRequestHeaderType() {
        return new RequestHeaderType();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link InitiateRequest }{@code >}
     * 
     * @param value
     *     Java instance representing xml element's value.
     * @return
     *     the new instance of {@link JAXBElement }{@code <}{@link InitiateRequest }{@code >}
     */
    @XmlElementDecl(namespace = "http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd", name = "InitiateRequestRoot")
    public JAXBElement<InitiateRequest> createInitiateRequestRoot(InitiateRequest value) {
        return new JAXBElement<InitiateRequest>(_InitiateRequestRoot_QNAME, InitiateRequest.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link InitiateRequest }{@code >}
     * 
     * @param value
     *     Java instance representing xml element's value.
     * @return
     *     the new instance of {@link JAXBElement }{@code <}{@link InitiateRequest }{@code >}
     */
    @XmlElementDecl(namespace = "http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd", name = "Payment")
    public JAXBElement<InitiateRequest> createPayment(InitiateRequest value) {
        return new JAXBElement<InitiateRequest>(_Payment_QNAME, InitiateRequest.class, null, value);
    }

}
