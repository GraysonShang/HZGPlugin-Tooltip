/// <reference path="../Declarations/forguncy.d.ts" />
/// <reference path="../Declarations/forguncy.Plugin.d.ts" />


class TooltipCommand extends Forguncy.Plugin.CommandBase {

    // 获取提示框配置
    getConfig() {
        if (Forguncy.PageInfo.TooltipGlobalMap == undefined) {
            Forguncy.PageInfo.TooltipGlobalMap = new Map();
        }
        this.isTargetCell = this.CommandParam.IsTargetCell;

        if (this.isTargetCell == true) {
            this.targetCellFormula = this.CommandParam.TargetCellFormula;
            this.targetCellLocation = this.getCellLocation(this.targetCellFormula);
            this.targetCell = Forguncy.Page.getCellByLocation(this.targetCellLocation);

            this.isRepeater = this.CommandParam.IsRepeater;
            if (this.isRepeater == true) {
                this.isOverflow = this.CommandParam.IsOverflow;
                if (this.isOverflow == true) {
                    this.repeaterClassNameFormula = this.CommandParam.RepeaterClassNameFormula;
                    this.repeaterClassName = this.evaluateFormula(this.repeaterClassNameFormula);
                }
            }
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

        if (this.isRepeater == true) {
            if (this.isOverflow == true) {

                //this.setTooltipOverflowInRepeater();
                //this.log(`图文列表${this.repeaterClassName}设置了溢出图文列表显示`);
                if (Forguncy.PageInfo.TooltipGlobalMap.get(`${this.repeaterClassName}-repeaterOverflow`) == undefined ||
                    Forguncy.PageInfo.TooltipGlobalMap.get(`${this.repeaterClassName}-repeaterOverflow`) == false) {
                    if (this.setTooltipOverflowInRepeater()) {
                        this.log(`图文列表${this.repeaterClassName}设置了溢出显示`);
                    } else {
                        this.log(`当前图文列表${this.repeaterClassName}溢出模式下，不能设置溢出显示`);
                    }
                    Forguncy.PageInfo.TooltipGlobalMap.set(`${this.repeaterClassName}-repeaterOverflow`, true)
                    
                }
            }
        }

        this.setTooltip();
    }

    // 活字格页面默认存在一个全局Map，弹出页面会创建一个子Map，执行命令只会获取对应页面的Map
    getCurrentPageMap() {
        if (Forguncy.PageInfo.TooltipGlobalMap.get("pageEnentBind") == null) {

            // 绑定页面加载事件，只有弹出页面才会执行
            //Forguncy.Page.bind("pageDefaultDataLoaded", function () {
            Forguncy.Page.bind("loaded", function () {
                if (Forguncy.ForguncyData.pageInfo.isPopup) {
                    let popPageCount = Forguncy.PageInfo.TooltipGlobalMap.get("popPageCount");
                    if (popPageCount == null) {
                        popPageCount = 1;
                    } else {
                        popPageCount++;
                    }
                    Forguncy.PageInfo.TooltipGlobalMap.set("popPageCount", popPageCount);
                    Forguncy.PageInfo.TooltipGlobalMap.set("popPageMap" + popPageCount, new Map());
                } else {
                    Forguncy.PageInfo.TooltipGlobalMap.clear();
                    return;
                }
            }, "*")

            // 给弹出页面绑定弹出页面关闭事件
            Forguncy.Page.bind("popupClosed", function () {
                let popPageCount = Forguncy.PageInfo.TooltipGlobalMap.get("popPageCount");

                if (popPageCount == 0) {
                    this.log("关闭弹出页面数据出现错误，可能会导致页面使用异常")
                } else {
                    Forguncy.PageInfo.TooltipGlobalMap.delete("popPageMap" + popPageCount);
                    popPageCount--;
                    Forguncy.PageInfo.TooltipGlobalMap.set("popPageCount", popPageCount);
                }

            }, "*")

            Forguncy.PageInfo.TooltipGlobalMap.set("pageEnentBind", true);
        }

        if (Forguncy.PageInfo.TooltipGlobalMap.get("popPageCount") == null || Forguncy.PageInfo.TooltipGlobalMap.get("popPageCount") == 0) {
            return Forguncy.PageInfo.TooltipGlobalMap;
        } else {
            return Forguncy.PageInfo.TooltipGlobalMap.get("popPageMap" + Forguncy.PageInfo.TooltipGlobalMap.get("popPageCount"));
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
        targetCellClassName = targetCellClassName + "__" + this.targetCellFormula.substring(1).replace(/\./g, "_") + "__tooltip__";


        if (this.map.get(targetCellClassName) == null) {
            this.map.set(targetCellClassName, 0);
            targetCellDom.classList.add(targetCellClassName);
        }

        this.className = targetCellClassName;

    }

    setTooltip() {
        let tooltips;
        if (Forguncy.PageInfo.TooltipGlobalMap.get("popPageCount") != null && Forguncy.PageInfo.TooltipGlobalMap.get("popPageCount") != 0) {
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
                
                // 添加碰撞检测事件监听器
                this.addCollisionDetectionEvents(tooltip);
                this.log("添加了碰撞检测")
            }

            this.map.set(this.className, 1);
        } else {
            for (let i = 0; i < tooltips.length; i++) {
                let tooltip = tooltips[i];
                this.setTooltipText(tooltip);
                
                // 添加碰撞检测事件监听器（如果还没有添加）
                if (!tooltip.__collisionDetectionAdded) {
                    this.addCollisionDetectionEvents(tooltip);
                }
            }
        }
    }
    
    // 添加碰撞检测事件监听器
    addCollisionDetectionEvents(tooltip) {
        // 标记已添加事件监听器
        tooltip.__collisionDetectionAdded = true;
        
        // 添加mouseover和focus事件监听器
        tooltip.addEventListener('mouseover', () => {
            this.collisionDetection(tooltip);
        });
        
        tooltip.addEventListener('focus', () => {
            this.collisionDetection(tooltip);
        });
        
        // 监听窗口大小变化，重新检测碰撞
        window.addEventListener('resize', () => {
            this.collisionDetection(tooltip);
        });
    }
    
    // 碰撞检测逻辑
    collisionDetection(tooltip) {
        // 获取原始位置设置
        const originalPosition = this.position;
        const originalPositionX = this.positionX;
        const originalPositionY = this.positionY;
        
        // 创建临时元素来模拟tooltip的位置和大小
        const tempTooltip = document.createElement('div');
        tempTooltip.style.position = 'fixed';
        tempTooltip.style.visibility = 'hidden';
        tempTooltip.style.pointerEvents = 'none';
        tempTooltip.style.backgroundColor = this.tooltipCSSColor || 'rgba(0, 0, 0, 0.8)';
        tempTooltip.style.color = this.textFontCSSColor || 'white';
        tempTooltip.style.fontSize = this.textFontSize + 'px';
        tempTooltip.style.padding = '10px';
        tempTooltip.style.borderRadius = '5px';
        tempTooltip.style.minWidth = this.minWidth + 'px';
        if (!this.isFixedWidth) {
            tempTooltip.style.maxWidth = this.maxWidth + 'px';
        }
        tempTooltip.textContent = tooltip.getAttribute('data-tooltip');
        
        document.body.appendChild(tempTooltip);
        
        // 获取tooltip元素的位置信息
        const tooltipRect = tooltip.getBoundingClientRect();
        const tempRect = tempTooltip.getBoundingClientRect();
        
        // 获取视口尺寸
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 根据原始位置动态生成优先级顺序：先检查相对位置，然后检查其他位置
        let positions = [];
        
        // 定义位置映射
        const positionMap = {
            0: { name: '__top__', opposite: 3, oppositeName: '__bottom__' },
            1: { name: '__left__', opposite: 2, oppositeName: '__right__' },
            2: { name: '__right__', opposite: 1, oppositeName: '__left__' },
            3: { name: '__bottom__', opposite: 0, oppositeName: '__top__' }
        };
        
        // 获取原始位置信息
        const originalPosInfo = positionMap[originalPosition];
        
        // 构建优先级顺序：
        // 1. 原始位置（如果可用）
        // 2. 相对位置（左→右，右→左，上→下，下→上）
        // 3. 其他位置
        positions.push({
            name: originalPosInfo.name,
            position: originalPosition
        });
        
        positions.push({
            name: originalPosInfo.oppositeName,
            position: originalPosInfo.opposite
        });
        
        // 添加剩余位置
        Object.keys(positionMap).forEach(pos => {
            const posNum = parseInt(pos);
            if (posNum !== originalPosition && posNum !== originalPosInfo.opposite) {
                positions.push({
                    name: positionMap[posNum].name,
                    position: posNum
                });
            }
        });
        
        // 找到最佳位置
        let bestPosition = originalPosition;
        let bestPositionName = '';
        let bestScore = Infinity;
        
        for (const pos of positions) {
            // 计算临时元素在当前位置的坐标
            let left, top;
            
            switch (pos.name) {
                case '__top__':
                    left = tooltipRect.left + (tooltipRect.width * (this.positionX || 50) / 100) - (tempRect.width / 2);
                    top = tooltipRect.top - tempRect.height - 10;
                    break;
                case '__right__':
                    left = tooltipRect.right + 10;
                    top = tooltipRect.top + (tooltipRect.height * (this.positionY || 50) / 100) - (tempRect.height / 2);
                    break;
                case '__bottom__':
                    left = tooltipRect.left + (tooltipRect.width * (this.positionX || 50) / 100) - (tempRect.width / 2);
                    top = tooltipRect.bottom + 10;
                    break;
                case '__left__':
                    left = tooltipRect.left - tempRect.width - 10;
                    top = tooltipRect.top + (tooltipRect.height * (this.positionY || 50) / 100) - (tempRect.height / 2);
                    break;
            }
            
            // 更新临时元素位置
            tempTooltip.style.left = left + 'px';
            tempTooltip.style.top = top + 'px';
            
            // 重新获取临时元素的位置信息
            const updatedTempRect = tempTooltip.getBoundingClientRect();
            
            // 检查是否超出视口
            const isWithinViewport = 
                updatedTempRect.left >= 0 &&
                updatedTempRect.right <= viewportWidth &&
                updatedTempRect.top >= 0 &&
                updatedTempRect.bottom <= viewportHeight;
            
            // 检查是否被其他元素遮挡
            const isVisible = this.isElementVisible(updatedTempRect, tooltip);
            
            // 计算位置得分
            let score = 0;
            if (isWithinViewport && isVisible) {
                // 如果在视口内且可见，给一个较低的基础分数
                score = 0;
                // 如果是原始位置，分数更低
                if (pos.position === originalPosition) {
                    score = -10;
                }
                // 如果是相对位置，分数次之
                const originalPosInfo = positionMap[originalPosition];
                if (pos.position === originalPosInfo.opposite) {
                    score = -5;
                }
            } else {
                // 计算超出视口的程度
                const viewportOutOfBounds = 
                    Math.abs(Math.min(0, left)) +
                    Math.abs(Math.max(0, left + tempRect.width - viewportWidth)) +
                    Math.abs(Math.min(0, top)) +
                    Math.abs(Math.max(0, top + tempRect.height - viewportHeight));
                
                // 计算被遮挡的程度
                const occlusionScore = this.calculateOcclusionScore(updatedTempRect, tooltip);
                
                // 总得分
                score = viewportOutOfBounds + occlusionScore;
            }
            
            // 更新最佳位置
            if (score < bestScore) {
                bestScore = score;
                bestPosition = pos.position;
                bestPositionName = pos.name;
            }
        }
        
        // 移除临时元素
        document.body.removeChild(tempTooltip);
        
        // 如果需要改变位置，更新tooltip的类名
        if (bestPosition !== originalPosition) {
            // 移除所有位置类名
            tooltip.classList.remove('__top__', '__left__', '__right__', '__bottom__');
            // 添加最佳位置类名
            tooltip.classList.add(bestPositionName);
            
            // 临时更新位置设置，以便重新应用位移
            const oldPosition = this.position;
            this.position = bestPosition;
            
            // 重新设置位移
            if (!tooltip["__" + bestPositionName + "styleAdded"]) {
                this.setTooltipPositionTranslate(tooltip);
                this.setTooltipColor(tooltip);
                this.setTooltipMinWidth(tooltip);
                tooltip["__" + bestPositionName + "styleAdded"] = true;
            }
            
            
            // 恢复原始位置设置
            this.position = oldPosition;
        }
    }
    
    // 检查元素是否可见（不被父容器遮挡）
    isElementVisible(elementRect, tooltipElement) {
        // 获取tooltip的所有父元素
        let parent = tooltipElement.parentElement;
        while (parent && parent !== document.body) {
            // 检查父元素是否有overflow属性导致遮挡
            const overflow = getComputedStyle(parent).overflow;
            const overflowX = getComputedStyle(parent).overflowX;
            const overflowY = getComputedStyle(parent).overflowY;
            
            // 如果父元素有overflow属性且不是visible，检查是否遮挡
            if ((overflow !== 'visible' && overflow !== 'unset') ||
                (overflowX !== 'visible' && overflowX !== 'unset') ||
                (overflowY !== 'visible' && overflowY !== 'unset')) {
                
                const parentRect = parent.getBoundingClientRect();
                
                // 检查tooltip是否超出父元素边界
                if (elementRect.left < parentRect.left ||
                    elementRect.right > parentRect.right ||
                    elementRect.top < parentRect.top ||
                    elementRect.bottom > parentRect.bottom) {
                    return false;
                }
            }
            
            parent = parent.parentElement;
        }
        
        return true;
    }
    
    // 计算元素被遮挡的程度
    calculateOcclusionScore(elementRect, tooltipElement) {
        let occlusionScore = 0;
        
        // 获取tooltip的所有父元素
        let parent = tooltipElement.parentElement;
        while (parent && parent !== document.body) {
            // 检查父元素是否有overflow属性导致遮挡
            const overflow = getComputedStyle(parent).overflow;
            const overflowX = getComputedStyle(parent).overflowX;
            const overflowY = getComputedStyle(parent).overflowY;
            
            // 如果父元素有overflow属性且不是visible，计算遮挡程度
            if ((overflow !== 'visible' && overflow !== 'unset') ||
                (overflowX !== 'visible' && overflowX !== 'unset') ||
                (overflowY !== 'visible' && overflowY !== 'unset')) {
                
                const parentRect = parent.getBoundingClientRect();
                
                // 计算每个方向超出父元素的程度
                const leftOverflow = Math.max(0, parentRect.left - elementRect.left);
                const rightOverflow = Math.max(0, elementRect.right - parentRect.right);
                const topOverflow = Math.max(0, parentRect.top - elementRect.top);
                const bottomOverflow = Math.max(0, elementRect.bottom - parentRect.bottom);
                
                // 累加遮挡分数
                occlusionScore += leftOverflow + rightOverflow + topOverflow + bottomOverflow;
            }
            
            parent = parent.parentElement;
        }
        
        return occlusionScore;
    }

    setTooltipOverflowInRepeater() {
        let simplebar_maskDiv = document.querySelector(`.${this.repeaterClassName} .simplebar-mask`);
        let simplebar_contentDiv = document.querySelector(`.${this.repeaterClassName} .simplebar-mask .simplebar-content`);
        if (simplebar_maskDiv == null || simplebar_contentDiv == null) {
            return false;
        }
        simplebar_maskDiv.style.setProperty('overflow', 'visible', 'important');
        //simplebar_contentDiv.style.setProperty('overflow', 'visible', 'important');

        var style = document.createElement("style");
        var change = document.createTextNode(`.${this.repeaterClassName} .simplebar-mask .simplebar-content { overflow: visible !important;}`);
        style.appendChild(change);

        simplebar_contentDiv.appendChild(style);
        return true;
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

        var change = document.createTextNode(classname + '::before{content: attr(data-tooltip)}');

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

        tooltip.setAttribute("data-tooltip", this.tooltipText);
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
