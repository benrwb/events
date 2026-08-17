import * as moment from "moment"

export function _formatDate(datestr: string, dateformat: string) {
    if (!datestr) return "";
    if (!dateformat) dateformat = "DD/MM/YYYY";
    return moment(datestr).format(dateformat);
}

export function _secondsSinceEpoch() {
    // used for setting `lastUpdate` field
    return Math.round(new Date().getTime() / 1000);
    // to convert this back to a date, do `new Date(value * 1000)`
}