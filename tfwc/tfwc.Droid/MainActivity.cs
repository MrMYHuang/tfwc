using System;

using Android.App;
using Android.Content.PM;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Android.OS;
using System.Threading.Tasks;
using Android.Support.V4.Content;
using Android.Support.V4.App;
using Android;

namespace tfwc.Droid
{
    [Activity(Label = "Taiwan Free WiFi & Charging", Icon = "@drawable/icon", MainLauncher = true, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation)]
    public class MainActivity : global::Xamarin.Forms.Platform.Android.FormsApplicationActivity
    {
        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);
            global::Xamarin.Forms.Forms.Init(this, bundle);
            Xamarin.FormsMaps.Init(this, bundle);
            LoadApplication(new tfwc.App());
            GetLocationCompatAsync();
        }

        const int RequestLocationId = 0;

        readonly string[] PermissionsLocation = 
            {
                Manifest.Permission.AccessCoarseLocation,
                Manifest.Permission.AccessFineLocation
            };

        async Task GetLocationCompatAsync()
        {
            const string permission = Manifest.Permission.AccessFineLocation;

            if (ContextCompat.CheckSelfPermission(this, permission) == (int)Permission.Granted)
            {
                //await GetLocationAsync();
                return;
            }

            /*
            if (ActivityCompat.ShouldShowRequestPermissionRationale(this, permission))
            {
                //Explain to the user why we need to read the contacts
                Snackbar.Make(layout, "Location access is required to show coffee shops nearby.",
                    Snackbar.LengthIndefinite)
                    .SetAction("OK", v => RequestPermissions(PermissionsLocation, RequestLocationId))
                    .Show();

                return;
            }*/

            RequestPermissions(PermissionsLocation, RequestLocationId);
        }
    }
}

