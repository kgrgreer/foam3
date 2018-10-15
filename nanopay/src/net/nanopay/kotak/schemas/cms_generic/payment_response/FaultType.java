
package net.nanopay.kotak.schemas.cms_generic.payment_response;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for FaultType complex type.
 * 
 * <p>The following schema fragment specifies the expected         content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="FaultType"&gt;
 *   &lt;complexContent&gt;
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType"&gt;
 *       &lt;sequence&gt;
 *         &lt;element name="Code" type="{http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd}MaxChar10_ST" minOccurs="0"/&gt;
 *         &lt;element name="Reason" type="{http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd}MinChar1_MaxChar2000_ST"/&gt;
 *         &lt;element name="InvalidField" type="{http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd}MaxChar50_ST" minOccurs="0"/&gt;
 *         &lt;element name="SubmittedFieldValue" type="{http://www.kotak.com/schemas/CMS_Generic/Payment_Response.xsd}MaxChar4000_ST" minOccurs="0"/&gt;
 *       &lt;/sequence&gt;
 *     &lt;/restriction&gt;
 *   &lt;/complexContent&gt;
 * &lt;/complexType&gt;
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "FaultType", propOrder = {
    "code",
    "reason",
    "invalidField",
    "submittedFieldValue"
})
public class FaultType {

    @XmlElement(name = "Code")
    protected String code;
    @XmlElement(name = "Reason", required = true)
    protected String reason;
    @XmlElement(name = "InvalidField")
    protected String invalidField;
    @XmlElement(name = "SubmittedFieldValue")
    protected String submittedFieldValue;

    /**
     * Gets the value of the code property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCode() {
        return code;
    }

    /**
     * Sets the value of the code property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCode(String value) {
        this.code = value;
    }

    /**
     * Gets the value of the reason property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getReason() {
        return reason;
    }

    /**
     * Sets the value of the reason property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setReason(String value) {
        this.reason = value;
    }

    /**
     * Gets the value of the invalidField property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getInvalidField() {
        return invalidField;
    }

    /**
     * Sets the value of the invalidField property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setInvalidField(String value) {
        this.invalidField = value;
    }

    /**
     * Gets the value of the submittedFieldValue property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSubmittedFieldValue() {
        return submittedFieldValue;
    }

    /**
     * Sets the value of the submittedFieldValue property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSubmittedFieldValue(String value) {
        this.submittedFieldValue = value;
    }

}
