import * as moment from "moment"

export function _formatDate(datestr: string, dateformat: string) {
    if (!datestr) return "";
    if (!dateformat) dateformat = "DD/MM/YYYY";
    return moment(datestr).format(dateformat);
}