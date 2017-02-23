using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tfwc.Portable
{
    public class FreeChargingRec : GpsPos
    {
        public string Unit { get; set; }
        public string Region { get; set; }
        public string Station { get; set; }
        public string Addr { get; set; }
    }
}
