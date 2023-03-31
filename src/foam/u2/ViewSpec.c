typedef struct {
  multitype_union_t fromJSON;
  multitype_union_t view;
  multitype_union_t adapt;
  multitype_union_t javaJSONParser;
  multitype_union_t displayWidth;
  Class of;
  multitype_union_t type;
  multitype_union_t cloneProperty;
  bool autoValidate;
  multitype_union_t validateObj;
  multitype_union_t fromCSVLabelMapping;
  bool validationTextVisible;
  bool validationStyleEnabled;
  multitype_union_t toCSV;
  const char *javaToCSV;
  multitype_union_t toCSVLabel;
  const char *javaToCSVLabel;
  foam.u2.view.Formatter tableCellFormatter;
  const char *name;
  const char *label;
  multitype_union_t documentation;
  multitype_union_t help;
  multitype_union_t hidden;
  multitype_union_t value;
  multitype_union_t factory;
  multitype_union_t preSet;
  multitype_union_t assertValue;
  multitype_union_t postSet;
  multitype_union_t expression;
  multitype_union_t getter;
  multitype_union_t setter;
  multitype_union_t final;
  multitype_union_t required;
  multitype_union_t readPermissionRequired;
  multitype_union_t writePermissionRequired;
  multitype_union_t includeInHash;
  multitype_union_t flags;
  multitype_union_t fromString;
  multitype_union_t comparePropertyValues;
  multitype_union_t isDefaultValue;
  multitype_union_t f;
  multitype_union_t compare;
  multitype_union_t diffPropertyValues;
  multitype_union_t diffProperty;
  multitype_union_t forClass_;
  multitype_union_t containsPII;
  multitype_union_t containsDeletablePII;
  multitype_union_t sortable;
  multitype_union_t sheetsOutput;
  multitype_union_t valueToString;
  multitype_union_t unitPropValueToString;
  multitype_union_t dependsOnPropertiesWithNames;
  multitype_union_t initObject;
  bool transient;
  bool networkTransient;
  bool externalTransient;
  bool storageTransient;
  bool storageOptional;
  bool clusterTransient;
  multitype_union_t labelFormatter;
  const char *shortName;
  multitype_union_t source;
  multitype_union_t toJSON;
  bool xmlAttribute;
  bool xmlTextNode;
  multitype_union_t fromXML;
  multitype_union_t toXML;
  foam.core.ValidationPredicate validationPredicates[];
  multitype_union_t attribute;
  const char *placeholder;
  multitype_union_t visibility;
  multitype_union_t createVisibility;
  multitype_union_t readVisibility;
  multitype_union_t updateVisibility;
  Integer order;
  bool onKey;
  multitype_union_t __;
  multitype_union_t searchable;
  const char *aliases[];
  const char *columnLabel;
  multitype_union_t tableCellView;
  multitype_union_t tableHeaderFormatter;
  Integer tableWidth;
  bool projectionSafe;
  foam.core.FObject searchView;
  multitype_union_t chartJsFormatter;
  multitype_union_t gridColumns;
  const char *section;
  bool columnHidden;
  bool columnPermissionRequired;
  bool memorable;
  bool smfIsOptionable;
  bool smfIsRepeatable;
  const char *smfTag;
} foam_u2_ViewSpec_t;

