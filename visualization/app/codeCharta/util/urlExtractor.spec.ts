import { getService } from "../../../mocks/ng.mockhelper"
import { ILocationService, IHttpService } from "angular"
import { UrlExtractor } from "./urlExtractor"

describe("urlExtractor", () => {
	let $location: ILocationService
	let $http: IHttpService

	beforeEach(() => {
		restartSystem()
		withMockedMethods()
	})

	function restartSystem() {
		$location = getService<ILocationService>("$location")
		$http = getService<IHttpService>("$http")
	}

	function withMockedMethods() {
		$location.absUrl = jest.fn(() => {
			return "http://testurl?file=valid.json"
		})

		$http.get = jest.fn(fileName => {
			return new Promise((resolve, reject) => {
				resolve({ data: "some data", status: 200 })
			})
		})
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("getParameterByName", () => {
		it("should return fileName for given parameter name 'file'", () => {
			const result = UrlExtractor.getParameterByName("file", $location)
			expect(result).toBe("valid.json")
		})

		it("should return renderMode for given parameter name 'mode'", () => {
			$location.absUrl = jest.fn(() => {
				return "http://testurl?file=valid.json&mode=Delta"
			})
			const result = UrlExtractor.getParameterByName("mode", $location)
			expect(result).toBe("Delta")
		})
	})

	describe("getFileDataFromQueryParam", () => {
		it("should return an empty array when file is undefined", async () => {
			$location.search = jest.fn(() => {
				return {}
			})

			const result = await UrlExtractor.getFileDataFromQueryParam($location, $http)
			const expected = []

			expect(result).toEqual(expected)
		})

		it("should create an array when file is defined but not as an array", async () => {
			$location.search = jest.fn(() => {
				return { file: { data: "some data" } }
			})
			UrlExtractor["getFileDataFromFile"] = jest.fn((fileName, $http) => {
				return new Promise((resolve, reject) => {
					resolve(fileName)
				})
			})

			const result = await UrlExtractor.getFileDataFromQueryParam($location, $http)
			const expected = [{ data: "some data" }]

			expect(result).toEqual(expected)
			expect(UrlExtractor["getFileDataFromFile"]).toHaveBeenCalledTimes(1)
			expect(UrlExtractor["getFileDataFromFile"]).toHaveBeenCalledWith({ data: "some data" }, $http)
		})

		it("should return an array of resolved file data", () => {
			$location.search = jest.fn(() => {
				return { file: ["some data", "some more"] }
			})

			UrlExtractor["getFileDataFromFile"] = jest.fn((fileName, $http) => {
				return new Promise((resolve, reject) => {
					resolve(fileName)
				})
			})

			const expected = ["some data", "some more"]

			return expect(UrlExtractor.getFileDataFromQueryParam($location, $http)).resolves.toEqual(expected)
		})

		it("should return the first filename rejected", () => {
			$location.search = jest.fn(() => {
				return { file: ["some data", "some more"] }
			})

			UrlExtractor["getFileDataFromFile"] = jest.fn((fileName, $http) => {
				return new Promise((resolve, reject) => {
					reject(fileName)
				})
			})

			const expected = "some data"

			return expect(UrlExtractor.getFileDataFromQueryParam($location, $http)).rejects.toMatch(expected)
		})
	})

	describe("getFileDataFromFile", () => {
		it("should reject if file is not existing ", () => {
			return expect(UrlExtractor["getFileDataFromFile"](null, $http)).rejects.toEqual(undefined)
		})

		it("should reject if file length is 0 ", () => {
			return expect(UrlExtractor["getFileDataFromFile"]("", $http)).rejects.toEqual(undefined)
		})

		it("should resolve data and return an object with content and fileName", () => {
			const expected = { content: "some data", fileName: "test.json" }
			return expect(UrlExtractor["getFileDataFromFile"]("test.json", $http)).resolves.toEqual(expected)
		})

		it("should reject if statuscode is not 200", async () => {
			$http.get = jest.fn(file => {
				return new Promise((resolve, reject) => {
					resolve({ data: "some data", status: 201 })
				})
			})
			return expect(UrlExtractor["getFileDataFromFile"]("test.json", $http)).rejects.toEqual(undefined)
		})
	})
})
