/// <reference path="../Declarations/forguncy.d.ts" />
/// <reference path="../Declarations/forguncy.Plugin.d.ts" />


class TooltipCommand extends Forguncy.Plugin.CommandBase {

    // 获取提示框配置
    getConfig() {
        this.isTargetCell = this.CommandParam.IsTargetCell;

        if (this.isTargetCell == true) {
            this.targetCellFormula = this.CommandParam.TargetCellFormula;
            this.targetCellLocation = this.getCellLocation(this.targetCellFormula);
            this.targetCell = Forguncy.Page.getCellByLocation(this.targetCellLocation);

            this.isRepeater = this.CommandParam.IsRepeater;
        } else {
            this.classNameFormula = this.CommandParam.ClassNameFormula;
            this.className = this.evaluateFormula(this.classNameFormula);
        }
    }

    // 获取提示框样式的配置
    getStyleConfig() {
        this.position = this.CommandParam.TooltipPosition;

        if (this.position == 0 || this.position == 3) {
            // 当提示框位于目标上下位置时，获取水平位移
            this.positionX = this.CommandParam.TooltipPositionX;
        } else {
            // 当提示框位于目标左右位置时，获取垂直位移
            this.positionY = this.CommandParam.TooltipPositionY;
        }


        this.tooltipColor = this.CommandParam.TooltipColor;
        this.tooltipCSSColor = Forguncy.ConvertToCssColor(this.tooltipColor);
        this.isFocusShow = this.CommandParam.IsFocusedShow;
        this.minWidth = this.CommandParam.MinWidth;

        this.isFixedWidth = this.CommandParam.IsFixedWidth;

        if (!this.isFixedWidth) {
            this.maxWidth = this.CommandParam.MaxWidth;
        }

    }

    // 获取文字以及文字样式的配置
    getTextStyleConfig() {
        this.tooltipTextFormula = this.CommandParam.TooltipTextFormula;
        this.tooltipText = this.evaluateFormula(this.tooltipTextFormula);

        //this.isMultiline = this.CommandParam.IsMultiline;

        this.textFontSize = this.CommandParam.TextFontSize;
        this.textFontColor = this.CommandParam.TextFontColor;
        this.textFontCSSColor = Forguncy.ConvertToCssColor(this.textFontColor);
    }


    execute() {
        this.getConfig();

        this.map = this.getCurrentPageMap();


        // 若是指定单元格，先构造Class，然后添加到对应目标单元格上
        if (this.isTargetCell == true) {
            if (this.targetCell == null) {
                this.log("目标单元格不能为空");
            }
            this.setTargetCellClassName();
        }

        this.setTooltip();
    }

    // 活字格页面默认存在一个全局Map，弹出页面会创建一个子Map，执行命令只会获取对应页面的Map
    getCurrentPageMap() {
        if (GlobalMap.get("pageEnentBind") == null) {

            // 绑定页面加载事件，只有弹出页面才会执行
            //Forguncy.Page.bind("pageDefaultDataLoaded", function () {
            Forguncy.Page.bind("loaded", function () {
                if (Forguncy.ForguncyData.pageInfo.isPopup) {
                    let popPageCount = GlobalMap.get("popPageCount");
                    if (popPageCount == null) {
                        popPageCount = 1;
                    } else {
                        popPageCount++;
                    }
                    GlobalMap.set("popPageCount", popPageCount);
                    GlobalMap.set("popPageMap" + popPageCount, new Map());
                } else {
                    GlobalMap.clear();
                    return;
                }
            }, "*")

            // 给弹出页面绑定弹出页面关闭事件
            Forguncy.Page.bind("popupClosed", function () {
                let popPageCount = GlobalMap.get("popPageCount");

                if (popPageCount == 0) {
                    this.log("关闭弹出页面数据出现错误，可能会导致页面使用异常")
                } else {
                    GlobalMap.delete("popPageMap" + popPageCount);
                    popPageCount--;
                    GlobalMap.set("popPageCount", popPageCount);
                }

            }, "*")

            GlobalMap.set("pageEnentBind", true);
        }

        if (GlobalMap.get("popPageCount") == null || GlobalMap.get("popPageCount") == 0) {
            return GlobalMap;
        } else {
            return GlobalMap.get("popPageMap" + GlobalMap.get("popPageCount"));
        }
    }

