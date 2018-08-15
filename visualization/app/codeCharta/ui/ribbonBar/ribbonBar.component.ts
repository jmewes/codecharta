import "./ribbonBar.component.scss";
import $ from "jquery";

export class RibbonBarController {

    private heightExpanded = 300;
    private heightCollapsed = $("ribbon-bar-component #header").height();
    private collapsingElements = $("ribbon-bar-component #header, ribbon-bar-component .section-body");

    private isExpanded: boolean = false;

    /* @ngInject */
    constructor() {
        $(document).on("mousemove", this.onMouseMove.bind(this));
    }

    private onMouseMove(e) {
        if (e.pageY <= this.heightCollapsed && !this.isExpanded) {
            this.expand();
        } else if (e.pageY > this.heightExpanded && this.isExpanded) {
            this.collapse();
        }
    }

    public expand() {
        this.isExpanded = true;
        this.collapsingElements.addClass("expanded");
    }

    public collapse() {
        this.isExpanded = false;
        this.collapsingElements.removeClass("expanded");
    }

}

export const ribbonBarComponent = {
    selector: "ribbonBarComponent",
    template: require("./ribbonBar.component.html"),
    controller: RibbonBarController
};

