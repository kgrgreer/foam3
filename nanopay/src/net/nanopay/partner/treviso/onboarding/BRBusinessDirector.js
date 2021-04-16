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
  package: 'net.nanopay.partner.treviso.onboarding',
  name: 'BRBusinessDirector',
  extends: 'net.nanopay.model.BusinessDirector',

  documentation: `
    A business director is a person from a group of managers who leads or
    supervises a particular area of a company.
    This model is the Brazil extension of the generic BusinessDirector model
  `,

  imports: [
    'brazilVerificationService',
    'countryDAO'
  ],

  javaImports: [
    'net.nanopay.country.br.BrazilVerificationService',
  ],

  messages: [
    { name: 'FOREIGN_ID_ERROR', message: 'Identification Document required' },
    { name: 'NATIONALITY_ERROR', message: 'Nationality required' },
    { name: 'YES', message: 'Yes' },
    { name: 'NO', message: 'No' },
    { name: 'PROOF_OF_ADDRESS', message: 'Proof of address documents required' },
    { name: 'PROOF_OF_IDENTIFICATION', message: 'Proof of identication documents required' },
    { name: 'RICHCHOICE_SELECTION_TITLE', message: 'Countries' }
  ],

  properties: [
    'firstName',
    'lastName',
    {
      class: 'EMail',
      name: 'email',
      required: true
    },
    {
      class: 'String',
      name: 'foreignId',
      label: 'Identification Document (Ex: RG, CNH, OAB, RNE)',
      required: true,
      validationPredicates: [
        {
          args: ['foreignId'],
          predicateFactory: function(e) {
            return e.GTE(
              foam.mlang.StringLength.create({
                arg1: net.nanopay.partner.treviso.onboarding.BRBusinessDirector
                  .FOREIGN_ID }),
                1);
          },
          errorMessage: 'FOREIGN_ID_ERROR'
        }
      ]
    },

    {
      class: 'FObjectProperty',
      name: 'cpf',
      label: '',
      of: 'net.nanopay.country.br.CPF',
      required: true
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'nationality',
      of: 'foam.nanos.auth.Country',
      documentation: `Defined nationality of business director.`,
      required: true,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: X.data.RICHCHOICE_SELECTION_TITLE,
              dao: X.countryDAO
            }
          ]
        };
      },
      validationPredicates: [
        {
          args: ['nationality'],
          predicateFactory: function(e) {
            return e.GTE(
              foam.mlang.StringLength.create({
                arg1: net.nanopay.partner.treviso.onboarding.BRBusinessDirector
                  .NATIONALITY }),
              1);
          },
          errorMessage: 'NATIONALITY_ERROR'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'hasSignedContratosDeCambioDirector',
      label: 'Has this business director signed the foreign exchange contract?',
      help: `
        Foreign exchange contract (Contratos de câmbio) is a legal arrangement in which the
        parties agree to transfer between them a certain amount of foreign exchange at a
        predetermined rate of exchange, and as of a predetermined date.
      `,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'documentsOfAddress',
      label: 'Please upload proof of address',
      view: function(_, X) {
        let selectSlot = foam.core.SimpleSlot.create({ value: 0 });
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
      validationPredicates: [
        {
          args: ['documentsOfAddress'],
          predicateFactory: function(e) {
            return e.HAS(net.nanopay.partner.treviso.onboarding.BRBusinessDirector.DOCUMENTS_OF_ADDRESS);
          },
          errorMessage: 'PROOF_OF_ADDRESS'
        }
      ]
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'documentsOfId',
      label: 'Please upload proof of identification',
      view: function(_, X) {
        let selectSlot = foam.core.SimpleSlot.create({ value: 0 });
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
      validationPredicates: [
        {
          args: ['documentsOfId'],
          predicateFactory: function(e) {
            return e.HAS(net.nanopay.partner.treviso.onboarding.BRBusinessDirector.DOCUMENTS_OF_ID);
          },
          errorMessage: 'PROOF_OF_IDENTIFICATION'
        }
      ]
    }
  ]
});
