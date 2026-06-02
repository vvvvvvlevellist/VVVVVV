import { round, score } from './score.js';

/**
 * Path to directory containing _list.json and all levels
 */
const dir = '/data';

export async function fetchList() {
    try {
        const listResult = await fetch(`${dir}/_list.json`);
        const order = await listResult.json();

        const full = await Promise.all(
            order.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);

                try {
                    const level = await levelResult.json();

                    return [
                        {
                            ...level,
                            path,
                            rank: rank + 1,
                            records: (level.records || []).sort(
                                (a, b) => b.percent - a.percent
                            ),
                        },
                        null,
                    ];
                } catch (err) {
                    console.error(`Failed level: ${path}`);
                    return [null, path];
                }
            })
        );

        // ----------------------------
        // LEGACY SYSTEM (TOP 50 ACTIVE)
        // ----------------------------
        const ACTIVE_LIMIT = 50;

        const list = full.filter(([l]) => l).slice(0, ACTIVE_LIMIT);
        const legacy = full.filter(([l]) => l).slice(ACTIVE_LIMIT);

        return { list, legacy };

    } catch (err) {
        console.error("Failed to load list:", err);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const res = await fetch(`${dir}/_editors.json`);
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {
    const data = await fetchList();
    if (!data) return null;

    const list = data.list;

    const scoreMap = {};
    const errs = [];

    list.forEach(([level, err], rank) => {
        if (err || !level) {
            errs.push(err || "unknown");
            return;
        }

        const verifier =
            Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === level.verifier.toLowerCase()
            ) || level.verifier;

        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };

        scoreMap[verifier].verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
        });

        level.records.forEach((record) => {
            const user =
                Object.keys(scoreMap).find(
                    (u) => u.toLowerCase() === record.user.toLowerCase()
                ) || record.user;

            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };

            if (record.percent === 100) {
                scoreMap[user].completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                });
            } else {
                scoreMap[user].progressed.push({
                    rank: rank + 1,
                    level: level.name,
                    percent: record.percent,
                    score: score(rank + 1, record.percent, level.percentToQualify),
                    link: record.link,
                });
            }
        });
    });

    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;

        const total = [verified, completed, progressed]
            .flat()
            .reduce((p, c) => p + c.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    return [res.sort((a, b) => b.total - a.total), errs];
}