using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Xamarin.Forms;
using System.Threading.Tasks;
using System.IO;
using tfwc.Portable;

[assembly: Dependency(typeof(tfwc.iOS.FileHelper))]

namespace tfwc.iOS
{
    public class FileHelper : IFileHelper
    {
        public Task<bool> ExistsAsync(string filename)
        {
            string filepath = GetFilePath(filename);
            bool exists = File.Exists(filepath);
            return Task<bool>.FromResult(exists);
        }

        public async Task<StreamReader> ReadTextAsync(string filename)
        {
            string filepath = GetFilePath(filename);
            var s = File.OpenRead("Assets/" + filename);
            return new StreamReader(s);
        }

        public Task<IEnumerable<string>> GetFilesAsync()
        {
            // Sort the filenames.
            IEnumerable<string> filenames =
                from filepath in Directory.EnumerateFileSystemEntries(GetDocsFolder())
                select Path.GetFileName(filepath);

            return Task<IEnumerable<string>>.FromResult(filenames);
        }

        string GetDocsFolder()
        {
            return Environment.GetFolderPath(Environment.SpecialFolder.Personal);
        }

        string GetFilePath(string filename)
        {
            return Path.Combine(GetDocsFolder(), filename);
        }

    }
}