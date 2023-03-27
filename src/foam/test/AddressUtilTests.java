package foam.test;

import foam.core.ContextAware;
import foam.core.X;
import foam.nanos.test.Test;
import foam.util.AddressUtil;
import static foam.util.AddressUtil.parseAddress;

public class AddressUtilTests extends Test {

  @Override
  public void runTest(X x) {
    testAddressParse("14 Cheltenham Mews", "", "14", "Cheltenham Mews");
    testAddressParse("25 St. Dennis Drive", "Suite # 1019", "25", "St. Dennis Drive");
    testAddressParse("1505 - 25 The Esplanade", "", "25", "The Esplanade");
    testAddressParse("1505-19 Western Battery Rd", "", "19", "Western Battery Rd");

    testCountryNormalization(x, "CAN", "CA");
    testCountryNormalization(x, "CA", "CA");
    testCountryNormalization(x, "US", "US");
    testCountryNormalization(x, "USA", "US");
    testCountryNormalization(x, "IN", "IN");
    testCountryNormalization(x, "IND", "IN");

    testRegionNormalization(x, "CA", "ONTARIO", "CA-ON");
    testRegionNormalization(x, "CA", "Ontario", "CA-ON");
    testRegionNormalization(x, "CA", "ON", "CA-ON");
    testRegionNormalization(x, "US", "NE", "US-NE");
    testRegionNormalization(x, "US", "Nebraska", "US-NE");
    testRegionNormalization(x, "US", "NEBRASKA", "US-NE");
  }

  public void testAddressParse(String address1, String address2, String number, String street) {
    var addrs1 = parseAddress(address1, address2);
    test(addrs1[0].equals(number) && addrs1[1].equals(street), "[" + address1 + (address2.isEmpty() ? "" : "," + address2) + "] parsed to [\"" + number + "\", \"" + street + "\"]");
  }

  public void testCountryNormalization(X x, String country, String normalizedCountry) {
    var computed = AddressUtil.normalizeCountry(x, country);
    test(normalizedCountry.equals(computed), "[" + country + "] normalized to " + computed);
  }

  public void testRegionNormalization(X x, String country, String region, String normalizedRegion) {
    var computed = AddressUtil.normalizeRegion(x, country, region);
    test(normalizedRegion.equals(computed), "[" + country + ":" + region + "] normalized to " + computed);
  }
}
