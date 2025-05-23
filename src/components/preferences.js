/**
 * PreferencesComponent for displaying and saving player settings.
 * Expand for controls, quality, audio, etc.
 */
import Component from '../engine/component.js';

export default class PreferencesComponent extends Component {
    constructor() {
        super();
        this.panel = null;
    }

    init(entity) {
        this.panel = document.createElement('div');
        this.panel.className = 'preferences-panel';
        this.panel.style.position = 'absolute';
        this.panel.style.top = '80px';
        this.panel.style.right = '20px';
        this.panel.style.background = 'rgba(30,30,30,0.95)';
        this.panel.style.color = '#fff';
        this.panel.style.padding = '20px';
        this.panel.style.borderRadius = '10px';
        this.panel.style.zIndex = '300';
        this.panel.style.display = 'none';

        // Example: Quality setting
        const qualityLabel = document.createElement('label');
        qualityLabel.textContent = 'Graphics Quality: ';
        const qualitySelect = document.createElement('select');
        ['Auto', 'High', 'Medium', 'Low'].forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.toLowerCase();
            o.textContent = opt;
            qualitySelect.appendChild(o);
        });
        qualityLabel.appendChild(qualitySelect);
        this.panel.appendChild(qualityLabel);

        // Example: Audio toggle
        const audioLabel = document.createElement('label');
        audioLabel.style.marginLeft = '20px';
        audioLabel.textContent = 'Audio: ';
        const audioCheckbox = document.createElement('input');
        audioCheckbox.type = 'checkbox';
        audioCheckbox.checked = true;
        audioLabel.appendChild(audioCheckbox);
        this.panel.appendChild(audioLabel);

        // Show/hide button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Preferences';
        toggleBtn.style.position = 'absolute';
        toggleBtn.style.top = '-40px';
        toggleBtn.style.right = '0';
        toggleBtn.onclick = () => {
            this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(toggleBtn);
        document.body.appendChild(this.panel);

        // Save/load logic can be added here
    }

    destroy(entity) {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}