class AgendaApp {
    constructor() {
        this.projects = {};
        this.currentProject = 'Project 1';
        this.statusConfig = {
            alignment: { label: 'Alignment', color: '#6A1B9A' },
            approval: { label: 'Approval', color: '#1976D2' },
            help: { label: 'Help Required', color: '#FFFFC5' },
            decision: { label: 'Decision', color: '#64B5F6' },
            informed: { label: 'Informed', color: '#388E3C' },
            review: { label: 'Review', color: '#D32F2F' },
            escalation: { label: 'Escalation', color: '#FFA500' }
        };
        
        this.initializeElements();
        this.loadFromLocalStorage();
        this.bindEvents();
        this.renderTabs();
        this.switchToProject(this.currentProject);
    }

    initializeElements() {
        this.titleInput = document.getElementById('titleInput');
        this.statusSelect = document.getElementById('statusSelect');
        this.minutesInput = document.getElementById('minutesInput');
        this.addBtn = document.getElementById('addBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.loadBtn = document.getElementById('loadBtn');
        this.fileInput = document.getElementById('fileInput');
        this.addTabBtn = document.getElementById('addTabBtn');
        this.renameTabBtn = document.getElementById('renameTabBtn');
        this.deleteTabBtn = document.getElementById('deleteTabBtn');
        this.agendaList = document.getElementById('agendaList');
        this.exportContainer = document.getElementById('exportContainer');
        this.exportAgendaList = document.getElementById('exportAgendaList');
        this.tabsContainer = document.querySelector('.tabs-container');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addAgendaItem());
        this.exportBtn.addEventListener('click', () => this.exportAsPNG());
        this.saveBtn.addEventListener('click', () => this.saveToFile());
        this.loadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.loadFromFile(e));
        this.addTabBtn.addEventListener('click', () => this.addNewProject());
        this.renameTabBtn.addEventListener('click', () => this.renameCurrentProject());
        this.deleteTabBtn.addEventListener('click', () => this.deleteCurrentProject());
        
