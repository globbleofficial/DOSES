using System;

namespace SecureWipe.WindowsDaemon
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=========================================================");
            Console.WriteLine("SECUREWIPE PRO - C# .NET CORE WINDOWS SERVICE ENGINE");
            Console.WriteLine("=========================================================");

            var service = new DeviceWipeService();
            service.DiscoverWindowsDrives();
            service.ExecuteCryptographicSanitize("\\\\.\\PhysicalDrive1", "SN-WDC-WD10EZEX-2026");
        }
    }
}
