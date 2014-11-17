using AltaSoft.MvcCRUDScaffolder.UI;
using EnvDTE;
using Microsoft.AspNet.Scaffolding;
using Microsoft.AspNet.Scaffolding.Core.Metadata;
using Microsoft.AspNet.Scaffolding.EntityFramework;
using Microsoft.AspNet.Scaffolding.EntityFramework.Infrastructure;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Linq;
using System.IO;
using EnvDTE80;

namespace AltaSoft.MvcCRUDScaffolder
{
    public class CRUDGenerator : CodeGenerator
    {
        CustomViewModel _viewModel;

        /// <summary>
        /// Constructor for the custom code generator
        /// </summary>
        /// <param name="context">Context of the current code generation operation based on how scaffolder was invoked(such as selected project/folder) </param>
        /// <param name="information">Code generation information that is defined in the factory class.</param>
        public CRUDGenerator(
            CodeGenerationContext context,
            CodeGeneratorInformation information)
            : base(context, information)
        {
            _viewModel = new CustomViewModel(Context);
        }


        /// <summary>
        /// Any UI to be displayed after the scaffolder has been selected from the Add Scaffold dialog.
        /// Any validation on the input for values in the UI should be completed before returning from this method.
        /// </summary>
        /// <returns></returns>
        public override bool ShowUIAndValidate()
        {
            // Bring up the selection dialog and allow user to select a model type
            SelectModelWindow window = new SelectModelWindow(_viewModel);
            bool? showDialog = window.ShowDialog();
            return showDialog ?? false;
        }

        /// <summary>
        /// This method is executed after the ShowUIAndValidate method, and this is where the actual code generation should occur.
        /// In this example, we are generating a new file from t4 template based on the ModelType selected in our UI.
        /// </summary>
        public override void GenerateCode()
        {
            var controllerName = _viewModel.ControllerName;
            var viewDataTypeName = _viewModel.SelectedModelType.TypeName;
            var viewDataShortTypeName = _viewModel.SelectedModelType.ShortTypeName;
            var modelNamespace = _viewModel.SelectedModelType.Namespace;

            var isFilterSelected = _viewModel.SelectedFilterType != null;
            var filterTypeName = isFilterSelected ? _viewModel.SelectedFilterType.TypeName : String.Empty;
            var filterShortTypeName = isFilterSelected ? _viewModel.SelectedFilterType.ShortTypeName : String.Empty;

            var isSavedFilterTypeSelected = _viewModel.SelectedSavedFilterModelType != null;
            var SavedFilterModelTypeName = isSavedFilterTypeSelected ? _viewModel.SelectedSavedFilterModelType.TypeName : String.Empty;
            var SavedFilterModelShortTypeName = isSavedFilterTypeSelected ? _viewModel.SelectedSavedFilterModelType.ShortTypeName : String.Empty;

            var isSearchFeatureEnabled = _viewModel.EnableSearchFeature;
            var isOne2ManyFeatureEnabled = _viewModel.EnableOne2ManyFeature;

            if (!controllerName.EndsWith("Controller"))
                controllerName += "Controller";

            var shortControllerName = controllerName.Replace("Controller", String.Empty);
            var efService = Context.ServiceProvider.GetService<IEntityFrameworkService>();
            //var efMetadata = new ObjectToModelMetadata(Context).AddRequiredEntity(Context, "", viewDataTypeName);
            var modelMetadata = GetMetadata(viewDataTypeName);



            GenerateController(controllerName, viewDataShortTypeName, modelNamespace, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, isSearchFeatureEnabled, isOne2ManyFeatureEnabled);

            GenerateView("Create", viewDataTypeName, shortControllerName, modelMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);
            GenerateView("Delete", viewDataTypeName, shortControllerName, modelMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);
            GenerateView("Details", viewDataTypeName, shortControllerName, modelMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);
            GenerateView("Edit", viewDataTypeName, shortControllerName, modelMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);
            GenerateView("List", viewDataTypeName, shortControllerName, modelMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);
            GenerateView("_ListItems", viewDataTypeName, shortControllerName, modelMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);


            if (isFilterSelected)
            {
                var filterMetadata = GetMetadata(_viewModel.SelectedFilterType.TypeName);

                GenerateView("_ListFilter", viewDataTypeName, shortControllerName, filterMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);
            }


            if (isSavedFilterTypeSelected)
            {
                var filterMetadata = GetMetadata(_viewModel.SelectedSavedFilterModelType.TypeName);

                GenerateView("_ListFilterHeader", viewDataTypeName, shortControllerName, filterMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);
            }

            if (isSearchFeatureEnabled)
            {
                GenerateView("_Search", viewDataTypeName, shortControllerName, modelMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);
                GenerateView("_SearchListItems", viewDataTypeName, shortControllerName, modelMetadata, viewDataShortTypeName, isFilterSelected, filterTypeName, filterShortTypeName, isSavedFilterTypeSelected, SavedFilterModelTypeName, SavedFilterModelShortTypeName, controllerName);
            }


        }


