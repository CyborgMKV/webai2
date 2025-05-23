/**
 * LeaderboardComponent for displaying top scores.
 * Expand for online backend integration.
 */
import Component from '../engine/component.js';

export default class LeaderboardComponent extends Component {
    constructor() {
        super();
        this.panel = null;
        this.scores = [];
    }

    init(entity) {
        this.panel = document.createElement('div');
        this.panel.className = 'leaderboard-panel';
        this.panel.style.position = 'absolute';
        this.panel.style.top = '80px';
        this.panel.style.left = '50%';
        this.panel.style.transform = 'translateX(-50%)';
        this.panel.style.background = 'rgba(30,30,30,0.95)';
        this.panel.style.color = '#fff';
        this.panel.style.padding = '20px';
        this.panel.style.borderRadius = '10px';
        this.panel.style.zIndex = '400';
        this.panel.style.display = 'none';

        // Title
        const title = document.createElement('div');
        title.textContent = 'Leaderboard';
        title.style.fontSize = '28px';
        title.style.marginBottom = '12px';
        this.panel.appendChild(title);

        // Scores list
        this.list = document.createElement('ol');
        this.panel.appendChild(this.list);

        // Show/hide button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Leaderboard';
        toggleBtn.style.position = 'absolute';
        toggleBtn.style.top = '-40px';
        toggleBtn.style.left = '0';
        toggleBtn.onclick = () => {
            this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(toggleBtn);
        document.body.appendChild(this.panel);
    }

    /**
     * Set and display scores.
     * @param {Array<{name: string, score: number}>} scores
     */
    setScores(scores) {
        this.scores = scores;
        this.render();
    }

    render() {
        this.list.innerHTML = '';
        for (const entry of this.scores) {
            const li = document.createElement('li');
            li.textContent = `${entry.name}: ${entry.score}`;
            this.list.appendChild(li);
        }
    }

    destroy(entity) {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}