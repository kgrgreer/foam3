
package net.nanopay.kotak.schemas.cms_generic.payment_response;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the net.nanopay.kotak.schemas.cms_generic.payment_response package.
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

    private final static QName _AcknowledgementRoot_QNAME = new QName("http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd", "AcknowledgementRoot");
    private final static QName _Payment_QNAME = new QName("http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd", "Payment");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: net.nanopay.kotak.schemas.cms_generic.payment_response
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link AcknowledgementType }
     * 
     */
    public AcknowledgementType createAcknowledgementType() {
        return new AcknowledgementType();
    }

    /**
     * Create an instance of {@link Acknowledgement }
     * 
     */
    public Acknowledgement createAcknowledgement() {
        return new Acknowledgement();
    }

    /**
     * Create an instance of {@link ErrorListType }
     * 
     */
    public ErrorListType createErrorListType() {
        return new ErrorListType();
    }

    /**
     * Create an instance of {@link FaultListType }
     * 
     */
    public FaultListType createFaultListType() {
        return new FaultListType();
    }

    /**
     * Create an instance of {@link FaultType }
     * 
     */
    public FaultType createFaultType() {
        return new FaultType();
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
     * Create an instance of {@link JAXBElement }{@code <}{@link AcknowledgementType }{@code >}
     * 
     * @param value
     *     Java instance representing xml element's value.
     * @return
     *     the new instance of {@link JAXBElement }{@code <}{@link AcknowledgementType }{@code >}
     */
    @XmlElementDecl(namespace = "http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd", name = "AcknowledgementRoot")
    public JAXBElement<AcknowledgementType> createAcknowledgementRoot(AcknowledgementType value) {
        return new JAXBElement<AcknowledgementType>(_AcknowledgementRoot_QNAME, AcknowledgementType.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link AcknowledgementType }{@code >}
     * 
     * @param value
     *     Java instance representing xml element's value.
     * @return
     *     the new instance of {@link JAXBElement }{@code <}{@link AcknowledgementType }{@code >}
     */
    @XmlElementDecl(namespace = "http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd", name = "Payment")
    public JAXBElement<AcknowledgementType> createPayment(AcknowledgementType value) {
        return new JAXBElement<AcknowledgementType>(_Payment_QNAME, AcknowledgementType.class, null, value);
    }

}
