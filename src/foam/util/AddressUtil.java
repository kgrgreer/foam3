/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Country;
import foam.nanos.auth.Region;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import static foam.mlang.MLang.*;

public class AddressUtil {

  protected static final Pattern SUITE_PATTERN = Pattern.compile("/\\d+/g");
  protected static final Pattern REPLACE_PATTERN = Pattern.compile("/[#\"]/g");
  public static final Map<String, String> caPostalCodeToRegionCodeMap = new HashMap<>();

  static {
    // https://www150.statcan.gc.ca/n1/pub/92-195-x/2011001/other-autre/pc-cp/tbl/tbl9-eng.htm
    caPostalCodeToRegionCodeMap.put("A", "CA-NL");
    caPostalCodeToRegionCodeMap.put("B", "CA-NS");
    caPostalCodeToRegionCodeMap.put("C", "CA-PE");
    caPostalCodeToRegionCodeMap.put("E", "CA-NB");
    caPostalCodeToRegionCodeMap.put("G", "CA-QC");
    caPostalCodeToRegionCodeMap.put("H", "CA-QC");
    caPostalCodeToRegionCodeMap.put("J", "CA-QC");
    caPostalCodeToRegionCodeMap.put("K", "CA-ON");
    caPostalCodeToRegionCodeMap.put("L", "CA-ON");
    caPostalCodeToRegionCodeMap.put("M", "CA-ON");
    caPostalCodeToRegionCodeMap.put("N", "CA-ON");
    caPostalCodeToRegionCodeMap.put("P", "CA-ON");
    caPostalCodeToRegionCodeMap.put("R", "CA-MB");
    caPostalCodeToRegionCodeMap.put("S", "CA-SK");
    caPostalCodeToRegionCodeMap.put("T", "CA-AB");
    caPostalCodeToRegionCodeMap.put("V", "CA-BC");
    //caPostalCodeToRegionCodeMap.put("X", null); // belong to both Northwest Territories and Nunavut
    caPostalCodeToRegionCodeMap.put("Y", "CA-YT");
  }

  /*
   * Splits an address into the number and name, in that order, into an array
   */
  public static String[] parseAddress(String address1, String address2) throws IllegalArgumentException {
    if ( address1.indexOf("Unit") > 0) {
      var parts = address1.split("Unit");
      address1 = parts[0].trim();
      address2 = parts[1].trim();
    }
    if ( address1.endsWith(",") ) {
      address1 = address1.split(",")[0];
    }
    if ( address1.indexOf(',') > 0) {
      var parts = address1.split(",");
      address1 = parts[0];
      address2 = parts[1];
    }
    var street = address1;
    var suite = "";

    try {
      suite = SUITE_PATTERN.matcher(address2).group(0);
    } catch(IllegalStateException ignored) {}

    if ( address1.indexOf('-') > 0) {
      var parts = address1.split("-");
      try {
        suite = SUITE_PATTERN.matcher(parts[0]).group(0);
      } catch(IllegalStateException ignored) {}
      street = parts[1].trim();
    }

    var newString = REPLACE_PATTERN.matcher(street).replaceAll("");
    var n = newString.indexOf(' ');

    var streetNumber = newString.substring(0, n);
    var streetName = newString.substring(n+1);

    if ( streetNumber.isEmpty() || ! streetNumber.chars().allMatch(Character::isDigit) || streetName.isEmpty() )
      throw new IllegalArgumentException("Couldn't parse " + address1 + (address2.isEmpty() ? "" : "," + address2));

    return new String[] { streetNumber, streetName };
  }

  // TODO: country defaults to CA if not given. Remove when we can.
  public static String normalizeRegion(X x, String country, String region) {
    if ( SafetyUtil.isEmpty(region) ) return region;

    if ( SafetyUtil.isEmpty(country) ) {
      country = "CA";
    }

    country = country.trim();
    region = region.trim();

    Region regionObject = lookupRegion(x, country, region);
    if ( regionObject != null ) {
      return regionObject.getCode();
    } else {
      return country + "-" + region;
    }
  }

  // TODO: country defaults to CA if not given. Remove when we can.
  public static String normalizeRegion(X x, String country, String region, String postalCode) {
    if ( SafetyUtil.isEmpty(country) ) {
      country = "CA";
    }

    country = country.trim();
    if ( ! SafetyUtil.isEmpty(region) ) region = region.trim();
    if ( ! SafetyUtil.isEmpty(postalCode) ) postalCode = postalCode.trim();

    if ( ! SafetyUtil.isEmpty(region) ) {
      Region regionObject = lookupRegion(x, country, region);
      if ( regionObject != null ) return regionObject.getCode();
    }

    if ( ! SafetyUtil.isEmpty(postalCode) ) {
      String regionCode = lookupRegionCodeWithPostalCode(x, country, postalCode);
      if ( ! SafetyUtil.isEmpty(regionCode) ) return regionCode; 
    }

    return SafetyUtil.isEmpty(region) ? region : country + "-" + region;
  }

  private static Region lookupRegion(X x, String country, String region) {
    return (Region) ((DAO) x.get("regionDAO")).find(AND(
      EQ(Region.COUNTRY_ID, country),
      OR(
        EQ(Region.ISO_CODE, region),
        EQ(Region.CODE, region),
        IN(region.toUpperCase(), Region.ALTERNATIVE_NAMES)
      )
    ));
  }
  
  private static String lookupRegionCodeWithPostalCode(X x, String country, String postalCode) {
    if ( SafetyUtil.isEmpty(postalCode) ) return "";

    switch(country) {
      case "CA":
        return caPostalCodeToRegionCodeMap.get(postalCode.substring(0, 1).toUpperCase());
      default: 
        return "";
    }
  }

  // TODO: country defaults to CA if not given. Remove when we can.
  public static String normalizeCountry(X x, String country) {
    if ( SafetyUtil.isEmpty(country) ) {
      return "CA";
    }

    country = country.trim();

    DAO countryDAO = (DAO) x.get("countryDAO");
    Country countryObject = (Country) countryDAO.find(OR(
      EQ(Country.ISO31661CODE, country),
      EQ(Country.CODE, country),
      IN(country.toUpperCase(), Country.ALTERNATIVE_NAMES)
    ));

    if ( countryObject != null ) {
      return countryObject.getCode();
    } else {
      return country;
    }
  }
}
