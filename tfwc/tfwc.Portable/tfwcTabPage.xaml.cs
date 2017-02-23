using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using CsvHelper;
using System.IO;
using System.Collections.ObjectModel;
using Plugin.Geolocator;
using System.Diagnostics;
using Plugin.Geolocator.Abstractions;

namespace tfwc.Portable
{
    public partial class tfwcTabPage : ContentPage
    {
        List<FreeStation2> fFullList;
        List<FreeStation2> fcrFullList;
        List<FreeStation2> fwrFullList;
        public static ObservableCollection<FreeStation2> fcList = new ObservableCollection<FreeStation2>();

        public tfwcTabPage()
        {
            ReadAllCsv();

            InitializeComponent();
        }

        public async Task<int> ReadAllCsv()
        {
            fcrFullList = await ReadFreeChargingCsv("charge_station_list_20170221.csv");
            fwrFullList = await ReadFreeChargingCsv("itaiwan_hotspotlist_20170221.csv");
            fFullList = fcrFullList;
            refreshFreeList();
            return 0;
        }

        public async Task<List<FreeStation2>> ReadFreeChargingCsv(string csvFile)
        {
            try
            {
                var fileHelper = new FileHelper();
                var csvr = new CsvReader(await fileHelper.ReadTextAsync(csvFile));
                var fcFullListOrig = csvr.GetRecords<FreeChargingRec>().ToList();
                var fcFullList = new List<FreeStation2>();
                foreach (var fcr in fcFullListOrig)
                {
                    fcFullList.Add(new FreeStation2
                    {
                        Lat = fcr.Lat,
                        Lon = fcr.Lon,
                        Addr = fcr.Addr,
                        Unit = fcr.Unit,
                        Station = fcr.Station,
                        Dist = 0,
                    });
                }
                return fcFullList;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return null;
            }
        }

        void refreshFreeList()
        {
            fcList.Clear();
            foreach (var fcr in fFullList.GetRange(0, 10))
            {
                fcList.Add(fcr);
            }
        }

        private async void Button_Clicked(object sender, EventArgs e)
        {
            var parent = Parent as tfwcTabbedPage;

            try
            {
                var locator = CrossGeolocator.Current;
                locator.DesiredAccuracy = 100; //100 is new default
                parent.userPos = await locator.GetPositionAsync(timeoutMilliseconds: 10000);
                calDists(new GpsPos { Lat = parent.userPos.Latitude, Lon = parent.userPos.Longitude }, fcrFullList);

                fcrFullList.Sort((x, y) => x.Dist - y.Dist);

                calDists(new GpsPos { Lat = parent.userPos.Latitude, Lon = parent.userPos.Longitude }, fwrFullList);
                fwrFullList.Sort((x, y) => x.Dist - y.Dist);

                refreshFreeList();
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
        }

        // Mean Earth radius in meters
        double earthRadius = 6371000;

        // Distance using Pythagoras’ theorem.
        public int posDist(GpsPos p1, GpsPos p2)
        {
            var lat1 = p1.Lat / 360;
            var lat2 = p2.Lat / 360;
            var lon1 = p1.Lon / 360;
            var lon2 = p2.Lon / 360;

            var y = lat2 - lat1;
            var x = (lon2 - lon1) * Math.Cos((lat2 + lat1) / 2);
            return (int) (earthRadius * Math.Sqrt(Math.Pow(x, 2) + Math.Pow(y, 2)));
        }

        // Calculate distance from each station to user.
        private void calDists(GpsPos userPos, List<FreeStation2> fFullList)
        {
            foreach (var fcr in fFullList)
            {
                fcr.Dist = posDist(fcr, userPos);
            }
        }

        private void fclv_ItemTapped(object sender, ItemTappedEventArgs e)
        {
            var parent = Parent as tfwcTabbedPage;
            var lv = sender as ListView;
            parent.selFcr = lv.SelectedItem as FreeChargingRec;
            parent.CurrentPage = parent.Children[1];
        }

        bool resSwitchStat = false;
        private void resSwitch_Clicked(object sender, EventArgs e)
        {
            resSwitchStat = !resSwitchStat;
            if (!resSwitchStat)
            {
                fFullList = fcrFullList;
                resSwitch.Text = "免費充電";
            }
            else
            {
                fFullList = fwrFullList;
                resSwitch.Text = "免費WiFi";
            }
            refreshFreeList();
        }
    }
}
