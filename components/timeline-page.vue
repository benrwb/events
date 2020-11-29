<template>
    <div>
        <button class="btn btn-success" 
                v-on:click="addEvent">
            Add Event
        </button>

        <div v-for="item in orderedTimeline"
            v-bind:key="item.id"
            class="panel"
            v-bind:class="{ 'panel-success': item.status == 'Going',
                            'panel-default': item.status == 'Interested',
                            'panel-danger': item.status == 'Need to book',
                            'panel-warning': !item.status,
                            'faded': item.id == itemBeingUpdated }">
            <div class="panel-heading">
                <div v-if="isCollapsed(item) && item.date"
                     class="pull-right">
                    <span class="text-muted">{{ item.date | formatDate('D/MMM') }}</span>
                    <span v-bind:class="{ 'text-danger': dateIsInPast(item.date) }">({{ howSoon(item.date) }})</span>
                </div>
                <div style="font-weight: bold"
                        v-bind:class="{ 'text-muted': isCollapsed(item) }">
                    
                    <span v-on:click="editEvent(item.id)"
                            style="cursor: pointer">
                        {{ eventTypes[item.type] }} 
                        {{ item.name }}
                    </span>
                    
                    <a v-if="item.link"
                        v-bind:href="item.link"
                        class="emoji"
                        style="text-decoration: none"
                        target="_blank">&nbsp;<span class="glyphicon glyphicon-new-window"></span></a>
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
                    <div class="text-muted" v-if="item.location">{{ item.location }}</div>
                    <div>
                        <span class="emoji">
                            {{ statusList[item.status] }}
                        </span>
                        <span class="text-muted">
                            {{ item.status }}
                        </span>
                    </div>
                    
                    <button class="btn btn-sm btn-default"
                            v-bind:disabled="item.id == itemBeingUpdated"
                            v-on:click="editEvent(item.id)">Edit</button>
                </div>
            </div><!-- /panel-heading -->
        </div>

        
    </div>
</template>

<script lang="ts">

import editorDialog from './editor-dialog.vue'
import Vue from './@types/vue'
import * as moment from './@types/moment';

export default Vue.extend({
    components: {
        editorDialog
    },
    props: {
        timeline: Array,
        itemBeingUpdated: String, // id (guid) of item currently being saved
        ideasOnly: Boolean,
        eventTypes: Object,
        statusList: Object
    },
    methods: {
        addEvent: function () {
            this.$emit('open-editor', null);
        },
        editEvent: function(itemId) {
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
        dateIsInPast: function (datestr) {
            return moment(datestr).isBefore();
        }
    },
    computed: {
        orderedTimeline: function() {
            var self = this;
            var filteredTimeline = this.timeline.filter(function(item) {
                return item.type != "Link" && item.status != "Went" && item.status != "Didn't go"
                && ((self.ideasOnly == true && !item.date) || (self.ideasOnly == false && item.date))
            });
            return _.orderBy(filteredTimeline, ["date"]);
        }
    }
});