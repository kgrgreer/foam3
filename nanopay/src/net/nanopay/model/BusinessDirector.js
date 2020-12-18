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
  package: 'net.nanopay.model',
  name: 'BusinessDirector',
  documentation: `
    A business director is a person from a group of managers who leads or
    supervises a particular area of a company.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  messages: [
    { name: 'PROOF_OF_ADDRESS', message: 'Proof of address documents required' },
    { name: 'PROOF_OF_IDENTIFICATION', message: 'Proof of identication documents required' }
  ],

  properties: [
    {
      class: 'String',
      name: 'firstName',
      gridColumns: 6,
      required: true
    },
    {
      class: 'String',
      name: 'lastName',
      gridColumns: 6,
      required: true
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'documentsOfAddress',
      label: 'Please upload proof of address',
      view: function(_, X) {
        let selectSlot = foam.core.SimpleSlot.create({value: 0});
        return foam.u2.MultiView.create({
        views: [
          foam.nanos.fs.fileDropZone.FileDropZone.create({
            files$: X.data.documentsOfAddress$,
            selected$: selectSlot
          }, X),
          foam.nanos.fs.fileDropZone.FilePreview.create({
            data$: X.data.documentsOfAddress$,
            selected$: selectSlot
          })
        ]
        });
      },
      validateObj: function(documentsOfAddress) {
        if ( documentsOfAddress.length === 0 ) {
          return this.PROOF_OF_ADDRESS;
        }
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'documentsOfId',
      label: 'Please upload proof of identification',
      view: function(_, X) {
        let selectSlot = foam.core.SimpleSlot.create({value: 0});
        return foam.u2.MultiView.create({
        views: [
          foam.nanos.fs.fileDropZone.FileDropZone.create({
            files$: X.data.documentsOfId$,
            selected$: selectSlot
          }, X),
          foam.nanos.fs.fileDropZone.FilePreview.create({
            data$: X.data.documentsOfId$,
            selected$: selectSlot
          })
        ]
        });
      },
      validateObj: function(documentsOfId) {
        if ( documentsOfId.length === 0 ) {
          return this.PROOF_OF_IDENTIFICATION;
        }
      }
    }
  ]
});
