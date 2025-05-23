/**
 * EventCalendarComponent for displaying upcoming events.
 * Expand for backend or JSON integration.
 */
import Component from '../engine/component.js';

export default class EventCalendarComponent extends Component {
    constructor() {
        super();
        this.panel = null;
        this.events = [];
    }

    init(entity) {
        this.panel = document.createElement('div');
        this.panel.className = 'event-calendar-panel';
        this.panel.style.position = 'absolute';
        this.panel.style.top = '80px';
        this.panel.style.right = '20px';
        this.panel.style.background = 'rgba(30,30,30,0.95)';
        this.panel.style.color = '#fff';
        this.panel.style.padding = '20px';
        this.panel.style.borderRadius = '10px';
        this.panel.style.zIndex = '500';
        this.panel.style.display = 'none';

        // Title
        const title = document.createElement('div');
        title.textContent = 'Event Calendar';
        title.style.fontSize = '28px';
        title.style.marginBottom = '12px';
        this.panel.appendChild(title);

        // Events list
        this.list = document.createElement('ul');
        this.panel.appendChild(this.list);

        // Show/hide button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Events';
        toggleBtn.style.position = 'absolute';
        toggleBtn.style.top = '-40px';
        toggleBtn.style.right = '0';
        toggleBtn.onclick = () => {
            this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(toggleBtn);
        document.body.appendChild(this.panel);
    }

    /**
     * Set and display events.
     * @param {Array<{date: string, name: string, description?: string}>} events
     */
    setEvents(events) {
        this.events = events;
        this.render();
    }

    render() {
        this.list.innerHTML = '';
        for (const event of this.events) {
            const li = document.createElement('li');
            li.textContent = `${event.date}: ${event.name}` + (event.description ? ` - ${event.description}` : '');
            this.list.appendChild(li);
        }
    }

    destroy(entity) {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}