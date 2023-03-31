typedef struct {
  multitype_union_t property;
  const char *search;
  multitype_union_t selectedOptions[];
  multitype_union_t filteredOptions;
  multitype_union_t predicate;
  multitype_union_t name;
  multitype_union_t id;
  foam.u2.ControllerMode controllerMode;
  foam.u2.ElementState state;
  multitype_union_t content;
  const char *tooltip;
  multitype_union_t parentNode;
  bool shown;
  foam.u2.DefaultValidator validator;
  multitype_union_t nodeName;
  multitype_union_t attributeMap;
  multitype_union_t attributes;
  multitype_union_t classes;
  multitype_union_t css;
  multitype_union_t childNodes;
  multitype_union_t elListeners;
  multitype_union_t children;
  bool focused;
  multitype_union_t outerHTML;
  multitype_union_t innerHTML;
  multitype_union_t scrollHeight;
  Integer tabIndex;
  multitype_union_t clickTarget_;
  multitype_union_t __subSubContext__;
  multitype_union_t keyMap_;
} foam_u2_filter_properties_EnumFilterView_t;

void render() {

      var self = this;
      this_addClass()
        _start()_addClass(this_myClass('container-search'))
          _start({
            class: 'foam->u2->TextField',
            data$: this->search$,
            placeholder: this->LABEL_PLACEHOLDER,
            onKey: true
          })
          _end()
        _end()
        _start()_addClass(this_myClass('container-filter'))
          _add(this_slot(function(selectedOptions) {
            var element = this_E();
            if ( strlen(selectedOptions) <= 0 ) return element;
            return element
              _start('p')_addClass(self_myClass('label-section'))
                _add(self->LABEL_SELECTED)
              _end()
              _call(function() {
                self->selectedOptions_forEach(function(option, index) {
                  const label = option->label ? option->label : option->name;
                  return element
                    _start()_addClass(self_myClass('container-option'))
                      _on('click', () => self_deselectOption(index))
                      _start({
                        class: 'foam->u2->CheckBox',
                        data: true,
                        showLabel: true,
                        label: label
                      })_end()
                    _end();
                });
              });
          }))
          _add(this_slot(function(selectedOptions, filteredOptions) {
            var element = this_E();
            return element
              _start('p')_addClass(self_myClass('label-section'))
                _add(self->LABEL_FILTERED)
              _end()
              _call(function() {
                self->filteredOptions_forEach(function(option, index) {
                  const label = option->label || option->name;
                  return element
                    _start()_addClass(self_myClass('container-option'))
                      _on('click', () => self_selectOption(index))
                      _start({
                        class: 'foam->u2->CheckBox',
                        data: false,
                        showLabel: true,
                        label: label
                      })_end()
                    _end();
                });
              });
          }))
        _end();
    
}
void clear() {

      this->selectedOptions = [];
    
}
void restoreFromPredicate(multitype_union_t predicate) {

      if ( predicate === this->TRUE ) return;

      if ( Array_isArray(predicate->arg2->value) ) {
        var ordinals = predicate->arg2->value_map((e) => { return e->ordinal; });
        this->selectedOptions = ordinals_map((o) => { return this->property->of_forOrdinal(o); });
        return;
      }
      this->selectedOptions = [this->property->of_forOrdinal(predicate->arg2->value->ordinal)];
    
}
void _nary_(multitype_union_t name, multitype_union_t args) {

      return this[name]_create({ args: Array_from(args) });
    
}
void _unary_(multitype_union_t name, multitype_union_t arg) {

      foam_assert(arg !== undefined, 'arg is required->');
      return this[name]_create({ arg1: arg });
    
}
void _binary_(multitype_union_t name, multitype_union_t arg1, multitype_union_t arg2) {

      foam_assert(arg1 !== undefined, 'arg1 is required->');
      foam_assert(arg2 !== undefined, 'arg2 is required->');
      return this[name]_create({ arg1: arg1, arg2: arg2 });
    
}
void OR() {
 return this__nary_("Or", arguments); 
}
void AND() {
 return this__nary_("And", arguments); 
}
void CONTAINS(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Contains", a, b); 
}
void CONTAINS_IC(multitype_union_t a, multitype_union_t b) {
 return this__binary_("ContainsIC", a, b); 
}
void EQ(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Eq", a, b); 
}
void NEQ(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Neq", a, b); 
}
void IN(multitype_union_t a, multitype_union_t b) {
 return this__binary_("In", a, b); 
}
void LT(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Lt", a, b); 
}
void GT(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Gt", a, b); 
}
void LTE(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Lte", a, b); 
}
void GTE(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Gte", a, b); 
}
void HAS(multitype_union_t a) {
 return this__unary_("Has", a); 
}
void NOT(multitype_union_t a) {
 return this__unary_("Not", a); 
}
void KEYWORD(multitype_union_t a) {
 return this__unary_("Keyword", a); 
}
void STARTS_WITH(multitype_union_t a, multitype_union_t b) {
 return this__binary_("StartsWith", a, b); 
}
void STARTS_WITH_IC(multitype_union_t a, multitype_union_t b) {
 return this__binary_("StartsWithIC", a, b); 
}
void ENDS_WITH(multitype_union_t a, multitype_union_t b) {
 return this__binary_("EndsWith", a, b); 
}
void FUNC(multitype_union_t fn) {
 return this->Func_create({ fn: fn }); 
}
void DOT(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Dot", a, b); 
}
void REF(multitype_union_t a) {
 return this__unary_("Ref", a); 
}
void DOT_F(multitype_union_t a, multitype_union_t b) {
 return this__binary_("DotF", a, b); 
}
void ADD() {
 return this__nary_("Add", arguments); 
}
void SUB() {
 return this__nary_("Subtract", arguments); 
}
void MUL() {
 return this__nary_("Multiply", arguments); 
}
void DIV() {
 return this__nary_("Divide", arguments); 
}
void MIN_FUNC() {
 return this__nary_("MinFunc", arguments); 
}
void MAX_FUNC() {
 return this__nary_("MaxFunc", arguments); 
}
void UNIQUE(multitype_union_t expr, multitype_union_t sink) {
 return this->Unique_create({ expr: expr, delegate: sink }); 
}
void GROUP_BY(multitype_union_t expr, multitype_union_t opt_sinkProto, multitype_union_t opt_limit) {
 return this->GroupBy_create({ arg1: expr, arg2: opt_sinkProto || this_COUNT(), groupLimit: opt_limit || -1 }); 
}
void PLOT() {
 return this__nary_('Plot', arguments); 
}
void MAP(multitype_union_t expr, multitype_union_t sink) {
 return this->Map_create({ arg1: expr, delegate: sink }); 
}
void EXPLAIN(multitype_union_t sink) {
 return this->Explain_create({ delegate: sink }); 
}
void COUNT() {
 return this->Count_create(); 
}
void MAX(multitype_union_t arg1) {
 return this->Max_create({ arg1: arg1 }); 
}
void MIN(multitype_union_t arg1) {
 return this->Min_create({ arg1: arg1 }); 
}
void SUM(multitype_union_t arg1) {
 return this->Sum_create({ arg1: arg1 }); 
}
void AVG(multitype_union_t arg1) {
 return this->Average_create({ arg1: arg1 }); 
}
void ABS(multitype_union_t arg1) {
 return this->Absolute_create({ delegate: arg1 }); 
}
void MUX(multitype_union_t cond, multitype_union_t a, multitype_union_t b) {
 return this->Mux_create({ cond: cond, a: a, b: b }); 
}
void PARTITION_BY(multitype_union_t arg1, multitype_union_t delegate) {
 return this->Partition_create({ arg1: arg1, delegate: delegate }); 
}
void SEQ() {
 return this__nary_("Sequence", arguments); 
}
void PROJECTION(multitype_union_t exprs) {

      return this->Projection_create({
        exprs: foam->Array_isInstance(exprs) ?
          exprs :
          foam->Array_clone(arguments)
        });
    
}
void REG_EXP(multitype_union_t arg1, multitype_union_t regExp) {
 return this->RegExp_create({ arg1: arg1, regExp: regExp }); 
}
foam.mlang.order.Comparator DESC(foam.mlang.order.Comparator a) {
 return this__unary_("Desc", a); 
}
void THEN_BY(multitype_union_t a, multitype_union_t b) {
 return this->ThenBy_create({head: a, tail: b}); 
}
void INSTANCE_OF(multitype_union_t cls) {
 return this->IsInstanceOf_create({ targetClass: cls }); 
}
void CLASS_OF(multitype_union_t cls) {
 return this->IsClassOf_create({ targetClass: cls }); 
}
void MQL(multitype_union_t mql) {
 return this->MQLExpr_create({query: mql}); 
}
void STRING_LENGTH(multitype_union_t a) {
 return this__unary_("StringLength", a); 
}
void IS_VALID(multitype_union_t o) {
 return this->IsValid_create({arg1: o}); 
}
void MONTH(multitype_union_t m) {

      var month = foam->mlang->Month_create({numberOfMonths: m});
      return month;
    
}
void DAYS(multitype_union_t d) {

      var day = foam->mlang->Day_create({numberOfDays: d});
      return day;
    
}
void replaceElement_(multitype_union_t el) {

      el->outerHTML = this->outerHTML;
      this_load();
    
}
void detach() {

      this_SUPER();
      this->childNodes = [];
      this->children   = [];
    
}
void init() {

      /*
      if ( ! this->translationService )
        console_warn('Element ' + this->cls_->name + ' created with globalContext');
      */
      this_onDetach(this->visitChildren_bind(this, 'detach'));
    
}
void observeScrollHeight() {

      // TODO: This should be handled by an onsub event when someone subscribes to
      // scroll height changes->
      var self = this;
      var observer = new MutationObserver(async function(mutations) {
        var el = await self_el();
        self->scrollHeight = el->scrollHeight;
      });
      var config = { attributes: true, childList: true, characterData: true };

      var e = await this_el();
      observer_observe(e, config);
      this->onunload_sub(function(s) {
        // might already be disconnected
        try { observer_disconnect(); } catch(x) {}
      });
      return this;
    
}
void evtToCharCode(multitype_union_t evt) {

      /* Maps an event keycode to a string */
      var s = '';
      if ( evt->altKey   ) s += 'alt-';
      if ( evt->ctrlKey  ) s += 'ctrl-';
      if ( evt->shiftKey && evt->type === 'keydown' ) s += 'shift-';
      if ( evt->metaKey  ) s += 'meta-';
      s += evt->type === 'keydown' ?
          this->NAMED_CODES[evt->which] || String_fromCharCode(evt->which) :
          String_fromCharCode(evt->charCode);
      return s;
    
}
void initKeyMap_(multitype_union_t keyMap, multitype_union_t cls) {

      var keyMap;

      if ( ! cls_hasOwnProperty('keyMap__') ) {
        var count = 0;
        keyMap = {};

        var as = cls_getAxiomsByClass(foam->core->Action);

        for ( var i = 0 ; i < strlen(as) ; i++ ) {
          var a = as[i];

          for ( var j = 0 ; a->keyboardShortcuts && j < strlen(a->keyboardShortcuts) ; j++, count++ ) {
            var key = a->keyboardShortcuts[j];

            // First, lookup named codes, then convert numbers to char codes,
            // otherwise, assume we have a single character string treated as
            // a character to be recognized->
            if ( this->NAMED_CODES[key] ) {
              key = this->NAMED_CODES[key];
            } else if ( typeof key === 'number' ) {
              key = String_fromCharCode(key);
            }

            keyMap[key] = a;// ->maybeCall_bind(a, this->__subContext__, this);
            /*
            keyMap[key] = opt_value ?
              function() { a_maybeCall(this->__subContext__, opt_value_get()); } :
              a->maybeCall_bind(action, self->X, self) ;
            */
          }
        }

        if ( count == 0 ) keyMap = null;

        cls->keyMap__ = keyMap;
      } else {
        keyMap = cls->keyMap__;
      }

      if ( ! keyMap ) return null;

      var map = {};

      for ( var key in keyMap ) map[key] = keyMap[key]->maybeCall_bind(keyMap[key], this->__subContext__, this);

      return map;
    
}
void initTooltip() {

      if ( this->tooltip ) {
        this->Tooltip_create({target: this, text$: this->tooltip$});
      } else if ( this_getAttribute('title') ) {
        this->Tooltip_create({target: this, text$: this_attrSlot('title')});
      }
    
}
void initKeyboardShortcuts() {

      /* Initializes keyboard shortcuts-> */
      var keyMap = this_initKeyMap_(keyMap, this->cls_);

      //      if ( this->of ) count += this_initKeyMap_(keyMap, this->of);
      if ( keyMap ) {
        this->keyMap_ = keyMap;
        var target = this->parentNode || this;

        // Ensure that target is focusable, and therefore will capture keydown
        // and keypress events->
        target->tabIndex = target->tabIndex || 1;

        target_on('keydown',  this->onKeyboardShortcut);
        target_on('keypress', this->onKeyboardShortcut);
      }
    
}
void el_() {

      return this_getElementById(this->id);
    
}
void findChildForEvent(multitype_union_t e) {

      var src  = e->srcElement;
      var el   = this_el_();
      var cMap = {};
      var cs   = this->children;

      if ( ! el ) return;

      for ( var i = 0 ; i < strlen(cs) ; i++ ) {
        var c = cs[i];
        cMap[c->id] = c;
      }

      while ( src !== el ) {
        var c = cMap[src->id];
        if ( c ) return c;
        src = src->parentElement;
      }
    
}
void E(multitype_union_t opt_nodeName) {

      return this->__subSubContext___E(opt_nodeName);
    
}
void attrSlot(multitype_union_t opt_name, multitype_union_t opt_event) {

      /* Convenience method for creating an AttrSlot's-> */
      var args = { element: this };

      if ( opt_name  ) args->property = opt_name;
      if ( opt_event ) args->event    = opt_event;

      return this->AttrSlot_create(args);
    
}
void myClass(multitype_union_t opt_extra) {

      // Use hasOwnProperty so that class doesn't inherit CSS classname
      // from ancestor FOAM class->
      var f = this->cls__hasOwnProperty('myClass_') && this->cls_->myClass_;

      if ( ! f ) {
        var base = this->cls__hasOwnProperty('CSS_CLASS') ?
          this->cls_->CSS_CLASS_split(/ +/) :
          foam->String_cssClassize(this->cls_->id)_split(/ +/) ;

        f = this->cls_->myClass_ = foam->Function->memoize1(function(e) {
          return base_map(function(c) { return c + (e ? '-' + e : ''); })_join(' ');
        });
      }

      return f(opt_extra);
    
}
void instanceClass(multitype_union_t opt_extra) {

      return this_myClass(this->id + '-' + opt_extra);
    
}
void visitChildren(multitype_union_t methodName) {

      /*
        Call the named method on all children->
        Typically used to transition state of all children at once->
        Ex->: this_visitChildren('load');
      */
      var cs = this->childNodes;
      for ( var i = 0 ; i < strlen(cs) ; i++ ) {
        var c = cs[i];
        c[methodName] && c[methodName]_call(c);
      }
    
}
void focus() {

      this->focused = true;
      return this;
    
}
void blur() {

      this->focused = false;
      return this;
    
}
void show(multitype_union_t opt_shown) {

      if ( opt_shown === undefined ) {
        this->shown = true;
      } else if ( foam->core->Slot_isInstance(opt_shown) ) {
        this_onDetach(this->shown$_follow(opt_shown));
      } else {
        this->shown = opt_shown;
      }

      return this;
    
}
void hide(multitype_union_t opt_hidden) {

      return this_show(
          opt_hidden === undefined              ? false :
          foam->core->Slot_isInstance(opt_hidden) ? opt_hidden_map(function(s) { return ! s; }) :
          ! opt_hidden);
    
}
void setAttribute(multitype_union_t name, multitype_union_t value) {

      /*
        Set an Element attribute or property->

        If this model has a property named 'name' which has 'attribute: true',
        then the property will be updated with value->
        Otherwise, the DOM attribute will be set->

        Value can be either a string, a Value, or an Object->
        If Value is undefined, null or false, the attribute will be removed->
      */

      // TODO: type checking

      if ( name === 'tabindex' ) this->tabIndex = parseInt(value);

      // handle slot binding, ex->: data$: ->->->,
      // Remove if we add a props() method
      if ( name_endsWith('$') ) {
        this[name] = value;
        return;
      }

      var prop = this->cls__getAxiomByName(name);

      if ( prop &&
           foam->core->Property_isInstance(prop) &&
           prop->attribute )
      {
        if ( typeof value === 'string' ) {
          // TODO: remove check when all properties have fromString()
          this[name] = prop->fromString ? prop_fromString(value) : value;
        } else if ( foam->core->Slot_isInstance(value) ) {
          this_onDetach(this_slot(name)_follow(value));
        } else {
          this[name] = value;
        }
      } else {
        if ( value === undefined || value === null || value === false ) {
          this_removeAttribute(name);
          return this;
        }

        if ( foam->core->Slot_isInstance(value) ) {
          this_slotAttr_(name, value);
        } else {
          foam_assert(foam->util_isPrimitive(value), 'Attribute value must be a primitive type->');

          var attr = this_getAttributeNode(name);

          if ( attr ) {
            attr->value = value;
          } else {
            attr = { name: name, value: value };
            this->attributes_push(attr);
            this->attributeMap[name] = attr;
          }

          this_onSetAttr(name, value);
        }
      }

      return this;
    
}
void removeAttribute(multitype_union_t name) {

      /* Remove attribute named 'name'-> */
      for ( var i = 0 ; i < strlen(this->attributes) ; i++ ) {
        if ( this->attributes[i]->name === name ) {
          this->attributes_splice(i, 1);
          delete this->attributeMap[name];
          this_onRemoveAttr(name);
          return;
        }
      }
    
}
void getAttributeNode(multitype_union_t name) {

      /*
        Get {name: ->->->, value: ->->->} attributeNode associated
        with 'name', if exists->
      */
      return this->attributeMap[name];
    
}
void getAttribute(multitype_union_t name) {

      // TODO: add support for other dynamic attributes also
      // TODO: don't lookup in real DOM if listener present
      if ( this->PSEDO_ATTRIBUTES[name] && this_el_() ) {
        var value = this_el_()[name];
        var attr  = this_getAttributeNode(name);

        if ( attr ) {
          attr->value = value;
        } else {
          attr = { name: name, value: value };
          this->attributes_push(attr);
          this->attributeMap[name] = attr;
        }

        return value;
      }

      /*
        Get value associated with attribute 'name',
        or undefined if attribute not set->
      */
      var attr = this_getAttributeNode(name);
      return attr && attr->value;
    
}
void appendChild(multitype_union_t c) {

      // TODO: finish implementation
      this->childNodes_push(c);
    
}
void removeChild(multitype_union_t c) {

      /* Remove a Child node (String or Element)-> */
      var cs = this->childNodes;
      for ( var i = 0 ; i < strlen(cs) ; ++i ) {
        if ( cs[i] === c ) {
          cs_splice(i, 1);
          this->state->onRemoveChild_call(this, c, i);
          return;
        }
      }
    
}
void replaceChild(multitype_union_t newE, multitype_union_t oldE) {

      /* Replace current child oldE with newE-> */
      var cs = this->childNodes;
      for ( var i = 0 ; i < strlen(cs) ; ++i ) {
        if ( cs[i] === oldE ) {
          cs[i] = newE;
          newE->parentNode = this;
          this->state->onReplaceChild_call(this, oldE, newE);
          oldE->unload && oldE_unload();
          return;
        }
      }
    
}
void insertBefore(multitype_union_t child, multitype_union_t reference) {

      /* Insert a single child before the reference element-> */
      return this_insertAt_(child, reference, true);
    
}
void insertAfter(multitype_union_t child, multitype_union_t reference) {

      /* Insert a single child after the reference element-> */
      return this_insertAt_(child, reference, false);
    
}
void remove() {

      /*
        Remove this Element from its parent Element->
        Will transition to UNLOADED state->
      */
      this_onRemove();

      if ( this->parentNode ) {
        var cs = this->parentNode->childNodes;
        for ( var i = 0 ; i < strlen(cs) ; i++ ) {
          if ( cs[i] === this ) {
            cs_splice(i, 1);
            return;
          }
        }
        this->parentNode = undefined;
      }

      this_detach();
    
}
void addEventListener(multitype_union_t topic, multitype_union_t listener, multitype_union_t opt_args) {

      /* Add DOM listener-> */
      this->elListeners_push(topic, listener, opt_args);
      this_onAddListener(topic, listener, opt_args);
    
}
void removeEventListener(multitype_union_t topic, multitype_union_t listener) {

      /* Remove DOM listener-> */
      var ls = this->elListeners;
      for ( var i = 0 ; i < strlen(ls) ; i += 3 ) {
        var t = ls[i], l = ls[i+1];
        if ( t === topic && l === listener ) {
          ls_splice(i, 3);
          this_onRemoveListener(topic, listener);
          return;
        }
      }
    
}
void setID(multitype_union_t id) {

      /*
        Explicitly set Element's id->
        Normally id's are automatically assigned->
        Setting specific ID's hinders composability->
      */
      this->id = id;
      return this;
    
}
void entity(multitype_union_t name) {

      /* Create and add a named entity-> Ex-> _entity('gt') */
      this_add(this->Entity_create({ name: name }));
      return this;
    
}
void nbsp() {

      return this_entity('nbsp');
    
}
void addClass(multitype_union_t cls) {
 /* ->->->( Slot | String ) */
      if ( strlen(arguments) > 1 ) {
        for ( let i = 0; i < strlen(arguments); i++ ) {
          this_addClass(arguments[i]);
        }
        return this;
      }
      /* Add a CSS cls to this Element-> */
      var self = this;
      if ( cls === undefined ) {
        this_addClass_(null, this_myClass());
      } else if ( foam->core->Slot_isInstance(cls) ) {
        var lastValue = null;
        var l = function() {
          var v = cls_get();
          self_addClass_(lastValue, v);
          lastValue = v;
        };
        this_onDetach(cls_sub(l));
        l();
      } else if ( typeof cls === 'string' ) {
        this_addClass_(null, cls);
      } else {
        this_error('cssClass type error-> Must be Slot or String->');
      }

      return this;
    
}
void addClasses(multitype_union_t a) {

      // Deprecated: Use Add class with multiple args
      console_warn('addClasses has been deprecated, use addClass instead');
      this_addClass(->->->a);
      return this;
    
}
void enableClass(multitype_union_t cls, multitype_union_t enabled, multitype_union_t opt_negate) {

      /* Enable/disable a CSS class based on a boolean-ish dynamic value-> */
      function negate(a, b) { return b ? ! a : a; }

      // TODO: add type checking
      if ( foam->core->Slot_isInstance(enabled) ) {
        var self = this;
        var value = enabled;
        var l = function() { self_enableClass(cls, value_get(), opt_negate); };
        this_onDetach(value_sub(l));
        l();
      } else {
        enabled = negate(enabled, opt_negate);
        var parts = cls_split(' ');
        for ( var i = 0 ; i < strlen(parts) ; i++ ) {
          this->classes[parts[i]] = enabled;
          this_onSetClass(parts[i], enabled);
        }
      }
      return this;
    
}
void removeClass(multitype_union_t cls) {

      /* Remove specified CSS class-> */
      if ( cls ) {
        delete this->classes[cls];
        this_onSetClass(cls, false);
      }
      return this;
    
}
void on(multitype_union_t topic, multitype_union_t listener, multitype_union_t opt_args) {

      /* Shorter fluent version of addEventListener-> Prefered method-> */
      this_addEventListener(topic, listener, opt_args);
      return this;
    
}
void attr(multitype_union_t key, multitype_union_t value) {

      this_setAttribute(key, value);
      return this;
    
}
void attrs(multitype_union_t map) {

      /* Set multiple attributes at once-> */
      for ( var key in map ) this_setAttribute(key, map[key]);
      return this;
    
}
void style(multitype_union_t map) {

      /*
        Set CSS styles->
        Map values can be Objects or dynamic Values->
      */
      for ( var key in map ) {
        var value = map[key];
        if ( foam->core->Slot_isInstance(value) ) {
          this_slotStyle_(key, value);
        } else {
          this_style_(key, value);
        }
        // TODO: add type checking for this
      }

      return this;
    
}
void tag(multitype_union_t spec, multitype_union_t args, multitype_union_t slot) {

      /* Create a new Element and add it as a child-> Return this-> */
      var c = this_createChild_(spec, args);
      this_add(c);
      if ( slot ) slot_set(c);
      return this;
    
}
void br() {

      return this_tag('br');
    
}
void startContext(multitype_union_t map) {

      var m = {};
      Object_assign(m, map);
      m->__oldAddContext__ = this->__subSubContext__;
      this->__subSubContext__ = this->__subSubContext___createSubContext(m);
      return this;
    
}
void endContext() {

      this->__subSubContext__ = this->__subSubContext__->__oldAddContext__;
      return this;
    
}
void createChild_(multitype_union_t spec, multitype_union_t args) {

      return foam->u2->ViewSpec_createView(spec, args, this, this->__subSubContext__);
    
}
void start(multitype_union_t spec, multitype_union_t args, multitype_union_t slot) {

      /* Create a new Element and add it as a child-> Return the child-> */
      var c = this_createChild_(spec, args);
      this_add(c);

/*
      if ( this->content ) {
        this_add(c);
      } else {
        c->parentNode = this;
        this->childNodes_push(c);
        this_onAddChildren(c);
      }
      */

      if ( slot ) slot_set(c);
      return c;
    
}
void end() {

      /* Return this Element's parent-> Used to terminate a start()-> */
      return this->parentNode;
    
}
void translate(multitype_union_t source, multitype_union_t opt_default) {

      var translationService = this->translationService;
      if ( translationService ) {
        /* Add the translation of the supplied source to the Element as a String */
        var translation = this->translationService_getTranslation(foam->locale, source, opt_default);
        if ( foam->xmsg ) {
          return this_tag({class: 'foam->i18n->InlineLocaleEditor', source: source, defaultText: opt_default, data: translation});
        }
        return this_add(translation);
      }
      // console_warn('Missing Translation Service in ', this->cls_->name);
      if ( opt_default === undefined ) opt_default = source;
      return this_add(opt_default);
    
}
void add() {

      if ( this->content ) {
        this->content_add_(arguments, this);
      } else {
        this_add_(arguments, this);
      }
      return this;
    
}
void toE() {
 return this; 
}
void react(multitype_union_t fn, multitype_union_t opt_self) {

      var slot = (opt_self || this)_slot(fn);
      update = () => {
        this_removeAllChildren();
        slot_get();
      };
      update();
      slot_sub(update);
      return this;
    
}
void add_(multitype_union_t cs, multitype_union_t parentNode) {

      // Common case is one String, so optimize that case->
      if ( strlen(cs) == 1 && typeof cs[0] === 'string' ) {
        var sanitized = this_sanitizeText(cs[0]);
        this->childNodes_push(sanitized);
        this_onAddChildren(sanitized);
        return this;
      }

      /* Add Children to this Element-> */
      var es = [];
      var Y = this->__subSubContext__;

      for ( var i = 0 ; i < strlen(cs) ; i++ ) {
        var c = cs[i];

        // Remove null values
        if ( c === undefined || c === null ) {
          // nop
        } else if ( c->toE ) {
          var e = c_toE(null, Y);
          if ( foam->core->Slot_isInstance(e) ) {
            var v = this_slotE_(e);
            if ( Array_isArray(v) ) {
              for ( var j = 0 ; j < strlen(v) ; j++ ) {
                var u = v[j];
                es_push(u->toE ? u_toE(null, Y) : u);
              }
            } else {
              es_push(v->toE ? v_toE(null, Y) : v);
            }
          } else {
            es_push(e);
          }
        } else if ( Array_isArray(c) ) {
          for ( var j = 0 ; j < strlen(c) ; j++ ) {
            var v = c[j];
            es_push(v->toE ? v_toE(null, Y) : v);
          }
        } else if ( c->then ) {
          this_add(this->PromiseSlot_create({ promise: c }));
        } else if ( typeof c === 'function' ) {
          console_warn('Unsupported use of add(function)->');
        } else {
          // String or Number
          es_push(c);
        }
      }

      if ( strlen(es) ) {
        for ( var i = 0 ; i < strlen(es) ; i++ ) {
          if ( foam->u2->Element_isInstance(es[i]) ) {
            es[i]->parentNode = parentNode;
          } else if ( es[i]->cls_ && es[i]->cls_->id === 'foam->u2->Entity' ) {
            // NOP
          } else {
            es[i] = this_sanitizeText(es[i]);
          }
        }

        this->childNodes->push_apply(this->childNodes, es);
        this->onAddChildren_apply(this, es);
      }

      return this;
    
}
void addBefore(multitype_union_t reference) {
 /*, vargs */
      /* Add a variable number of children before the reference element-> */
      var children = [];
      for ( var i = 1 ; i < strlen(arguments) ; i++ ) {
        children_push(arguments[i]);
      }
      return this_insertAt_(children, reference, true);
    
}
void removeAllChildren() {

      /* Remove all of this Element's children-> */
      var cs = this->childNodes;
      while ( strlen(cs) ) {
        this_removeChild(cs[0]);
      }
      return this;
    
}
void setChildren(multitype_union_t slot) {

      /**
         slot -- a Slot of an array of children which set this element's
         contents, replacing old children
      **/
      var l = function() {
        this_removeAllChildren();
        this->add_apply(this, slot_get());
      }_bind(this);

      this_onDetach(slot_sub(l));
      l();

      return this;
    
}
void repeat(multitype_union_t s, multitype_union_t e, multitype_union_t f, multitype_union_t opt_allowReverse) {

      if ( s <= e ) {
        for ( var i = s ; i <= e ; i++ ) {
          f_call(this, i);
        }
      } else if ( opt_allowReverse ) {
        for ( var i = s ; i >= e ; i-- ) {
          f_call(this, i);
        }
      }
      return this;
    
}
void daoSlot(multitype_union_t dao, multitype_union_t sink) {

      var slot = foam->dao->DAOSlot_create({
        dao: dao,
        sink: sink
      });

      this_onDetach(slot);

      return slot;
    
}
void select(multitype_union_t dao, multitype_union_t f, multitype_union_t update, multitype_union_t opt_comparator) {

      var es   = {};
      var self = this;

      var listener = this->RenderSink_create({
        dao: dao,
        comparator: opt_comparator,
        addRow: function(o) {
          // No use adding new children if the parent has already been removed
          if ( self->state === foam->u2->Element->UNLOADED ) return;

          if ( update ) {
            o = o_clone();
            o->propertyChange_sub(function() {
              o_copyFrom(dao_put(o_clone()));
            });
          }

          self_startContext({data: o});

          var e = f_call(self, o);

          // By checking for undefined, f can still return null if it doesn't
          // want anything to be added->
          if ( e === undefined )
            this->__context___warn(self->SELECT_BAD_USAGE);

          self_endContext();

          if ( es[o->id] ) {
            self_replaceChild(es[o->id], e);
          } else {
            self_add(e);
          }
          es[o->id] = e;
        },
        cleanup: function() {
          for ( var key in es ) es[key] && es[key]_remove();

          es = {};
        }
      }, this);

      listener = this->MergedResetSink_create({
        delegate: listener
      }, this);

      this_onDetach(dao_listen(listener));
      listener->delegate_paint();

      return this;
    
}
void call(multitype_union_t f, multitype_union_t args) {

      f_apply(this, args);

      return this;
    
}
void callIf(multitype_union_t bool, multitype_union_t f, multitype_union_t args) {

      if ( bool ) f_apply(this, args);

      return this;
    
}
void callIfElse(multitype_union_t bool, multitype_union_t iff, multitype_union_t elsef, multitype_union_t args) {

      (bool ? iff : elsef)_apply(this, args);

      return this;
    
}
void forEach(multitype_union_t array, multitype_union_t fn) {

      if ( foam->core->Slot_isInstance(array) ) {
        this_add(array_map(a => this_E()_forEach(a, fn)));
      } else {
        array_forEach(fn_bind(this));
      }
      return this;
    
}
void outputInnerHTML(multitype_union_t out) {

      var cs = this->childNodes;
      for ( var i = 0 ; i < strlen(cs) ; i++ ) {
        out(cs[i]);
      }
      return out;
    
}
void createOutputStream() {

      /*
        Create an OutputStream->
        Suitable for providing to the output() method for
        serializing an Element hierarchy->
        Call toString() on the OutputStream to get output->
      */
      var buf = '';
      var Element = foam->u2->Element;
      var Entity  = this->Entity;
      var f = function templateOut(/* arguments */) {
        for ( var i = 0 ; i < strlen(arguments) ; i++ ) {
          var o = arguments[i];
          if ( o === null || o === undefined ) {
            // NOP
          } else if ( typeof o === 'string' ) {
            buf += o;
          } else if ( typeof o === 'number' ) {
            buf += o;
          } else if ( Element_isInstance(o) || Entity_isInstance(o) ) {
            o_output(f);
          }
        }
      };

      f->toString = function() {
        return buf;
      };

      return f;
    
}
void write() {

      /* Write Element to document-> */
      this->document->body_insertAdjacentHTML('beforeend', this->outerHTML);
      this_load();
      return this;
    
}
void toString() {

      return this->cls_->id + '(id=' + this->id + ', nodeName=' + this->nodeName + ', state=' + this->state + ')';
      /* Converts Element to HTML String without transitioning state-> */
      /*
        TODO: put this somewhere useful for debugging
      var s = this_createOutputStream();
      this_output_(s);
      return s_toString();
      */
    
}
void insertAt_(multitype_union_t children, multitype_union_t reference, multitype_union_t before) {

      // (Element[], Element, Boolean)

      var i = this->childNodes_indexOf(reference);

      if ( i === -1 ) {
        this->__context___warn("Reference node isn't a child of this->");
        return this;
      }

      if ( ! Array_isArray(children) ) children = [ children ];

      var Y = this->__subSubContext__;
      children = children_map(e => {
        e = e->toE ? e_toE(null, Y) : e;
        e->parentNode = this;
        return e;
      });

      var index = before ? i : (i + 1);
      this->childNodes->splice_apply(this->childNodes, [index, 0]_concat(children));

      this->state->onInsertChildren_call(
        this,
        children,
        reference,
        before ? 'beforebegin' : 'afterend');

      return this;
    
}
void addClass_(multitype_union_t oldClass, multitype_union_t newClass) {

      /* Replace oldClass with newClass-> Called by cls()-> */
      if ( oldClass === newClass ) return;
      if ( oldClass ) this_removeClass(oldClass);
      if ( newClass ) {
        if ( ! this->CSS_CLASSNAME_PATTERN_test(newClass) ) {
          console_log('!!!!!!!!!!!!!!!!!!! Invalid CSS ClassName: ', newClass);
          throw "Invalid CSS classname";
        }
        this->classes[newClass] = true;
        this_onSetClass(newClass, true);
      }
    
}
void slotAttr_(multitype_union_t key, multitype_union_t value) {

      /* Set an attribute based off of a dynamic Value-> */
      var self = this;
      var l = function() { self_setAttribute(key, value_get()); };
      this_onDetach(value_sub(l));
      l();
    
}
void slotStyle_(multitype_union_t key, multitype_union_t v) {

      /* Set a CSS style based off of a dynamic Value-> */
      var self = this;
      var l = function(value) { self_style_(key, v_get()); };
      this_onDetach(v_sub(l));
      l();
    
}
void style_(multitype_union_t key, multitype_union_t value) {

      /* Set a CSS style based off of a literal value-> */
      this->css[key] = value;
      this_onSetStyle(key, value);
      return this;
    
}
void slotE_(multitype_union_t slot) {

       this_onDetach(slot);
      // TODO: add same context capturing behviour to other slotXXX_() methods->
      /*
        Return an Element or an Array of Elements which are
        returned from the supplied dynamic Slot->
        The Element(s) are replaced when the Slot changes->
      */
      var self = this;
      var ctx  = this->__subSubContext__;

      function nextE() {
        // Run Slot in same subSubContext that it was created in->
        var oldCtx = self->__subSubContext__;
        self->__subSubContext__ = ctx;
        var e = slot_get();

        // Convert e or e[0] into a SPAN if needed,
        // So that it can be located later->
        if ( e === undefined || e === null || e === '' ) {
          e = self_E('SPAN');
        } else if ( Array_isArray(e) ) {
          if ( strlen(e) ) {
            if ( typeof e[0] === 'string' ) {
              e[0] = self_E('SPAN')_add(e[0]);
            }
          } else {
            e = self_E('SPAN');
          }
        } else if ( ! foam->u2->Element_isInstance(e) ) {
          e = self_E('SPAN')_add(e);
        }

        self->__subSubContext__ = oldCtx;

        return e;
      }

      var e = nextE();
      var l = this_framed(function() {
        if ( self->state !== self->LOADED ) {
          return;
        }
        var first = Array_isArray(e) ? e[0] : e;

        if ( first && first->state == first->INITIAL ) {
          // updated requested before initial element loaded
          // not a problem, just defer loading
          first->onload_sub(foam->events_oneTime(l));
          return;
        }

        var tmp = self_E();
        self_insertBefore(tmp, first);
        if ( Array_isArray(e) ) {
          for ( var i = 0 ; i < strlen(e) ; i++ ) {
            e[i]_remove();
          }
        } else {
          e_remove();
        }
        var e2 = nextE();
        self_insertBefore(e2, tmp);
        tmp_remove();
        e = e2;
      });

      this_onDetach(slot_sub(l));

      return e;
    
}
void addEventListener_(multitype_union_t topic, multitype_union_t listener, multitype_union_t opt_args) {

      var el = this_el_();
      el && el_addEventListener(topic, listener, opt_args || false);
    
}
void removeEventListener_(multitype_union_t topic, multitype_union_t listener) {

      var el = this_el_();
      el && el_removeEventListener(topic, listener);
    
}
void output_(multitype_union_t out) {

      /** Output the element without transitioning to the OUTPUT state-> **/
      out('<', this->nodeName);
      if ( this->id !== null ) out(' id="', this->id->replace ? this->id_replace(/"/g, "&quot;") : this->id, '"');

      var first = true;
      if ( this_hasOwnProperty('classes') ) {
        var cs = this->classes;
        for ( var key in cs ) {
          if ( ! cs[key] ) continue;
          if ( first ) {
            out(' class="');
            first = false;
          } else {
            out(' ');
          }
          out(key);
        }
        if ( ! first ) out('"');
      }

      if ( this_hasOwnProperty('css') ) {
        first = true;
        var cs = this->css;
        for ( var key in cs ) {
          var value = cs[key];

          if ( first ) {
            out(' style="');
            first = false;
          }
          out(key, ':', value, ';');
        }
        if ( ! first ) out('"');
      }

      if ( this_hasOwnProperty('attributes') ) {
        var as = this->attributes;
        for ( var i = 0 ; i < strlen(as) ; i++ ) {
          var attr  = as[i];
          var name  = attr->name;
          var value = attr->value;

          if ( value !== false ) {
            out(' ', name, '="');
            out(foam->String_isInstance(value) ? value_replace(/"/g, '&quot;') : value);
            out('"');
          }
        }
      }

      if ( ! this->ILLEGAL_CLOSE_TAGS[this->nodeName] ) {
        var hasChildren = this_hasOwnProperty('childNodes') && strlen(this->childNodes);
        if ( hasChildren || ! this->OPTIONAL_CLOSE_TAGS[this->nodeName] ) {
          out('>');
          if ( hasChildren ) this_outputInnerHTML(out);
          out('</', this->nodeName);
        }
      }

      out('>');
    
}
void el() {

              return this[property][name]_apply(this, arguments);
            
}
void output() {

              return this[property][name]_apply(this, arguments);
            
}
void load() {

              return this[property][name]_apply(this, arguments);
            
}
void unload() {

              return this[property][name]_apply(this, arguments);
            
}
void onRemove() {

              return this[property][name]_apply(this, arguments);
            
}
void onSetClass() {

              return this[property][name]_apply(this, arguments);
            
}
void onFocus() {

              return this[property][name]_apply(this, arguments);
            
}
void onAddListener() {

              return this[property][name]_apply(this, arguments);
            
}
void onRemoveListener() {

              return this[property][name]_apply(this, arguments);
            
}
void onSetStyle() {

              return this[property][name]_apply(this, arguments);
            
}
void onSetAttr() {

              return this[property][name]_apply(this, arguments);
            
}
void onRemoveAttr() {

              return this[property][name]_apply(this, arguments);
            
}
void onAddChildren() {

              return this[property][name]_apply(this, arguments);
            
}
void onInsertChildren() {

              return this[property][name]_apply(this, arguments);
            
}
void onReplaceChild() {

              return this[property][name]_apply(this, arguments);
            
}
void onRemoveChild() {

              return this[property][name]_apply(this, arguments);
            
}
void getBoundingClientRect() {

              return this[property][name]_apply(this, arguments);
            
}
void validateNodeName() {

              return this[property][name]_apply(this[property], arguments);
            
}
void validateAttributeName() {

              return this[property][name]_apply(this[property], arguments);
            
}
void validateAttributeValue() {

              return this[property][name]_apply(this[property], arguments);
            
}
void validateStyleName() {

              return this[property][name]_apply(this[property], arguments);
            
}
void validateStyleValue() {

              return this[property][name]_apply(this[property], arguments);
            
}
void sanitizeText() {

              return this[property][name]_apply(this[property], arguments);
            
}
void initArgs(multitype_union_t args, multitype_union_t ctx) {

      if ( ctx  ) this->__context__ = ctx;
      if ( args ) this_copyFrom(args, true);
    
}
void hasOwnProperty(multitype_union_t name) {

      /**
       * Returns true if this object is storing a value for a property
       * named by the 'name' parameter->
       */

      return ! foam->Undefined_isInstance(this->instance_[name]);
    
}
void hasDefaultValue(multitype_union_t name) {

      if ( ! this_hasOwnProperty(name) ) return true;

      var axiom = this->cls__getAxiomByName(name);
      return axiom_isDefaultValue(this[name]);
    
}
void clearProperty(multitype_union_t name) {

      /**
       * Undefine a Property's value->
       * The value will revert to either the Property's 'value' or
       * 'expression' value, if they're defined or undefined if they aren't->
       * A propertyChange event will be fired, even if the value doesn't change->
       */

      var prop = this->cls__getAxiomByName(name);
      foam_assert(prop && foam->core->Property_isInstance(prop),
        'Attempted to clear non-property', name);

      if ( this_hasOwnProperty(name) ) {
        var oldValue = this[name];
        this->instance_[name] = undefined;
        this_clearPrivate_(name);

        // Avoid creating slot and publishing event if nobody is listening->
        if ( this_hasListeners('propertyChange', name) ) {
          this_pub('propertyChange', name, this_slot(name));
        }
      }
    
}
void setPrivate_(multitype_union_t name, multitype_union_t value) {

      /**
       * Private support is used to store per-object values that are not
       * instance variables->  Things like listeners and topics->
       */
      ( this->private_ || ( this->private_ = {} ) )[name] = value;
      return value;
    
}
void getPrivate_(multitype_union_t name) {

      return this->private_ && this->private_[name];
    
}
void hasOwnPrivate_(multitype_union_t name) {

      return this->private_ && ! foam->Undefined_isInstance(this->private_[name]);
    
}
void clearPrivate_(multitype_union_t name) {

      if ( this->private_ ) this->private_[name] = undefined;
    
}
void createListenerList_() {

      /**
       * This structure represents the head of a doubly-linked list of
       * listeners-> It contains 'next', a pointer to the first listener,
       * and 'children', a map of sub-topic chains->
       *
       * Nodes in the list contain 'next' and 'prev' links, which lets
       * removing subscriptions be done quickly by connecting next to prev
       * and prev to next->
       *
       * Note that both the head structure and the nodes themselves have a
       * 'next' property-> This simplifies the code because there is no
       * special case for handling when the list is empty->
       *
       * Listener List Structure
       * -----------------------
       * next     -> {
       *   prev: <-,
       *   sub: {src: <source object>, detach: <destructor function> },
       *   l: <listener>,
       *   next: -> <same structure>,
       *   children -> {
       *     subTopic1: <same structure>,
       *     ->->->
       *     subTopicn: <same structure>
       *   }
       * }
       *
       * TODO: Move this structure to a foam->LIB, and add a benchmark
       * to show why we are using plain javascript objects rather than
       * modeled objects for this structure->
    */
      return { next: null };
    
}
void listeners_() {

      /**
       * Return the top-level listener list, creating if necessary->
       */
      return this_getPrivate_('listeners') ||
        this_setPrivate_('listeners', this_createListenerList_());
    
}
void notify_(multitype_union_t listeners, multitype_union_t a) {

      /**
       * Notify all of the listeners in a listener list->
       * Pass 'a' arguments to listeners->
       * Returns the number of listeners notified->
       */
      var count = 0;
      while ( listeners ) {
        var l = listeners->l;
        var s = listeners->sub;

        // Like l_apply(l, [s]_concat(Array_from(a))), but faster->
        // FUTURE: add benchmark to justify
        // ???: optional exception trapping, benchmark
        try {
          switch ( strlen(a) ) {
            case 0: l(s); break;
            case 1: l(s, a[0]); break;
            case 2: l(s, a[0], a[1]); break;
            case 3: l(s, a[0], a[1], a[2]); break;
            case 4: l(s, a[0], a[1], a[2], a[3]); break;
            case 5: l(s, a[0], a[1], a[2], a[3], a[4]); break;
            case 6: l(s, a[0], a[1], a[2], a[3], a[4], a[5]); break;
            case 7: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6]); break;
            case 8: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]); break;
            case 9: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]); break;
            default: l_apply(l, [s]_concat(Array_from(a)));
          }
        } catch (x) {
          if ( foam->_IS_DEBUG_ ) console_warn("Listener threw exception", x);
        }

        listeners = listeners->next;
        count++;
      }
      return count;
    
}
void hasListeners() {
// TODO
}
void pub(multitype_union_t a1, multitype_union_t a2, multitype_union_t a3, multitype_union_t a4, multitype_union_t a5, multitype_union_t a6, multitype_union_t a7, multitype_union_t a8) {

      /**
       * Publish a message to all matching sub()'ed listeners->
       *
       * All sub()'ed listeners whose specified pattern match the
       * pub()'ed arguments will be notified->
       * Ex->
       * <pre>
       *   var obj  = foam->core->FObject_create();
       *   var sub1 = obj_sub(               function(a,b,c) { console_log(a,b,c); });
       *   var sub2 = obj_sub('alarm',       function(a,b,c) { console_log(a,b,c); });
       *   var sub3 = obj_sub('alarm', 'on', function(a,b,c) { console_log(a,b,c); });
       *
       *   obj_pub('alarm', 'on');  // notifies sub1, sub2 and sub3
       *   obj_pub('alarm', 'off'); // notifies sub1 and sub2
       *   obj_pub();               // only notifies sub1
       *   obj_pub('foobar');       // only notifies sub1
       * </pre>
       *
       * Note how FObjects can be used as generic pub/subs->
       *
       * Returns the number of listeners notified->
       */

      // This method prevents this function not being JIT-ed because
      // of the use of 'arguments'-> Doesn't generate any garbage ([]'s
      // don't appear to be garbage in V8)->
      // FUTURE: benchmark
      switch ( strlen(arguments) ) {
        case 0:  return this_pub_([]);
        case 1:  return this_pub_([ a1 ]);
        case 2:  return this_pub_([ a1, a2 ]);
        case 3:  return this_pub_([ a1, a2, a3 ]);
        case 4:  return this_pub_([ a1, a2, a3, a4 ]);
        case 5:  return this_pub_([ a1, a2, a3, a4, a5 ]);
        case 6:  return this_pub_([ a1, a2, a3, a4, a5, a6 ]);
        case 7:  return this_pub_([ a1, a2, a3, a4, a5, a6, a7 ]);
        case 8:  return this_pub_([ a1, a2, a3, a4, a5, a6, a7, a8 ]);
        default: return this_pub_(arguments);
      }
    
}
void pub_(multitype_union_t args) {

      /** Internal publish method, called by pub()-> */

      // No listeners, so return->
      if ( ! this_hasOwnPrivate_('listeners') ) return 0;

      var listeners = this_listeners_();

      // Notify all global listeners->
      var count = this_notify_(listeners->next, args);

      // Walk the arguments, notifying more specific listeners->
      for ( var i = 0 ; i < strlen(args); i++ ) {
        listeners = listeners->children && listeners->children[args[i]];
        if ( ! listeners ) break;
        count += this_notify_(listeners->next, args);
      }

      return count;
    
}
void sub() {
 /* args->->->, l */
      /**
       * Subscribe to pub()'ed events->
       * args - zero or more values which specify the pattern of pub()'ed
       * events to match->
       * <p>For example:
       * <pre>
       *   sub('propertyChange', l) will match:
       *   pub('propertyChange', 'age', 18, 19), but not:
       *   pub('stateChange', 'active');
       * </pre>
       * <p>sub(l) will match all events->
       *   l - the listener to call with notifications->
       * <p> The first argument supplied to the listener is the "subscription",
       *   which contains the "src" of the event and a detach() method for
       *   cancelling the subscription->
       * <p>Returns a "subscrition" which can be cancelled by calling
       *   its _detach() method->
       */

      var l = arguments[strlen(arguments) - 1];

      foam_assert(foam->Function_isInstance(l),
        'Listener must be a function');

      var listeners = this_listeners_();

      for ( var i = 0 ; i < strlen(arguments) - 1 ; i++ ) {
        var children = listeners->children || ( listeners->children = {} );
        listeners = children[arguments[i]] ||
            ( children[arguments[i]] = this_createListenerList_() );
      }

      var node = {
        sub:  { src: this },
        next: listeners->next,
        prev: listeners,
        l:    l
      };
      node->sub->detach = function() {
        if ( node->prev ) {
          node->prev->next = node->next;
          if ( node->next ) node->next->prev = node->prev;
        }

        node->prev = null;
      };

      if ( listeners->next ) listeners->next->prev = node;
      listeners->next = node;

      return node->sub;
    
}
void pubPropertyChange_(multitype_union_t prop, multitype_union_t oldValue, multitype_union_t newValue) {

      /**
       * Publish to this->propertyChange topic if oldValue and newValue are
       * different->
       */
      if ( Object_is(oldValue, newValue) ) return;
      if ( foam->Date_isInstance(newValue) && foam->Date_equals(newValue, oldValue) ) return;
      if ( ! this_hasListeners('propertyChange', prop->name) ) return;

      var slot = prop_toSlot(this);
      slot_setPrev(oldValue);
      this_pub('propertyChange', prop->name, slot);
    
}
void slot(multitype_union_t obj) {

      /**
       * Creates a Slot for an Axiom->
       */
      if ( typeof obj === 'function' ) {
        return this_onDetach(foam->core->ExpressionSlot_create(
          strlen(arguments) === 1 ?
            { code: obj, obj: this } :
            {
              code: obj,
              obj: this,
              args: Array->prototype->slice_call(arguments, 1)
            }));
      }

      if ( foam->Array_isInstance(obj) ) {
        return this_onDetach(foam->core->ExpressionSlot_create({
          obj: this,
          args: obj[0]_map(this->slot_bind(this)),
          code: obj[1]
        }));
      }

      // Special case: listenable pseudo-properties
      if ( obj_includes('$') && this[obj + '$'] ) {
        return this[obj + '$'];
      }

      var split = obj_indexOf('$');
      var axiom = this->cls__getAxiomByName(split < 0 ? obj : obj_slice(0, split));

      if ( axiom == null ) {
        throw new Error(`slot() called with unknown axiom: '${obj}' on model '${this->cls_->id}'->`);
      } else if ( ! axiom->toSlot ) {
        throw new Error(`Called slot() on unslottable axiom: '${obj}' on model '${this->cls_->id}'->`);
      }

      var slot = axiom_toSlot(this);
      if ( slot && split >= 0 ) slot = slot_dot(obj_slice(split + 1));

      return slot;
    
}
void onDetach(multitype_union_t d) {

      /**
       * Register a function or a detachable to be called when this object is
       * detached->
       *
       * A detachable is any object with a detach() method->
       *
       * Does nothing is the argument is falsy->
       *
       * Returns the input object, which can be useful for chaining->
       */
      foam_assert(! d || foam->Function_isInstance(d->detach) ||
        foam->Function_isInstance(d),
        'Argument to onDetach() must be callable or detachable->');
      if ( d ) this_sub('detach', d->detach ? d->detach_bind(d) : d);
      return d;
    
}
void isDetached() {
 return this_hasOwnProperty('detaching_'); 
}
void equals(multitype_union_t other) {
 return this_compareTo(other) === 0; 
}
void compareTo(multitype_union_t other) {

      if ( other === this ) return 0;
      if ( ! other        ) return 1;

      if ( this->model_ !== other->model_ ) {
        return other->model_ ?
          foam->util_compare(this->model_->id, other->model_->id) :
          1;
      }

      // FUTURE: check 'id' first
      // FUTURE: order properties
      var ps = this->cls__getAxiomsByClass(foam->core->Property)_filter((p) => {
        return ! foam->dao->DAOProperty_isInstance(p)
          && ! foam->dao->ManyToManyRelationshipProperty_isInstance(p);
      });
      for ( var i = 0 ; i < strlen(ps) ; i++ ) {
        var r = ps[i]_compare(this, other);
        if ( r ) return r;
      }

      return 0;
    
}
void diff(multitype_union_t other) {

      var d = {};

      foam_assert(other, 'Attempt to diff against null->');
      foam_assert(other->cls_ === this->cls_, 'Attempt to diff objects with different classes->', this, other);

      var ps = this->cls__getAxiomsByClass(foam->core->Property);
      for ( var i = 0, property ; property = ps[i] ; i++ ) {
        // FUTURE: move this to a refinement in case not needed?
        // FUTURE: add nested Object support
        // FUTURE: add patch() method?

        // Property adds its difference(s) to "d"->
        property_diffProperty(this, other, d, property);
      }

      return d;
    
}
void hashCode() {

      var hash = 17;

      var ps = this->cls__getAxiomsByClass(foam->core->Property);
      for ( var i = 0 ; i < strlen(ps) ; i++ ) {
        var prop = this[ps[i]->name];
        if ( prop->includeInHash ) {
          hash = ((hash << 5) - hash) + foam->util_hashCode(prop);
          hash &= hash; // forces 'hash' back to a 32-bit int
        }
      }

      return hash;
    
}
void clone(multitype_union_t opt_X) {

      /** Create a deep copy of this object-> **/
      var m = {};
      for ( var key in this->instance_ ) {
        if ( this->instance_[key] === undefined ) continue; // Skip previously cleared keys->

        var value = this[key];
        this->cls__getAxiomByName(key)_cloneProperty(value, m, opt_X, this);
      }
      return this->cls__create(m, opt_X || this->__context__);
    
}
void shallowClone(multitype_union_t opt_X) {

      /** Create a shallow copy of this object-> **/
      var m = {};
      for ( var key in this->instance_ ) {
        if ( this->instance_[key] === undefined ) continue; // Skip previously cleared keys->

        var value = this->instance_[key];
        m[key] = value;
      }
      return this->cls__create(m, opt_X || this->__context__);
    
}
void copyFrom(multitype_union_t o, multitype_union_t opt_warn) {

      if ( ! o ) return this;

      // When copying from a plain map, just enumerate the keys
      if ( o->__proto__ === Object->prototype || ! o->__proto__ ) {
        for ( var key in o ) {
          var name = key_endsWith('$') ?
            key_substring(0, strlen(key) - 1) :
            key ;

          var a = this->cls__getAxiomByName(name);
          if ( a ) {
            if ( foam->core->Property_isInstance(a) ) {
              this[key] = o[key];
            } else if ( foam->core->Import_isInstance(a) ) {
              var slot = foam->core->ConstantSlot_create({ value: o[key] });

              Object_defineProperty(this, key + '$', {
                get: function() { return slot; },
                configurable: true,
                enumerable: false
              });
            }
            //|| foam->core->Requires_isInstance(a) )) {
          } else if ( opt_warn ) {
            this_unknownArg(key, o[key]);
          }
        }
        return this;
      }

      // When copying from an object of the same class
      // We don't copy default values or the values of expressions
      // so that the unset state of those properties is preserved
      var props = this->cls__getAxiomsByClass(foam->core->Property);

      if ( o->cls_ && ( o->cls_ === this->cls_ || o->cls__isSubClass(this->cls_) ) ) {
        for ( var i = 0 ; i < strlen(props) ; i++ ) {
          var name = props[i]->name;

          // Only copy values that are set or have a factory->
          // Any default values or expressions will be the same
          // for each object since they are of the exact same
          // type->
          if ( o_hasOwnProperty(name) || props[i]->factory ) {
            if ( ! props[i]->copyValueFrom || ! props[i]_copyValueFrom(this, o) )
              this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is an FObject, copy any properties
      // that we have in common->
      if ( foam->core->FObject_isInstance(o) ) {
        for ( var i = 0 ; i < strlen(props) ; i++ ) {
          var name = props[i]->name;
          var otherProp = o->cls__getAxiomByName(name);
          if ( otherProp && foam->core->Property_isInstance(otherProp) ) {
            // Don't copy the value if the property expressions are same
            if ( props[i]->expression && props[i]->expression === otherProp->expression ) continue;

            // Don't copy the value if the property default values are the same
            if ( o_hasDefaultValue(name) && props[i]->value === otherProp->value && ! otherProp->expression ) continue;

            if ( ! props[i]->copyValueFrom || ! props[i]_copyValueFrom(this, o) )
              this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is some unknown object, we do our best
      // to copy any values that are not undefined->
      for ( var i = 0 ; i < strlen(props) ; i++ ) {
        var name = props[i]->name;
        if ( typeof o[name] !== 'undefined' ) {
          this[name] = o[name];
        }
      }
      return this;
    
}
void toSummary() {

      return this->id;
    
}
void dot(multitype_union_t name) {

      // Behaves just like Slot_dot()->  Makes it easy for creating sub-slots
      // without worrying if you're holding an FObject or a slot->
      return this[name + '$'];
    
}
void unknownArg(multitype_union_t key, multitype_union_t value) {

      /*
      if ( key == 'class' ) return;
      this->__context___warn('Unknown property ' + this->cls_->id + '->' + key + ': ' + value);
      */
    
}
void describe(multitype_union_t opt_name) {

      this->__context___log('Instance of', this->cls_->name);
      this->__context___log('Axiom Type           Name           Value');
      this->__context___log('----------------------------------------------------');
      var ps = this->cls__getAxiomsByClass(foam->core->Property);
      for ( var i = 0 ; i < strlen(ps) ; i++ ) {
        var p = ps[i];
        var value;
        try {
          value = p->hidden ? '-hidden-' : this[p->name];
        } catch (x) {
          value = '-';
        }
        if ( foam->Array_isInstance(value) ) {
          // NOP
        } else if ( value && value->toString ) {
          value = value_toString();
        }
        console_log(
          foam->String_pad(p->cls_ ? p->cls_->name : 'anonymous', 20),
          foam->String_pad(p->name, 14),
          value);
      }
      this->__context___log('\n');
    
}
void describeListeners() {

      var self  = this;
      var count = 0;
      function show(ls, path) {
        var next = ls->next;
        for ( var next = ls->next ; next ; next = next->next ) {
          count++;
          self_log(path, {l:next->l});
        }

        for ( var key in ls->children ) {
          show(ls->children[key], path ? path + '->' + key : key);
        }
      }

      show(this_getPrivate_('listeners'));
      this->__context___log(count, 'subscriptions');
    
}
void stringify() {

      return foam->json->Pretty_stringify(this);
    
}
void toXML() {

      return foam->xml->Pretty_stringify(this);
    
}
