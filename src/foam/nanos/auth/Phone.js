/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Phone',

  documentation: 'Phone number information.',

  javaImports: [
    'java.util.regex.Matcher',
    'java.util.regex.Pattern'
  ],

  constants: [
    foam.core.PhoneNumber.PHONE_NUMBER_REGEX
  ],


  properties: [
    {
      class: 'PhoneNumber',
      name: 'number',
      label: 'Phone Number',
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      /* ???: Why is this here and not just inherited from foam.core.PhoneNumber? */
      validationPredicates: [
        {
          args: ['number'],
          query: 'number~PHONE_NUMBER_REGEX',
          errorString: 'Please enter phone number'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'verified',
      writePermissionRequired: true,
      readPermissionRequired: true,
      createVisibility: 'HIDDEN'
    }
  ],

  static: [
    {
      name: 'sanitize',
      type: 'String',
      args: 'String phoneNumber',
      javaCode: `
        if ( phoneNumber.contains(",") ) {
          phoneNumber = phoneNumber.split(",")[0];
        }

        Pattern pattern = Pattern.compile("^(\\\\+?)(.*)");
        Matcher matcher = pattern.matcher(phoneNumber);

        if ( matcher.find() ) {
          return matcher.group(1) + matcher.group(2).replaceAll("\\\\D", "");
        }

        return phoneNumber;
      `
    }
  ]
});
