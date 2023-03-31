typedef struct {
  foam.nanos.medusa.ClusterConfig config;
  foam.nanos.medusa.MedusaHealth health;
  Float width;
  Float height;
  multitype_union_t fontSize;
  multitype_union_t labelOffset;
  Long openTime;
  Long openIndex;
  Float borderWidth;
  const char *border;
  bool clip;
  Integer cornerRadius;
  Float rotation;
  Float originX;
  Float originY;
  Float scaleX;
  Float scaleY;
  Float skewX;
  Float skewY;
  Float x;
  Float y;
  Float alpha;
  multitype_union_t color;
  const char *shadowColor;
  Integer shadowBlur;
  multitype_union_t children;
  multitype_union_t state;
  multitype_union_t parent;
  multitype_union_t canvas;
  multitype_union_t transform_;
  multitype_union_t transform;
  bool autoRepaint;
  multitype_union_t x_;
  multitype_union_t y_;
  multitype_union_t top_;
  multitype_union_t left_;
  multitype_union_t bottom_;
  multitype_union_t right_;
  multitype_union_t invalidate_;
} foam_nanos_medusa_ReplayingInfoDetailCView_t;

void initCView() {

      this_SUPER();

      this->health = await this->healthDAO_find(this->config->id);

      this->borderWidth = 5;
      this->border = 'blue';
      this->color = 'white';

      this->openTime = Date_now();
      this->openIndex = this->health->index;

//       var view = foam->graphics->ViewCView_create({
// //        innerView: this->config->replayingInfo_toE(null, this)
//         innerView: foam->u2->DetailView_create({
//           data: this->config->replayingInfo
//         })
//       });
//       this_add(view);
//       return;

      var label = this_makeLabel();
      label->text = this->config->name;
      this_add(label);

      if ( this->config->availabilityId ) {
        var label = this_makeLabel();
        label->text = 'AZ: '+this->config->availabilityId;
        this_add(label);
      }

      if ( this->config->bucket ) {
        var label = this_makeLabel();
        label->text = 'Bucket: '+this->config->bucket;
        this_add(label);
      }

      label = this_makeLabel();
      label->text$ = this->health$_map(function(h) {
        return 'Uptime: '+foam->core->Duration_duration(h->uptime);
      });
      this_add(label);

      label = this_makeLabel();
      label->text$ = this->health$_map(function(h) {
        return 'Version: '+h->version;
      });
      this_add(label);

      label = this_makeLabel();
      label->text$ = this->health$_map(function(h) { return 'Index: '+h->index; });
      this_add(label);

      if ( this->config->replayingInfo->replaying ) {
        label = this_makeLabel();
        label->text$ = this->config$_map(function(c) { return 'Replay: '+c->replayingInfo->replayIndex; });
        this_add(label);

        label = this_makeLabel();
        label->text$ = this->config$_map(function(c) {
          return 'Elapsed: '+foam->core->Duration_duration(c->replayingInfo->elapsedTime);
        });
        this_add(label);

        label = this_makeLabel();
        label->text$ = this->config$_map(function(c) { let f = (c->replayingInfo->percentComplete * 100)_toFixed(2); return 'Complete: '+f+'%'; });
        this_add(label);

        label = this_makeLabel();
        label->text$ = this->config$_map(function(c) { return 'Remaining: '+foam->core->Duration_duration(c->replayingInfo->timeRemaining); });
        this_add(label);

        label = this_makeLabel();
        label->text$ = this->config$_map(function(c) { return 'Replay TPS: '+c->replayingInfo->replayTps_toFixed(2); });
        this_add(label);
      }

      label = this_makeLabel();
      label->text$ = this->config$_map(function(c) {
        return 'TPS: '+c->replayingInfo->replayTps_toFixed(2);
      }_bind(this));
      this_add(label);

      label = this_makeLabel();
      label->text$ = this->config$_map(function(c) {
        let now = Date_now();
        let delta = now - (c->replayingInfo->lastModified && c->replayingInfo->lastModified_getTime() || now);
        return 'Idle: '+foam->core->Duration_duration(delta);
      });
      this_add(label);

      label = this_makeLabel();
      label->text$ = this->health$_map(function(h) {
        var used = 0;
        if ( h->memoryTotal > 0 ) {
          used = (h->memoryUsed / h->memoryTotal) * 100;
        }
        if ( used < 70 ) {
          label->color = 'green';
        } else if ( used < 80 ) {
          label->color = 'orange';
        } else {
          label->color = 'red';
        }
        let u = h->memoryUsed / (1024*1024*1024);
        return 'Memory: '+used_toFixed(0)+'% '+u_toFixed(1)+'gb';
      });
      this_add(label);

      label = this_makeLabel();
      label->text$ = this->config$_map(function(c) {
        if ( c->errorMessage && strlen(c->errorMessage) > 0 ) {
          return 'Error: '+c->errorMessage;
        } else {
          return '';
        }
      });
      label->color = 'red';
      this_add(label);

      label = this_makeLabel();
      label->text$ = this->health$_map(function(h) {
        if ( h->alarms && h->alarms > 0 ) {
          // TODO: this also includes those recently inactive->
          return 'Alarms: '+h->alarms;
        } else {
          return '';
        }
      });
      label->color = 'red';
      this_add(label);
    
}
void refresh() {
// TODO
}
void makeLabel() {

        return this->Label_create({
          align: 'center',
          x: this->width / 2,
          y: (this->children || [])->length * this->labelOffset
        });
      
}
void handleClick(multitype_union_t evt, multitype_union_t element) {

        console_log('ReplayingInfoDetailCView->handleClick');
        element->canvas_remove(this);
      
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
void paintSelf(multitype_union_t x) {

      x_beginPath();

      if ( this->cornerRadius ){
        this_roundRect(x, 0, 0, this->width, this->height, this->cornerRadius)
      } else {
        x_rect(0, 0, this->width, this->height);
      }


      if ( this->border && this->borderWidth ) {
        x->lineWidth = this->borderWidth;
        x_stroke();
      }
      if ( this->color ) x_fill();
      if ( this->clip ) x_clip();
    
}
void roundRect(multitype_union_t ctx, multitype_union_t x, multitype_union_t y, multitype_union_t width, multitype_union_t height, multitype_union_t radius) {

      if (typeof radius === "number") {
        radius = {
          topLeft: radius,
          topRight: radius,
          bottomLeft: radius,
          bottomRight: radius
        };

      } else {
        var defaultRadius = {
          topLeft: 0,
          topRight: 0,
          bottomLeft: 0,
          bottomRight: 0
        };

        for (var side in defaultRadius) {
          radius[side] = radius[side] || defaultRadius[side];
        }
      }
      ctx_beginPath();

      ctx_moveTo(x + radius->topLeft, y);

      ctx_lineTo(x + width - radius->topRight, y);

      ctx_quadraticCurveTo(x + width, y, x + width, y + radius->topRight);

      ctx_lineTo(x + width, y + height - radius->bottomRight);

      ctx_quadraticCurveTo(x + width, y + height, x + width - radius->bottomRight, y + height);

      ctx_lineTo(x + radius->bottomLeft, y + height);

      ctx_quadraticCurveTo(x, y + height, x, y + height - radius->bottomLeft);

      ctx_lineTo(x, y + radius->topLeft);

      ctx_quadraticCurveTo(x, y, x + radius->topLeft, y);

      ctx_closePath();
    
}
void invalidate() {

      this->invalidate_ && this_invalidate_();
    
}
void parentToLocalCoordinates(multitype_union_t p) {

      this->transform_invert()_mulP(p);
      p->x /= p->w;
      p->y /= p->w;
      p->w = 1;
      return p;
    
}
void globalToLocalCoordinates(multitype_union_t p) {

      if ( this->parent ) p = this->parent_globalToLocalCoordinates(p);
      return this_parentToLocalCoordinates(p);
    
}
void localToGlobalCoordinates(multitype_union_t p) {

      var curr = this;
      while ( curr ){
        curr->transform_mulP(p);
        p->x *= p->w;
        p->y *= p->w;
        p->w = 1;
        curr = curr->parent;
      }
      return p;
    
}
void findFirstChildAt(multitype_union_t p) {

      if ( strlen(arguments) > 1 ) {
        var tmp = foam->graphics->Point_create();
        tmp->x = arguments[0];
        tmp->y = arguments[1];
        tmp->w = 1;
        p = tmp;
      }

      this_parentToLocalCoordinates(p);

      if ( strlen(this->children) ) {
        var p2 = foam->graphics->Point_create();

        for ( var i = 0 ; i < strlen(this->children) ; i++ ) {
          p2->x = p->x;
          p2->y = p->y;
          p2->w = p->w;

          var c = this->children[i]_findFirstChildAt(p2);
          if ( c ) return c;
        }
      }

      if ( this_hitTest(p) ) return this;
    
}
void hitTest(multitype_union_t p) {

      return p->x >= 0 && p->y >= 0 && p->x < this->width && p->y < this->height;
    
}
void maybeInitCView(multitype_union_t x) {

      if ( this->state === 'initial' ) {
        this->state = 'initailized';
        this_initCView(x);
      }
    
}
void paint(multitype_union_t x) {

      this_maybeInitCView(x);

      x_save();

      var
        alpha       = this->alpha,
        border      = this->border,
        color       = this->color,
        shadowColor = this->shadowColor,
        shadowBlur  = this->shadowBlur;

      if ( alpha !== 1 ) {
        x->globalAlpha *= alpha;
      }

      if ( border ) {
        x->strokeStyle = border->toCanvasStyle ?
          border_toCanvasStyle(x) :
          border ;
      }

      if ( color ) {
        x->fillStyle = color->toCanvasStyle ?
          color_toCanvasStyle(x) :
          color ;
      }

      this_doTransform(x);

      if ( shadowColor && shadowBlur ) {
        x->shadowColor = shadowColor;
        x->shadowBlur  = shadowBlur;
      }

      this_paintSelf(x);
      this_paintChildren(x);

      x_restore();
    
}
void doTransform(multitype_union_t x) {

      var t = this->transform;
      x_transform(t->a, t->d, t->b, t->e, t->c, t->f);
    
}
void paintChildren(multitype_union_t x) {

      for ( var i = 0 ; i < strlen(this->children) ; i++ ) {
        this->children[i]_paint(x);
      }
    
}
void remove(multitype_union_t c) {

      for ( var i = 0 ; i < strlen(this->children) ; i++ ) {
        if ( this->children[i] === c ) {
          this->children_splice(i, 1);
          this_removeChild_(c);
          return;
        }
      }
    
}
void removeAllChildren() {

      var children = this->children;
      this->children = [];
      for ( var i = 0 ; i < strlen(children) ; i++ ) {
        this_removeChild_(children[i]);
      }
    
}
void removeChild(multitype_union_t c) {

      console_log('Deprecated use of CView_removeChild()-> Use _remove() instead->');
      this_remove(c);
    
}
void addChild_(multitype_union_t c) {

      c->parent = this;
      return c;
    
}
void removeChild_(multitype_union_t c) {

      c->parent = undefined;
      c->canvas = undefined;
      this_invalidate();
      return c;
    
}
void add() {

      for ( var i = 0 ; i < strlen(arguments) ; i++ ) {
        this->children_push(arguments[i]);
        this_addChild_(arguments[i]);
      }
      this_invalidate();
      return this;
    
}
void addChildren() {

      console_warn('Deprecated use of CView_addChildren()-> Use add() instead->');
      return this->add_apply(this, arguments);
    
}
void hsl(multitype_union_t h, multitype_union_t s, multitype_union_t l) {

      return 'hsl(' + h + ',' + s + '%,' + l + '%)';
    
}
void write() {

      return this_toE()_write();
    
}
void toE(multitype_union_t args, multitype_union_t X) {

      return this->Canvas_create({ cview: this }, X)_attrs({
        width:  this_slot(function(x, width,  scaleX) { return x + width*scaleX; }),
        height: this_slot(function(y, height, scaleY) { return y + height*scaleY; })
      });
    
}
void intersects(multitype_union_t c) {

      if ( c->RADIUS ) {
        return ! (
          this->x + this->width  < c->x - c->radius ||
          this->y + this->height < c->y - c->radius ||
          c->x    + c->radius    < this->x         ||
          c->y    + c->radius    < this->y );
      }
      return ! (
        this->x + this->width  < c->x ||
        this->y + this->height < c->y ||
        c->x    + c->width  < this->x ||
        c->y    + c->height < this->y );
    
}
void equals(multitype_union_t b) {
 return this === b; 
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
void toString() {

      // Distinguish between prototypes and instances->
      return this->cls_->id + (
          this->cls_->prototype === this ? 'Proto' : '');
    
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
