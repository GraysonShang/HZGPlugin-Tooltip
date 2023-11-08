using GrapeCity.Forguncy.Commands;
using System;
using System.Collections.Generic;

namespace Tooltip.Designer
{
    public class TooltipCommandDesigner : CommandDesigner<TooltipCommand>
    {
        public override IEnumerable<string> GetSearchTags()
        {
            return new string[] { "tooltip" }; // 自定义命令的搜索关键字
        }
    }
}
