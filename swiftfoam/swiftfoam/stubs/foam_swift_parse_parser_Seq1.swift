// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Seq1: AbstractFObject, Parser {

  public var parsers: [Parser] {
    get {
      
if _parsers_inited_ {
  return _parsers_!
}

return []

      
    }
set(value) {
      
self.set(key: "parsers", value: value)
      
    }
  }

  var _parsers_: [Parser]! = nil

  var _parsers_inited_: Bool = false

  public static let PARSERS: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "parsers"
  let classInfo: ClassInfo
  let transient = false
  let label = "Parsers" // TODO localize
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

  private lazy var parsers_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "parsers",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var parsers_Value_Sub_: Subscription?

  public var parsers$: Slot {
    get {
      return self.parsers_Value_
    }
set(value) {
      
self.parsers_Value_Sub_?.detach()
self.parsers_Value_Sub_ = self.parsers$.linkFrom(value)
self.onDetach(self.parsers_Value_Sub_!)
      
    }
  }

  public var index: Int {
    get {
      
if _index_inited_ {
  return _index_!
}

return 0

      
    }
set(value) {
      
self.set(key: "index", value: value)
      
    }
  }

  var _index_: Int! = nil

  var _index_inited_: Bool = false

  public static let INDEX: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "index"
  let classInfo: ClassInfo
  let transient = false
  let label = "Index" // TODO localize
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

  private lazy var index_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "index",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var index_Value_Sub_: Subscription?

  public var index$: Slot {
    get {
      return self.index_Value_
    }
set(value) {
      
self.index_Value_Sub_?.detach()
self.index_Value_Sub_ = self.index$.linkFrom(value)
self.onDetach(self.index_Value_Sub_!)
      
    }
  }

  lazy var parse$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let ps = args[0] as! PStream

    let x = args[1] as! ParserContext

    
    return self!.`parse`(
        _: ps, _: x)
  }
])
      
  }()

  public static let PARSE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "parse"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_parsers_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> [Parser] {
    return newValue as! [Parser]
  }

  private func `_parsers_preSet_`(_ oldValue: Any?, _ newValue: [Parser]) -> [Parser] {
    return newValue
  }

  private func `_parsers_postSet_`(_ oldValue: Any?, _ newValue: [Parser]) {
    
  }

  private func `_index_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int32.max)
  let min = Int(Int32.min)
  return i > max ? max : i < min ? min : i
}
return 0
        
  }

  private func `_index_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_index_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  public func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
var value: Any? = nil
var ps: PStream? = ps
for (i, parser) in parsers.enumerated() {
  ps = parser.parse(ps!, x)
  if ps == nil { return nil }
  if i == index { value = ps!.value() }
}
return ps!.setValue(value)
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Seq1.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Seq1.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "parsers":
    _parsers_inited_ = false
    _parsers_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "parsers"]) {
      _ = pub(["propertyChange", "parsers", parsers$])
    }
    break

  case "index":
    _index_inited_ = false
    _index_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "index"]) {
      _ = pub(["propertyChange", "index", index$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "parsers": return `_parsers_inited_`

  case "index": return `_index_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "parsers": return `parsers`

  case "index": return `index`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "parsers": return `parsers$`

  case "index": return `index$`


  case "parse": return `parse$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "parsers$":
    parsers$ = value as! Slot
    return
  case "parsers":
  
    let oldValue: Any? = _parsers_inited_ ? self.`parsers` : nil
    _parsers_ = _parsers_preSet_(oldValue, _parsers_adapt_(oldValue, value))
    _parsers_inited_ = true
    _parsers_postSet_(oldValue, _parsers_)
    if hasListeners(["propertyChange", "parsers"]) && !FOAM_utils.equals(oldValue, _parsers_) {
      _ = pub(["propertyChange", "parsers", parsers$])
    }
    return

  case "index$":
    index$ = value as! Slot
    return
  case "index":
  
    let oldValue: Any? = _index_inited_ ? self.`index` : nil
    _index_ = _index_preSet_(oldValue, _index_adapt_(oldValue, value))
    _index_inited_ = true
    _index_postSet_(oldValue, _index_)
    if hasListeners(["propertyChange", "index"]) && !FOAM_utils.equals(oldValue, _index_) {
      _ = pub(["propertyChange", "index", index$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.parser.Seq1"

    lazy var label: String = "Seq1"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [PARSERS,INDEX,PARSE]

    lazy var cls: AnyClass = Seq1.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Seq1(args, x)
    }

  }

}