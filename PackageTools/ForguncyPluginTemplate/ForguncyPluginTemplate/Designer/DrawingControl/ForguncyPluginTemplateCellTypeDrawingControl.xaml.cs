using GrapeCity.Forguncy.CellTypes;
using System.Windows.Controls;

namespace ForguncyPluginTemplate.Designer.DrawingControl
{
    public partial class ForguncyPluginTemplateCellTypeDrawingControl : UserControl
    {
        public ForguncyPluginTemplateCellTypeDrawingControl(ForguncyPluginTemplateCellType cellType, ICellInfo cellInfo, IDrawingHelper drawingHelper)
        {
            this.DataContext = new ForguncyPluginTemplateCellTypeDrawingControlViewModel(cellType, cellInfo, drawingHelper);

            InitializeComponent();
        }

        public class ForguncyPluginTemplateCellTypeDrawingControlViewModel
        {
            ForguncyPluginTemplateCellType _cellType;
            ICellInfo _cellInfo;
            IDrawingHelper _drawingHelper;
            public ForguncyPluginTemplateCellTypeDrawingControlViewModel(ForguncyPluginTemplateCellType cellType, ICellInfo cellInfo, IDrawingHelper drawingHelper)
            {
                _cellType = cellType;
                _cellInfo = cellInfo;
                _drawingHelper = drawingHelper;
            }
            public string Text { get => _cellType.ToString(); }
        }
    }
}
