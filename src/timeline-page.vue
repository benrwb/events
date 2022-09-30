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

        <div v-for="(items, heading) in orderedTimeline"
             v-bind:key="heading">
            
            <h1 v-if="heading != 'N/A'">{{ heading }}</h1>
            
            <div v-for="item in items"
                 v-bind:key="item.id"
                 class="panel"
                 v-on:click="editEvent(item.id, $event)"
                 style="cursor: pointer"
                 v-bind:class="{ 'panel-success': item.status == 'Going',
                                 'panel-default': item.status == 'Interested',
                                 'panel-danger': item.status == 'Need to book',
                                 'panel-warning': !item.status,
                                 'faded': item.id == itemBeingUpdated }">
                <div class="panel-heading">
                    <div v-if="isCollapsed(item) && item.date"
                         class="pull-right">
                        <span class="text-muted">{{ item.date | formatDate('ddd D/MMM') }}</span>
                        <span v-bind:class="{ 'text-danger': dateIsInPast(item.date) }">({{ shorten(howSoon(item.date)) }})</span>
                    </div>
                    <div style="font-weight: bold"
                         v-bind:class="{ 'text-muted': isCollapsed(item) }">
                        
                        {{ eventTypes[item.type] }} {{ item.name }}
                        
                        <a v-if="item.link"
                           v-bind:href="item.link"
                           class="emoji"
                           style="text-decoration: none"
                           target="_blank"><span class="glyphicon glyphicon-new-window"
                                                 style="padding: 0 3px"></span></a>
                    </div>
                    <div v-show="!isCollapsed(item)">
                        <div v-if="item.date">
                            <span class="text-muted">{{ item.date | formatDate('dddd D MMMM YYYY') }}</span>
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
                                {{ statusList[item.status] }}
                            </span>
                            <span class="text-muted">
                                {{ item.status }}
                            </span>
                        </div>
                    </div>
                </div><!-- /panel-heading -->
            </div>
        </div>

        
    </div>
</template>

<script lang="ts">

import editorDialog from './editor-dialog.vue'
import Vue, { PropType } from './@types/vue'
import moment from './@types/moment';
import { TimelineItem, TimelineWithHeadings } from './@types/app';
import * as _ from './@types/lodash'

export default Vue.extend({
    components: {
        editorDialog
    },
    props: {
        timeline: Array as PropType<TimelineItem[]>,
        itemBeingUpdated: String, // id (guid) of item currently being saved
        ideasOnly: Boolean,
        eventTypes: Object,
        statusList: Object
    },
    data: function() {
        return {
            showNeedToBookOnly: false
        }
    },
    methods: {
        addEvent: function () {
            this.$emit('open-editor', null);
        },
        editEvent: function (itemId, event) {
            if (event.target.classList.contains("glyphicon-new-window")) {
                return; // don't open the editor if the link was clicked
            }
            var idx = this.timeline.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.timeline[idx]); // create a copy of the item for the editor to work with
            this.$emit('open-editor', copy);
        },
        isCollapsed: function(item) { 
            return item.status == "Interested";
        },
        howSoon: function(date) {
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
            } else if (duration.asWeeks() < 10)
                // Less than 10 weeks away - show in weeks/days
                return pluralise(Math.floor(duration.asWeeks()), "week") + " " 
                     + pluralise(Math.floor(duration.asDays() % 7), "day")
                     + (isNegative ? " ago" : "");
            else if (duration.asYears() < 1)
                // Less than a year away - show in months
                return pluralise(duration.months(), "month")
                     + (isNegative ? " ago" : "");
            else 
                // More than a year away - show years/months
                return pluralise(duration.years(), "year") + " "  
                     + pluralise(duration.months(), "month")
                     + (isNegative ? " ago" : "");
        },
        shorten: function (str: string) {
            return str.replace(/ week[s]?/,"w").replace(/ day[s]?/, "d");
        },
        dateIsInPast: function (datestr) {
            return moment(datestr).isBefore();
        }
    },
    computed: {
        orderedTimeline: function(): TimelineWithHeadings {
            if (this.ideasOnly) {
                // IDEAS
                var filteredTimeline = this.timeline.filter(item =>
                    item.category != "Link" && item.status != "Went" && item.status != "Didn't go"
                    && !item.date);
                var orderedTimeline = _.sortBy(filteredTimeline, [
                    item => item.type == "Film" ? "!Film" : item.type, // sort by type; Films first
                    item => (item.name.includes("📌") ? "!" : "") + item.name // within each type heading, sort items in alphabetical order; pinned items at top
                ]);
                return _.groupBy(orderedTimeline, "type");
            } else {
                // TIMELINE
                var filteredTimeline = this.timeline.filter(item =>
                    item.category != "Link" && item.status != "Went" && item.status != "Didn't go"
                    && !!item.date);
                if (this.showNeedToBookOnly) {
                    filteredTimeline = filteredTimeline.filter(item => item.status == "Need to book");
                }
                var orderedTimeline = _.orderBy(filteredTimeline, ["date"]); // date order
                return { 'N/A': orderedTimeline };
            }
        },
        needToBookCount: function(): number {
            return this.timeline.filter(item =>
                item.category != "Link" && !!item.date && item.status == "Need to book").length;
        }
    }
});