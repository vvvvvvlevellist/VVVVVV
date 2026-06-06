import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <div class="search-bar">
                    <input 
                        v-model="searchQuery" 
                        type="text" 
                        placeholder="Search levels..."
                        class="search-input"
                    />
                </div>
                <table class="list" v-if="list">
                    <tr v-for="entry in filteredList" :key="entry.index">
                        <td class="rank">
                            <p v-if="entry.index + 1 <= 50" class="type-label-lg">#{{ entry.index + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == entry.index, 'error': !entry.level }">
                            <button @click="selected = entry.index">
                                <span class="type-label-lg">{{ entry.level?.name || \`Error (\${entry.err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
                <div v-if="filteredList.length === 0 && searchQuery" class="no-results">
                    <p>No levels found matching "{{ searchQuery }}"</p>
                </div>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Tier</div>
                            <p>{{ level.tier }}</p>
                        </li>
                            <li>
                                <div class="type-title-sm">Download</div>
                                <a v-if="level.download !== 'Base Game'" :href="level.download" target="_blank" class="type-label-lg">
                                    Download Link
                                </a>
                                <span v-else class="type-label-lg">Base Game</span>
                            </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"></p>                   
                    <p v-else>This level does not accept new records</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                    <p>
                        Full list of rules and submissions in the discord!!!
                    <p>
                    </div>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        searchQuery: "",
        roleIconMap,
        store
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
        filteredList() {
            if (!this.searchQuery.trim()) {
                return this.list.slice(0, 50).map(([level, err], index) => ({
                    level,
                    err,
                    index
                }));
            }
            const query = this.searchQuery.toLowerCase();
            return this.list
                .slice(0, 50)
                .map(([level, err], index) => ({
                    level,
                    err,
                    index
                }))
                .filter(entry => entry.level && entry.level.name.toLowerCase().includes(query));
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
