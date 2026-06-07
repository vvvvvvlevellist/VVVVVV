import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Legacy from './pages/Legacy.js';
import Roulette from './pages/Roulette.js';

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/legacy', component: Legacy },
    { path: '/roulette', component: Roulette },
];
