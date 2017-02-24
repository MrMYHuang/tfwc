using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using Windows.Devices.Geolocation;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

namespace tfwc.UWP
{
    public sealed partial class MainPage 
    {
        public MainPage()
        {
            Xamarin.FormsMaps.Init("jQCggaSeQBF5H9uI69W1~aD-SuqEtUqP9cBODQ9kh8A~AoT1sVtdZSdWsLpIJhIBLh5svMtU7u66aKAtxEbYLlyowCm1VaelAPRWcZVHsDil");
            this.InitializeComponent();
            LoadApplication(new tfwc.App());
            geoReqAsync();
        }

        async void geoReqAsync()
        {
            try
            {
                var stat = await Geolocator.RequestAccessAsync();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
        }
    }
}
