// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Repeat0: ProxyParser {

  public var delim: Parser? {
    get {
      
if _delim_inited_ {
  return _delim_
}

return nil

      
    }
set(value) {
      
self.set(key: "delim", value: value)
      
    }
  }

  var _delim_: Parser? = nil

  var _delim_inited_: Bool = false

  public static let DELIM: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "delim"
  let classInfo: ClassInfo
  let transient = false
  let label = "Delim" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var delim_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "delim",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var delim_Value_Sub_: Subscription?

  public var delim$: Slot {
    get {
      return self.delim_Value_
    }
set(value) {
      
self.delim_Value_Sub_?.detach()
self.delim_Value_Sub_ = self.delim$.linkFrom(value)
self.onDetach(self.delim_Value_Sub_!)
      
    }
  }

  public var min: Int {
    get {
      
if _min_inited_ {
  return _min_!
}

return -1

      
    }
set(value) {
      
self.set(key: "min", value: value)
      
    }
  }

  var _min_: Int! = nil

  var _min_inited_: Bool = false

  public static let MIN: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "min"
  let classInfo: ClassInfo
  let transient = false
  let label = "Min" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var min_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "min",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var min_Value_Sub_: Subscription?

  public var min$: Slot {
    get {
      return self.min_Value_
    }
set(value) {
      
self.min_Value_Sub_?.detach()
self.min_Value_Sub_ = self.min$.linkFrom(value)
self.onDetach(self.min_Value_Sub_!)
      
    }
  }

  public var max: Int {
    get {
      
if _max_inited_ {
  return _max_!
}

return -1

      
    }
set(value) {
      
self.set(key: "max", value: value)
      
    }
  }

  var _max_: Int! = nil

  var _max_inited_: Bool = false

  public static let MAX: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "max"
  let classInfo: ClassInfo
  let transient = false
  let label = "Max" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var max_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "max",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var max_Value_Sub_: Subscription?

  public var max$: Slot {
    get {
      return self.max_Value_
    }
set(value) {
      
self.max_Value_Sub_?.detach()
self.max_Value_Sub_ = self.max$.linkFrom(value)
self.onDetach(self.max_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_delim_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Parser? {
    return newValue as! Parser?
  }

  private func `_delim_preSet_`(_ oldValue: Any?, _ newValue: Parser?) -> Parser? {
    return newValue
  }

  private func `_delim_postSet_`(_ oldValue: Any?, _ newValue: Parser?) {
    
  }

  private func `_min_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int32.max)
  let min = Int(Int32.min)
  return i > max ? max : i < min ? min : i
}
return 0
        
  }

  private func `_min_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_min_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_max_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int32.max)
  let min = Int(Int32.min)
  return i > max ? max : i < min ? min : i
}
return 0
        
  }

  private func `_max_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_max_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  public override func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
var first = true
var ps = ps
var result: PStream?

var i = 0
while max == -1 || i < max {
  if delim != nil && !first {
    result = delim!.parse(ps, x)
    if result == nil { break }
    ps = result!
  }

  result = delegate.parse(ps, x)
  if result == nil { break }
  ps = result!
  first = false

  i+=1
}

if min != -1 && i < min { return nil }
return ps
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Repeat0.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Repeat0.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "delim":
    _delim_inited_ = false
    _delim_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "delim"]) {
      _ = pub(["propertyChange", "delim", delim$])
    }
    break

  case "min":
    _min_inited_ = false
    _min_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "min"]) {
      _ = pub(["propertyChange", "min", min$])
    }
    break

  case "max":
    _max_inited_ = false
    _max_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "max"]) {
      _ = pub(["propertyChange", "max", max$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "delim": return `_delim_inited_`

  case "min": return `_min_inited_`

  case "max": return `_max_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "delim": return `delim`

  case "min": return `min`

  case "max": return `max`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "delim": return `delim$`

  case "min": return `min$`

  case "max": return `max$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "delim$":
    delim$ = value as! Slot
    return
  case "delim":
  
    let oldValue: Any? = _delim_inited_ ? self.`delim` : nil
    _delim_ = _delim_preSet_(oldValue, _delim_adapt_(oldValue, value))
    _delim_inited_ = true
    _delim_postSet_(oldValue, _delim_)
    if hasListeners(["propertyChange", "delim"]) && !FOAM_utils.equals(oldValue, _delim_) {
      _ = pub(["propertyChange", "delim", delim$])
    }
    return

  case "min$":
    min$ = value as! Slot
    return
  case "min":
  
    let oldValue: Any? = _min_inited_ ? self.`min` : nil
    _min_ = _min_preSet_(oldValue, _min_adapt_(oldValue, value))
    _min_inited_ = true
    _min_postSet_(oldValue, _min_)
    if hasListeners(["propertyChange", "min"]) && !FOAM_utils.equals(oldValue, _min_) {
      _ = pub(["propertyChange", "min", min$])
    }
    return

  case "max$":
    max$ = value as! Slot
    return
  case "max":
  
    let oldValue: Any? = _max_inited_ ? self.`max` : nil
    _max_ = _max_preSet_(oldValue, _max_adapt_(oldValue, value))
    _max_inited_ = true
    _max_postSet_(oldValue, _max_)
    if hasListeners(["propertyChange", "max"]) && !FOAM_utils.equals(oldValue, _max_) {
      _ = pub(["propertyChange", "max", max$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.parser.Repeat0"

    lazy var label: String = "Repeat0"

    lazy var parent: ClassInfo? = ProxyParser.classInfo()

    lazy var ownAxioms: [Axiom] = [DELIM,MIN,MAX,PARSE]

    lazy var cls: AnyClass = Repeat0.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Repeat0(args, x)
    }

  }

}