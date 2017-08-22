foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'BusinessInformation',

  documentation: 'Business information',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'email',
      required: true
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'profileImageURL'
    },
    {
      class: 'String',
      name: 'defaultContact'
    },
    {
      class: 'String',
      name: 'secureAssetStore',
      required: true
    },
    {
      class: 'Boolean',
      name: 'active'
    },
    {
      class: 'String',
      name: 'businessNumber'
    },
    {
      class: 'String',
      name: 'idVerificationUrl'
    },
    {
      class: 'String',
      name: 'businessVerificationUrl'
    },
    {
      class: 'String',
      name: 'website'
    },
    {
      class: 'Boolean',
      name: 'verified'
    },
    {
      class: 'String',
      name: 'sectorId'
    },
    {
      class: 'String',
      name: 'businessTypeId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.common.model.BankAccount',
      name: 'bankAccount',
      hidden: true,
      factory: function() { return net.nanopay.common.model.BankAccount.create(); }
    },
    {
      class: 'String',
      name: 'businessContact'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'BusinessType',

  documentation: 'Proprietor details for business/businesses',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'BusinessSector',

  documentation: 'Unknown, TODO.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'Device',
  ids: ['serialNumber'],

  tableColumns: ['name', 'type', 'serialNumber', 'status'],

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'type',
      required: true
    },
    {
      class: 'Boolean',
      name: 'active',
      required: true
    },
    {
      class: 'String',
      name: 'serialNumber',
      label: 'Serial No.',
      required: true
    },
    {
      class: 'Double',
      name: 'password',
      required: true
    },
    {
      class: 'String',
      name: 'secureAssetStore'
    },
    {
      class: 'String',
      name: 'certificateId'
    },
    {
      class: 'Boolean',
      name: 'resetPassword'
    },
    {
      class: 'String',
      name: 'status'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'Transaction',

  documentation: 'Transaction information.',

  tableColumns: ['id', 'dateAndTime', 'type', 'customer', 'server', 'tip', 'total', 'device'],

  properties: [
    {
      class: 'Long',
      name: 'id',
      label: 'Transaction ID'
    },
    {
      class: 'String',
      name: 'dateAndTime',
      label: 'Date & Time'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'customer'
    },
    {
      class: 'String',
      name: 'server'
    },
    {
      class: 'Currency',
      name: 'tip',
      required: true
    },
    {
      class: 'Currency',
      name: 'total',
      required: true
    },
    {
      class: 'String',
      name: 'device'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.retail.model',
  extends: 'net.nanopay.common.model.BankAccountInfo',
  name: 'BankAccount',

  ids: ['accountName'],

  documentation: 'Bank Account Information',

  tableColumns: ['accountName', 'bankNumber', 'transitNumber', 'accountNumber', 'status'],

  properties: [
    {
      class: 'String',
      name: 'status',
      value: 'Unverified'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'Merchant',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'firstName',
      required: true
    },
    {
      class: 'String',
      name: 'lastName',
      required: true
    },
    {
      class: 'String',
      name: 'email',
      required: true
    },
    {
      class: 'String',
      name: 'password',
      required: true
    },
    {
      class: 'String',
      name: 'profileImageUrl'
    },
    {
      class: 'Boolean',
      name: 'twoFactorEnabled'
    },
    {
      class: 'String',
      name: 'twoFactorSecretKey'
    },
    {
      name: 'autoCashout'
    },
    {
      name: 'businessInformation'
    },
    {
      class: 'Boolean',
      name: 'emailVerified'
    },
    {
      class: 'Array',
      of: 'net.nanopay.common.Address',
      name: 'addresses'
    },
    {
      class: 'Array',
      of: 'net.nanopay.common.Phone',
      name: 'phones'
    },
    {
      class: 'Array',
      of: 'net.nanopay.common.BankAccount',
      name: 'bankAccounts'
    },
    {
      class: 'Array',
      of: 'net.nanopay.retail.Device',
      name: 'devices'
    }
  ]
});
