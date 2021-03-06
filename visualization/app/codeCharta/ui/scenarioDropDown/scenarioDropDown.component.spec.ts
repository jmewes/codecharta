import "./scenarioDropDown.module"
import "../codeMap/threeViewer/threeViewer.module"
import { ScenarioDropDownController } from "./scenarioDropDown.component"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { MetricService } from "../../state/metric.service"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { MetricData } from "../../codeCharta.model"

describe("ScenarioDropDownController", () => {
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let scenarioButtonsController: ScenarioDropDownController
	let metricData: MetricData[]

	function rebuildController() {
		scenarioButtonsController = new ScenarioDropDownController($rootScope, settingsService, threeOrbitControlsService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.scenarioDropDown")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")

		metricData = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
	}

	function withMockedSettingsService() {
		settingsService = scenarioButtonsController["settingsService"] = jest.fn(() => {
			return {
				updateSettings: jest.fn()
			}
		})()
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = scenarioButtonsController["threeOrbitControlsService"] = jest.fn(() => {
			return {
				autoFitTo: jest.fn()
			}
		})()
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
		withMockedThreeOrbitControlsService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("constructor", () => {
		it("should subscribe to MetricService on construction", () => {
			MetricService.subscribe = jest.fn()

			scenarioButtonsController = new ScenarioDropDownController($rootScope, settingsService, threeOrbitControlsService)

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, scenarioButtonsController)
		})
	})

	describe("onMetricDataAdded", () => {
		it("should call getScenarios and set the scenarios in viewmodel correctly", () => {
			ScenarioHelper.getScenarios = jest.fn().mockReturnValue([{ name: "scenario", settings: {} }])

			scenarioButtonsController.onMetricDataAdded(metricData, undefined)

			expect(ScenarioHelper.getScenarios).toHaveBeenCalledWith(metricData)
			expect(scenarioButtonsController["_viewModel"].scenarios).toEqual([{ name: "scenario", settings: {} }])
		})
	})

	describe("applySettings", () => {
		it("should call getScenarioSettingsByName and set call updateSettings with scenarioSettings", () => {
			const mockScenarioSettings = {}
			ScenarioHelper.getScenarioSettingsByName = jest.fn().mockReturnValue(mockScenarioSettings)
			scenarioButtonsController["_viewModel"].selectedName = "scenario"

			scenarioButtonsController.applySettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(mockScenarioSettings)
			expect(scenarioButtonsController["_viewModel"].selectedName).toBeNull()
			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
		})
	})
})
