/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.test',
  name: 'SafetyUtilTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.util.SafetyUtil',
  ],
  documentation: 'test utility functions',

  methods: [
    {
    name: 'runTest',
    javaCode: ` 
      String message = "Strings are euqal -- ignores case";
      String s1 = "abc";
      String s2 = "aBc";
      String s3 = "AbCdEfGh";
      String s4 = "abcdEFGH";
      String s5 = "123456aabb";
      String s6 = "123456AABB";
      String s7 = "12AbCdEfGh34";
      String s8 = "12abcdEFGH34";
      String s9 = "AbCd1122EfGh";
      String s10 = "abcd1122EFGH";
      String s11 = "notEqual";
      String s12 = "NOT_EQUAL";
      String empty = "";
      String nptr = null;
      test( SafetyUtil.equalsIgnoreCase( s1, s2 ), message );
      test( SafetyUtil.equalsIgnoreCase( s3, s4 ), message );
      test( SafetyUtil.equalsIgnoreCase( s5, s6 ), message );
      test( SafetyUtil.equalsIgnoreCase( s7, s8 ), message );
      test( SafetyUtil.equalsIgnoreCase( s9, s10 ), message );
      test( !SafetyUtil.equalsIgnoreCase( s11, s12 ), "Not equal -- different string" );
      test( !SafetyUtil.equalsIgnoreCase( empty, s11 ), "Not equal -- empty string" );
      test( !SafetyUtil.equalsIgnoreCase( s1, empty ), "Not equal -- empty string" );
      test( SafetyUtil.equalsIgnoreCase( empty, empty ), "Equal -- both empty string" );
      test( SafetyUtil.equalsIgnoreCase( nptr, nptr ), "Equal -- both null" );
      test( !SafetyUtil.equalsIgnoreCase( empty, nptr ), "Not equal -- empty string and null" );
      test( !SafetyUtil.equalsIgnoreCase( nptr, empty ), "Not equal -- empty string and null" );
      test( !SafetyUtil.equalsIgnoreCase( nptr, s8 ), "Not equal -- empty string and string" );
    `,
    },
  ]
});
