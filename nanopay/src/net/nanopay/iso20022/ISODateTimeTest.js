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
  name: 'ISODateTimeTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.lib.json.JSONParser',
    'java.util.Calendar',
    'java.util.TimeZone'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        Calendar expected = Calendar.getInstance(TimeZone.getTimeZone("UTC-05:00"));
        expected.clear();
        expected.set(2011, Calendar.OCTOBER, 5, 14, 48, 10);
        expected.set(Calendar.MILLISECOND, 500);

        // parse string
        String toParse = "{\\"DbtDtTm\\":\\"2011-10-05T14:48:10.500-05:00\\"}";
        JSONParser parser = x.create(JSONParser.class);
        SettlementDateTimeIndication1 settlementDateTimeIndication1 = (SettlementDateTimeIndication1)
          parser.parseString(toParse, SettlementDateTimeIndication1.class);

        Calendar actual = Calendar.getInstance(TimeZone.getTimeZone("UTC-05:00"));
        actual.clear();
        actual.setTime(settlementDateTimeIndication1.getDebitDateTime());

        test(expected.get(Calendar.YEAR)  == actual.get(Calendar.YEAR),  "ISODateTime property parses year correctly.");
        test(expected.get(Calendar.MONTH) == actual.get(Calendar.MONTH), "ISODateTime property parses month correctly");
        test(expected.get(Calendar.DATE)  == actual.get(Calendar.DATE),  "ISODateTime property parses date correctly");
        test(expected.get(Calendar.HOUR)  == actual.get(Calendar.HOUR),  "ISODateTime property parses hour correctly");
        test(expected.get(Calendar.MINUTE)  == actual.get(Calendar.MINUTE),  "ISODateTime property parses minute correctly");
        test(expected.get(Calendar.SECOND)  == actual.get(Calendar.SECOND),  "ISODateTime property parses seconds correctly");
        test(expected.get(Calendar.MILLISECOND)  == actual.get(Calendar.MILLISECOND),  "ISODateTime property parses milliseconds correctly");
      `
    }
  ]
});
