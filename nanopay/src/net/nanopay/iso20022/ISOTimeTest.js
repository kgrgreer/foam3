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
  package: 'net.nanopay.iso20022',
  name: 'ISOTimeTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.lib.json.JSONParser',
    'java.util.Calendar',
    'java.util.TimeZone',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        Calendar expected = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        expected.clear();
        expected.set(Calendar.HOUR, 7);
        expected.set(Calendar.MINUTE, 33);
        expected.set(Calendar.SECOND, 12);
        expected.set(Calendar.MILLISECOND, 500);

        // parse string
        String toParse = "{\\"CLSTm\\":\\"07:33:12.500Z\\"}";
        JSONParser parser = x.create(JSONParser.class);
        SettlementTimeRequest2 settlementTimeRequest2 = (SettlementTimeRequest2)
          parser.parseString(toParse, SettlementTimeRequest2.class);

        Calendar actual = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        actual.clear();
        actual.setTime(settlementTimeRequest2.getCLSTime());

        test(expected.get(Calendar.HOUR) == actual.get(Calendar.HOUR),  "ISOTime property parses hour correctly.");
        test(expected.get(Calendar.MINUTE) == actual.get(Calendar.MINUTE), "ISOTime property parses minutes correctly");
        test(expected.get(Calendar.SECOND) == actual.get(Calendar.SECOND),  "ISOTime property parses seconds correctly");
        test(expected.get(Calendar.MILLISECOND) == actual.get(Calendar.MILLISECOND),  "ISOTime property parses milliseconds correctly");
      `
    }
  ]
});
