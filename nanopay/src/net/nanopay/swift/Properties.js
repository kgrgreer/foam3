/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.swift.fields',
  name: 'FieldTagRegexValidated',
  extends: 'foam.core.Property',
  messages: [
    { name: 'REQUIRED_MESSAGE', message: ' required' },
    { name: 'INVALID_MESSAGE',  message: ' format is invalid' }
  ],
  properties: [
    {
      name: 'value',
      class: 'String'
    },
    {
      name: 'validateObj',
      expression: function(label, value, required) {
        if ( ! value )
          return required ? label + this.REQUIRED_MESSAGE : null;

        if ( ! this.REGEX.test(value) )
          return label + this.INVALID_MESSAGE;
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag20',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,16}/
    }
  ],
  properties: [
    {
      name: 'required',
      value: true
    },
    {
      name: 'name',
      value: 'senderRef'
    },
    {
      name: 'label',
      value: 'Sender\'s Reference'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag21',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,16}/
    }
  ],
  properties: [
    {
      name: 'value',
      class: 'String'
    },
    {
      name: 'required',
      value: true
    },
    {
      name: 'name',
      value: 'relatedRef'
    },
    {
      name: 'label',
      value: 'Related Reference'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag13C',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[/][A-Z0-9]{0,8}[/][0-9]{4}[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{4}[0-9]/
    }
  ],
  properties: [
    {
      name: 'value',
      class: 'String'
    },
    {
      name: 'name',
      value: 'timeIndication'
    },
    {
      name: 'label',
      value: 'Time Indication'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag23B',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[A-Z0-9]{4}/
    }
  ],
  properties: [
    {
      name: 'required',
      value: true
    },
    {
      name: 'name',
      value: 'bankOpCode'
    },
    {
      name: 'label',
      value: 'Bank Operation Code'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag23E',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[A-Z0-9]{4}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,30}]*/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'instCode'
    },
    {
      name: 'label',
      value: 'Instruction Code'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag26T',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[A-Z0-9]{3}/
    }
  ],
  properties: [
    {
      name: 'required',
      value: true
    },
    {
      name: 'name',
      value: 'transactionType'
    },
    {
      name: 'label',
      value: 'Transaction Type Code'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag32A',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[0-9]{6}[A-Z]{3}[d?(\,{1}\d{1,}|d*)]{0,15}/
    }
  ],
  properties: [
    {
      name: 'required',
      value: true
    },
    {
      name: 'name',
      value: 'settledAmount'
    },
    {
      name: 'label',
      value: 'Value Date/Currency/Interbank Settled Amount'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag33B',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[A-Z]{3}[d?(\,{1}\d{1,}|d*)]{0,15}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'amount'
    },
    {
      name: 'label',
      value: 'Currency/Instructed Amount'
    },
    {
      name: 'validateObj',
      expression: function(label, value) {
        if ( ! instCode )
          return label + ' required';

        if ( ! this.REGEX.test(instCode) )
          return label + ' format is invalid';
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag36',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[d?(\,{1}\d{1,}|d*)]{0,12}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'exchangeRate'
    },
    {
      name: 'label',
      value: 'Exchange Rate'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag50a',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /([[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]*[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}|[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]*|[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4})/
    }
  ],
  properties: [
    {
      name: 'required',
      value: true
    },
    {
      name: 'name',
      value: 'orderingCustomer'
    },
    {
      name: 'label',
      value: 'Ordering Customer'
    },
    {
      name: 'validateObj',
      expression: function(label, value) {
        if ( ! value )
          return label + ' required';

        if ( ! this.REGEX.test(value) )
          return label + ' format is invalid';
        }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag51A',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value:/[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]{*}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'sendingInst'
    },
    {
      name: 'label',
      value: 'Sending Institution'
    },
    {
      name: 'validateObj',
      expression: function(label, value) {
        if ( ! value )
          return label + ' required';
        
        if ( ! this.REGEX.test(value) )
          return label + ' format is invalid';
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag52a',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]{*}|[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'orderingInst'
    },
    {
      name: 'label',
      value: 'Ordering Institution'
    }
  ]
});



foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag53a',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]{*}|[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]*|[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'senderCorrespondent'
    },
    {
      name: 'label',
      value: 'Sender\'s Correspondent'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag54a',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]{*}|[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]*|[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'receiverInst'
    },
    {
      name: 'label',
      value: 'Receiver\'s Correspondent'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag55a',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]{*}|[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]*|[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'thirdReimbInst'
    },
    {
      name: 'label',
      value: 'Third Reimbursement Institution'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag56a',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]{*}|[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}|[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'intermInst'
    },
    {
      name: 'label',
      value: 'Intermediary Institution'
    },
    {
      name: 'validateObj',
      expression: function(label, value) {
        if ( ! value )
          return label + ' required';

        if ( ! this.REGEX.test(value) )
          return label + ' format is invalid';
        }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag57a',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[/][A-Z]{0,1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]{*}|[[/][A-Z]{1}]*[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{35}]{*}|[[/][A-Z]{1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{*}|[[/][A-Z]{1}]*[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{35}]{0,4}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'accWithInst'
    },
    {
      name: 'label',
      value: 'Account With Institution'
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag58a',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[/][A-Z]{0,1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]{*}|[[/][A-Z]{0,1}]{*}[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4}/
    }
  ],
  properties: [
    {
      name: 'required',
      value: true
    },
    {
      name: 'name',
      value: 'benfInst'
    },
    {
      name: 'label',
      value: 'Beneficiary Institution'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag59a',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]*[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4}|[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]*[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}[[A-Z0-9]{3}]{*}|[[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,34}]{*}[[0-9]{1}[/][a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,33}]{0,4}/
    }
  ],
  properties: [
    {
      name: 'required',
      value: true
    },
    {
      name: 'name',
      value: 'benfCustomer'
    },
    {
      name: 'label',
      value: 'Beneficiary Customer'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag70',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,4}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'remtInf'
    },
    {
      name: 'label',
      value: 'Remittance Information'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag71A',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[A-Z]{3}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'detOfCharges'
    },
    {
      name: 'label',
      value: 'Details of Charges'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag71F',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[A-Z]{3}[d?(\,{1}\d{1,}|d*)]{0,15}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'senderCharges'
    },
    {
      name: 'label',
      value: 'Sender\'s Charges'
    },
    {
      name: 'validateObj',
      expression: function(label, value) {
        if ( ! value )
          return label + ' required';

        if ( ! this.REGEX.test(senderCharges) )
          return label + ' format is invalid';
      }
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag71G',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[A-Z]{3}[d?(\,{1}\d{1,}|d*)]{0,15}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'recieverCharges'
    },
    {
      name: 'label',
      value: 'Receiver\'s Charges'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag72',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,6}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'senderToRecieverInfo'
    },
    {
      name: 'label',
      value: 'Sender to Receiver Information'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.swift.fields',
  name: 'FieldTag77B',
  extends: 'net.nanopay.swift.fields.FieldTagRegexValidated',
  constants: [
    {
      name: 'REGEX',
      type: 'Regex',
      value: /[[a-zA-Z0-9,/,–,?,:,(,),.,,,‘, ,+,\r\n]{0,35}]{0,3}/
    }
  ],
  properties: [
    {
      name: 'name',
      value: 'regReporting'
    },
    {
      name: 'label',
      value: 'Regulatory Reporting'
    }
  ]
});