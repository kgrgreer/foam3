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
  name: 'ISODateTest',
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
        Calendar expected = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        expected.clear();
        expected.set(1992, Calendar.JUNE, 3);

        // parse string
        String toParse = "{\\"BirthDt\\":\\"1992-06-03\\"}";
        JSONParser parser = x.create(JSONParser.class);
        DateAndPlaceOfBirth dateAndPlaceOfBirth = (DateAndPlaceOfBirth)
          parser.parseString(toParse, DateAndPlaceOfBirth.class);

        Calendar actual = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        actual.clear();
        actual.setTime(dateAndPlaceOfBirth.getBirthDate());

        test(expected.get(Calendar.YEAR)  == actual.get(Calendar.YEAR),  "ISODate property parses year correctly.");
        test(expected.get(Calendar.MONTH) == actual.get(Calendar.MONTH), "ISODate property parses month correctly");
        test(expected.get(Calendar.DATE)  == actual.get(Calendar.DATE),  "ISODate property parses date correctly");
      `
    }
  ]
});
