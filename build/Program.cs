using System;
using System.Text;
using System.IO;

namespace build
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Building...");

            var contents = new StringBuilder();

            var di = new DirectoryInfo("../components");
            foreach (FileInfo fi in di.GetFiles()) 
            {
                if (fi.Extension == ".vue") 
                {
                    contents.Append(new NaiveVueCompiler(fi.FullName).Parse());
                }
            }
            
            File.WriteAllText("../bundle.js", contents.ToString());

            Console.WriteLine("Done!");
        }
    }
}
