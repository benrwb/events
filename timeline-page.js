import editorDialog from './editor-dialog.js'

export default Vue.extend({
    components: {
        editorDialog
    },
    template: /* html */`
    <div>
        <button class="btn btn-success navbar-btn" 
                v-on:click="addEvent">
            Add Event
        </button>

        <div v-for="item in orderedTimeline"
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
                    </span>
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
    `,
    props: {
        timeline: Array
    },
    data: function() {
        return {
            eventTypes: {
                "Birthday": "🎂",
                "Film": "🎬",
                "Comedy": "🎭",
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
            },
            itemBeingUpdated: '' // id (guid) of item currently being saved
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
            this.$emit('update-timeline-item', item);
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
            return duration.years() > 0 ? pluralise(duration.years(), "year") : ""
                + duration.months() > 0 ? pluralise(duration.months(), "month") : ""
                + duration.weeks() > 0 ? pluralise(duration.weeks(), "week") : ""
                + duration.days() > 0 ? pluralise(duration.days(), "day") : "";
        }
    },
    computed: {
        orderedTimeline: function() {
            var filteredTimeline = this.timeline.filter(function(item) {
                return item.status != "Went" && item.status != "Didn't go";
            });
            return _.orderBy(filteredTimeline, ["date"]);
        }
    }
});