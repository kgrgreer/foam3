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
import java.util.List;
import java.util.regex.Pattern;

import static foam.mlang.MLang.*;


public class AddressUtil {

  protected static final Pattern SUITE_PATTERN = Pattern.compile("/\\d+/g");
  protected static final Pattern REPLACE_PATTERN = Pattern.compile("/[#\"]/g");

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

  public static String normalizeRegion(X x, String country, String regionCode) {
    if ( SafetyUtil.isEmpty(regionCode) ) {
      return regionCode;
    }
    
    String[] normalizedRegion = { country + "-" + regionCode };
    DAO regionDAO = (DAO) x.get("regionDAO");
    Region found = (Region) regionDAO.find(regionCode);
    if ( found != null )
      return found.getCode();

    if ( SafetyUtil.isEmpty(country) ) {
      return regionCode;
    }

    regionDAO.where(AND(
      EQ(Region.COUNTRY_ID, country),
      OR(
        EQ(Region.ISO_CODE, regionCode),
        STARTS_WITH_IC(Region.NAME, regionCode),
        IN(regionCode, Region.ALTERNATIVE_NAMES)
      )
    )).select(new AbstractSink() {
      public void put(Object o, Detachable d) {
        Region region = (Region) o;
        if ( region.getIsoCode().equals(regionCode) 
          || region.getName().equalsIgnoreCase(regionCode) 
          || Arrays.stream(region.getAlternativeNames()).anyMatch(n -> n.equals(regionCode))
           ) {
          normalizedRegion[0] = region.getCode();
          d.detach();
        }
      }
    });
    
    return normalizedRegion[0];
  }

  public static String normalizeCountry(X x, String countryCode) {
    if ( SafetyUtil.isEmpty(countryCode) ) {
      return countryCode;
    }
    
    String normalizedCountry = countryCode;

    DAO countryDAO = (DAO) x.get("countryDAO");
    Country country = (Country) countryDAO.find(OR(
      EQ(Country.ISO31661CODE, countryCode),
      EQ(Country.CODE, countryCode)
    ));

    if ( country != null ) {
      normalizedCountry = country.getCode();
    }
    
    return normalizedCountry;
  }
}
