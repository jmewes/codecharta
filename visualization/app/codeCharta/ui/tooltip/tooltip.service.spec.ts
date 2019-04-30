import "./tooltip.module"

import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IAngularEvent, IRootScopeService } from "angular"
import { TooltipService, Tooltips, TooltipServiceSubscriber, TOOLTIPS_CHANGED_EVENT_ID, NO_DESCRIPTION } from "./tooltip.service"

describe("tooltip.service", () => {
	let $rootScope, tooltipService: TooltipService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.tooltip")
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildService() {
		tooltipService = new TooltipService($rootScope)
	}

	it("setting tooltips broadcasts the correct angular event", done => {
		let values: Tooltips = {
			a: "a",
			b: "b"
		}

		$rootScope.$on(TOOLTIPS_CHANGED_EVENT_ID, (event: IAngularEvent, tooltips: Tooltips) => {
			expect(tooltips).toBe(values)
			done()
		})

		tooltipService.tooltips = values
	})

	it("setting tooltips notifies subscriber", done => {
		let values: Tooltips = {
			a: "a",
			b: "b"
		}

		let subscriber: TooltipServiceSubscriber = {
			onTooltipsChanged: (tooltips: Tooltips, event: Event) => {
				expect(tooltips).toBe(values)
				done()
			}
		}

		tooltipService.subscribe(subscriber)
		tooltipService.tooltips = values
	})

	it("default tooltips should be tooltips from json file", () => {
		expect(tooltipService.tooltips).toBe(require("../../assets/tooltips.json"))
	})

	it("Should return the correct description of the given metric", () => {
		tooltipService.tooltips = { a: "a description" }
		expect(tooltipService.getTooltipTextByKey("a")).toBe("a description")
	})

	it("Should return no description when the key is not a correct already known key", () => {
		expect(tooltipService.getTooltipTextByKey("")).toBe(NO_DESCRIPTION)
		expect(tooltipService.getTooltipTextByKey(null)).toBe(NO_DESCRIPTION)
		expect(tooltipService.getTooltipTextByKey(undefined)).toBe(NO_DESCRIPTION)
	})

	it("should return nested answer by keys in keys sorrounded by {}", () => {
		tooltipService.tooltips = { a: "a description", c: "c description {a}" }
		expect(tooltipService.getTooltipTextByKey("c")).toBe("c description a description")
	})

	it("should allow strings like lines_of_code", () => {
		tooltipService.tooltips = { a: "lines_of_code", c: "c description {a}" }
		expect(tooltipService.getTooltipTextByKey("a")).toBe("lines_of_code")
		expect(tooltipService.getTooltipTextByKey("c")).toBe("c description lines_of_code")
	})

	it('should return nested "no description" by unknown keys in keys sorrounded by {}', () => {
		tooltipService.tooltips = { d: "d description {as}" }
		expect(tooltipService.getTooltipTextByKey("d")).toBe("d description " + NO_DESCRIPTION)
	})

	it("should return nested into nested descriptions", () => {
		tooltipService.tooltips = { a: "a description", c: "c description {a}", e: "nested descriptions {c}" }
		expect(tooltipService.getTooltipTextByKey("e")).toBe("nested descriptions c description a description")
	})
})