    setTargetCellClassName() {
        let targetCellid = this.targetCell._pageCell.id + "_div";
        let targetCellDom = document.getElementById(targetCellid);
        let repeaterName = "";
        let targetCellClassName = "";
        if (this.isRepeater) {
            let repeaterIndex = this.map.get("repeaterContainter")

            if (repeaterIndex == null) {
                repeaterIndex = 1;
            } else {
                repeaterIndex++;
            }
            repeaterName = "repeater" + repeaterIndex;
            this.map.set("repeaterContainter", repeaterIndex);

            targetCellClassName = "__" + repeaterName;
        }
        targetCellClassName = targetCellClassName + "__" + this.targetCellFormula.substring(1) + "__tooltip__";


        if (this.map.get(targetCellClassName) == null) {
            this.map.set(targetCellClassName, 0);
            targetCellDom.classList.add(targetCellClassName);
        }
        this.className = targetCellClassName;

    }

    setTooltip() {
        let tooltips;
        if (GlobalMap.get("popPageCount") != null && GlobalMap.get("popPageCount") != 0) {
            // 若存在弹出页面，获取最后一个弹出页面对应的DOM元素
            let popPages = document.getElementsByClassName("FUI-dialog-outer");
            let lastPopPage = popPages[popPages.length - 1];
            tooltips = lastPopPage.getElementsByClassName(this.className);
        } else {
            tooltips = document.getElementsByClassName(this.className);
        }
        if (tooltips.length == 0) {
            this.log("未找到类名为 " + this.className + " 的元素");
            return;
        }

        if (this.map.get(this.className) == null ||
            this.map.get(this.className) == 0) {
            for (let i = 0; i < tooltips.length; i++) {
                let tooltip = tooltips[i];
                tooltip.classList.add("__tooltip__");
                this.setTooltipPosition(tooltip);
                this.setTooltipText(tooltip);

                this.setTooltipTextFontSize(tooltip);
                this.setTooltipTextFontColor(tooltip);
            }

            this.map.set(this.className, 1);
        } else {
            for (let i = 0; i < tooltips.length; i++) {
                let tooltip = tooltips[i];
                this.setTooltipText(tooltip);
            }
        }
    }

    setTooltipPosition(tooltip) {
        this.getStyleConfig();
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
        if (this.position >= 0 && this.position <= 3) {
            this.setTooltipPositionTranslate(tooltip);
            this.setFocusedShow(tooltip);
            this.setTooltipMinWidth(tooltip);
            //this.setTooltipMaxWidth(tooltip);
            this.setTooltipColor(tooltip);
        }
    }

    // 设置相对位移
    setTooltipPositionTranslate(tooltip) {

        var style = document.createElement("style");
        var classname = '.' + this.className;

        if (this.position == 0 || this.position == 3) {
            if (this.positionX == 50) return;
            var changeBefore = document.createTextNode(classname + '.__top__::before,'
                + classname + '.__bottom__::before'
                + '{left: ' + this.positionX + '%;}');
            var changeAfter = document.createTextNode(classname + '.__top__::after,'
                + classname + '.__bottom__:after'
                + '{left: ' + this.positionX + '%;}');
            style.appendChild(changeBefore);
            style.appendChild(changeAfter);
        }
        else {
            if (this.positionY == 50) return;
            var changeBefore = document.createTextNode(classname + '.__left__::before,'
                + classname + '.__right__::before'
                + '{top: ' + this.positionY + '%;}');
            var changeAfter = document.createTextNode(classname + '.__left__::after,'
                + classname + '.__right__:after'
                + '{top: ' + this.positionY + '%;}');
            style.appendChild(changeBefore);
            style.appendChild(changeAfter);
        }

        tooltip.appendChild(style);
    }

