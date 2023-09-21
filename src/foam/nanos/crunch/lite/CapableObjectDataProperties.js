/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableObjectDataProperties',

  properties: [
    {
      name: 'capablePayloads',
      class: 'FObjectArray',
      // javaType: 'java.util.List<foam.nanos.crunch.crunchlite.CapablePayload>',
      of: 'foam.nanos.crunch.CapabilityJunctionPayload',
      columnPermissionRequired: true,
      section: 'capabilityInformation',
      autoValidate: true,
      columnPermissionRequired: true
    },
    {
      name: 'userCapabilityRequirements',
      class: 'StringArray',
      columnPermissionRequired: true,
      section: 'capabilityInformation',
      columnPermissionRequired: true
    },
    {
      name: 'isWizardIncomplete',
      class: 'Boolean',
      section: 'systemInformation',
      transient: true,
      hidden: true
    },
    {
      class: 'StringArray',
      name: 'capabilityIds',
      columnPermissionRequired: true,
      section: 'capabilityInformation'
    },
    {
      class: 'String',
      name: 'DAOKey',
      columnPermissionRequired: true,
      section: 'capabilityInformation',
      visibility: 'HIDDEN'
    }
  ]
});
