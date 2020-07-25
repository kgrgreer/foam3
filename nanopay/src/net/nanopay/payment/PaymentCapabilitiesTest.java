/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.payment;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.crunch.CapabilityCapabilityJunction;
import foam.nanos.logger.Logger;

public class PaymentCapabilitiesTest extends foam.nanos.test.Test {

  DAO paymentProviderCorridorDAO, countryCapabilityDAO;
  DAO prerequisiteDAO, paymentProviderDAO;

  PaymentProviderCorridor j;
  PaymentProvider paymentProvider;
  CapabilityCapabilityJunction pccj = null;
  CapabilityCapabilityJunction sccj = null;
  CapabilityCapabilityJunction tccj = null;

  public void runTest(X x) {

    paymentProviderCorridorDAO = (DAO) x.get("paymentProviderCorridorDAO");
    paymentProviderDAO = (DAO) x.get("paymentProviderDAO");
    countryCapabilityDAO = (DAO) x.get("countryCapabilityDAO");
    prerequisiteDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");

    setUpTest(x);
    testCreatePrequisitePaymentProvider(x);
    testCreatePrequisiteSourceCountryCapability(x);
    testCreatePrequisiteTargetCountryCapability(x);
    testPreventJunctionPaymentProvider(x);
    cleanUpTest(x);
  }

  // Sets up payment providers, corridors and associated capabilities.
  public void setUpTest(X x) {
    paymentProvider = (PaymentProvider) paymentProviderDAO.put(
      new PaymentProvider.Builder(x)
        .setId("TEST_PROVIDER")
        .setName("TEST_PROVIDER")
        .setEnabled(true)
        .build());

    j = (PaymentProviderCorridor) paymentProviderCorridorDAO.put(
      new PaymentProviderCorridor.Builder(x)
      .setSourceCountry("CA")
      .setTargetCountry("US")
      .setProvider(paymentProvider.getId())
      .setSourceCurrencies(new String[]{"CAD"})
      .setTargetCurrencies(new String[]{"USD"})
      .build());
  }

 // Test that payment provider capability is added as prerequisite when adding payment provider corridor capability.
  public void testCreatePrequisitePaymentProvider(X x) {
    pccj = (CapabilityCapabilityJunction) prerequisiteDAO.find(
      foam.mlang.MLang.AND(
        foam.mlang.MLang.EQ(CapabilityCapabilityJunction.SOURCE_ID, j.getId()),
        foam.mlang.MLang.EQ(CapabilityCapabilityJunction.TARGET_ID, paymentProvider.getId())
      )
    );

    test(pccj != null, "Payment Provider Capability added as prerequisite");
  }

  // Test that source country capability is added and is prerequisite of payment provider corridor when adding payment provider corridor.
  public void testCreatePrequisiteSourceCountryCapability(X x) {
    CountryCapability sourceCountryCapability = (CountryCapability) countryCapabilityDAO.find(
      foam.mlang.MLang.AND(
        foam.mlang.MLang.EQ(CountryCapability.COUNTRY, j.getSourceCountry()),
        foam.mlang.MLang.EQ(CountryCapability.TYPE, SourceTargetType.SOURCE)
      )
    );
    test(sourceCountryCapability != null, "Source Country Capability created.");

    if ( sourceCountryCapability != null ) {
      sccj = (CapabilityCapabilityJunction) prerequisiteDAO.find(
        foam.mlang.MLang.AND(
          foam.mlang.MLang.EQ(CapabilityCapabilityJunction.SOURCE_ID, j.getId()),
          foam.mlang.MLang.EQ(CapabilityCapabilityJunction.TARGET_ID, sourceCountryCapability.getId())
        )
      );
    }

    test(sccj != null, "Source Country Capability added as prerequisite to payment provider.");
  }

  // Test that target country capability is added and is prerequisite of payment provider corridor when adding payment provider corridor.
  public void testCreatePrequisiteTargetCountryCapability(X x) {
    CountryCapability targetCountryCapability = (CountryCapability) countryCapabilityDAO.find(
      foam.mlang.MLang.AND(
        foam.mlang.MLang.EQ(CountryCapability.COUNTRY, j.getTargetCountry()),
        foam.mlang.MLang.EQ(CountryCapability.TYPE, SourceTargetType.TARGET)
      )
    );
    test(targetCountryCapability != null, "Target Country Capability created.");

    if ( targetCountryCapability != null ) {
      tccj = (CapabilityCapabilityJunction) prerequisiteDAO.find(
        foam.mlang.MLang.AND(
          foam.mlang.MLang.EQ(CapabilityCapabilityJunction.SOURCE_ID, j.getId()),
          foam.mlang.MLang.EQ(CapabilityCapabilityJunction.TARGET_ID, targetCountryCapability.getId())
        )
      );
    }

    test(tccj != null, "Target Country Capability added as prerequisite to payment provider.");
  }

 // Test that payment provider corridor cannot be created since payment provider does not exist.
  public void testPreventJunctionPaymentProvider(X x) {
    Exception exception = null;
    try {
      PaymentProviderCorridor providerCorridor = (PaymentProviderCorridor) paymentProviderCorridorDAO.put(
        new PaymentProviderCorridor.Builder(x)
        .setProvider("FAULTY_PROVIDER")
        .setSourceCountry("CA")
        .setTargetCountry("US")
        .setSourceCurrencies(new String[]{"CAD"})
        .setTargetCurrencies(new String[]{"USD"})
        .build());
    } catch (Exception e) {
      exception = e;
    }

    test(exception != null, "Unable to create payment provider corridor junction - missing valid payment provider");

    exception = null;
    try {
      PaymentProviderCorridor providerCorridor = (PaymentProviderCorridor) paymentProviderCorridorDAO.put(
        new PaymentProviderCorridor.Builder(x)
        .setProvider("FAULTY_PROVIDER")
        .setSourceCountry("CA")
        .setTargetCountry("US")
        .setSourceCurrencies(new String[]{"CAD", "RANDOM_STRING"})
        .setTargetCurrencies(new String[]{"USD"})
        .build());
    } catch (Exception e) {
      exception = e;
    }

    test(exception != null, "Unable to create payment provider corridor junction - Currency provided is not supported");
  }

  public void cleanUpTest(X x) {
    prerequisiteDAO.remove(pccj);
    prerequisiteDAO.remove(sccj);
    prerequisiteDAO.remove(tccj);
    paymentProviderDAO.remove(paymentProvider);
    paymentProviderCorridorDAO.remove(j);
  }
}
