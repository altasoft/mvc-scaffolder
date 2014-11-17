using Microsoft.AspNet.Scaffolding;
using Microsoft.AspNet.Scaffolding.EntityFramework;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Windows;

namespace AltaSoft.MvcCRUDScaffolder.UI
{
    /// <summary>
    /// View model for code types so that it can be displayed on the UI.
    /// </summary>
    public class CustomViewModel : INotifyPropertyChanged
    {
        /// <summary>
        /// This gets all the Model types from the active project.
        /// </summary>
        public IEnumerable<ModelType> ModelTypes
        {
            get
            {
                try
                {
                    if (_ModelTypes == null)
                    {
                        ICodeTypeService codeTypeService = (ICodeTypeService)Context
                            .ServiceProvider.GetService(typeof(ICodeTypeService));

                        _ModelTypes = codeTypeService
                            .GetAllCodeTypes(Context.ActiveProject)
                            .Where(codeType => codeType.IsValidWebProjectEntityType())
                            .Where(codeType => codeType.Namespace != null)
                            .Select(codeType => new ModelType(codeType))
                            .OrderBy(t => t.ShortTypeName)
                            .ToList();
                    }

                    var items = _ModelTypes;

                    if (IsShowOnlyViewModelsChecked)
                        items = _ModelTypes.Where(i => i.ShortTypeName != null && i.ShortTypeName.EndsWith("ViewModel"));

                    return items;
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.ToString());
                    return new List<ModelType>();
                }
            }
        }
        IEnumerable<ModelType> _ModelTypes;


        public bool EnableSearchFeature
        {
            get
            {
                return _EnableSearchFeature;
            }
            set
            {
                if (_EnableSearchFeature == value) return;

                _EnableSearchFeature = value;
                RaisePropertyChanged("EnableSearchFeature");
            }
        }
        bool _EnableSearchFeature;

        public bool EnableOne2ManyFeature
        {
            get
            {
                return _EnableOne2ManyFeature;
            }
            set
            {
                if (_EnableOne2ManyFeature == value) return;

                _EnableOne2ManyFeature = value;
                RaisePropertyChanged("EnableOne2ManyFeature");
            }
        }
        bool _EnableOne2ManyFeature;


        public ModelType SelectedModelType { get; set; }
        public ModelType SelectedFilterType { get; set; }
        public ModelType SelectedSavedFilterModelType { get; set; }

        public string ControllerName { get; set; }

        public CodeGenerationContext Context { get; private set; }

        bool _IsShowOnlyViewModelsChecked = true;
        public bool IsShowOnlyViewModelsChecked
        {
            get
            {
                return _IsShowOnlyViewModelsChecked;
            }
            set
            {
                _IsShowOnlyViewModelsChecked = value;
                RaisePropertyChanged("IsShowOnlyViewModelsChecked");
                RaisePropertyChanged("ModelTypes");
            }
        }


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">The code generation context</param>
        public CustomViewModel(CodeGenerationContext context)
        {
            Context = context;
        }



        public void RaisePropertyChanged(string name)
        {
            if (PropertyChanged != null)
                PropertyChanged(this, new PropertyChangedEventArgs(name));
        }
        public event PropertyChangedEventHandler PropertyChanged;
    }
}
