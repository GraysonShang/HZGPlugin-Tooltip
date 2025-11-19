/// <reference path="../Declarations/forguncy.d.ts" />
/// <reference path="../Declarations/forguncy.Plugin.d.ts" />

class ForguncyPluginTemplateCellType extends Forguncy.Plugin.CellTypeBase {
    createContent() {
        // 获取MyProperty属性值，注意，这里的MyProperty应该与 ForguncyPluginTemplateCellType.cs 文件定义的属性名一致
        const propValue = this.CellElement.CellType.MyProperty ?? "MyCell";

        // 构建 Jquery Dom 并返回
        const div = $("<div>" + propValue + "<div>")

        div.css("color", "Red"); // 字体颜色设置为红色

        return div;
    }
}
Forguncy.Plugin.CellTypeHelper.registerCellType("ForguncyPluginTemplate.ForguncyPluginTemplateCellType, ForguncyPluginTemplate", ForguncyPluginTemplateCellType);