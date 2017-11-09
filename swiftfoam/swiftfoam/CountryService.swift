//
//  CountryService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-20.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class CountryService: Service {
  public static let instance: CountryService = CountryService()

  // Helps determine type of error to handle on frontend
  public enum CountryError: ServiceErrorProtocol {
    case IncorrectCountryCode
    public func description() -> String {
      switch(self) {
      case .IncorrectCountryCode:
        return "Incorrect Country Id"
      }
    }
  }

  private var countries: [Country]?

  init() {
    super.init(withURL: ServiceURLs.URL.Country)
  }

  public func getAllCountries(callback: @escaping (Any?) -> Void) {
    guard countries == nil else {
      callback(countries)
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        guard let sink = (try self.dao.skip(0).limit(300).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard let array = sink.array as? [Country] else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard array.count > 0 else {
          DispatchQueue.main.async {
            callback(ServiceError.Failed)
          }
          return
        }

        self.countries = array

        DispatchQueue.main.async {
          callback(self.countries)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  public func getCountry(byCode code: String, callback: @escaping (Any?) -> Void) {
    guard countries == nil else {
      findCountry(byCode: code, callback: callback)
      return
    }
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        guard let sink = (try self.dao.skip(0).limit(300).select(ArraySink())) as? ArraySink else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard let array = sink.array as? [Country] else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        guard array.count > 0 else {
          DispatchQueue.main.async {
            callback(ServiceError.Failed)
          }
          return
        }

        self.countries = array

        DispatchQueue.main.async {
          self.findCountry(byCode: code, callback: callback)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  func findCountry(byCode code: String, callback: @escaping (Any?) -> Void) {
    guard countries != nil else {
      callback(ServiceError.Failed)
      return
    }

    for country in countries! {
      if country.code == code {
        
        callback(country)
        return
      }
    }
    callback(CountryError.IncorrectCountryCode)
  }
}

