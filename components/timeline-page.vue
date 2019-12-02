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
                    ({{ howSoon(item.date) }})
                </div>
                <div style="font-weight: bold"
                        v-bind:class="{ 'text-muted': isCollapsed(item) }">
                    
                    <span v-on:click="editEvent(item.id)"
                            style="cursor: pointer">
                        {{ eventTypes[item.type] }} 
                    </span>
                    
                    {{ item.name}}

                    <a v-if="item.link"
                        v-bind:href="item.link"
                        class="emoji"
                        style="text-decoration: none"
                        target="_blank">&nbsp;<span class="glyphicon glyphicon-new-window"></span></a>
                </div>
                <div v-show="!isCollapsed(item)">
                    <div v-if="item.date"  >
                        <span class="text-muted">{{ item.date | formatDate('dddd D MMMM YYYY') }}</span>
                        ({{ howSoon(item.date) }})
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

        <editor-dialog ref="editor"
                v-bind:event-types="eventTypes"
                v-bind:status-list="statusList"
                v-on:save="editorSave"></editor-dialog>
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
        ideasOnly: Boolean
    },
    data: function() {
        return {
            eventTypes: {
                "Birthday": "🎂",
                "Restaurent": "🍽️",
                "Film": "🎬",
                "Live Entertainment": "🎭",
                "Music": "🎵",
                "Excursion": "🚶‍",
                "Holiday": "🌞"
            },
            statusList: {
                "Going": "✔",
                "Interested": "⭐",
                "Need to book": "🎟",
                "Went":"🙂",
                "Didn't go": "🙁"
            }
        }
    },
    methods: {
        addEvent: function () {
            this.$refs.editor.openDialog();
        },
        editEvent: function(itemId) {
            var idx = this.timeline.findIndex(z => z.id === itemId);
            var copy = Object.assign({}, this.timeline[idx]); // create a copy of the item for the editor to work with
            this.$refs.editor.openDialog(copy);
        },
        editorSave: function(item) {
            this.$emit('update-item', item);
        },
        isCollapsed: function(item) { 
            return item.status == "Interested";
        },
        howSoon: function(date) {
            var eventDate = moment(date);
            var nowDate = moment().startOf('day');
            var duration = moment.duration(eventDate.diff(nowDate));
            //return duration.humanize();
            var pluralise = function(number, suffix) {
                return number + " " + suffix + (number == 1 ? "" : "s");
            }
            if (duration.asDays() < 7) {
                if (duration.days() == 0)
                    return "Today";
                else 
                    // Less than a week away - show # days
                    return pluralise(duration.days(), "day");
            } else if (duration.asWeeks() < 10)
                // Less than 10 weeks away - show in weeks/days
                return pluralise(Math.floor(duration.asWeeks()), "week") + " " + pluralise(Math.floor(duration.asDays() % 7), "day");
            else if (duration.asYears() < 1)
                // Less than a year away - show in months
                return pluralise(duration.months(), "month");
            else 
                // More than a year away - show years/months
                return pluralise(duration.years(), "year") + " "  + pluralise(duration.months(), "month");
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