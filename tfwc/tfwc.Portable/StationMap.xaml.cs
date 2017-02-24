using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Maps;
using Xamarin.Forms.Xaml;

namespace tfwc.Portable
{

    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class StationMap : ContentPage
    {
        Geocoder geoCoder;
        public StationMap()
        {
            InitializeComponent();
            geoCoder = new Geocoder();
            MessagingCenter.Subscribe<tfwcTabPage>(this, "updateMapIcons", (sender) => {
                updateMapIcons();
            });
        }

        /*
        private async void OnAddPinClicked(object sender, EventArgs e)
        {
            var point = MyMap.VisibleRegion.Center;
            var item = (await geoCoder.GetAddressesForPositionAsync(point)).FirstOrDefault();

            var name = item ?? "Unknown";

            MyMap.Pins.Add(new Pin
            {
                Label = name,
                Position = point,
                Type = PinType.Generic
            });
        }
        */

        private void OnStreetClicked(object sender, EventArgs e) =>
            MyMap.MapType = MapType.Street;

        private void OnHybridClicked(object sender, EventArgs e) =>
            MyMap.MapType = MapType.Hybrid;

        private void OnSatelliteClicked(object sender, EventArgs e) =>
            MyMap.MapType = MapType.Satellite;

        /*
        private async void OnGoToClicked(object sender, EventArgs e)
        {
            var item = (await geoCoder.GetPositionsForAddressAsync(EntryLocation.Text)).FirstOrDefault();
            if (item == null)
            {
                await DisplayAlert("Error", "Unable to decode position", "OK");
                return;
            }

            var zoomLevel = SliderZoom.Value; // between 1 and 18
            var latlongdegrees = 360 / (Math.Pow(2, zoomLevel));
            MyMap.MoveToRegion(new MapSpan(item, latlongdegrees, latlongdegrees));
        }

        private void OnSliderChanged(object sender, ValueChangedEventArgs e)
        {
            var zoomLevel = e.NewValue; // between 1 and 18
            var latlongdegrees = 360 / (Math.Pow(2, zoomLevel));
            MyMap.MoveToRegion(new MapSpan(MyMap.VisibleRegion.Center, latlongdegrees, latlongdegrees));
        }
        */

        void updateMapIcons()
        {
            MyMap.Pins.Clear();
            var parent = this.Parent as tfwcTabbedPage;

            if (parent.userPos != null)
            {
                MyMap.Pins.Add(new Pin
                {
                    Label = "您的位置",
                    Type = PinType.Place,
                    Position = new Position(parent.userPos.Latitude, parent.userPos.Longitude)
                });
            }


            if (parent.selFcr == null)
            {
                return;
            }

            var fcr = parent.selFcr;
            var pos = new Position(fcr.Lat, fcr.Lon);
            MyMap.Pins.Add(new Pin
            {
                Label = fcr.Station,
                Address = fcr.Addr,
                Type = PinType.SearchResult,
                Position = pos
            });
            var fcrReg = MapSpan.FromCenterAndRadius(pos, new Distance(500));
            MyMap.MoveToRegion(fcrReg);
        }
    }
}
