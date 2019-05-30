using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace build {
    public class NaiveVueCompiler
    {
        string _filename;
        string _componentName;
        List<string> _lines;

        public NaiveVueCompiler(string filename)
        {
            _filename = filename;
            FileInfo fi = new FileInfo(_filename);

            if (!fi.Name.Contains('-'))
                throw new Exception("Component name doesn't contain a dash '-'. (Vue component names should always be multi-word)");

            _componentName = fi.Name.Substring(0, fi.Name.Length - fi.Extension.Length);
            _lines = File.ReadAllText(filename).Replace("\r\n", "\n").Split('\n').ToList();
        }


        public string Parse()
        {
            StringBuilder output = new StringBuilder();
            List<string> templateLines = new List<string>();

            bool in_template = false,
                 in_components = false;

            foreach (string line in _lines)
            {
                var trimmedLine = line.Trim();

                if (trimmedLine == "<template>")
                {
                    in_template = true;
                    continue;
                }

                if (trimmedLine == "</template>")
                {
                    in_template = false;
                    continue;
                }

                if (in_template) 
                {
                    templateLines.Add(line);
                    continue;
                }
                
                if (trimmedLine.StartsWith("<script") || trimmedLine.StartsWith("</script>"))
                    continue; // ignore <script> tags

                if (trimmedLine.StartsWith("import ") && line.Contains(" from "))
                    continue; // ignore imports

                // Change export to Vue.component
                int offset = line.IndexOf("export default Vue.extend({");
                if (offset != -1) 
                {
                    string leftpad = new string(' ', offset);
                    output.AppendLine(leftpad + $"Vue.component('{_componentName}', {{");
                    output.AppendLine(leftpad + $"    template: " + BuildTemplateString(templateLines) + ",");
                    continue;
                } 

                if (trimmedLine == "components: {") 
                {
                    in_components = true;
                    continue;
                }

                if (in_components)
                {
                    if (line.Contains("}"))
                        in_components = false;
                    continue; // skip "components:" section
                }

                output.AppendLine(line);
            }

            return output.ToString();
        }

        private string BuildTemplateString(List<string> templateLines)
        {
            return string.Join("\n+",
                templateLines.Select(
                    line => "\"" + line.Replace("\"", "\\\"") + "\""
                )
            );
        }
    }
}