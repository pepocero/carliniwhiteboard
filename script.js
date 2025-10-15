class Whiteboard {
    constructor() {
        this.canvas = document.getElementById('whiteboardCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'select';
        this.currentColor = '#000000';
        this.strokeWidth = 3;
        this.isDrawing = false;
        this.isPanning = false;
        this.lastX = 0;
        this.lastY = 0;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.textElements = [];
        this.stickyNotes = [];
        this.selectedElement = null;
        this.startX = 0;
        this.startY = 0;
        this.tempShape = null;
        this.stickyColor = '#ffeb3b';
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupToolbar();
        this.setupModals();
        this.saveState();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Set initial canvas style
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
    }

    resizeCanvas() {
        const container = document.getElementById('canvasWrapper');
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        this.redraw();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseout', (e) => this.handleMouseUp(e));

        // Touch events for mobile support
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    setupToolbar() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.selectTool(tool);
            });
        });

        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectColor(e.currentTarget.dataset.color);
            });
        });

        // Custom color picker
        document.getElementById('customColor').addEventListener('change', (e) => {
            this.selectColor(e.target.value);
        });

        // Stroke width
        const strokeSlider = document.getElementById('strokeWidth');
        const strokeValue = document.getElementById('strokeValue');
        
        strokeSlider.addEventListener('input', (e) => {
            this.strokeWidth = parseInt(e.target.value);
            strokeValue.textContent = `${this.strokeWidth}px`;
        });

        // Action buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('resetZoom').addEventListener('click', () => this.resetZoom());

        // Header buttons
        document.getElementById('saveBtn').addEventListener('click', () => this.save());
        document.getElementById('loadBtn').addEventListener('click', () => this.load());
        document.getElementById('shareBtn').addEventListener('click', () => this.share());
    }

    setupModals() {
        // Text modal
        const textModal = document.getElementById('textModal');
        const textInput = document.getElementById('textInput');
        const confirmText = document.getElementById('confirmText');
        const cancelText = document.getElementById('cancelText');

        confirmText.addEventListener('click', () => {
            const text = textInput.value.trim();
            if (text) {
                this.addTextElement(text, this.lastX, this.lastY);
                this.saveState();
            }
            this.hideModal('textModal');
            textInput.value = '';
        });

        cancelText.addEventListener('click', () => {
            this.hideModal('textModal');
            textInput.value = '';
        });

        // Sticky note modal
        const stickyModal = document.getElementById('stickyModal');
        const stickyInput = document.getElementById('stickyInput');
        const confirmSticky = document.getElementById('confirmSticky');
        const cancelSticky = document.getElementById('cancelSticky');

        // Sticky note colors
        document.querySelectorAll('.sticky-color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.sticky-color-option').forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.stickyColor = e.currentTarget.dataset.color;
            });
        });

        confirmSticky.addEventListener('click', () => {
            const text = stickyInput.value.trim();
            if (text) {
                this.addStickyNote(text, this.lastX, this.lastY);
                this.saveState();
            }
            this.hideModal('stickyModal');
            stickyInput.value = '';
        });

        cancelSticky.addEventListener('click', () => {
            this.hideModal('stickyModal');
            stickyInput.value = '';
        });
    }

    selectTool(tool) {
        this.currentTool = tool;
        
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Update cursor
        this.canvas.className = `cursor-${tool}`;
        
        // Clear selection
        this.selectedElement = null;
        this.redraw();
    }

    selectColor(color) {
        this.currentColor = color;
        
        // Update UI
        document.querySelectorAll('.color-option').forEach(option => option.classList.remove('active'));
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
        
        // Update custom color picker
        document.getElementById('customColor').value = color;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX / this.zoom - this.panX,
            y: (e.clientY - rect.top) * scaleY / this.zoom - this.panY
        };
    }

    getTouchPos(e) {
        const touch = e.touches[0] || e.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (touch.clientX - rect.left) * scaleX / this.zoom - this.panX,
            y: (touch.clientY - rect.top) * scaleY / this.zoom - this.panY
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        this.startX = pos.x;
        this.startY = pos.y;
        this.lastX = pos.x;
        this.lastY = pos.y;

        if (this.currentTool === 'select') {
            this.handleSelection(pos);
        } else if (this.currentTool === 'pen') {
            this.startDrawing(pos);
        } else if (this.currentTool === 'eraser') {
            this.startErasing(pos);
        } else if (this.currentTool === 'text') {
            this.showModal('textModal');
        } else if (this.currentTool === 'sticky') {
            this.showModal('stickyModal');
        } else if (['rectangle', 'circle', 'line', 'arrow'].includes(this.currentTool)) {
            this.startShape(pos);
        }
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);

        if (this.isDrawing) {
            this.draw(pos);
        } else if (this.isPanning) {
            this.pan(pos);
        } else if (this.tempShape) {
            this.updateTempShape(pos);
        } else if (this.currentTool === 'select' && this.selectedElement) {
            this.moveSelectedElement(pos);
        }
    }

    handleMouseUp(e) {
        if (this.isDrawing) {
            this.stopDrawing();
        } else if (this.tempShape) {
            this.finishShape();
        }
        
        this.isPanning = false;
        this.tempShape = null;
    }

    handleTouchStart(e) {
        e.preventDefault();
        const pos = this.getTouchPos(e);
        this.startX = pos.x;
        this.startY = pos.y;
        this.lastX = pos.x;
        this.lastY = pos.y;

        if (e.touches.length === 1) {
            // Single touch
            if (this.currentTool === 'select') {
                this.handleSelection(pos);
            } else if (this.currentTool === 'pen') {
                this.startDrawing(pos);
            } else if (this.currentTool === 'eraser') {
                this.startErasing(pos);
            } else if (this.currentTool === 'text') {
                this.showModal('textModal');
            } else if (this.currentTool === 'sticky') {
                this.showModal('stickyModal');
            } else if (['rectangle', 'circle', 'line', 'arrow'].includes(this.currentTool)) {
                this.startShape(pos);
            }
        } else if (e.touches.length === 2) {
            // Two finger pan/zoom
            this.isPanning = true;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        const pos = this.getTouchPos(e);

        if (this.isDrawing) {
            this.draw(pos);
        } else if (this.isPanning && e.touches.length === 2) {
            this.pan(pos);
        } else if (this.tempShape) {
            this.updateTempShape(pos);
        } else if (this.currentTool === 'select' && this.selectedElement) {
            this.moveSelectedElement(pos);
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        if (this.isDrawing) {
            this.stopDrawing();
        } else if (this.tempShape) {
            this.finishShape();
        }
        
        this.isPanning = false;
        this.tempShape = null;
    }

    handleKeyDown(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 's':
                    e.preventDefault();
                    this.save();
                    break;
            }
        }
    }

    startDrawing(pos) {
        this.isDrawing = true;
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.strokeWidth;
    }

    draw(pos) {
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        this.isDrawing = false;
        this.saveState();
    }

    startErasing(pos) {
        this.isDrawing = true;
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineWidth = this.strokeWidth * 2;
    }

    startShape(pos) {
        this.tempShape = {
            type: this.currentTool,
            startX: pos.x,
            startY: pos.y,
            endX: pos.x,
            endY: pos.y,
            color: this.currentColor,
            strokeWidth: this.strokeWidth
        };
    }

    updateTempShape(pos) {
        this.tempShape.endX = pos.x;
        this.tempShape.endY = pos.y;
        this.redraw();
        this.drawTempShape();
    }

    finishShape() {
        if (this.tempShape) {
            this.drawShape(this.tempShape);
            this.tempShape = null;
            this.saveState();
        }
    }

    drawTempShape() {
        if (!this.tempShape) return;

        this.ctx.save();
        this.ctx.strokeStyle = this.tempShape.color;
        this.ctx.lineWidth = this.tempShape.strokeWidth;
        this.ctx.globalCompositeOperation = 'source-over';

        const { type, startX, startY, endX, endY } = this.tempShape;
        const width = endX - startX;
        const height = endY - startY;

        switch (type) {
            case 'rectangle':
                this.ctx.strokeRect(startX, startY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(width * width + height * height);
                this.ctx.beginPath();
                this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
                break;
            case 'arrow':
                this.drawArrow(startX, startY, endX, endY);
                break;
        }

        this.ctx.restore();
    }

    drawShape(shape) {
        this.ctx.save();
        this.ctx.strokeStyle = shape.color;
        this.ctx.lineWidth = shape.strokeWidth;
        this.ctx.globalCompositeOperation = 'source-over';

        const { type, startX, startY, endX, endY } = shape;
        const width = endX - startX;
        const height = endY - startY;

        switch (type) {
            case 'rectangle':
                this.ctx.strokeRect(startX, startY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(width * width + height * height);
                this.ctx.beginPath();
                this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
                break;
            case 'arrow':
                this.drawArrow(startX, startY, endX, endY);
                break;
        }

        this.ctx.restore();
    }

    drawArrow(startX, startY, endX, endY) {
        const headLength = 15;
        const angle = Math.atan2(endY - startY, endX - startX);

        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Draw arrowhead
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.stroke();
    }

    addTextElement(text, x, y) {
        const textElement = {
            id: Date.now(),
            text: text,
            x: x,
            y: y,
            color: this.currentColor,
            fontSize: 16,
            fontFamily: 'Arial'
        };
        
        this.textElements.push(textElement);
        this.redraw();
    }

    addStickyNote(text, x, y) {
        const stickyNote = {
            id: Date.now(),
            text: text,
            x: x,
            y: y,
            color: this.stickyColor,
            width: 200,
            height: 150
        };
        
        this.stickyNotes.push(stickyNote);
        this.redraw();
    }

    handleSelection(pos) {
        // Check if clicking on an existing element
        let clickedElement = null;
        
        // Check text elements
        for (let i = this.textElements.length - 1; i >= 0; i--) {
            const element = this.textElements[i];
            if (this.isPointInText(pos, element)) {
                clickedElement = { type: 'text', element: element, index: i };
                break;
            }
        }
        
        // Check sticky notes
        if (!clickedElement) {
            for (let i = this.stickyNotes.length - 1; i >= 0; i--) {
                const element = this.stickyNotes[i];
                if (this.isPointInSticky(pos, element)) {
                    clickedElement = { type: 'sticky', element: element, index: i };
                    break;
                }
            }
        }
        
        this.selectedElement = clickedElement;
        this.redraw();
    }

    isPointInText(pos, textElement) {
        // Simple bounding box check for text
        const textWidth = this.ctx.measureText(textElement.text).width;
        const textHeight = textElement.fontSize;
        
        return pos.x >= textElement.x && 
               pos.x <= textElement.x + textWidth &&
               pos.y >= textElement.y - textHeight && 
               pos.y <= textElement.y;
    }

    isPointInSticky(pos, stickyNote) {
        return pos.x >= stickyNote.x && 
               pos.x <= stickyNote.x + stickyNote.width &&
               pos.y >= stickyNote.y && 
               pos.y <= stickyNote.y + stickyNote.height;
    }

    moveSelectedElement(pos) {
        if (this.selectedElement) {
            const deltaX = pos.x - this.lastX;
            const deltaY = pos.y - this.lastY;
            
            this.selectedElement.element.x += deltaX;
            this.selectedElement.element.y += deltaY;
            
            this.redraw();
        }
    }

    pan(pos) {
        const deltaX = pos.x - this.lastX;
        const deltaY = pos.y - this.lastY;
        
        this.panX += deltaX;
        this.panY += deltaY;
        
        this.updateCanvasTransform();
    }

    zoomIn() {
        this.zoom = Math.min(this.zoom * 1.2, 5);
        this.updateCanvasTransform();
        this.updateZoomDisplay();
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom / 1.2, 0.1);
        this.updateCanvasTransform();
        this.updateZoomDisplay();
    }

    resetZoom() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateCanvasTransform();
        this.updateZoomDisplay();
    }

    updateCanvasTransform() {
        this.canvas.style.transform = `scale(${this.zoom}) translate(${this.panX}px, ${this.panY}px)`;
    }

    updateZoomDisplay() {
        document.getElementById('zoomLevel').textContent = `${Math.round(this.zoom * 100)}%`;
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw text elements
        this.textElements.forEach(element => {
            this.drawTextElement(element);
        });
        
        // Draw sticky notes
        this.stickyNotes.forEach(note => {
            this.drawStickyNote(note);
        });
        
        // Draw selection indicator
        if (this.selectedElement) {
            this.drawSelectionIndicator();
        }
    }

    drawTextElement(element) {
        this.ctx.save();
        this.ctx.fillStyle = element.color;
        this.ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        this.ctx.fillText(element.text, element.x, element.y);
        this.ctx.restore();
    }

    drawStickyNote(note) {
        this.ctx.save();
        
        // Draw sticky note background
        this.ctx.fillStyle = note.color;
        this.ctx.fillRect(note.x, note.y, note.width, note.height);
        
        // Draw border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(note.x, note.y, note.width, note.height);
        
        // Draw text
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        const lines = this.wrapText(note.text, note.width - 20);
        lines.forEach((line, index) => {
            this.ctx.fillText(line, note.x + 10, note.y + 25 + (index * 16));
        });
        
        this.ctx.restore();
    }

    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = this.ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    drawSelectionIndicator() {
        if (!this.selectedElement) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        const element = this.selectedElement.element;
        
        if (this.selectedElement.type === 'text') {
            const textWidth = this.ctx.measureText(element.text).width;
            const textHeight = element.fontSize;
            this.ctx.strokeRect(element.x - 2, element.y - textHeight - 2, textWidth + 4, textHeight + 4);
        } else if (this.selectedElement.type === 'sticky') {
            this.ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
        }
        
        this.ctx.restore();
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    saveState() {
        // Remove any states after current index (for redo functionality)
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add new state
        const state = {
            textElements: JSON.parse(JSON.stringify(this.textElements)),
            stickyNotes: JSON.parse(JSON.stringify(this.stickyNotes))
        };
        
        this.history.push(state);
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState();
        }
    }

    restoreState() {
        const state = this.history[this.historyIndex];
        this.textElements = JSON.parse(JSON.stringify(state.textElements));
        this.stickyNotes = JSON.parse(JSON.stringify(state.stickyNotes));
        this.selectedElement = null;
        this.redraw();
    }

    clear() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el tablero?')) {
            this.textElements = [];
            this.stickyNotes = [];
            this.selectedElement = null;
            this.redraw();
            this.saveState();
        }
    }

    save() {
        const data = {
            textElements: this.textElements,
            stickyNotes: this.stickyNotes,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `whiteboard-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    load() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.textElements = data.textElements || [];
                        this.stickyNotes = data.stickyNotes || [];
                        this.selectedElement = null;
                        this.redraw();
                        this.saveState();
                    } catch (error) {
                        alert('Error al cargar el archivo. Por favor, verifica que sea un archivo válido.');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    share() {
        const data = {
            textElements: this.textElements,
            stickyNotes: this.stickyNotes,
            timestamp: new Date().toISOString()
        };
        
        const encodedData = btoa(JSON.stringify(data));
        const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Whiteboard Compartido',
                text: 'Mira este tablero colaborativo',
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Enlace copiado al portapapeles');
            });
        }
    }
}

// Initialize whiteboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Whiteboard();
    
    // Check for shared data in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
        try {
            const data = JSON.parse(atob(sharedData));
            // This would need to be integrated with the whiteboard instance
            console.log('Shared data received:', data);
        } catch (error) {
            console.error('Error parsing shared data:', error);
        }
    }
});