    // 设置获取焦点时显示
    setFocusedShow(tooltip) {

        var style = document.createElement("style");
        var classname = '.' + this.className;

        if (this.isFocusShow) {
            this.log("focus get");
            var changeBefore = document.createTextNode(classname + ':focus-within::before'
                + '{display: block;}');
            var changeAfter = document.createTextNode(classname + ':focus-within::after'
                + '{display: inline-block;}');
            style.appendChild(changeBefore);
            style.appendChild(changeAfter);
        }
        else {
            this.log("focus none");
            var changeBefore = document.createTextNode(classname + ':focus-within::before'
                + '{display: none;}');
            var changeAfter = document.createTextNode(classname + ':focus-within::after'
                + '{display: none;}');
            style.appendChild(changeBefore);
            style.appendChild(changeAfter);
        }

        tooltip.appendChild(style);
    }

    // 设置展示Tooltip最小宽度
    setTooltipMinWidth(tooltip) {
        //if (this.minWidth == 200) return;
        this.log("min-width: " + this.minWidth)
        var style = document.createElement("style");
        var classname = '.' + this.className;

        var change;

        switch (this.position) {
            case 0:
                change = document.createTextNode(classname + '.__top__::before{min-width: ' + this.minWidth + 'px;}');
                break;
            case 1:
                change = document.createTextNode(classname + '.__left__::before{min-width: ' + this.minWidth + 'px;}');
                break;
            case 2:
                change = document.createTextNode(classname + '.__right__::before{min-width: ' + this.minWidth + 'px;}');
                break;
            case 3:
                change = document.createTextNode(classname + '.__bottom__::before{min-width: ' + this.minWidth + 'px;}');
                break;
            default:
                alert("min-width error");
                break;
        }

        style.appendChild(change);

        tooltip.appendChild(style);
    }

    // 设置展示Tooltip最大宽度
    setTooltipMaxWidth(tooltip) {
        var maxWidth = 200;
        if (this.isFixedWidth) {
            maxWidth = this.minWidth

        } else {
            maxWidth = this.maxWidth
        }
        this.log("max-width: " + maxWidth)

        var style = document.createElement("style");
        var classname = '.' + this.className;

        var change;

        switch (this.position) {
            case 0:
                change = document.createTextNode(classname + '.__top__::before{max-width: ' + maxWidth + 'px;}');
                break;
            case 1:
                change = document.createTextNode(classname + '.__left__::before{max-width: ' + maxWidth + 'px;}');
                break;
            case 2:
                change = document.createTextNode(classname + '.__right__::before{max-width: ' + maxWidth + 'px;}');
                break;
            case 3:
                change = document.createTextNode(classname + '.__bottom__::before{max-width: ' + maxWidth + 'px;}');
                break;
            default:
                alert("max-width error");
                break;
        }

        style.appendChild(change);

        tooltip.appendChild(style);
    }

    // 设置Tooltip颜色
    setTooltipColor(tooltip) {
        if (this.tooltipCSSColor == null) return;
        this.log("Color: " + this.tooltipCSSColor);

        var style = document.createElement("style");
        var classname = '.' + this.className;

        var changeBackground;
        var positionChange;
        switch (this.position) {
            case 0:
                positionChange = document.createTextNode(classname + '.__top__::after{border-top-color:' + this.tooltipCSSColor + ';}');
                changeBackground = document.createTextNode(classname + '.__top__::before{background-color: ' + this.tooltipCSSColor + ';}');
                break;
            case 1:
                positionChange = document.createTextNode(classname + '.__left__::after{border-left-color:' + this.tooltipCSSColor + ';}');
                changeBackground = document.createTextNode(classname + '.__left__::before{background-color: ' + this.tooltipCSSColor + ';}');
                break;
            case 2:
                positionChange = document.createTextNode(classname + '.__right__::after{border-right-color:' + this.tooltipCSSColor + ';}');
                changeBackground = document.createTextNode(classname + '.__right__::before{background-color: ' + this.tooltipCSSColor + ';}');
                break;
            case 3:
                positionChange = document.createTextNode(classname + '.__bottom__::after{border-bottom-color:' + this.tooltipCSSColor + ';}');
                changeBackground = document.createTextNode(classname + '.__bottom__::before{background-color: ' + this.tooltipCSSColor + ';}');
                break;
            default:
                alert("TooltipColor error");
                break;
        }

        style.appendChild(changeBackground);
        style.appendChild(positionChange);

        tooltip.appendChild(style);
    }

