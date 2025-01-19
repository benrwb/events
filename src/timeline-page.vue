<style>
    div.same-date {
        margin-bottom: 0; /* no spacing betweens events taking place on the same date */
    }
    div.school-holidays {
        outline: solid 11px #c0d3e7;
        background-color: #c0d3e7;
    }
    div.school-holidays + div:not(.school-holidays) {
        /* create extra spacing */
        margin-top: 30px;
    }
    div:not(.school-holidays) + div.school-holidays {
        /* create extra spacing */
        margin-top: 30px;
    }
    .cancelled {
        text-decoration: line-through;
    }
    .text-dark {
        color: #444; 
    }
</style>
<template>
    <div>
        <label v-if="!ideasOnly && needToBookCount > 0"
              class="pull-right">
              <input type="checkbox" v-model="showNeedToBookOnly" />
            Need to book <span class="badge">{{ needToBookCount }}</span>
        </label>
        <button class="btn btn-success" 
                v-on:click="addEvent">
            Add Event
        </button>

        <search-box v-model="store.search"></search-box>
        
        <template v-if="ideasOnly && !store.search">
            <span v-for="(_, heading) in orderedTimeline">
                <a class="btn" v-bind:href="'#' + heading">{{ store.eventTypes[heading] }} {{ heading }}</a>
            </span>
        </template>

        <br />

        <div v-for="(items, heading, idx) in orderedTimeline"
             v-bind:key="heading"
             v-bind:id="heading.toString()"
             v-bind:class="{ 'school-holidays': items[0].schoolHolidays }">
            
            <h1 v-if="!heading.startsWith('N/A') && !store.search">
                {{ heading }}
                <a v-if="idx > 0"
                   style="float: right" href="#">↑</a><!-- link to go back to top -->
            </h1>
            
            <div v-for="item in items"
                    v-bind:key="item.id"
                    class="panel"
                    v-on:click="editEvent(item.id, $event)"
                    style="cursor: pointer"
                    v-bind:class="{ 'panel-success': item.status == 'Going',
                                    'panel-default': item.status == 'Interested',
                                    'panel-danger': item.status == 'Need to book',
                                    'panel-warning': !item.status,
                                    'faded': item.id == itemBeingUpdated,
                                    'same-date': nextItemIsSameDate(item, items) }">
                <div class="panel-heading">
                    <div v-if="isCollapsed(item) && item.date"
                        class="pull-right"
                        v-bind:class="{'cancelled': item.name.includes('❌')}">
                        <span class="text-muted">{{ formatDate(item.date, 'ddd D/MMM') }}</span>
                        <span v-bind:class="{ 'text-danger': dateIsInPast(item.date) }">
                            ({{ shorten(howSoon(item.date)) }})
                        </span>
                    </div>
                    <div style="font-weight: bold"
                        v-bind:class="{ 'text-muted': isCollapsed(item),
                                        'cancelled': item.name.includes('❌') }">
                        
                        {{ store.eventTypes[item.type] }} {{ item.name }}
                        
                        <a v-if="item.link"
                            v-bind:href="item.link" v-on:click.stop
                            v-bind:target="store.openLinksInNewWindow ? '_blank' : null"
                            class="emoji" style="text-decoration: none"
                            ><span class="glyphicon glyphicon-new-window"
                                    style="padding: 0 3px"></span></a>
                    </div>
                    <div v-show="!isCollapsed(item)">
                        <div v-if="item.date">
                            <span class="text-muted">{{ formatDate(item.date, 'dddd D MMMM YYYY') }}</span>
                            <span v-bind:class="{ 'text-danger': dateIsInPast(item.date),
                                                  'text-dark':  !dateIsInPast(item.date) && item.status == 'Need to book' }">
                                                <!-- ^^ change colour from red to dark gray, as red is reserved for dates in the past. -->
                                ({{ howSoon(item.date) }})
                            </span>
                        </div>
                        <div v-if="item.location"
                            class="text-muted">{{ item.location }}</div>
                        <div v-if="item.status">
                            <span class="emoji">
                                {{ store.statusList[item.status] }}
                            </span>
                            <span class="text-muted">
                                {{ item.status }}
                            </span>
                        </div>
                    </div>
                    <div v-if="item.showNotesOnTimeline"
                            v-html="convertMarkdownToHtml(item.notes)"
                            style="background: transparent; cursor:auto"
                            v-on:click.stop=""
                            class="editor-preview" /><!-- `editor-preview` to get styles from easymde.min.css (e.g. table borders) -->
                                                    <!-- `click.stop` so that clicking on the Notes doesn't open the editor 
                                                        (this is to enable selecting text and clicking links)-->
                </div><!-- /panel-heading -->
            </div><!-- /panel -->
        </div>

        
    </div>
