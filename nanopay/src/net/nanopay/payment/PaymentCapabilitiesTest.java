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
import net.nanopay.fx.Corridor;

public class PaymentCapabilitiesTest extends foam.nanos.test.Test {

  DAO corridorDAO;
  DAO paymentProviderCorridorJunctionDAO;
  DAO prerequisiteDAO, capabilityDAO, paymentProviderDAO;

  Corridor c;
  PaymentProviderCorridorJunction j;
  PaymentProviderCorridorCapability ppcc;
  PaymentProvider paymentProvider;
  PaymentProviderCapability paymentProviderCapability;

  public void runTest(X x) {
    corridorDAO = (DAO) x.get("corridorDAO");
    capabilityDAO = (DAO) x.get("capabilityDAO");
    paymentProviderCorridorJunctionDAO = (DAO) x.get("paymentProviderCorridorJunctionDAO");
    paymentProviderDAO = (DAO) x.get("paymentProviderDAO");
    prerequisiteDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");

    setUpTest(x);
    testCreatePrequisitePaymentProvider(x);
    testPreventJunctionPaymentProvider(x);
    testPreventJunctionCorridor(x);
  }

  // Sets up payment providers, corridors and associated capabilities.
  public void setUpTest(X x) {
    c = (Corridor) corridorDAO.put(
      new Corridor.Builder(x)
      .setId("corridor-ca-us")
      .setSourceCountry("CA")
      .setTargetCountry("US")
      .setEnabled(true)
      .build());

    paymentProvider = (PaymentProvider) paymentProviderDAO.put(
      new PaymentProvider.Builder(x)
        .setId("TEST_PROVIDER")
        .setName("TEST_PROVIDER")
        .build());

    // NOTE: May make sense to make payment providers into capabilities.
    paymentProviderCapability = (PaymentProviderCapability) capabilityDAO.put(
      new PaymentProviderCapability.Builder(x)
        .setPaymentProvider(paymentProvider.getId())
        .setEnabled(true)
        .setName("Test_provider")
        .build());

    j = (PaymentProviderCorridorJunction) paymentProviderCorridorJunctionDAO.put(
      new PaymentProviderCorridorJunction.Builder(x)
      .setSourceId(paymentProvider.getId())
      .setTargetId(c.getId())
      .setCurrencies(new String[]{"CAD","USD"})
      .build());

    ppcc = (PaymentProviderCorridorCapability) capabilityDAO.put(
      new PaymentProviderCorridorCapability.Builder(x)
        .setPaymentProviderCorridorId(j.getId())
        .setEnabled(true)
        .setName("Test provider ca-us")
        .build());
  }

 // Test that payment provider capability is added as prerequisite when adding payment provider corridor capability.
  public void testCreatePrequisitePaymentProvider(X x) {
    CapabilityCapabilityJunction ccj = (CapabilityCapabilityJunction) prerequisiteDAO.find(
      foam.mlang.MLang.AND(
        foam.mlang.MLang.EQ(CapabilityCapabilityJunction.SOURCE_ID, paymentProviderCapability.getId()),
        foam.mlang.MLang.EQ(CapabilityCapabilityJunction.TARGET_ID, ppcc.getId())
      )
    );

    test(ccj != null, "Payment Provider Capability added as prerequisite");
  }

 // Test that payment provider corridor junction cannot be created since payment provider does not exist.
  public void testPreventJunctionPaymentProvider(X x) {
    Exception exception = null;
    try {
      PaymentProviderCorridorJunction providerCorridorJunction = (PaymentProviderCorridorJunction) paymentProviderCorridorJunctionDAO.put(
        new PaymentProviderCorridorJunction.Builder(x)
        .setSourceId("FAULTY_PROVIDER")
        .setTargetId(c.getId())
        .setCurrencies(new String[]{"CAD","USD"})
        .build());
    } catch (Exception e) {
      exception = e;
    }

    test(exception != null, "Unable to create payment provider corridor junction - missing valid payment provider");
  }

  // Test that payment provider corridor junction cannot be created since corridor does not exist.
  public void testPreventJunctionCorridor(X x) {
    Exception exception = null;
    try {
      PaymentProviderCorridorJunction providerCorridorJunction = (PaymentProviderCorridorJunction) paymentProviderCorridorJunctionDAO.put(
        new PaymentProviderCorridorJunction.Builder(x)
        .setSourceId(paymentProvider.getId())
        .setTargetId("a-random-id-string")
        .setCurrencies(new String[]{"CAD","USD"})
        .build());
    } catch (Exception e) {
      exception = e;
    }

    test(exception != null, "Unable to create payment provider corridor junction - missing valid corridor");
  }
}