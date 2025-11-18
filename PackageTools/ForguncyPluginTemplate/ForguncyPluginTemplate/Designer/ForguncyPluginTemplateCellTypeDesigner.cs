using ForguncyPluginTemplate.Designer.DrawingControl;
using GrapeCity.Forguncy.CellTypes;
using System.Windows;

namespace ForguncyPluginTemplate.Designer
{
    public class ForguncyPluginTemplateCellTypeDesigner : CellTypeDesigner<ForguncyPluginTemplateCellType>
    {
        public override FrameworkElement GetDrawingControl(ICellInfo cellInfo, IDrawingHelper drawingHelper)
        {
            return new ForguncyPluginTemplateCellTypeDrawingControl(this.CellType, cellInfo, drawingHelper);
        }
    }
}