</template>

<script lang="ts">

import editorDialog from './editor-dialog.vue'
import { defineComponent, isMemoSame, PropType } from 'vue';
import * as moment from "moment";
import { TimelineItem, TimelineWithHeadings } from './types/app';
import * as _ from "lodash";
import { _formatDate } from './common';
import { store } from "./store";

export default defineComponent({
    components: {
        editorDialog
    },
    props: {
        timeline: Array as PropType<TimelineItem[]>,
        itemBeingUpdated: String, // id (guid) of item currently being saved
        ideasOnly: Boolean,
    },
    data: function() {
        return {
            showNeedToBookOnly: false,
            store: store
        }
    },
    methods: {
        addEvent: function () {
            this.$emit('open-editor', null);
        },
        editEvent: function (itemId, event) {
            if (event.target.classList.contains("glyphicon-new-window")) {
                return; // don't open the editor if the link icon ↗️ was clicked
            }
            var idx = this.timeline.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.timeline[idx]); // create a copy of the item for the editor to work with
            this.$emit('open-editor', copy);
        },
        isCollapsed: function(item) { 
            return item.status == "Interested";
        },
        howSoon: function(date: string) {
            // NOTE: Using UTC for date comparisons, to avoid problems caused by 
            //       comparing dates from different timezones (due to daylight savings):
            // EXAMPLE (LOCAL TIME):    
            //        Today's date = "Sun Mar 15 2020 00:00:00 GMT+0000"
            //          Event date = "Mon Mar 30 2020 00:00:00 GMT+0100"
            //   duration.asDays() = 14.958333333333334 (1 hour short, due to clocks going forward)
            //    Result displayed = "2 weeks 0 days" ❌ (should be 2 weeks 1 day) 
            // EXAMPLE (UTC):
            //       Todays's date = "Sun Mar 15 2020 00:00:00 GMT+0000"
            //          Event date = "Mon Mar 30 2020 00:00:00 GMT+0000"
            //   duration.asDays() = 15
            //    Result displayed = "2 weeks 1 day" ✅
            var eventDate = moment.utc(date);
            var nowDate = moment.utc(moment().format("YYYY-MM-DD"));
            var duration = moment.duration(eventDate.diff(nowDate));
            //return duration.humanize();

            var pluralise = function(number, suffix) {
                return number + " " + suffix 
                    + (number == 1 ? "" : "s");
            }

            // Handle dates in the past
            var isNegative = false;
            if (duration.asMilliseconds() < 0) {
                duration = moment.duration(0 - duration.asMilliseconds(), 'milliseconds');
                isNegative = true;
            }

            if (duration.asDays() < 7) {
                if (duration.days() == 0)
                    return "Today";
                else 
                    // Less than a week away - show # days
                    return pluralise(duration.days(), "day") 
                         + (isNegative ? " ago" : "");
            } else if (duration.asWeeks() < 8) {
                // Less than 8 weeks away - show in weeks/days
                return pluralise(Math.floor(duration.asWeeks()), "week") + " " 
                     + pluralise(Math.floor(duration.asDays() % 7), "day")
                     + (isNegative ? " ago" : "");
            } else if (duration.asMonths() < 4) {
                // Less than 4 months (~17 weeks) away - show months, but also weeks/days
                // "Normally, the timetable for any particular day is confirmed 12 weeks in advance."
                // -- https://www.nationalrail.co.uk/travel-information/temporary-timetable-changes/
                return pluralise(duration.months(), "month")
                    + "/" + Math.floor(duration.asWeeks()) + "w " + Math.floor(duration.asDays() % 7) + "d"
                    // ^^^ Note that this extra information is removed by `shorten` function
                     + (isNegative ? " ago" : "");
            }
            else if (duration.asYears() < 1) {
                // Less than a year away - show in months
                return pluralise(duration.months(), "month")
                     + (isNegative ? " ago" : "");
            // half month idea // } else if (duration.asYears() < 1) {
            // half month idea //     // Less than a year away - show in months
            // half month idea //     // (IDEA) var half = (duration.days() >= 15 ? "½" : "");
            // half month idea //     return pluralise(duration.months() /* (IDEA) + half */, "month")
            // half month idea //          + (isNegative ? " ago" : "");
            } else {
                // More than a year away - show years/months
                return pluralise(duration.years(), "year") + " "  
                    + pluralise(duration.months(), "month")
                    + (isNegative ? " ago" : "");
            }
        },
        shorten: function (str: string) {
            str = str.replace(/ week[s]?/,"w")
                     .replace(/ day[s]?/, "d");

            // If `str` is in the format "{months}/{weeks}{days}",
            // then remove the information after the slash.
            let slashIdx = str.indexOf("/")
            if (slashIdx != -1)
                str = str.substring(0, slashIdx);
            
            return str;
        },
        dateIsInPast: function (datestr) {
            return moment(datestr).isBefore();
        },
        convertMarkdownToHtml: function (markdown) {
            var converter = new showdown.Converter({ 
                tables: true, // enable support for tables
                openLinksInNewWindow: store.openLinksInNewWindow 
            });
            return converter.makeHtml(markdown);
        },
        nextItemIsSameDate: function (item: TimelineItem, items: TimelineItem[]) {
            if (!item.date) return false; // e.g. on "Ideas" tab
            let nextIdx = items.indexOf(item) + 1;
            if (nextIdx < items.length) {
                return item.date == items[nextIdx].date;
            }
            return false;
        },
        groupBySchoolHolidays: function (events: TimelineItem[]): TimelineWithHeadings {
            // Group events according to `schoolHolidays` (while still keeping them in date order).
            // This allows a background colour / border (outline) to be applied to events in the school hols.
            // Group name begins with "N/A" to hide the heading.
            // e.g. {"N/A 01": [events from June-mid July], "N/A 02": [events in summer hols], "N/A 03": [events in September etc]}
            if (!events || events.length == 0) return {};
            let timeline = {} as TimelineWithHeadings;
            let curGroup = [] as TimelineItem[];
            let groupNumber = 1;
            let inSchoolHolidays = events[0].schoolHolidays;
            function newGroup() {
                let groupName = "N/A " + (groupNumber++).toString().padStart(2, '0');
                timeline[groupName] = curGroup; // add current group to timeline
            }
            events.forEach(item => {
                if (inSchoolHolidays == item.schoolHolidays) {
                    // continue adding to current group
                    curGroup.push(item);
                } else {
                    // start a new group
                    newGroup();
                    inSchoolHolidays = item.schoolHolidays;
                    curGroup = [item];
                }
            });
            newGroup(); // save last group
            return timeline;
        },
        formatDate: _formatDate
    },
    computed: {
        orderedTimeline: function(): TimelineWithHeadings {
            let filteredTimeline = this.timeline;
            if (this.store.search) {
                filteredTimeline = filteredTimeline.filter(item => item.name.toLocaleLowerCase().includes(this.store.search.toLocaleLowerCase()));
            }
            if (this.ideasOnly) {
                // "IDEAS" TAB
                filteredTimeline = filteredTimeline.filter(item =>
                    item.category != "Link" && item.status != "Went" && item.status != "Didn't go"
                    && !item.date);
                var orderedTimeline = _.sortBy(filteredTimeline, [
                    item => item.type == "Film" ? "!Film" : item.type, // sort by type; Films first
                    item => (item.name.includes("📌") ? "!" : "") + item.name // within each type heading, sort items in alphabetical order; pinned items at top
                ]);
                return _.groupBy(orderedTimeline, "type");
            } else {
                // "TIMELINE" TAB
                filteredTimeline = filteredTimeline.filter(item =>
                    item.category != "Link" && item.status != "Went" && item.status != "Didn't go"
                    && !!item.date);
                if (this.showNeedToBookOnly) {
                    filteredTimeline = filteredTimeline.filter(item => item.status == "Need to book");
                }
                var orderedTimeline = _.orderBy(filteredTimeline, ["date"]); // date order
                return this.groupBySchoolHolidays(orderedTimeline);
            }
        },
        needToBookCount: function(): number {
            return this.timeline.filter(item =>
                item.category != "Link" && !!item.date && item.status == "Need to book").length;
        }
    }
});