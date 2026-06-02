import { store } from "../main.js";
import { fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner },

    template: `
        <main v-if="loading">
            <Spinner />
        </main>

        <main v-else class="page-list">
            <h1>Legacy List</h1>

            <div class="list-container">
                <table class="list" v-if="legacy">
                    <tr v-for="(level, i) in legacy">
                        <td class="rank">
                            <p class="type-label-lg">Legacy</p>
                        </td>

                        <td class="level">
                            <span class="type-label-lg">
                                {{ level?.name || "Unknown Level" }}
                            </span>
                        </td>

                        <td class="tier">
                            <p>{{ level.tier }}</p>
                        </td>

                        <td class="download">
                            <a
                                v-if="level.download"
                                :href="level.download"
                                target="_blank"
                                class="type-label-lg"
                            >
                                Download
                            </a>

                            <p v-else>Base Game</p>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="meta-container">
                <div class="meta">

                    <h3>Legacy Info</h3>
                    <p>
                        These are archived levels that are no longer in the active top 50 list.
                        They no longer award points but remain playable and documented.
                    </p>

                    <div class="og">
                        <p class="type-label-md">
                            Website layout made by
                            <a href="https://tsl.pages.dev/" target="_blank">
                                TheShittyList
                            </a>
                        </p>
                    </div>

                </div>
            </div>
        </main>
    `,

    data: () => ({
        legacy: [],
        loading: true,
        store,
    }),

    async mounted() {
        const data = await fetchList();
        this.legacy = data?.legacy || [];
        this.loading = false;
    },
};