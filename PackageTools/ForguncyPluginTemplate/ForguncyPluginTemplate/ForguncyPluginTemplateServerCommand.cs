using GrapeCity.Forguncy.Commands;
using GrapeCity.Forguncy.Plugin;
using System;
using System.ComponentModel;
using System.Threading.Tasks;

namespace ForguncyPluginTemplate
{
    [Icon("pack://application:,,,/ForguncyPluginTemplate;component/Resources/Icon.png")]
    [Designer("ForguncyPluginTemplate.Designer.ForguncyPluginTemplateServerCommandDesigner, ForguncyPluginTemplate")]
    public class ForguncyPluginTemplateServerCommand : Command, ICommandExecutableInServerSideAsync
    {
        [FormulaProperty]
        [DisplayName("加数1")]
        public object AddNumber1 { get; set; }

        [FormulaProperty]
        [DisplayName("加数2")]
        public object AddNumber2 { get; set; }

        [ResultToProperty]
        [DisplayName("相加结果")]
        public string ResultTo { get; set; } = "结果";

        public async Task<ExecuteResult> ExecuteAsync(IServerCommandExecuteContext dataContext)
        {
            var add1 = await dataContext.EvaluateFormulaAsync(AddNumber1); // 计算的一个加数的公式值
            var add2 = await dataContext.EvaluateFormulaAsync(AddNumber2); // 计算第二个家属的公式值

            double.TryParse(add1?.ToString(), out var add1Number); // 对第一个加数做类型转换
            double.TryParse(add2?.ToString(), out var add2Number); // 对第二个加数做类型转换

            dataContext.Parameters[ResultTo] = add1Number + add2Number;  // 把计算的结果设置到结果变量中

            return new ExecuteResult();
        }

        public override string ToString()
        {
            return "ForguncyPluginTemplate-LacaleName服务端命令";
        }

        public override CommandScope GetCommandScope()
        {
            return CommandScope.ExecutableInServer;
        }
    }
}
