/// <reference path="../Declarations/forguncy.d.ts" />
/// <reference path="../Declarations/forguncy.Plugin.d.ts" />


class TooltipCommand extends Forguncy.Plugin.CommandBase {

    getParam() {

        // 获取提示框配置
        this.isTargetCell = this.CommandParam.IsTargetCell;

        if (this.isTargetCell == true) {
            this.targetCellFormula = this.CommandParam.TargetCell;
            this.cellLocation = this.getCellLocation(this.targetCellFormula);
            this.targetCell = Forguncy.Page.getCellByLocation(this.cellLocation);

            this.isRepeater = this.CommandParam.IsRepeater;
        } else {
            this.className = this.CommandParam.ClassName;
            this.resultClassName = this.evaluateFormula(this.className);
        }

        

        // 获取提示框样式的配置
        this.position = this.CommandParam.TooltipPosition;
        this.positionX = this.CommandParam.TooltipPositionX;
        this.positionY = this.CommandParam.TooltipPositionY;
        this.color = this.CommandParam.TooltipColor;
        this.resultColor = Forguncy.ConvertToCssColor(this.color);
        this.focusShow = this.CommandParam.GetFocusedShow;
        this.minWidth = this.CommandParam.MinWidth;

        // 获取文字以及文字样式的配置
        this.text = this.CommandParam.TooltipText;
        this.resultText = this.evaluateFormula(this.text);
        this.textFontSize = this.CommandParam.TextFontSize;
        this.textFontColor = this.CommandParam.TextFontColor;
        this.resultTextFontColor = Forguncy.ConvertToCssColor(this.textFontColor);
    }
    execute() {
        if (typeof map.get("isBindEvent") === "undefined") {
            Forguncy.Page.bind("PageDefaultDataLoaded", function () {
                if (Forguncy.ForguncyData.pageInfo.isPopup) {
                    console.log("弹出页面，新建一个map");
                    map.set("popUpPage", 1);
                    var oldMap = map;
                }

                map.clear();
                console.log("map 已清空");
                
            },"*");

            Forguncy.Page.bind("PopupClosed", function (arg1,arg2) {
                map.clear();

                console.log("弹出页面已关闭，map 已清空")
            }, "*");

            map.set("isBindEvent", true);
        }

        this.getParam();
        if (this.isTargetCell == true) {
            if (this.targetCell == null) {
                this.log("目标单元格不能为空");
            }
            this.setTargetCellClassName();
        }
        this.setTooltip();
    }

    setTargetCellClassName() {
        this.targetCellid = this.targetCell._pageCell.id + "_div";
        this.targetCellDom = document.getElementById(this.targetCellid);
        this.repeaterName = "";
        this.targetCellClassName = "";
        if (this.isRepeater) {
            if (typeof map.get("repeaterContainter") === "undefined") {
                map.set("repeaterContainter", 1);
                this.repeaterName = "repeater" + 1;
            } else {
                var repeaterIndex = map.get("repeaterContainter");
                repeaterIndex++;
                this.repeaterName = "repeater" + repeaterIndex;
                map.set("repeaterContainter", repeaterIndex);
            }
            this.targetCellClassName = "__" + this.repeaterName;
        }
        this.targetCellClassName = this.targetCellClassName + "__" + this.targetCellFormula.substring(1) + "__tooltip__";
        if (typeof map.get(this.targetCellClassName) === "undefined") {
            map.set(this.targetCellClassName, 0);
            this.targetCellDom.classList.add(this.targetCellClassName);
        }
        this.resultClassName = this.targetCellClassName;
        
    }

    setTooltip() {
        let tooltips = document.getElementsByClassName(this.resultClassName);
        if (tooltips.length == 0) {
            this.log("未找到类名为 " + this.resultClassName + " 的元素");
            return;
        }

        if (typeof map.get(this.resultClassName) === "undefined" ||
            map.get(this.resultClassName) == 0) {
            for (let i = 0; i < tooltips.length; i++) {
                let tooltip = tooltips[i];
                tooltip.classList.add("__tooltip__");
                this.setTooltipPosition(tooltip);
                this.setTooltipText(tooltip);
            }

            this.setTooltipPositionTranslate();
            this.setTooltipColor();
            this.setFocusedShow();
            this.setTooltipMinWidth();
            this.setTooltipTextFontSize();
            this.setTooltipTextFontColor();

            map.set(this.resultClassName, 1);
        } else {
            for (let i = 0; i < tooltips.length; i++) {
                let tooltip = tooltips[i];
                this.setTooltipText(tooltip);
            }
        }
        
    }

    setTooltipPosition(tooltip) {
        tooltip.classList.remove("__top__", "__left__", "__right__", "__bottom__");
        switch (this.position) {
            case 0:
                tooltip.classList.add("__top__");
                break;
            case 1:
                tooltip.classList.add("__left__");
                break;
            case 2:
                tooltip.classList.add("__right__");
                break;
            case 3:
                tooltip.classList.add("__bottom__");
                break;
            default:
                alert("position error");
                break;
        }
    }

