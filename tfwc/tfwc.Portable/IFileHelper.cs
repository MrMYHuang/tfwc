using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tfwc.Portable
{
    public interface IFileHelper
    {
        Task<bool> ExistsAsync(string filename);

        /*
        Task WriteTextAsync(string filename, string text);*/

        Task<StreamReader> ReadTextAsync(string filename);

        Task<IEnumerable<string>> GetFilesAsync();

        /*
        Task DeleteAsync(string filename);*/
    }
}
