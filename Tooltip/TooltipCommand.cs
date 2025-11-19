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
        [DisplayName("使用目标单元格")]
        [BoolProperty(IndentLevel = 0)]
        [Description("默认使用类名设置，可以选择使用单元格设置")]
        public bool IsTargetCell { get; set; } = false;

        [DisplayName("在图文列表模板设置")]
        [BoolProperty(IndentLevel = 1)]
        [Description("若图文列表模板中单元格展示数据一样，请使用类名设置，\r\n"
            + "若展示数据依赖于当前行数据，请勾选本值以及使用单元格设置")]
        public bool IsRepeater { get; set; } = false;


        [DisplayName("允许显示在图文列表外")]
        [BoolProperty(IndentLevel = 2)]
        [Description("这个功能会修改图文列表的样式，可能会影响原有的显示，\r\n"
            + "若测试有问题，建议放弃该功能，设置不会出现在图文列表外部的提示")]
        public bool IsOverflow { get; set; } = false;

        [DisplayName("图文列表类名")]
        [FormulaProperty]
        [Required]
        [Description("建议使用自定义的类名，比如 toolip_overflow ，\r\n"
            + "若出现和页面其他类名重复，容易出现错误\r\n")]
        public object RepeaterClassNameFormula { get; set; }

        [DisplayName("文本框类名")]
        [FormulaProperty]
        [Required]
        [Description("建议使用自定义的类名，比如 mytooltip ,或者 _tooltip_ ，\r\n"
            + "若出现和页面其他类名重复，容易出现错误\r\n")]
        public object ClassNameFormula { get; set; }

        [DisplayName("单元格位置")]
        [FormulaProperty(OnlySupportCell = true)]
        [Required]
        [Description("通过选择单元格，或者单元格名称来设置")]
        public object TargetCellFormula { get; set; }


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

        //[DisplayName("设置固定宽度")]
        //[BoolProperty(IndentLevel = 1)]
        //[Description("开启固定宽度之后，最大宽度将等于最小宽度")]
        //public bool IsFixedWidth { get; set; } = false;

        //[DisplayName("提示框最大宽度(单位：像素)")]
        //[Description("提示框宽度自适应，最大宽度保证了当文字长度到达限制会换行\r\n"
        //    + "最小值为1，最大值为2000")]
        //[IntProperty(Min = 1, Max = 2000)]
        //public int MaxWidth { get; set; } = 200;

        [DisplayName("获取焦点时提示")]
        [Description("获取焦点时会一直提示")]
        [BoolProperty]
        public bool IsFocusedShow { get; set; } = false;

        [DisplayName("提示信息内容")]
        [FormulaProperty(AcceptsReturn = true)]
        public object TooltipTextFormula { get; set; }


        //[DisplayName("是否多行显示数据")]
        //[BoolProperty(IndentLevel = 1)]
        //[Description("若想要对提示的问题换行展示请勾选此项，否则换行符会以空格展示")]
        //public bool IsMultiline { get; set; } = false;

        [DisplayName("提示信息文字大小(单位：像素)")]
        [Description("最小值为1.00，最大值为200.00，默认大小为14.67px")]
        [DoubleProperty(Min = 1, Max = 2000)]
        public double TextFontSize { get; set; } = 14.67;


        [DisplayName("提示信息文字颜色")]
        [Description("默认颜色为白色")]
        [ColorProperty]
        public string TextFontColor { get; set; }


        public override bool GetDesignerPropertyVisible(string propertyName, CommandScope commandScope)
        {
            if (propertyName == nameof(TooltipPositionX))
            {
                return (TooltipPosition.Equals(Position.Top)
                    || TooltipPosition.Equals(Position.Bottom)) ? true : false;
            }

            if (propertyName == nameof(TooltipPositionY))
            {
                return (TooltipPosition.Equals(Position.Left)
                    || TooltipPosition.Equals(Position.Right)) ? true : false;
            }

            if (propertyName == nameof(TargetCellFormula))
            {
                return IsTargetCell;
            }

            if (propertyName == nameof(IsRepeater))
            {
                return IsTargetCell;
            }

            if (propertyName == nameof(IsOverflow))
            {
                return IsRepeater;
            }

            if (propertyName == nameof(RepeaterClassNameFormula))
            {
                return IsOverflow;
            }

            if (propertyName == nameof(ClassNameFormula))
            {
                return !IsTargetCell;
            }

            //if (propertyName == nameof(MaxWidth))
            //{
            //    return !IsFixedWidth;
            //}

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
