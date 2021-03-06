import "./loadingGif.module"
import { LoadingGifController } from "./loadingGif.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { LoadingGifService } from "./loadingGif.service"

describe("LoadingGifController", () => {
	let loadingGifController: LoadingGifController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let loadingGifService: LoadingGifService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedLoadingGifService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.loadingGif")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		loadingGifService = getService<LoadingGifService>("loadingGifService")
	}

	function rebuildController() {
		loadingGifController = new LoadingGifController($rootScope, $timeout)
	}

	function withMockedLoadingGifService() {
		loadingGifService = loadingGifController["loadingGifService"] = jest.fn().mockReturnValue({
			updateLoadingFileFlag: jest.fn(),
			updateLoadingMapFlag: jest.fn()
		})()
	}

	describe("constructor", () => {
		beforeEach(() => {
			LoadingGifService.subscribe = jest.fn()
		})

		it("should subscribe to LoadingGifService", () => {
			rebuildController()

			expect(LoadingGifService.subscribe).toHaveBeenCalledWith($rootScope, loadingGifController)
		})

		it("should set attribute isLoadingFile to true", () => {
			rebuildController()

			expect(loadingGifController["_viewModel"].isLoadingFile).toBeTruthy()
		})

		it("should set attribute isLoadingMap to true", () => {
			rebuildController()

			expect(loadingGifController["_viewModel"].isLoadingMap).toBeTruthy()
		})
	})

	describe("onLoadingFileStatusChanged", () => {
		it("should set isLoadingFile in viewModel", () => {
			loadingGifController.onLoadingFileStatusChanged(true, undefined)

			expect(loadingGifController["_viewModel"].isLoadingFile).toBe(true)
		})

		it("should set isLoadingFile in viewModel", () => {
			loadingGifController.onLoadingFileStatusChanged(false, undefined)

			expect(loadingGifController["_viewModel"].isLoadingFile).toBe(false)
		})
	})

	describe("onLoadingMapStatusChanged", () => {
		it("should set isLoadingMap in viewModel", () => {
			loadingGifController.onLoadingMapStatusChanged(true, undefined)

			expect(loadingGifController["_viewModel"].isLoadingMap).toBe(true)
		})

		it("should set isLoadingMap in viewModel", () => {
			loadingGifController.onLoadingMapStatusChanged(false, undefined)

			expect(loadingGifController["_viewModel"].isLoadingMap).toBe(false)
		})
	})
})