    setTooltipPositionTranslate() {
        if (this.position == 0 || this.position == 3) {
            if (this.positionX == 50) return;
            var style = document.createElement("style");
            var classname = '.' + this.resultClassName;
            var changeBefore = document.createTextNode(classname + '.__top__::before,'
                + classname + '.__bottom__::before'
                + '{left: ' + this.positionX + '%;}');
            var changeAfter = document.createTextNode(classname + '.__top__::after,'
                + classname + '.__bottom__:after'
                + '{left: ' + this.positionX + '%;}');
            style.appendChild(changeBefore);
            style.appendChild(changeAfter);
            document.body.appendChild(style);
        }
        else {
            if (this.positionY == 50) return;
            var style = document.createElement("style");
            var classname = '.' + this.resultClassName;
            var changeBefore = document.createTextNode(classname + '.__left__::before,'
                + classname + '.__right__::before'
                + '{top: ' + this.positionY + '%;}');
            var changeAfter = document.createTextNode(classname + '.__left__::after,'
                + classname + '.__right__:after'
                + '{top: ' + this.positionY + '%;}');
            style.appendChild(changeBefore);
            style.appendChild(changeAfter);
            document.body.appendChild(style);
        }
    }

    // 设置颜色
    setTooltipColor() {
        if (typeof this.resultColor === "undefined") return;
        this.log("Color: " + this.resultColor);
        var style = document.createElement("style");
        var classname = '.' + this.resultClassName;
        var change = document.createTextNode(classname + '::before{background-color: ' + this.resultColor + ';}');
        var changeTop = document.createTextNode(classname + '.__top__::after{border-top-color:' + this.resultColor + ';}');
        var changeLeft = document.createTextNode(classname + '.__left__::after{border-left-color:' + this.resultColor + ';}');
        var changeRight = document.createTextNode(classname + '.__right__::after{border-right-color:' + this.resultColor + ';}');
        var changeBottom = document.createTextNode(classname + '.__bottom__::after{border-bottom-color:' + this.resultColor + ';}');

        style.appendChild(change);
        style.appendChild(changeTop);
        style.appendChild(changeLeft);
        style.appendChild(changeRight);
        style.appendChild(changeBottom);
        document.body.appendChild(style);
    }

    // 设置获取焦点时显示
    setFocusedShow() {
        if (this.focusShow) {
            this.log("focus get");
            var style = document.createElement("style");
            var classname = '.' + this.resultClassName;
            var changeBefore = document.createTextNode(classname + ':focus-within::before'
                + '{display: inline-block;}');
            var changeAfter = document.createTextNode(classname + ':focus-within::after'
                + '{display: inline-block;}');
            style.appendChild(changeBefore);
            style.appendChild(changeAfter);
            document.body.appendChild(style);
        }
        else {
            this.log("focus none");
            var style = document.createElement("style");
            var classname = '.' + this.resultClassName;
            var changeBefore = document.createTextNode(classname + ':focus-within::before'
                + '{display: none;}');
            var changeAfter = document.createTextNode(classname + ':focus-within::after'
                + '{display: none;}');
            style.appendChild(changeBefore);
            style.appendChild(changeAfter);
            document.body.appendChild(style);
        }
    }

    setTooltipMinWidth() {
        this.log("min-width: " + this.minWidth)
        var style = document.createElement("style");
        var classname = '.' + this.resultClassName;
        var change = document.createTextNode(classname + '::before{min-width: ' + this.minWidth + 'px;}');

        style.appendChild(change);
        document.body.appendChild(style);
    }

    // 设置展示内容
    setTooltipText(tooltip) {
        if (this.isTargetCell) {
            if (this.isRepeater) {
                this.log("图文列表中，设置单元格为 " + this.targetCellFormula + " 的文本内容为 \"" + this.resultText + "\"");
            } else {
                this.log("设置单元格为 " + this.targetCellFormula + " 的文本内容为 \"" + this.resultText + "\"");
            }
            
        } else {
            this.log("设置类名为 " + this.resultClassName + " 的文本内容为 \"" + this.resultText + "\"");
        }

        tooltip.setAttribute("tooltipText", this.resultText);
    }

    // 设置展示内容文字大小
    setTooltipTextFontSize(tooltip) {
        if (typeof this.textFontSize === "undefined") return;
        this.log("Tooltip Text Font-Size: " + this.textFontSize + "px");
        var style = document.createElement("style");
        var classname = '.' + this.resultClassName;
        var change = document.createTextNode(classname + '::before{font-size: ' + this.textFontSize + 'px;}');

        style.appendChild(change);
        document.body.appendChild(style);
    }

    // 设置展示内容文字颜色
    setTooltipTextFontColor(tooltip) {
        if (typeof this.textFontColor === "undefined") return;
        this.log("Tooltip Text Font-Color: " + this.resultTextFontColor);
        var style = document.createElement("style");
        var classname = '.' + this.resultClassName;
        var change = document.createTextNode(classname + '::before{color: ' + this.resultTextFontColor + ';}');

        style.appendChild(change);
        document.body.appendChild(style);
    }
}

Forguncy.Plugin.CommandFactory.registerCommand("Tooltip.TooltipCommand, Tooltip", TooltipCommand);
