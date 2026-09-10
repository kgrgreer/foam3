/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EditColumnsView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.DetailView',
    'foam.u2.md.OverlayDropdown',
    'foam.u2.view.ColumnConfigPropView',
    'foam.u2.view.SubColumnSelectConfig'
  ],

  imports: [
    'window',
    'table?'
  ],

  css: `
    ^ .foam-u2-ActionView-closeButton {
      width: 24px;
      height: 35px;
      margin: 0;
      cursor: pointer;
      display: inline-block;
      float: right;
      outline: 0;
      border: none;
      background: transparent;
      box-shadow: none;
      padding-top: 15px;
      margin-right: 15px;
    }
    ^ .foam-u2-ActionView-closeButton:hover {
      outline: none;
      border: none;
      background: transparent;
    }
    ^container {
      align-items: flex-start;
      display: flex;
      flex-direction: column;
      width: clamp(18.75rem, 20vw, 37.5rem);
      max-width: calc(100vw - 2rem);
    }
  `,

  constants: {
    DROPDOWN_EDGE_PADDING: 8
  },

  properties: [
    {
      name: 'selectColumnsExpanded',
      class: 'Boolean',
      postSet: function(_, n) {
        n ? this.openDropDown() : this.overlay_?.close();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'overlay_',
      factory: function() {
        return this.OverlayDropdown.create({
          closeOnLeave: false,
          parentEdgePadding: this.DROPDOWN_EDGE_PADDING
        });
      }
    },
    'columnConfigPropView',
    'parentEl',
    'dropdownAnchorEl_',
    'parentId',
    { class: 'Int', name: 'refreshIdx', value: 0 }
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( this.data?.selectedColumnNames$ ) {
        this.onDetach(this.data.selectedColumnNames$.sub(() => {
          this.refresh();
        }));
      }
      this.onDetach(this.overlay_.opened$.sub(() => {
        if ( this.selectColumnsExpanded !== this.overlay_.opened )
          this.selectColumnsExpanded = this.overlay_.opened;
        if ( ! this.overlay_.opened ) this.removeDropdownAnchor_();
      }));
      this.onDetach(() => this.removeDropdownAnchor_());
    },
    function closeDropDown(e) {
      e?.stopPropagation();
      this.columnConfigPropView?.onClose?.();
      this.selectColumnsExpanded = false;
      this.removeDropdownAnchor_();
    },
    function openDropDown() {
      var parentEl = this.resolveParentEl_();
      if ( ! parentEl && this.dropdownAnchorEl_?.isConnected )
        parentEl = this.dropdownAnchorEl_;
      if ( ! parentEl && this.table && this.table.tableEl_ )
        parentEl = this.table.tableEl_.el_ ? this.table.tableEl_.el_() : this.table.tableEl_;
      if ( ! parentEl || parentEl.nodeType !== 1 ) return;

      this.overlay_.parentEl = this.ensureDropdownAnchor_(parentEl);
      this.refresh();
      this.overlay_.open();
    },
    function resolveParentEl_() {
      var parentEl = this.parentEl;
      if ( parentEl && parentEl.el_ ) parentEl = parentEl.el_();
      if ( parentEl && parentEl.nodeType === 1 && parentEl.isConnected )
        return parentEl;

      if ( this.parentId ) {
        parentEl = this.window.document.getElementById(this.parentId);
        if ( parentEl && parentEl.nodeType === 1 && parentEl.isConnected )
          return parentEl;
      }

      return null;
    },
    function ensureDropdownAnchor_(parentEl) {
      var doc = this.window.document;
      var anchor = this.dropdownAnchorEl_;
      if ( ! anchor ) {
        anchor = doc.createElement('span');
        anchor.setAttribute('aria-hidden', 'true');
        anchor.style.position = 'fixed';
        anchor.style.pointerEvents = 'none';
        anchor.style.opacity = '0';
        anchor.style.zIndex = '-1';
        doc.body.appendChild(anchor);
        this.dropdownAnchorEl_ = anchor;
      }

      var rect = parentEl.getBoundingClientRect();
      anchor.style.left = rect.left + 'px';
      anchor.style.top = rect.top + 'px';
      anchor.style.width = rect.width + 'px';
      anchor.style.height = rect.height + 'px';

      return anchor;
    },
    function removeDropdownAnchor_() {
      if ( this.dropdownAnchorEl_ ) {
        this.dropdownAnchorEl_.remove();
        this.dropdownAnchorEl_ = null;
      }
    },
    function render() {
      this.SUPER();
      var self = this;

      this.overlay_.add(this.dynamic(function(refreshIdx) {
        this.start(self.ColumnConfigPropView, { data: self.data }, self.columnConfigPropView$)
          .addClass(self.myClass('container'))
        .end();
      }));
      this.overlay_.write();
      this.onDetach(() => self.overlay_.remove());
    }
  ],

  actions: [
    {
      name: 'closeButton',
      label: '',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        this.columnConfigPropView?.onClose?.();
        this.selectColumnsExpanded = false;
      }
    }
  ],

  listeners: [
    function refresh() { this.refreshIdx++; },
    function updatePosition() {
      if ( this.selectColumnsExpanded )
        this.openDropDown();
    }
  ]
});
