import "./heightSettingsPanel.module"
import { HeightSettingsPanelController } from "./heightSettingsPanel.component"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { Settings } from "../../codeCharta.model"
import { SETTINGS } from "../../util/dataMocks"
import { FileStateHelper } from "../../util/fileStateHelper"

describe("HeightSettingsPanelController", () => {
	let heightSettingsPanelController: HeightSettingsPanelController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService

	let settings: Settings

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.heightSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildController() {
		heightSettingsPanelController = new HeightSettingsPanelController($rootScope, settingsService)
	}

	function withMockedSettingsService() {
		settingsService = heightSettingsPanelController["settingsService"] = jest.fn().mockReturnValue({
			updateSettings: jest.fn()
		})()
	}

	describe("constructor", () => {
		beforeEach(() => {
			SettingsService.subscribe = jest.fn()
			FileStateService.subscribe = jest.fn()
		})

		it("should subscribe to SettingsService", () => {
			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})

		it("should subscribe to FileStateService", () => {
			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})
	})

	describe("onSettingsChanged", () => {
		it("should set amountOfTopTables in viewModel", () => {
			heightSettingsPanelController.onSettingsChanged(settings, undefined, undefined)

			expect(heightSettingsPanelController["_viewModel"].amountOfTopLabels).toBe(31)
		})

		it("should set scalingY in viewModel", () => {
			heightSettingsPanelController.onSettingsChanged(settings, undefined, undefined)

			expect(heightSettingsPanelController["_viewModel"].scalingY).toBe(1.8)
		})

		it("should set invertHeight in viewModel", () => {
			heightSettingsPanelController.onSettingsChanged(settings, undefined, undefined)

			expect(heightSettingsPanelController["_viewModel"].invertHeight).toBeTruthy()
		})
	})

	describe("onFileSelectionStateChanged", () => {
		beforeEach(() => {
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(true)
		})

		it("should set isDeltaState in viewModel", () => {
			heightSettingsPanelController.onFileSelectionStatesChanged([], undefined)

			expect(heightSettingsPanelController["_viewModel"].isDeltaState).toBe(true)
		})

		it("should call isDeltaState with empty array", () => {
			heightSettingsPanelController.onFileSelectionStatesChanged([], undefined)

			expect(FileStateHelper.isDeltaState).toHaveBeenCalledWith([])
		})
	})

	describe("applySettings", () => {
		it("should call updateSettings", () => {
			heightSettingsPanelController["_viewModel"].amountOfTopLabels = 31
			heightSettingsPanelController["_viewModel"].invertHeight = true
			heightSettingsPanelController["_viewModel"].scalingY = 1.8
			const expected = {
				appSettings: {
					amountOfTopLabels: 31,
					invertHeight: true,
					scaling: {
						y: 1.8
					}
				}
			}

			heightSettingsPanelController.applySettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)
		})
	})
})
