/**
 * @license
 * copyright 2022 the foam authors. all rights reserved.
 * http://www.apache.org/licenses/license-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'RequirementSpec',
  documentation: `
    A utility model to represent requirements associated with numerous objects.
  `,

  properties: [
    {
      class: 'Class',
      name: 'requiredOf',
      required: true,
      documentation: `
        Specifies the type of object that the requirements specified by
        'capabilityIds' are relevant to.
      `
    },
    {
      class: 'String',
      name: 'requiredId',
      documentation: `
        An optional property to specify the ID of the object if there are more
        than one relevant object of the class specified by 'requiredOf'.
      `
    },
    {
      class: 'StringArray',
      name: 'capabilityIds'
    }
  ]
});
