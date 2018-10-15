
package net.nanopay.kotak.schemas.cms_generic.payment_request;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for EnrichmentSetType complex type.
 * 
 * <p>The following schema fragment specifies the expected         content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="EnrichmentSetType"&gt;
 *   &lt;complexContent&gt;
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType"&gt;
 *       &lt;sequence&gt;
 *         &lt;element name="Enrichment" type="{http://www.kotak.com/schemas/CMS_Generic/Payment_Request.xsd}MaxChar4000_ST" maxOccurs="unbounded"/&gt;
 *       &lt;/sequence&gt;
 *     &lt;/restriction&gt;
 *   &lt;/complexContent&gt;
 * &lt;/complexType&gt;
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "EnrichmentSetType", propOrder = {
    "enrichment"
})
public class EnrichmentSetType {

    @XmlElement(name = "Enrichment", required = true)
    protected List<String> enrichment;

    /**
     * Gets the value of the enrichment property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the enrichment property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getEnrichment().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link String }
     * 
     * 
     */
    public List<String> getEnrichment() {
        if (enrichment == null) {
            enrichment = new ArrayList<String>();
        }
        return this.enrichment;
    }

}