    // 设置展示内容样式
    setTooltipTextStyle(tooltip) {
        this.getTextStyleConfig();

        var style = document.createElement("style");
        var classname = '.' + this.className;

        var change = document.createTextNode(classname + '::before{content: attr(tooltipText)}');

        style.appendChild(change);
        tooltip.appendChild(style);
    }

    // 设置展示内容
    setTooltipText(tooltip) {
        this.getTextStyleConfig();
        if (this.isTargetCell) {
            if (this.isRepeater) {
                this.log("图文列表中，设置单元格为 " + this.targetCellFormula + " 的文本内容为 \"" + this.tooltipText + "\"");
            } else {
                this.log("设置单元格为 " + this.targetCellFormula + " 的文本内容为 \n\"" + this.tooltipText + "\"");
            }

        } else {
            this.log("设置类名为 " + this.className + " 的文本内容为 \n\"" + this.tooltipText + "\"");
        }

        tooltip.setAttribute("tooltipText", this.tooltipText);
    }

    // 设置展示内容文字大小
    setTooltipTextFontSize(tooltip) {
        //if (this.textFontSize == 14.67) return;
        this.log("Tooltip Text Font-Size: " + this.textFontSize + "px");

        var style = document.createElement("style");
        var classname = '.' + this.className;

        var change;
        switch (this.position) {
            case 0:
                change = document.createTextNode(classname + '.__top__::before{font-size: ' + this.textFontSize + 'px;}');
                break;
            case 1:
                change = document.createTextNode(classname + '.__left__::before{font-size: ' + this.textFontSize + 'px;}');
                break;
            case 2:
                change = document.createTextNode(classname + '.__right__::before{font-size: ' + this.textFontSize + 'px;}');
                break;
            case 3:
                change = document.createTextNode(classname + '.__bottom__::before{font-size: ' + this.textFontSize + 'px;}');
                break;
            default:
                alert("TooltipTextFontSize error");
                break;
        }

        style.appendChild(change);
        tooltip.appendChild(style);
    }

    // 设置展示内容文字颜色
    setTooltipTextFontColor(tooltip) {
        if (this.textFontColor == null) return;
        this.log("Tooltip Text Font-Color: " + this.textFontColor);

        var style = document.createElement("style");
        var classname = '.' + this.className;

        var change;
        switch (this.position) {
            case 0:
                change = document.createTextNode(classname + '.__top__::before{color: ' + this.textFontCSSColor + ';}');
                break;
            case 1:
                change = document.createTextNode(classname + '.__left__::before{color: ' + this.textFontCSSColor + ';}');
                break;
            case 2:
                change = document.createTextNode(classname + '.__right__::before{color: ' + this.textFontCSSColor + ';}');
                break;
            case 3:
                change = document.createTextNode(classname + '.__bottom__::before{color: ' + this.textFontCSSColor + ';}');
                break;
            default:
                alert("TooltipTextFontColor error");
                break;
        }

        style.appendChild(change);
        tooltip.appendChild(style);
    }

}

Forguncy.Plugin.CommandFactory.registerCommand("Tooltip.TooltipCommand, Tooltip", TooltipCommand);
