using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace AltaSoft.MvcCRUDScaffolder.UI
{
    /// <summary>
    /// Interaction logic for SelectModelWindow.xaml
    /// </summary>
    public partial class SelectModelWindow : Window
    {
        public CustomViewModel ViewModel
        {
            get
            {
                return this.DataContext as CustomViewModel;
            }
        }

        public SelectModelWindow(CustomViewModel viewModel)
        {
            InitializeComponent();

            DataContext = viewModel;
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            this.DialogResult = true;
        }

        private void ComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var vm = this.DataContext as CustomViewModel;
            if (vm == null) return;
            if (vm.SelectedModelType == null || String.IsNullOrEmpty(vm.SelectedModelType.ShortTypeName)) return;

            vm.ControllerName = vm.SelectedModelType.ShortTypeName.Replace("ViewModel", "").Replace("Model", "");
            vm.RaisePropertyChanged("ControllerName");

            btnAdd.IsEnabled = ViewModel.SelectedModelType != null && !String.IsNullOrEmpty(ViewModel.ControllerName);
        }

        private void TextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            btnAdd.IsEnabled = ViewModel.SelectedModelType != null && !String.IsNullOrEmpty(ViewModel.ControllerName);
        }

        private void FilterComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            SaveFilterModelComboBox.IsEnabled = true;
        }
    }
}
