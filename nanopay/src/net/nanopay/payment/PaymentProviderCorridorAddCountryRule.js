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

foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PaymentProviderCorridorAddCountryRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Creates or adds country capability as prerequisites to new payment provider corridor.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  messages: [
    {
      name: 'MISSING_COUNTRY_CAPABILITY',
      message: `WARNING: Created new Country Capability `
    },
    {
      name: 'UNABLE_TO_CREATE_PREREQUISITE',
      message: 'ERROR: Unable to create prerequisite for payment provider corridor '
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        // Assumes payment provider corridor has been validated through it's validate method.
        Logger logger = (Logger) x.get("logger");
        PaymentProviderCorridor paymentProviderCorridor = (PaymentProviderCorridor) obj;

        String sourceCountry = (String) paymentProviderCorridor.getSourceCountry();
        String targetCountry = (String) paymentProviderCorridor.getTargetCountry();

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO countryCapabilityDAO = (DAO) x.get("countryCapabilityDAO");
            CountryCapability sourceCountryCapability = (CountryCapability) countryCapabilityDAO.find(
              AND(
                EQ(CountryCapability.COUNTRY, sourceCountry),
                EQ(CountryCapability.TYPE, SourceTargetType.SOURCE)
              ));

            CountryCapability targetCountryCapability = (CountryCapability) countryCapabilityDAO.find(
              AND(
                EQ(CountryCapability.COUNTRY, targetCountry),
                EQ(CountryCapability.TYPE, SourceTargetType.TARGET)
              ));

            if ( sourceCountryCapability == null ) {
              sourceCountryCapability = new CountryCapability();
              sourceCountryCapability.setId("payment.source.country." + sourceCountry.toLowerCase());
              sourceCountryCapability.setCountry(sourceCountry);
              sourceCountryCapability.setType(SourceTargetType.SOURCE);
              sourceCountryCapability.setName("Source Country Capability " + sourceCountry);
              sourceCountryCapability.setEnabled(true);
              try {
                sourceCountryCapability = (CountryCapability) countryCapabilityDAO.put(sourceCountryCapability);
                logger.warning(MISSING_COUNTRY_CAPABILITY + "Source " + sourceCountry);
              } catch (Exception e) {
                logger.error(e);
              }
            }

            if ( targetCountryCapability == null ) {
              targetCountryCapability = new CountryCapability();
              targetCountryCapability.setId("payment.target.country." + targetCountry.toLowerCase());
              targetCountryCapability.setCountry(targetCountry);
              targetCountryCapability.setType(SourceTargetType.TARGET);
              targetCountryCapability.setName("Target Country Capability " + targetCountry);
              targetCountryCapability.setEnabled(true);
              try {
                targetCountryCapability = (CountryCapability) countryCapabilityDAO.put(targetCountryCapability);
                logger.warning(MISSING_COUNTRY_CAPABILITY + "Target " + targetCountry);
              } catch (Exception e) {
                logger.error(e);
              }
            }

            DAO prerequisiteDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
            if ( sourceCountryCapability != null ) {
              CapabilityCapabilityJunction sourceCCJ = new CapabilityCapabilityJunction();
              sourceCCJ.setSourceId(paymentProviderCorridor.getId());
              sourceCCJ.setTargetId(sourceCountryCapability.getId());
              sourceCCJ.setPriority(1);
              try {
                sourceCCJ = (CapabilityCapabilityJunction) prerequisiteDAO.put(sourceCCJ);
              } catch (Exception e) {
                logger.error(UNABLE_TO_CREATE_PREREQUISITE + paymentProviderCorridor.getId() + " " + sourceCountry);
              }
            }

            if ( targetCountryCapability != null ) {
              CapabilityCapabilityJunction targetCCJ = new CapabilityCapabilityJunction();
              targetCCJ.setSourceId(paymentProviderCorridor.getId());
              targetCCJ.setTargetId(targetCountryCapability.getId());
              targetCCJ.setPriority(1);
              try {
                targetCCJ = (CapabilityCapabilityJunction) prerequisiteDAO.put(targetCCJ);
              } catch (Exception e) {
                logger.error(UNABLE_TO_CREATE_PREREQUISITE + paymentProviderCorridor.getId() + " " + targetCountry);
              }
            }
          }
        }, "Creates or adds country capability as prerequisites to new payment provider corridor.");
      `
    }
  ]
});
