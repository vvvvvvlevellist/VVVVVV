import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
        searchQuery: "",
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <div class="search-bar">
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            placeholder="Search players..."
                            class="search-input"
                        />
                    </div>
                    <table class="board">
                        <tr v-for="entry in filteredLeaderboard" :key="entry.index">
                            <td class="rank">
                                <p class="type-label-lg">#{{ entry.index + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(entry.user.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == entry.index }">
                                <button @click="selected = entry.index">
                                    <span class="type-label-lg">{{ entry.user.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                    <div v-if="filteredLeaderboard.length === 0 && searchQuery" class="no-results">
                        <p>No players found matching "{{ searchQuery }}"</p>
                    </div>
                </div>
                <div class="player-container">
                    <div class="player" v-if="entry">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ localize(entry.total) }}</h3>
                            <h2 v-if="entry.verified.filter(s => !s.isLegacy).length > 0">Verified ({{ entry.verified.filter(s => !s.isLegacy).length }})</h2>
                            <table class="table">
                                <tr v-for="score in entry.verified.filter(s => !s.isLegacy)">
                                    <td class="rank">
                                        <p>#{{ score.rank }}</p>
                                    </td>
                                    <td class="level">
                                        <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                    </td>
                                    <td class="score">
                                        <p>+{{ localize(score.score) }}</p>
                                    </td>
                                </tr>
                            </table>
                            <h2 v-if="entry.completed.filter(s => !s.isLegacy).length > 0">Completed ({{ entry.completed.filter(s => !s.isLegacy).length }})</h2>
                            <table class="table">
                                <tr v-for="score in entry.completed.filter(s => !s.isLegacy)">
                                    <td class="rank">
                                        <p>#{{ score.rank }}</p>
                                    </td>
                                    <td class="level">
                                        <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                    </td>
                                    <td class="score">
                                        <p>+{{ localize(score.score) }}</p>
                                    </td>
                                </tr>
                            </table>

                            <h2 v-if="entry.verified.filter(s => s.isLegacy).length > 0">Legacy Verified ({{ entry.verified.filter(s => s.isLegacy).length }})</h2>
                            <table class="table">
                                <tr v-for="score in entry.verified.filter(s => s.isLegacy)" class="legacy">
                                    <td class="rank">
                                        <p>#{{ score.rank }}</p>
                                    </td>
                                    <td class="level">
                                        <a class="type-label-sm" target="_blank" :href="score.link">{{ score.level }}</a>
                                    </td>
                                    <td class="score">
                                        <p>✓</p>
                                    </td>
                                </tr>
                            </table>

                            <h2 v-if="entry.completed.filter(s => s.isLegacy).length > 0">Legacy Completed ({{ entry.completed.filter(s => s.isLegacy).length }})</h2>
                            <table class="table">
                                <tr v-for="score in entry.completed.filter(s => s.isLegacy)" class="legacy">
                                    <td class="rank">
                                        <p>#{{ score.rank }}</p>
                                    </td>
                                    <td class="level">
                                        <a class="type-label-sm" target="_blank" :href="score.link">{{ score.level }}</a>
                                    </td>
                                    <td class="score">
                                        <p>✓</p>
                                    </td>
                                </tr>
                            </table>

                            <h2 v-if="entry.progressed.filter(s => !s.isLegacy).length > 0">Progressed ({{ entry.progressed.filter(s => !s.isLegacy).length }})</h2>
                            <table class="table">
                                <tr v-for="score in entry.progressed.filter(s => !s.isLegacy)">
                                    <td class="rank">
                                        <p>#{{ score.rank }}</p>
                                    </td>
                                    <td class="level">
                                        <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                    </td>
                                    <td class="score">
                                        <p>+{{ localize(score.score) }}</p>
                                    </td>
                                </tr>
                            </table>

                            <h2 v-if="entry.progressed.filter(s => s.isLegacy).length > 0">Legacy Progressed ({{ entry.progressed.filter(s => s.isLegacy).length }})</h2>
                            <table class="table">
                                <tr v-for="score in entry.progressed.filter(s => s.isLegacy)" class="legacy">
                                    <td class="rank">
                                        <p>#{{ score.rank }}</p>
                                    </td>
                                    <td class="level">
                                        <a class="type-label-sm" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                    </td>
                                    <td class="score">
                                        <p>✓</p>
                                    </td>
                                </tr>
                            </table>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
        filteredLeaderboard() {
            if (!this.searchQuery.trim()) {
                return this.leaderboard.map((user, index) => ({
                    user,
                    index
                }));
            }
            const query = this.searchQuery.toLowerCase();
            return this.leaderboard
                .map((user, index) => ({
                    user,
                    index
                }))
                .filter(entry => entry.user.user.toLowerCase().includes(query));
        },
    },
    watch: {
        filteredLeaderboard() {
            // Reset selection when filtered results change
            this.selected = 0;
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        // Hide loading spinner
        this.loading = false;
    },
    methods: {
        localize,
    },
};
