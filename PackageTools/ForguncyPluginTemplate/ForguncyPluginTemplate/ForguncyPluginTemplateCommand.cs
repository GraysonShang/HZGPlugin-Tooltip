using GrapeCity.Forguncy.Commands;
using GrapeCity.Forguncy.Plugin;
using System;
using System.ComponentModel;

namespace ForguncyPluginTemplate
{
    [Icon("pack://application:,,,/ForguncyPluginTemplate;component/Resources/Icon.png")]
    [Designer("ForguncyPluginTemplate.Designer.ForguncyPluginTemplateCommandDesigner, ForguncyPluginTemplate")]
    public class ForguncyPluginTemplateCommand : Command
    {
        [DisplayName("命令属性")]
        [FormulaProperty]
        public object MyProperty { get; set; }

        public override string ToString()
        {
            return "ForguncyPluginTemplate-LacaleName命令";
        }
    }
}
