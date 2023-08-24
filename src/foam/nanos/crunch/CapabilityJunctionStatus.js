/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.ENUM({
  package: 'foam.nanos.crunch',
  name: 'CapabilityJunctionStatus',
  values: [
    {
      name: 'PENDING',
      label: { en: 'pending', pt: 'pendente'},
      documentation: 'Our team is currently reviewing. Approvals may take up to 24 hours',
      background: '#FFFFFF',
      color: '#865300',
      glyph: 'pending',
      ordinal: 0
    },
    {
      name: 'GRANTED',
      label: { en: 'granted', pt: 'concedida'},
      documentation: 'The information you provided has been approved',
      background: '#FFFFFF',
      color: '#007328',
      glyph: 'checkmark',
      ordinal: 1
    },
    {
      name: 'EXPIRED',
      label: { en: 'expired', pt: 'expirada'},
      documentation: 'The information required has changed, or your inputs are no longer valid',
      background: '#A00B0B',
      color: '#FFFFFF',
      ordinal: 2
    },
    {
      name: 'ACTION_REQUIRED',
      label: { en: 'action required', pt: 'ação requerida'},
      documentation: 'Information is missing for required fields',
      background: '#D57D11',
      color: '#FFFFFF',
      ordinal: 3
    },
    {
      name: 'AVAILABLE',
      label: { en: 'available', pt: 'acessível'},
      documentation: 'You are ready to get started',
      background: '#00B03E',
      color: '#FFFFFF',
      ordinal: 4
    },
    // NOTE: 5 removed
    {
      name: 'APPROVED',
      label: { en: 'approved', pt: 'aprovada'},
      documentation: `- not seen by users - Denoting a UCJ requiring review has been approved. It would need to go through the rules of the ucjDAO before
      being set to granted.`,
      background: '#FFFFFF',
      color: '#007328',
      ordinal: 6
    },
    {
      name: 'PENDING_REVIEW',
      label: { en: 'pending review', pt: 'revisão pendente' },
      documentation: 'The information you provided is pending review',
      background: '#FFFFFF',
      color: '$warn700',
      ordinal: 7
    },
    {
      name: 'REJECTED',
      label: { en: 'rejected', pt: 'rejeitada'},
      documentation: `- not seen by users - Denoting a junction requiring review has been rejected. Meant to mark items in a FINAL rejected state where it is not 
      expected to go to EXPIRED and have the user fill out more info. Used in the 
      Capable object junctions.`,
      background: '#FFFFFF',
      color: '$destructive500',
      glyph: 'exclamation',
      ordinal: 8
    },
  ]
});
