using GrapeCity.Forguncy.CellTypes;
using GrapeCity.Forguncy.Plugin;
using System;
using System.ComponentModel;

namespace ForguncyPluginTemplate
{
    [Icon("pack://application:,,,/ForguncyPluginTemplate;component/Resources/Icon.png")]
    [Designer("ForguncyPluginTemplate.Designer.ForguncyPluginTemplateCellTypeDesigner, ForguncyPluginTemplate")]
    public class ForguncyPluginTemplateCellType : CellType
    {
        public string MyProperty { get; set; } = "ForguncyPluginTemplate";

        public override string ToString()
        {
            return "ForguncyPluginTemplate-LacaleName单元格";
        }
    }
}
