using GrapeCity.Forguncy.Commands;
using GrapeCity.Forguncy.Plugin;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Security.RightsManagement;

namespace Tooltip
{
    [Icon("pack://application:,,,/Tooltip;component/Resources/Icon.png")]
    [Designer("Tooltip.Designer.TooltipCommandDesigner, Tooltip")]
    [Category("通知")]
    [Description("\r\n建议一种类只受到一个命令的控制，若有多个命令同时控制，部分样式不会生效")]
    public class TooltipCommand : Command
    {
        [DisplayName("是否使用目标单元格")]
        [BoolProperty]
        [Description("默认使用类名设置，可以选择使用单元格设置")]
        public bool IsTargetCell { get; set; } = false;

        [DisplayName("是否为图文列表模板设置")]
        [BoolProperty]
        [Description("若图文列表模板中单元格展示数据一样，可以使用类名设置，\r\n"
            + "若需要依赖于模板中某一个当前行字段，请勾选本值以及使用单元格设置")]
        public bool IsRepeater { get; set; } = false;

        [DisplayName("文本框类名")]
        [FormulaProperty]
        [Required]
        [Description("建议使用自定义的类名，比如mytooltip,或者_tooltip_，\r\n" 
            + "若出现和页面其他类名重复，容易出现错误\r\n")]
        public object ClassName { get; set; }

        [DisplayName("单元格位置")]
        [FormulaProperty(OnlySupportCell = true)]
        [Required]
        [Description("通过选择单元格，或者单元格名称来设置")]
        public object TargetCell { get; set; }


        [DisplayName("提示框出现的具体位置")]
        [Description("即提示框在文本框的上面，下面，左面，右面")]
        public Position TooltipPosition { get; set; }

        [DisplayName("水平局部移动百分比%设置")]
        [Description("在确定好提示符的，位置时候局部移动提示符,0在最左边，100在最右边")]
        [IntProperty(Min = 0, Max = 100)]
        public int TooltipPositionX { get; set; } = 50;

        [DisplayName("垂直局部移动百分比%设置")]
        [Description("在确定好提示符的，位置时候局部移动提示符，0在最上边，100在最下边")]
        [IntProperty(Min = 0, Max = 100)]
        public int TooltipPositionY { get; set; } = 50;

        [DisplayName("提示框的颜色")]
        [Description("提示框的颜色选择")]
        [ColorProperty]
        public string TooltipColor { get; set; }

        [DisplayName("提示框最小宽度(单位：像素)")]
        [Description("提示框宽度自适应，最小宽度保证了不会提前换行\r\n"
            + "最小值为1，最大值为2000")]
        [IntProperty(Min = 1, Max = 2000)]
        public int MinWidth { get; set; } = 200;

        [DisplayName("获取焦点时提示")]
        [Description("获取焦点时会一直提示")]
        public bool GetFocusedShow { get; set; } = false;

        [DisplayName("提示信息内容")]
        [FormulaProperty(AcceptsReturn = true)]
        public object TooltipText { get; set; }

        [DisplayName("提示信息文字大小(单位：像素)")]
        [Description("最小值为1.00，最大值为200.00，默认大小为14.67px")]
        [DoubleProperty(Min = 1, Max = 2000)]
        public object TextFontSize { get; set; } = 14.67;

        [DisplayName("提示信息文字颜色")]
        [Description("默认颜色为白色")]
        [ColorProperty]
        public string TextFontColor { get; set; }


        public override bool GetDesignerPropertyVisible(string propertyName, CommandScope commandScope)
        {
            if (propertyName == nameof(TooltipPositionX))
            {
                return (TooltipPosition.Equals(Position.Top) 
                    || TooltipPosition.Equals(Position.Bottom)) ? true: false;
            }

            if (propertyName == nameof(TooltipPositionY))
            {
                return (TooltipPosition.Equals(Position.Left)
                    || TooltipPosition.Equals(Position.Right)) ? true : false;
            }

            if (propertyName == nameof(TargetCell))
            {
                return IsTargetCell;
            }

            if (propertyName == nameof(IsRepeater))
            {
                return IsTargetCell;
            }

            if (propertyName == nameof(ClassName))
            {
                return !IsTargetCell;
            }

            return base.GetDesignerPropertyVisible(propertyName, commandScope);
        }

        public override string ToString()
        {
            return "文本框提示命令";
        }
    }

    public enum Position
    {
        Top,
        Left,
        Right,
        Bottom
    }
}
