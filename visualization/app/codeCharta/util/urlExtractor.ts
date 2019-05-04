"use strict"
import { ILocationService, IHttpService, IHttpResponse } from "angular"
import { NameDataPair } from "../codeCharta.model";
import _ from "lodash"

export class UrlExtractor {
	private static OK_CODE = 200

	public static getParameterByName(name: string, $location: ILocationService): string {
		const sanitizedName = name.replace(/[\[\]]/g, "\\$&")
		let regex = new RegExp("[?&]" + sanitizedName + "(=([^&#]*)|&|#|$)")
		let results = regex.exec($location.absUrl())

		if (!results) {
			return null
		}
		if (!results[2]) {
			return ""
		}
		return decodeURIComponent(results[2].replace(/\+/g, " "))
	}

	public static getFileDataFromQueryParam($location: ILocationService, $http: IHttpService): Promise<NameDataPair[]> {
		const fileNames: string[] = this.getFileNames($location)
		let fileReadingTasks: Promise<NameDataPair>[] = []

		fileNames.forEach(fileName => {
			fileReadingTasks.push(
				new Promise((resolve, reject) => {
					this.getFileDataFromFile(fileName, $http).then(resolve, reject)
				})
			)
		})

		return Promise.all(fileReadingTasks)
	}

	private static getFileNames($location: ILocationService): string[] {
		let fileNames = $location.search().file

		if (!_.isArray(fileNames)) {
			fileNames = [fileNames]
		}
		return fileNames
	}

	private static getFileDataFromFile(fileName: string, $http: IHttpService): Promise<NameDataPair> {
		return new Promise((resolve, reject) => {
			if (fileName && fileName.length > 0) {
				$http.get(fileName).then((response: IHttpResponse<Object>) => {
					if (response.status === UrlExtractor.OK_CODE) {
						Object.assign(response.data, { fileName: fileName })
						resolve({ fileName: fileName, content: response.data })
					} else {
						reject()
					}
				}, reject)
			} else {
				reject()
			}
		})
	}
}
