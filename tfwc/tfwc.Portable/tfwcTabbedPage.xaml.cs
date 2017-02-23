using Plugin.Geolocator.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace tfwc.Portable
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class tfwcTabbedPage : TabbedPage
    {
        public FreeChargingRec selFcr;
        public Position userPos;

        public tfwcTabbedPage()
        {
            InitializeComponent();
        }
    }
}