        // Allow adding items with Enter key
        this.titleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addAgendaItem();
        });
        
        this.minutesInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addAgendaItem();
        });
    }

    addAgendaItem() {
        const currentItems = this.getCurrentProjectItems();
        
        // Check if maximum items reached
        if (currentItems.length >= 9) {
            this.showError('Maximum 9 agenda items allowed');
            return;
        }

        const title = this.titleInput.value.trim() || 'Unnamed';
        const status = this.statusSelect.value || 'informed';
        const minutes = parseInt(this.minutesInput.value) || 15;

        // Create agenda item
        const item = {
            id: Date.now(),
            title,
            status,
            minutes
        };

        currentItems.push(item);
        this.saveToLocalStorage();
        this.renderAgendaItems();
        this.clearInputs();
        this.updateAddButtonState();
    }

    deleteAgendaItem(id) {
        const currentItems = this.getCurrentProjectItems();
        const index = currentItems.findIndex(item => item.id === id);
        if (index !== -1) {
            currentItems.splice(index, 1);
            this.saveToLocalStorage();
            this.renderAgendaItems();
            this.updateAddButtonState();
        }
    }

    renderAgendaItems() {
        this.agendaList.innerHTML = '';
        const currentItems = this.getCurrentProjectItems();
        
        currentItems.forEach(item => {
            const itemElement = this.createAgendaItemElement(item);
            this.agendaList.appendChild(itemElement);
        });
    }

    createAgendaItemElement(item, isExport = false) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `agenda-item ${item.status}`;
        
        const statusLabel = this.statusConfig[item.status].label;
        const statusIcon = this.getStatusIcon(item.status);
        
        itemDiv.innerHTML = `
            <div class="item-content">
                <div class="item-title ${!isExport ? 'editable' : ''}" ${!isExport ? `onclick="agendaApp.editTitle(${item.id}, this)"` : ''}>${this.escapeHtml(item.title)}</div>
                <div class="item-status ${!isExport ? 'editable' : ''}" ${!isExport ? `onclick="agendaApp.showStatusPopup(${item.id})"` : ''}>
                    ${statusIcon}
                    ${statusLabel}
                </div>
                <div class="item-minutes ${!isExport ? 'editable' : ''}" ${!isExport ? `onclick="agendaApp.showTimePopup(${item.id})"` : ''}>
                    <svg class="clock-icon" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                    </svg>
                    <span class="minutes-value">${item.minutes}</span> min
                </div>
            </div>
            ${!isExport ? `<button class="delete-btn" onclick="agendaApp.deleteAgendaItem(${item.id})">×</button>` : ''}
        `;
        
        return itemDiv;
    }

    getStatusIcon(status) {
        const icons = {
            alignment: '<svg class="status-icon" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/></svg>',
            approval: '<svg class="status-icon" viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>',
            help: '<svg class="status-icon" viewBox="0 0 24 24"><path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"/></svg>',
            decision: '<svg class="status-icon" viewBox="0 0 24 24"><path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/></svg>',
            informed: '<svg class="status-icon" viewBox="0 0 24 24"><path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>',
            review: '<svg class="status-icon" viewBox="0 0 24 24"><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></svg>',
            escalation: '<svg class="status-icon" viewBox="0 0 24 24"><path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/></svg>'
        };
        return icons[status] || '';
    }

    clearInputs() {
        this.titleInput.value = '';
        this.statusSelect.value = '';
        this.minutesInput.value = '';
        this.titleInput.focus();
    }

    showError(message) {
        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #D32F2F;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 3000);
    }

    showSuccess(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #388E3C;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 3000);
    }

    async exportAsPNG() {
        const currentItems = this.getCurrentProjectItems();
        if (currentItems.length === 0) {
            this.showError('Please add at least one agenda item before exporting');
            return;
        }

        // Show loading state
        this.exportBtn.textContent = 'Exporting...';
        this.exportBtn.disabled = true;

        try {
            // Store original styles
            const originalStyles = {
                position: this.exportContainer.style.position,
                left: this.exportContainer.style.left,
                top: this.exportContainer.style.top,
                width: this.exportContainer.style.width,
                height: this.exportContainer.style.height,
                overflow: this.exportContainer.style.overflow,
                visibility: this.exportContainer.style.visibility,
                opacity: this.exportContainer.style.opacity,
                zIndex: this.exportContainer.style.zIndex,
                transform: this.exportContainer.style.transform
            };

            // Position export container for capture
            Object.assign(this.exportContainer.style, {
                position: 'fixed',
                left: '0',
                top: '0',
                width: '1920px',
                height: '1080px',
                overflow: 'hidden',
                visibility: 'visible',
                opacity: '1',
                zIndex: '9999',
                transform: 'none'
            });

            // Populate export container
            this.populateExportContainer();
            
            // Apply scaling to fit all items within 16:9
            this.applyExportScaling();
            
            // Wait for rendering
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Calculate scale to fit all items
            const contentHeight = this.exportAgendaList.scrollHeight;
            const availableHeight = 900; // 1080 - header/footer
            const itemCount = this.getCurrentProjectItems().length;
            
            // If we have 8 or more items, ensure the last item is fully visible
            let scale = 1;
            if (itemCount >= 8) {
                const lastItem = this.exportAgendaList.lastElementChild;
                if (lastItem) {
                    const lastItemRect = lastItem.getBoundingClientRect();
                    const containerRect = this.exportAgendaList.getBoundingClientRect();
                    const lastItemBottom = lastItemRect.bottom - containerRect.top;
                    
                    // Calculate scale to fit the last item with some padding
                    scale = Math.min(1, (availableHeight - 20) / lastItemBottom);
                }
            } else {
                // For fewer than 8 items, use normal scaling
                scale = Math.min(1, availableHeight / contentHeight);
            }
            
            // Apply scale to fit all items
            if (scale < 1) {
                this.exportAgendaList.style.transform = `scale(${scale})`;
                this.exportAgendaList.style.transformOrigin = 'top center';
                this.exportAgendaList.style.width = '100%';
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            
            // Capture the export container with fixed 16:9 ratio
            const canvas = await html2canvas(this.exportContainer, {
                width: 1920,
                height: 1080,
                scale: 1,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0,
                logging: true,
                windowWidth: 1920,
                windowHeight: 1080,
                onclone: (clonedDoc) => {
                    const cloneContainer = clonedDoc.getElementById('exportContainer');
                    const cloneList = clonedDoc.getElementById('exportAgendaList');
                    if (cloneContainer && cloneList) {
                        cloneContainer.style.position = 'absolute';
                        cloneContainer.style.left = '0';
                        cloneContainer.style.top = '0';
                        cloneContainer.style.width = '1920px';
                        cloneContainer.style.height = '1080px';
                        cloneContainer.style.overflow = 'hidden';
                        
                        if (scale < 1) {
                            cloneList.style.transform = `scale(${scale})`;
                            cloneList.style.transformOrigin = 'top center';
                            cloneList.style.width = '100%';
                        }
                    }
                }
            });
            
            // Reset to original styles
            Object.assign(this.exportContainer.style, originalStyles);
            
            // Reset container styles
            this.exportContainer.style.position = 'absolute';
            this.exportContainer.style.left = '-9999px';
            this.exportContainer.style.top = '-9999px';
            this.exportContainer.style.visibility = 'hidden';
            this.exportContainer.style.opacity = '0';
            this.exportContainer.style.width = '';
            this.exportContainer.style.height = '';
            this.exportContainer.style.overflow = '';
            
            // Create and trigger download
            const link = document.createElement('a');
            link.download = `agenda-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('Export failed. Please try again.');
        } finally {
            // Reset button state
            this.exportBtn.textContent = 'Export as PNG';
            this.exportBtn.disabled = false;
        }
    }

    populateExportContainer() {
        this.exportAgendaList.innerHTML = '';
        const currentItems = this.getCurrentProjectItems();
        
        currentItems.forEach(item => {
            const itemElement = this.createAgendaItemElement(item, true);
            this.exportAgendaList.appendChild(itemElement);
        });
    }

    applyExportScaling() {
        const itemCount = this.getCurrentProjectItems().length;
        
        // Reset any previous transforms
        this.exportAgendaList.style.transform = 'none';
        this.exportAgendaList.style.transformOrigin = 'top center';
        this.exportAgendaList.style.width = '100%';
        
        // Set base styles for the export container
        Object.assign(this.exportContainer.style, {
            padding: '60px 80px',
            overflow: 'hidden',
            height: '1080px',
            minHeight: '1080px',
            maxHeight: '1080px'
        });
        
        // Set base styles for the agenda list
        Object.assign(this.exportAgendaList.style, {
            gap: '12px',
            fontSize: '1.1em',
            padding: '0',
            margin: '0',
            width: '100%',
            maxHeight: '960px', // 1080 - 120 (header/footer)
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column'
        });
        
        // Adjust item styles
        const items = this.exportAgendaList.querySelectorAll('.agenda-item');
        items.forEach(item => {
            Object.assign(item.style, {
                padding: '18px 24px',
                margin: '0',
                flexShrink: '0',
                boxSizing: 'border-box',
                width: '100%'
            });
        });
    }

    editTitle(itemId, element) {
        const currentItems = this.getCurrentProjectItems();
        const item = currentItems.find(item => item.id === itemId);
        if (!item) return;

        const currentText = item.title;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'inline-edit-input';
        input.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.5);
            color: inherit;
            font-size: inherit;
            font-weight: inherit;
            padding: 4px 8px;
            border-radius: 8px;
            width: 100%;
            outline: none;
        `;

        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newTitle = input.value.trim() || 'Unnamed';
            item.title = newTitle;
            element.textContent = newTitle;
            element.classList.add('editable');
            this.saveToLocalStorage();
        };

        const cancelEdit = () => {
            element.textContent = currentText;
            element.classList.add('editable');
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }

    showStatusPopup(itemId) {
        const currentItems = this.getCurrentProjectItems();
        const item = currentItems.find(item => item.id === itemId);
        if (!item) return;
        
        const popup = document.getElementById('statusPopup');
        const optionsContainer = popup.querySelector('.status-options');
        optionsContainer.innerHTML = '';
        
        // Create status options with icons and colors
        Object.entries(this.statusConfig).forEach(([key, status]) => {
            const option = document.createElement('div');
            option.className = 'status-option';
            option.style.borderLeft = `4px solid ${status.color}`;
            option.innerHTML = `
                <span class="status-icon">${this.getStatusIcon(key)}</span>
                <span class="status-label">${status.label}</span>
            `;
            option.dataset.status = key;
            
            // Highlight currently selected status
            if (key === item.status) {
                option.style.background = `${status.color}20`; // 20% opacity of status color
                option.style.borderColor = status.color;
            }
            
            option.addEventListener('click', () => this.handleStatusSelect(item, key));
            optionsContainer.appendChild(option);
        });
        
        // Show popup
        popup.classList.add('active');
        
        // Close on cancel button click
        popup.querySelector('.popup-button.cancel').onclick = () => {
            popup.classList.remove('active');
        };
        
        // Close on Escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                popup.classList.remove('active');
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
    }

    showTimePopup(itemId) {
        const currentItems = this.getCurrentProjectItems();
        const item = currentItems.find(item => item.id === itemId);
        if (!item) return;
        
        const popup = document.getElementById('timePopup');
        const timeInput = popup.querySelector('#timeInput');
        timeInput.value = item.minutes;
        
        // Show popup
        popup.classList.add('active');
        timeInput.focus();
        timeInput.select();
        
        const saveTime = () => {
            const newMinutes = parseInt(timeInput.value);
            if (newMinutes && newMinutes > 0 && newMinutes <= 999) {
                item.minutes = newMinutes;
                this.saveToLocalStorage();
                this.renderAgendaItems();
                popup.classList.remove('active');
            } else {
                this.showError('Please enter a valid number between 1 and 999');
                timeInput.focus();
            }
        };
        
        // Save on button click
        popup.querySelector('.popup-button.save').onclick = saveTime;
        
        // Save on Enter key
        timeInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                saveTime();
            }
        };
        
        // Close on cancel button click
        popup.querySelector('.popup-button.cancel').onclick = () => {
            popup.classList.remove('active');
        };
        
        // Close on Escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                popup.classList.remove('active');
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
    }

    handleStatusSelect(item, status) {
        item.status = status;
        this.saveToLocalStorage();
        this.renderAgendaItems();
        document.getElementById('statusPopup').classList.remove('active');
    }
    
    // Project Management Methods
    getCurrentProjectItems() {
        if (!this.projects[this.currentProject]) {
            this.projects[this.currentProject] = [];
        }
        return this.projects[this.currentProject];
    }

    switchToProject(projectName) {
        this.currentProject = projectName;
        this.renderAgendaItems();
        this.updateAddButtonState();
        this.updateActiveTab();
    }

    addNewProject() {
        const projectName = prompt('Enter project name:');
        if (projectName && projectName.trim()) {
            const trimmedName = projectName.trim();
            if (!this.projects[trimmedName]) {
                this.projects[trimmedName] = [];
                this.saveToLocalStorage();
                this.renderTabs();
                this.switchToProject(trimmedName);
            } else {
                this.showError('Project already exists');
            }
        }
    }

    renameCurrentProject() {
        const newName = prompt('Enter new project name:', this.currentProject);
        if (newName && newName.trim() && newName.trim() !== this.currentProject) {
            const trimmedName = newName.trim();
            if (!this.projects[trimmedName]) {
                this.projects[trimmedName] = this.projects[this.currentProject];
                delete this.projects[this.currentProject];
                this.currentProject = trimmedName;
                this.saveToLocalStorage();
                this.renderTabs();
                this.updateActiveTab();
            } else {
                this.showError('Project name already exists');
            }
        }
    }

    deleteCurrentProject() {
        const projectNames = Object.keys(this.projects);
        if (projectNames.length <= 1) {
            this.showError('Cannot delete the last project');
            return;
        }

        if (confirm(`Are you sure you want to delete "${this.currentProject}"?`)) {
            delete this.projects[this.currentProject];
            this.currentProject = projectNames.find(name => name !== this.currentProject) || 'Project 1';
            this.saveToLocalStorage();
            this.renderTabs();
            this.switchToProject(this.currentProject);
        }
    }

    renderTabs() {
        const tabsContainer = this.tabsContainer;
        const addTabBtn = tabsContainer.querySelector('.add-tab-btn');
        
        // Remove existing tabs
        tabsContainer.querySelectorAll('.tab').forEach(tab => tab.remove());
        
        // Add tabs for each project
        Object.keys(this.projects).forEach(projectName => {
            const tab = document.createElement('div');
            tab.className = 'tab';
            tab.dataset.project = projectName;
            tab.textContent = projectName;
            tab.addEventListener('click', () => this.switchToProject(projectName));
            tab.addEventListener('dblclick', () => this.editProjectName(tab, projectName));
            tabsContainer.insertBefore(tab, addTabBtn);
        });
        
        this.updateActiveTab();
    }

    updateActiveTab() {
        this.tabsContainer.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.project === this.currentProject);
        });
    }

    // Storage Methods
    saveToLocalStorage() {
        localStorage.setItem('agendaProjects', JSON.stringify({
            projects: this.projects,
            currentProject: this.currentProject
        }));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('agendaProjects');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.projects = data.projects || {};
                this.currentProject = data.currentProject || 'Project 1';
            } catch (e) {
                console.error('Failed to load from localStorage:', e);
            }
        }
        
        // Ensure at least one project exists
        if (Object.keys(this.projects).length === 0) {
            this.projects['Project 1'] = [];
            this.currentProject = 'Project 1';
        }
    }

    // File Save/Load Methods
    saveToFile() {
        const data = {
            projects: this.projects,
            currentProject: this.currentProject,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `agenda-projects-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    loadFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.projects) {
                    if (confirm('This will replace all current projects. Continue?')) {
                        this.projects = data.projects;
                        this.currentProject = data.currentProject || Object.keys(data.projects)[0] || 'Project 1';
                        this.saveToLocalStorage();
                        this.renderTabs();
                        this.switchToProject(this.currentProject);
                        this.showSuccess('Projects loaded successfully');
                    }
                } else {
                    this.showError('Invalid file format');
                }
            } catch (error) {
                this.showError('Failed to load file');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    updateAddButtonState() {
        const currentItems = this.getCurrentProjectItems();
        const isMaxReached = currentItems.length >= 9;
        this.addBtn.disabled = isMaxReached;
        
        if (isMaxReached) {
            this.addBtn.textContent = 'Maximum 9 Items';
            this.addBtn.style.opacity = '0.5';
            this.addBtn.style.cursor = 'not-allowed';
        } else {
            this.addBtn.textContent = 'Add Item';
            this.addBtn.style.opacity = '1';
            this.addBtn.style.cursor = 'pointer';
        }
    }

    editProjectName(tabElement, currentName) {
        // Prevent switching project during edit
        event.stopPropagation();
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'tab-edit-input';
        input.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.5);
            color: inherit;
            font-size: inherit;
            font-weight: inherit;
            padding: 6px 12px;
            border-radius: 20px;
            width: 100%;
            outline: none;
            text-align: center;
        `;

        tabElement.innerHTML = '';
        tabElement.appendChild(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newName = input.value.trim();
            if (newName && newName !== currentName) {
                if (!this.projects[newName]) {
                    // Rename project
                    this.projects[newName] = this.projects[currentName];
                    delete this.projects[currentName];
                    
                    // Update current project if it was the renamed one
                    if (this.currentProject === currentName) {
                        this.currentProject = newName;
                    }
                    
                    this.saveToLocalStorage();
                    this.renderTabs();
                    this.updateActiveTab();
                } else {
                    this.showError('Project name already exists');
                    tabElement.textContent = currentName;
                }
            } else {
                tabElement.textContent = currentName;
            }
        };

        const cancelEdit = () => {
            tabElement.textContent = currentName;
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.agendaApp = new AgendaApp();
});