/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Country;
import foam.nanos.auth.Region;
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
    String normalizedRegion = country + "-" + regionCode;
    DAO regionDAO = (DAO) x.get("regionDAO");
    ArraySink sink = (ArraySink) regionDAO.where(AND(
      EQ(Region.COUNTRY_ID, country),
      OR(
        EQ(Region.ISO_CODE, regionCode),
        STARTS_WITH_IC(Region.NAME, regionCode)
      )
    )).select(new ArraySink());

    List<Region> regions = sink.getArray();
    
    // Take the first match as the default
    if (regions.size() > 0)
      normalizedRegion = regions.get(0).getCode();
    
    // When there are more than one, take the first matches on the full name (i.e. not just STARTS_WITH_IC)
    if (regions.size() > 1) {
      for ( int i = 0; i < regions.size(); i++ ) {
        Region region = (Region) regions.get(i);
        if ( region.getName().equalsIgnoreCase(regionCode) ) {
          normalizedRegion = region.getCode();
          break;
        }
      }
    }
    
    return normalizedRegion;
  }

  public static String normalizeCountry(X x, String countryCode) {
    String normalizedCountry = countryCode;
    DAO countryDAO = (DAO) x.get("countryDAO");
    ArraySink sink = (ArraySink) countryDAO
      .where(OR(
        EQ(Country.Code, countryCode),
        EQ(Country.ISO31661CODE),
        STARTS_WITH_IC(Country.NAME, countryCode)
      ))
      .select(new ArraySink());

    List<Country> countries = sink.getArray();

    // Take the first match as default
    if (countries.size() > 0)
      normalizedCountry = country.getCode();

    // When there is more than one, take the first match on the full name (i.e. not just STARTS_WITH_IC)
    if (countries.size() > 1) {
      for ( int i = 0; i < countries.size(); i++ ) {
        Country country = (Country) countries.get(i);
        if ( country.getName().equalsIgnoreCase(countryCode) )
          normalizedCountry = country.getCode();
          break;
        }
      }
    }

    return normalizedCountry;
  }

}