        void GenerateController(string controllerName, string viewDataTypeShortName, string modelNamespace
            , bool isFilterTypeSelected, string filterTypeName, string filterTypeShortName
            , bool isSavedFilterModelTypeSelected, string savedFilterModelTypeName, string savedFilterModelTypeShortName
            , bool isSearchFeatureEnabled, bool isOne2ManyFeatureEnabled)
        {
            var output = String.Join("\\", "Controllers", controllerName);

            var parameters = new Dictionary<string, object>();
            parameters.Add("ControllerName", controllerName);
            parameters.Add("ControllerRootName", "");
            parameters.Add("Namespace", GetDefaultNamespace());
            parameters.Add("AreaName", "");
            parameters.Add("ViewDataTypeShortName", viewDataTypeShortName);
            parameters.Add("ModelNamespace", modelNamespace);
            parameters.Add("IsFilterTypeSelected", isFilterTypeSelected);
            parameters.Add("FilterTypeName", filterTypeName);
            parameters.Add("FilterTypeShortName", filterTypeShortName);
            parameters.Add("IsSavedFilterModelTypeSelected", isSavedFilterModelTypeSelected);
            parameters.Add("SavedFilterModelTypeName", savedFilterModelTypeName);
            parameters.Add("SavedFilterModelTypeShortName", savedFilterModelTypeShortName);
            parameters.Add("IsSearchFeatureEnabled", isSearchFeatureEnabled);
            parameters.Add("IsOne2ManyFeatureEnabled", isOne2ManyFeatureEnabled);


            var templateName = CheckExistingTemplate("Controller");

            this.AddFileFromTemplate(Context.ActiveProject,
                output,
                templateName,
                parameters,
                skipIfExists: true);
        }

        void GenerateView(string viewName, string viewDataTypeName, string shortControllerName, ModelMetadata metadata, string viewDataShortTypeName
            , bool isFilterTypeSelected, string filterTypeName, string filterTypeShortName
            , bool isSavedFilterModelTypeSelected, string savedFilterModelTypeName, string savedFilterModelTypeShortName
            , string controllerName)
        {
            var output = String.Join("\\", "Views", shortControllerName, viewName);
            //if (viewName == "ListFilter")
            //    output = String.Join("\\", "Views", shortControllerName, "DisplayTemplates", viewName);


            var parameters = new Dictionary<string, object>();
            parameters.Add("ControllerBaseName", controllerName.Replace("Controller", ""));
            parameters.Add("ViewDataTypeName", viewDataTypeName);
            parameters.Add("ViewDataTypeShortName", viewDataShortTypeName);
            parameters.Add("IsPartialView", false);
            parameters.Add("IsLayoutPageSelected", true);
            parameters.Add("ReferenceScriptLibraries", false);
            parameters.Add("ViewName", viewName);
            parameters.Add("LayoutPageFile", "");
            parameters.Add("JQueryVersion", "");
            parameters.Add("ModelMetadata", metadata);
            parameters.Add("IsFilterTypeSelected", isFilterTypeSelected);
            parameters.Add("FilterTypeName", filterTypeName);
            parameters.Add("FilterTypeShortName", filterTypeShortName);
            parameters.Add("IsSavedFilterModelTypeSelected", isSavedFilterModelTypeSelected);
            parameters.Add("SavedFilterModelTypeName", savedFilterModelTypeName);
            parameters.Add("SavedFilterModelTypeShortName", savedFilterModelTypeShortName);


            var templateName = CheckExistingTemplate(viewName);

            this.AddFileFromTemplate(Context.ActiveProject,
                output,
                templateName,
                parameters,
                skipIfExists: true);
        }

        string GetDefaultNamespace()
        {
            return Context.ActiveProjectItem == null
                ? Context.ActiveProject.GetDefaultNamespace()
                : Context.ActiveProjectItem.GetDefaultNamespace();
        }

        string CheckExistingTemplate(string name)
        {
            var lastIndex = Context.ActiveProject.FullName.LastIndexOf('\\');
            if (lastIndex == -1) return name;

            var address = Context.ActiveProject.FullName.Remove(lastIndex + 1) + @"CodeTemplates\CRUDGenerator\" + name + ".cs.t4";

            return false && File.Exists(address) ? address : name;
        }

        ModelMetadata GetMetadata(string viewDataTypeName)
        {
            var codeTypeService = Context.ServiceProvider.GetService<ICodeTypeService>();

            var model = codeTypeService
                .GetAllCodeTypes(Context.ActiveProject)
                .FirstOrDefault(codeType => codeType.IsValidWebProjectEntityType() && codeType.FullName == viewDataTypeName);

            if (model == null)
                return new ModelMetadata();


            var props = new List<PropertyMetadata>();

            for (int i = 0; i < model.Members.Count; i++)
            {
                var m = model.Members.Item(i + 1);
                if (m.Kind != vsCMElement.vsCMElementProperty) continue;

                var p = (m as CodeProperty);
                if (p == null) return new ModelMetadata();

                var scaffold = true;
                for (int j = 0; j < p.Attributes.Count; j++)
                {
                    var attr = p.Attributes.Item(j + 1);
                    if (attr.FullName == "System.ComponentModel.DataAnnotations.ScaffoldColumnAttribute")
                    {
                        scaffold = ((CodeAttribute2)attr).Value == "true";
                        break;
                    }
                }


                props.Add(new PropertyMetadata
                {
                    AssociationDirection = AssociationDirection.None,
                    DefaultValue = "",
                    IsAssociation = false,
                    IsAutoGenerated = false,
                    IsComplexType = !p.Type.IsPrimitiveType(),
                    IsConcurrencyProperty = false,
                    IsEnum = false,
                    IsEnumFlags = false,
                    IsForeignKey = false,
                    IsIndependentAssociation = false,
                    IsPrimaryKey = false,
                    IsReadOnly = false,
                    Scaffold = scaffold,
                    PropertyName = p.Name,
                    RelatedModel = null,
                    ShortTypeName = p.Type.AsString,
                    TypeName = p.Type.AsFullName
                });
            }

            var metadata = new ModelMetadata
            {
                Properties = props.ToArray()
            };

            return metadata;
        }
    }
}
