import "./revisionChooser.component.scss"
import "./revisionChooserFileDropDown.component.scss"
import { CCFile, FileSelectionState, FileState } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import { FileStateHelper } from "../../util/fileStateHelper"

interface SelectedFileNames {
	single: string
	delta: {
		reference: string
		comparison: string
	}
	partial: string[]
}

export class RevisionChooserController implements FileStateServiceSubscriber {
	private lastRenderState: FileSelectionState

	private _viewModel: {
		isSingleState: boolean
		isPartialState: boolean
		isDeltaState: boolean
		fileStates: FileState[]
		renderState: FileSelectionState
		selectedFileNames: SelectedFileNames
	} = {
		isSingleState: null,
		isPartialState: null,
		isDeltaState: null,
		fileStates: [],
		renderState: null,
		selectedFileNames: {
			single: null,
			delta: {
				reference: null,
				comparison: null
			},
			partial: null
		}
	}

	/* @ngInject */
	constructor(private fileStateService: FileStateService, private $rootScope: IRootScopeService) {
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this._viewModel.isSingleState = FileStateHelper.isSingleState(fileStates)
		this._viewModel.isPartialState = FileStateHelper.isPartialState(fileStates)
		this._viewModel.isDeltaState = FileStateHelper.isDeltaState(fileStates)
		this.updateSelectedFileNamesInViewModel(fileStates)
		this.lastRenderState = this._viewModel.renderState
	}

	private updateSelectedFileNamesInViewModel(fileStates: FileState[]) {
		const visibleFileStates = FileStateHelper.getVisibleFileStates(fileStates)

		if (this._viewModel.isSingleState) {
			this._viewModel.renderState = FileSelectionState.Single
			this._viewModel.selectedFileNames.single = visibleFileStates[0].file.fileMeta.fileName
		} else if (this._viewModel.isPartialState) {
			this._viewModel.renderState = FileSelectionState.Partial
			this._viewModel.selectedFileNames.partial = visibleFileStates.map(x => x.file.fileMeta.fileName)
		} else if (this._viewModel.isDeltaState) {
			this._viewModel.renderState = FileSelectionState.Comparison

			this._viewModel.selectedFileNames.delta.reference =
				visibleFileStates.length == 2
					? visibleFileStates.find(x => x.selectedAs === FileSelectionState.Reference).file.fileMeta.fileName
					: visibleFileStates[0].file.fileMeta.fileName

			this._viewModel.selectedFileNames.delta.comparison =
				visibleFileStates.length == 2
					? visibleFileStates.find(x => x.selectedAs === FileSelectionState.Comparison).file.fileMeta.fileName
					: visibleFileStates[0].file.fileMeta.fileName
		}
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this._viewModel.fileStates = fileStates
	}

	public onSingleFileChange(singleFileName: string) {
		const singleFile: CCFile = FileStateHelper.getFileByFileName(singleFileName, this.fileStateService.getFileStates())
		this.fileStateService.setSingle(singleFile)
	}

	public onDeltaReferenceFileChange(referenceFileName: string) {
		const referenceFile: CCFile = FileStateHelper.getFileByFileName(referenceFileName, this.fileStateService.getFileStates())
		const comparisonFile: CCFile = FileStateHelper.getFileByFileName(
			this._viewModel.selectedFileNames.delta.comparison,
			this.fileStateService.getFileStates()
		)
		this.fileStateService.setDelta(referenceFile, comparisonFile)
	}

	public onDeltaComparisonFileChange(comparisonFileName: string) {
		const referenceFile: CCFile = FileStateHelper.getFileByFileName(
			this._viewModel.selectedFileNames.delta.reference,
			this.fileStateService.getFileStates()
		)
		const comparisonFile: CCFile = FileStateHelper.getFileByFileName(comparisonFileName, this.fileStateService.getFileStates())
		this.fileStateService.setDelta(referenceFile, comparisonFile)
	}

	public onPartialFilesChange(partialFileNames: string[]) {
		const partialFiles: CCFile[] = []

		partialFileNames.forEach(fileName => {
			partialFiles.push(FileStateHelper.getFileByFileName(fileName, this.fileStateService.getFileStates()))
		})
		this.fileStateService.setMultiple(partialFiles)
	}

	public onRenderStateChange(renderState: FileSelectionState) {
		if (renderState === FileSelectionState.Single) {
			this._viewModel.selectedFileNames.single = this.getLastVisibleFileName()
			this.onSingleFileChange(this._viewModel.selectedFileNames.single)
		} else if (renderState === FileSelectionState.Partial) {
			this.selectAllPartialFiles()
		} else if (renderState === FileSelectionState.Comparison) {
			this._viewModel.selectedFileNames.delta.reference = this.getLastVisibleFileName()
			this.onDeltaComparisonFileChange(null)
		}
	}

	public selectAllPartialFiles() {
		const allFileNames = this.fileStateService.getFileStates().map(x => x.file.fileMeta.fileName)
		this.onPartialFilesChange(allFileNames)
	}

	public selectZeroPartialFiles() {
		this.onPartialFilesChange([])
	}

	public invertPartialFileSelection() {
		const invertedFileNames: string[] = this.fileStateService
			.getFileStates()
			.filter(x => x.selectedAs === FileSelectionState.None)
			.map(x => x.file.fileMeta.fileName)

		this.onPartialFilesChange(invertedFileNames)
	}

	private getLastVisibleFileName(): string {
		if (this.lastRenderState === FileSelectionState.Single) {
			return this._viewModel.selectedFileNames.single
		} else if (this.lastRenderState === FileSelectionState.Partial) {
			const visibleFileStates = FileStateHelper.getVisibleFileStates(this._viewModel.fileStates)
			if (FileStateHelper.getVisibleFileStates(this._viewModel.fileStates).length > 0) {
				return visibleFileStates[0].file.fileMeta.fileName
			} else {
				return this._viewModel.fileStates[0].file.fileMeta.fileName
			}
		} else if (this.lastRenderState === FileSelectionState.Comparison) {
			return this._viewModel.selectedFileNames.delta.reference
		}
	}
}

export const revisionChooserComponent = {
	selector: "revisionChooserComponent",
	template: require("./revisionChooser.component.html"),
	controller: RevisionChooserController
}
export const revisionChooserFileDropDownComponent = {
	selector: "revisionChooserFileDropDownComponent",
	template: require("./revisionChooserFileDropDown.component.html"),
	controller: RevisionChooserController
}
