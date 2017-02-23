using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Xamarin.Forms;
using System.Threading.Tasks;
using System.IO;
using tfwc.Portable;
using Windows.Storage;
using Windows.ApplicationModel;

[assembly: Dependency(typeof(tfwc.UWP.FileHelper))]

namespace tfwc.UWP
{
    public class FileHelper : IFileHelper
    {
        public Task<bool> ExistsAsync(string filename)
        {
            //string filepath = GetFilePath(filename);
            bool exists = File.Exists(filename);
            return Task<bool>.FromResult(exists);
        }

        public async Task<StreamReader> ReadTextAsync(string filename)
        {
            StorageFolder InstallationFolder = Package.Current.InstalledLocation;
            StorageFile file = await InstallationFolder.GetFileAsync(@"Assets\" + filename);
            var s = await file.OpenStreamForReadAsync();
            return new StreamReader(s);
        }

        public Task<IEnumerable<string>> GetFilesAsync()
        {
            throw new NotImplementedException();
        }
    }
}