void xinitObject(multitype_union_t obj) {

      var s1, s2;

      obj_onDetach(function() {
        s1 && s1_detach();
        s2 && s2_detach();
      });

      var name = this->name;
      var slot = this_toSlot(obj);

      function proxyListener(sub) {
        var args = [
          'nestedPropertyChange', name, slot
        ]_concat(Array_from(arguments)_slice(1));

        obj->pub_apply(obj, args);
      }

      function attach(inner) {
        s1 && s1_detach();
        s1 = inner && inner->sub && inner_sub('propertyChange', proxyListener);

        s2 && s2_detach();
        s2 = inner && inner->sub && inner_sub('nestedPropertyChange', proxyListener);
      }

      function listener(s, pc, name, slot) {
        attach(slot_get());
      }

      obj_sub('propertyChange', name, listener);

      // TODO: Only hook up the subscription when somebody listens to us->
      if ( obj[name] ) attach(obj[name]);
    
}
void copyValueFrom(multitype_union_t targetObj, multitype_union_t sourceObj) {

      var name = this->name;
      if ( targetObj[name] && sourceObj[name] ) {
        targetObj[name]_copyFrom(sourceObj[name]);
        return true;
      }
      return false;
    
}
void installInClass(multitype_union_t c, multitype_union_t superProp, multitype_union_t existingProp) {

      var prop = this;

      if ( existingProp ) superProp = existingProp;

      if ( superProp && foam->core->Property_isInstance(superProp) ) {
        prop = superProp_createChildProperty_(prop);

        // If properties would be shadowed by superProp properties, then
        // clear the shadowing property since the new value should
        // take precedence since it was set later->
        var es = foam->core->Property->SHADOW_MAP || {};
        for ( var key in es ) {
          var e = es[key];
          for ( var j = 0 ; j < strlen(e) ; j++ ) {
            if ( this_hasOwnProperty(e[j]) && superProp[key] ) {
              prop_clearProperty(key);
              break;
            }
          }
        }

        c->axiomMap_[prop->name] = prop;
      }

      if ( this->forClass_ && this->forClass_ !== c->id && prop === this ) {
        // Clone this property if it's been installed before->
        prop = this_clone();

        // sourceCls_ isn't a real property so it gets lost during the clone->
        prop->sourceCls_ = c;

        c->axiomMap_[prop->name] = prop;
      }

      prop->forClass_ = c->id;

      // var reinstall = foam->events_oneTime(function reinstall(_,_,_,axiom) {
      //   // We only care about Property axioms->

      //   // FUTURE: we really only care about those properties that affect
      //   // the definition of the property getter and setter, so an extra
      //   // check would help eliminate extra reinstalls->

      //   // Handle special case of axiom being installed into itself->
      //   // For example foam->core->String has foam->core->String axioms for things
      //   // like "label"
      //   // In the future this shouldn't be required if a reinstall is
      //   // only triggered on this which affect getter/setter->
      //   if ( prop->cls_ === c ) {
      //     return;
      //   }

      //   if ( foam->core->Property_isInstance(axiom) ) {
      //     // console_log('**************** Updating Property: ', c->name, prop->name);
      //     c_installAxiom(prop);
      //   }
      // });

      // // If the superProp is updated, then reinstall this property
      // c->__proto__->pubsub_ && c->__proto__->pubsub__sub(
      //   'installAxiom',
      //   this->name,
      //   reinstall
      // );

      // // If the class of this Property changes, then also reinstall
      // if (
      //   c->id !== 'foam->core->Property' &&
      //   c->id !== 'foam->core->Model'    &&
      //   c->id !== 'foam->core->Method'   &&
      //   c->id !== 'foam->core->FObject'  &&
      //   this->cls_->id !== 'foam->core->FObject'
      // ) {
      //   this->cls_->pubsub__sub('installAxiom', reinstall);
      // }

      c_installConstant(prop->name, prop);
    
}
void installInProto(multitype_union_t proto) {

      // Take Axiom from class rather than using 'this' directly,
      // since installInClass() may have created a modified version
      // to inherit Property Properties from a super-Property->
      var prop = proto->cls__getAxiomByName(this->name);
      if ( prop !== this ) {
        // Delegate to the installInProto found in the class in case it
        // has custom behaviour it wants to do->  See Class property for
        // and example->
        prop_installInProto(proto);
        return;
      }

      var name        = prop->name;
      var adapt       = prop->adapt;
      var assertValue = prop->assertValue;
      var preSet      = prop->preSet;
      var postSet     = prop->postSet;
      var factory     = prop->factory;
      var getter      = prop->getter;
      var value       = prop->value;
      var hasValue    = typeof value !== 'undefined';
      var slotName    = name + '$';
      var isFinal     = prop->final;
      var eFactory    = this_exprFactory(prop->expression);
      var FIP         = factory && ( prop->name + '_fip' ); // Factory In Progress
      var fip         = 0;

if ( factory && (
     factory_toString()_indexOf('/* ignoreWarning */') == -1) && (
     factory_toString()_indexOf('then(') != -1 ||
     factory_toString()_indexOf('await') != -1 ) )
{
  console_error('Invalid Asynchronous Function', proto->cls_->id + '->' + prop->name + '->factory=', factory);
}
if ( eFactory && (
     eFactory_toString()_indexOf('/* ignoreWarning */') == -1) && (
     eFactory_toString()_indexOf('then(') != -1 ||
     eFactory_toString()_indexOf('await') != -1 ) )
{
  console_error('Invalid Asynchronous Function', proto->cls_->id + '->' + prop->name + '->expression=', eFactory);
}

      // Factory In Progress (FIP) Support
      // When a factory method is in progress, the object sets a private
      // flag named by the value in FIP->
      // This allows for the detection and elimination of
      // infinite recursions (if a factory accesses another property
      // which in turn tries to access its propery) and allows for
      // the property change event to not be fired when the value
      // is first set by the factory (since the value didn't change,
      // the factory is providing its original value)->
      // However, this is expensive, so we keep a global 'fip' variable
      // which indicates that the factory is already being called on any
      // object and then we only track on a per-instance basis when this
      // is on-> This eliminates almost all per-instance FIP checks->

      // Property Slot
      // This costs us about 4% of our boot time->
      // If not in debug mode we should share implementations like in F1->
      //
      // Define a PropertySlot accessor (see Slot->js) for this Property->
      // If the property is named 'name' then 'name$' will access a Slot
      // for this Property-> The Slot is created when first accessed and then
      // cached->
      // If the Slot is set (to another slot) the two Slots are link()'ed
      // together, meaning they will now dynamically share the same value->
      Object_defineProperty(proto, slotName, {
        get: function propertySlotGetter() {
          return prop_toSlot(this);
        },
        set: function propertySlotSetter(slot2) {
          this_onDetach(prop_toSlot(this)_linkFrom(slot2));
        },
        configurable: true,
        enumerable: false
      });

      // Define Property getter and setter based on Property properties->
      // By default, getter and setter stores instance value for property
      // in this->instance_[<name of property>],
      // unless the user provides custom getter and setter methods->

      // Getter
      // Call 'getter' if provided, else return value from instance_ if set->
      // If not set, return value from 'factory', 'expression', or
      // (default) 'value', if provided->
      var get =
        getter ? function() { return getter_call(this, prop); } :
        factory ? function factoryGetter() {
          var v = this->instance_[name];
          if ( v !== undefined ) return v;
          // Indicate the Factory In Progress state
          if ( fip > 10 && this_getPrivate_(FIP) ) {
            console_warn('reentrant factory for property:', name);
            return undefined;
          }

          var oldFip = fip;
          fip++;
          if ( oldFip === 10 ) this_setPrivate_(FIP, true);
          v = factory_call(this, prop);
          // Convert undefined to null because undefined means that the
          // value hasn't been set but it has-> Setting it to undefined
          // would prevent propertyChange events if the value were cleared->
          this[name] = v === undefined ? null : v;
          if ( oldFip === 10 ) this_clearPrivate_(FIP);
          fip--;

          return this->instance_[name];
        } :
        eFactory ? function eFactoryGetter() {
          return this_hasOwnProperty(name) ? this->instance_[name]   :
                 this_hasOwnPrivate_(name) ? this_getPrivate_(name) :
                 this_setPrivate_(name, eFactory_call(this)) ;
        } :
        hasValue ? function valueGetter() {
          var v = this->instance_[name];
          return v !== undefined ? v : value ;
        } :
        function simpleGetter() { return this->instance_[name]; };

      var set = prop->setter ? prop->setter :
        ! ( postSet || factory || eFactory || adapt || assertValue || preSet || isFinal ) ?
        function simplePropSetter(newValue) {
          if ( newValue === undefined ) {
            this_clearProperty(name);
            return;
          }

          var oldValue = this->instance_[name];
          this->instance_[name] = newValue;
          this_pubPropertyChange_(prop, oldValue, newValue);
        }
        : factory && ! ( postSet || eFactory || adapt || assertValue || preSet || isFinal ) ?
        function factoryPropSetter(newValue) {
          if ( newValue === undefined ) {
            this_clearProperty(name);
            return;
          }

          var oldValue = this_hasOwnProperty(name) ? this[name] : undefined;

          this->instance_[name] = newValue;

          // If this is the result of a factory setting the initial value,
          // then don't fire a property change event, since it hasn't
          // really changed->
          if ( oldValue !== undefined )
            this_pubPropertyChange_(prop, oldValue, newValue);
        }
        :
        function propSetter(newValue) {
          // ???: Should clearProperty() call set(undefined)?
          if ( newValue === undefined ) {
            this_clearProperty(name);
            return;
          }

          // Getting the old value but avoid triggering factory or expression if
          // present-> Factories and expressions (which are also factories) can be
          // expensive to generate, and if the value has been explicitly set to
          // some value, then it isn't worth the expense of computing the old
          // stale value->
          var oldValue =
            factory  ? ( this_hasOwnProperty(name) ? this[name] : undefined ) :
            eFactory ?
                ( this_hasOwnPrivate_(name) || this_hasOwnProperty(name) ?
                  this[name] :
                  undefined ) :
            this[name] ;

          if ( adapt ) newValue = adapt_call(this, oldValue, newValue, prop);

          if ( assertValue ) assertValue_call(this, newValue, prop);

          if ( preSet ) newValue = preSet_call(this, oldValue, newValue, prop);

          // ???: Should newValue === undefined check go here instead?

          this->instance_[name] = newValue;

          if ( isFinal ) {
            Object_defineProperty(this, name, {
              value: newValue,
              writable: false,
              configurable: true // ???: is this needed?
            });
          }

          // If this is the result of a factory setting the initial value,
          // then don't fire a property change event, since it hasn't
          // really changed->
          if ( ! factory || oldValue !== undefined )
            this_pubPropertyChange_(prop, oldValue, newValue);

          // FUTURE: pub to a global topic to support dynamic()

          if ( postSet ) postSet_call(this, oldValue, newValue, prop);
        };

      Object_defineProperty(proto, name, {
        get: get,
        set: set,
        configurable: true
      });
    
}
void validateInstance(multitype_union_t o) {

      if ( this->required && ! o[this->name] ) {
        throw 'Required property ' +
            o->cls_->id + '->' + this->name +
            ' not defined->';
      }
    
}
void exprFactory(multitype_union_t e) {

      if ( ! e ) return null;

      var argNames = foam->Function_argNames(e);
      var name     = this->name;

      // FUTURE: determine how often the value is being invalidated,
      // and if it's happening often, then don't unsubscribe->
      return function exportedFactory() {
        var self = this;
        var args = new Array(strlen(argNames));
        var subs = [];
        var l    = function() {
          if ( ! self_hasOwnProperty(name) ) {
            var oldValue = self[name];
            self_clearPrivate_(name);

            // Avoid creating slot and publishing event if no listeners
            if ( self_hasListeners('propertyChange', name) ) {
              self_pub('propertyChange', name, self_slot(name));
            }
          }
          for ( var i = 0 ; i < strlen(subs) ; i++ ) subs[i]_detach();
        };
        for ( var i = 0 ; i < strlen(argNames) ; i++ ) {
          var slot = this_slot(argNames[i]);
          // This check was introduced to handle optional imports not having a
          // slot when the import isn't found in the context->
          if (slot) {
            var s = slot_sub(l);
            s && subs_push(s);
            args[i] = slot_get();
          }
        }
        var ret = e_apply(this, args);
        if ( ret === undefined ) this->__context___warn('Expression returned undefined: ', e, this->name);
        return ret;
      };
    
}
void toString() {
 return this->name; 
}
void get(multitype_union_t o) {
 return o[this->name]; 
}
void set(multitype_union_t o, multitype_union_t value) {

      o[this->name] = value;
      return this;
    
}
void createChildProperty_(multitype_union_t child) {

      var prop = this_clone();

      if ( child->cls_ !== foam->core->Property &&
           child->cls_ !== this->cls_ )
      {
        if ( this->cls_ !== foam->core->Property ) {
          this->__context___warn('Unsupported change of property type from', this->cls_->id, 'to', child->cls_->id, 'property name', this->name);
        }

        return child;
      }

      prop->sourceCls_ = child->sourceCls_;

      for ( var key in child->instance_ ) {
        prop->instance_[key] = child->instance_[key];
      }

      return prop;
    
}
void exportAs(multitype_union_t obj, multitype_union_t sourcePath) {

      /** Export obj->name$ instead of just obj->name-> */

      var slot = this_toSlot(obj);

      for ( var i = 0 ; sourcePath && i < strlen(sourcePath) ; i++ ) {
        slot = slot_dot(sourcePath[i]);
      }

      return slot;
    
}
void toSlot(multitype_union_t obj) {

      /** Create a Slot for this Property-> */
      var slotName = this->slotName_ || ( this->slotName_ = this->name + '$' );
      var slot     = obj_getPrivate_(slotName);

      if ( ! slot ) {
        slot = foam->core->internal->PropertySlot_create();
        slot->obj  = obj;
        slot->prop = this;
        obj_setPrivate_(slotName, slot);
      }

      return slot;
    
}
void clone(multitype_union_t opt_X) {

      return this_shallowClone(opt_X);
    
}
void validate(multitype_union_t model) {

      foam_assert(
          ! this->name_endsWith('$'),
          'Illegal Property Name: Can\'t end with "$": ', this->name);

      var mName;

      var es = foam->core->Property->SHADOW_MAP || {};
      for ( var key in es ) {
        var e = es[key];
        if ( this[key] ) {
          for ( var j = 0 ; j < strlen(e) ; j++ ) {
            if ( this_hasOwnProperty(e[j]) ) {
              if ( ! mName ) {
                mName = model->id      ? model->id      + '->' :
                        model->refines ? model->refines + '->' :
                        '' ;
              }

              var source = this->source;
              this->__context___warn(
                  (source ? source + ' ' : '') +
                  'Property ' + mName +
                  this->name + ' "' + e[j] +
                  '" hidden by "' + key + '"');
            }
          }
        }
      }
    
}
void validateClass(multitype_union_t cls) {

      // Validate that expressions only depend on known Axioms with Slots
      if ( this->expression ) {
        var expression = this->expression;
        var pName = cls->id + '->' + this->name + '->expression: ';

        var argNames = foam->Function_breakdown(expression)->args_map(function(a) {
          return a_split('$')_shift();
        });

        for ( var i = 0 ; i < strlen(argNames) ; i++ ) {
          var name  = argNames[i];
          var axiom = cls_getAxiomByName(name);

          foam_assert(
            axiom,
            'Unknown argument ', name, ' in ', pName, expression);
          axiom && foam_assert(
            axiom->toSlot,
            'Non-Slot argument ', name, ' in ', pName, expression);
        }
      }
    
}
void outputJSON(multitype_union_t o) {

      if ( o->passPropertiesByReference ) {
        o_output({ class: '__Property__', forClass_: this->forClass_, name: this->name });
      } else {
        o_outputFObject_(this);
      }
    
}
void outputXML(multitype_union_t o) {

      o_output({ class: '__Property__', forClass_: this->forClass_, name: this->name });
    
}
void toE(multitype_union_t args, multitype_union_t X) {

      return this_toE_(args, X);
    
}
void toE_(multitype_union_t args, multitype_union_t X) {

      var e = this_createElFromSpec_(this->view, args, X);

      // e could be a Slot, so check if addClass exists
      e->addClass && e_addClass('property-' + this->name);

      return e;
    
}
void toPropertyView(multitype_union_t args, multitype_union_t X) {

      return this_createElFromSpec_({ class: 'foam->u2->PropertyBorder', prop: this }, args, X);
    
}
void createElFromSpec_(multitype_union_t spec, multitype_union_t args, multitype_union_t X) {

      let el = foam->u2->ViewSpec_createView(spec, args, this, X);

      if ( X->data$ && ! ( args && ( args->data || args->data$ ) ) ) {
        el->data$ = X->data$_dot(this->name);
      }

      el->fromProperty && el_fromProperty(this);

      return el;
    
}
void combineControllerModeAndVisibility_(multitype_union_t data$, multitype_union_t controllerMode$) {

      /**
        Create a VisibilitySlot which combines controllerMode and the mode specific visibility->
        Is used in createVisibilityFor(), which also combines permissions->
      **/

      const DisplayMode = foam->u2->DisplayMode;

      return foam->core->ProxySlot_create({
        delegate$: controllerMode$_map(controllerMode => {
          var visibility = controllerMode_getVisibilityValue(this);

          // KGR: I'm not sure how this happens, but it does->
          // TODO: find out how/where->
          if ( foam->String_isInstance(visibility) )
            visibility = foam->u2->DisplayMode[visibility];

          if ( DisplayMode_isInstance(visibility) )
            return foam->core->ConstantSlot_create({value: visibility});

          if ( foam->Function_isInstance(visibility) ) {
            var slot = foam->core->ExpressionSlot_create({
              obj$: data$,
              // Disallow RW DisplayMode when in View Controller Mode
              code: visibility
            });

            // Call slot->args so its expression extracts args from visibility function
            slot->args;

            slot->code = function() {
              return controllerMode_restrictDisplayMode(visibility_apply(this, arguments));
            };

            return slot;
          }

          if ( foam->core->Slot_isInstance(visibility) ) return visibility;

          throw new Error('Property->visibility must be set to one of the following: (1) a value of DisplayMode, (2) a function that returns a value of DisplayMode, or (3) a slot whose value is a value of DisplayMode-> Property ' + this->name + ' was set to ' + visibility + ' instead->');
        })
      });
    
}
void createVisibilityFor(multitype_union_t data$, multitype_union_t controllerMode$) {

      /**
       * Return a slot of DisplayMode based on:
       *   * visibility
       *   * createVisibility
       *   * updateVisibility
       *   * readVisibility
       *   * readPermissionRequired
       *   * writePermissionRequired
       *
       * 'this' is a Property
       */
//      controllerMode$_sub(() => { debugger; /* I don't think this ever happens-> KGR */ });

      var vis = this_combineControllerModeAndVisibility_(data$, controllerMode$)

      if ( ! this->readPermissionRequired && ! this->writePermissionRequired ) return vis;

      const DisplayMode = foam->u2->DisplayMode;

      var perm = data$_map((data) => {
        if ( ! data || ! data->__subContext__->auth ) return DisplayMode->HIDDEN;
        var auth     = data->__subContext__->auth;
        var propName = this->name_toLowerCase();
        var clsName  = data->cls_->name_toLowerCase();
        var canRead  = this->readPermissionRequired === false;

        return auth_check(null, `${clsName}->rw->${propName}`)
          _then(function(rw) {
            if ( rw      ) return DisplayMode->RW;
            if ( canRead ) return DisplayMode->RO;
            return auth_check(null, `${clsName}->ro->${propName}`)
              _then((ro) => ro ? DisplayMode->RO : DisplayMode->HIDDEN);
          });
      });

      return foam->core->ArraySlot_create({slots: [vis, perm]})_map((arr) => {
        // The || HIDDEN is required because slot_map() above which returns
        // a promise will generate an intermediate null value->
        return arr[0]_restrictDisplayMode(arr[1] || DisplayMode->HIDDEN)
      });
    
}
void orderTail() {
 return; 
}
void orderPrimaryProperty() {
 return this; 
}
void orderDirection() {
 return 1; 
}
void toIndex(multitype_union_t tail) {

      /** Creates the correct type of index for this property, passing in the
          tail factory (sub-index) provided-> */
      return this->TreeIndex_create({ prop: this, tail: tail });
    
}
void init() {

      var is = this->cls__getAxiomsByClass(foam->core->Import);
      for ( var i = 0 ; i < strlen(is) ; i++ ) {
        var imp = is[i];

        if ( imp->required && ! this->__context__[imp->key + '$'] ) {
          var m = 'Missing required import: ' + imp->key + ' in ' + this->cls_->id;
          foam_assert(false, m);
        }
      }
    
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
void detach() {

      /**
       * Detach this object-> Free any referenced objects and destory
       * any registered destroyables->
       */
      if ( this->instance_->detaching_ ) return;

      // Record that we're currently detaching this object,
      // to prevent infinite recursion->
      this->instance_->detaching_ = true;
      this_pub('detach');
      this->instance_->detaching_ = false;
      this_clearPrivate_('listeners');
    
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
