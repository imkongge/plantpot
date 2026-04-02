// ===== Configuration =====
// 替换为你的 Google Apps Script Web 应用 URL
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzEtfrXb6LQCCj5gwD2xdH_Uhg5pjBb3bsjYmruz4t9lG6ezSKnS8WkhoaNEl3dpOZ4/exec';

// ===== Global State =====
const state = {
    title: "Mom's Garden",
    subtitle: "Love grows here",
    flowers: [],
    nextId: 1,
    nextZIndex: 10,
    draggedElement: null
};

// ===== Month Flower Graphics =====
const monthFlowers = {
    1: { name: 'January', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174612/f4e843f012d17dfb9cf93a05aa93da5d.png" style="width:100%;height:100%;object-fit:contain;">' },
    2: { name: 'February', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174611/5cc3c59f4bdc849f1410707e735a296a.png" style="width:100%;height:100%;object-fit:contain;">' },
    3: { name: 'March', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174613/3a2e6551bd819826c60b4a330ab55ef2.png" style="width:100%;height:100%;object-fit:contain;">' },
    4: { name: 'April', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174609/1a8b0d4f73c83415debbbc092550064e.png" style="width:100%;height:100%;object-fit:contain;">' },
    5: { name: 'May', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174614/f0c65ad7cf4a6aa787fc7bd307e59421.png" style="width:100%;height:100%;object-fit:contain;">' },
    6: { name: 'June', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174613/f94cd9dd8ac327361e2d382d98c97b01.png" style="width:100%;height:100%;object-fit:contain;">' },
    7: { name: 'July', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174612/a2465c8af9f27e345be6f200ff544c13.png" style="width:100%;height:100%;object-fit:contain;">' },
    8: { name: 'August', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174610/6ade02fb84f0c246406bcafd851b8572.png" style="width:100%;height:100%;object-fit:contain;">' },
    9: { name: 'September', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174615/0ee4a9446e25f1bdf3cdf69ca25ce40d.png" style="width:100%;height:100%;object-fit:contain;">' },
    10: { name: 'October', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174615/13812b0abc95f7cecfd9983b1cf0bc73.png" style="width:100%;height:100%;object-fit:contain;">' },
    11: { name: 'November', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174615/ebab94519d292edb5b0e026e6ad83f45.png" style="width:100%;height:100%;object-fit:contain;">' },
    12: { name: 'December', svg: '<img src="https://wxalbum-10001658-file.dianxiaomi.com/wxalbum/1424970/20260330174610/72e7c8b31c3d9aa44dec527a345e1ae2.png" style="width:100%;height:100%;object-fit:contain;">' }
};


// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    initGlobalInputs();
    initAddFlowerButton();
    initCopyButton();
    initSubmitButton();
    initDragAndDrop();
    initInteract();
    updateUI();
});



// ===== Initialize Global Inputs =====
function initGlobalInputs() {
    const titleInput = document.getElementById('titleInput');
    const subtitleInput = document.getElementById('subtitleInput');
    
    titleInput.addEventListener('input', (e) => {
        state.title = e.target.value;
        document.querySelector('#titleElement .element-text').textContent = state.title;
        updateTextSummary();
    });
    
    subtitleInput.addEventListener('input', (e) => {
        state.subtitle = e.target.value;
        document.querySelector('#subtitleElement .element-text').textContent = state.subtitle;
        updateTextSummary();
    });
}


// ===== Initialize Add Flower Button =====
function initAddFlowerButton() {
    const addBtn = document.getElementById('addFlowerBtn');
    addBtn.addEventListener('click', () => {
        addFlower();
    });
}

// ===== Add New Flower =====
function addFlower() {
    const id = state.nextId++;
    
    // Get current center offset from existing flowers
    let centerOffsetX = 0;
    let centerOffsetY = 0;
    if (state.flowers.length > 0) {
        const avgX = state.flowers.reduce((sum, f) => sum + f.x, 0) / state.flowers.length;
        const avgY = state.flowers.reduce((sum, f) => sum + f.y, 0) / state.flowers.length;
        centerOffsetX = avgX - 50;
        centerOffsetY = avgY - 50;
    }
    
    // Add flower to state first to get total count
    const newFlower = {
        id,
        month: Math.floor(Math.random() * 12) + 1,
        name: '',
        x: 50,
        y: 50,
        zIndex: state.nextZIndex++
    };
    
    state.flowers.push(newFlower);
    
    // Recalculate all positions centered, then apply current offset
    recalculateFlowerPositions();
    
    // Apply the current group offset if flowers were moved
    if (centerOffsetX !== 0 || centerOffsetY !== 0) {
        state.flowers.forEach(flower => {
            flower.x = Math.max(5, Math.min(95, flower.x + centerOffsetX));
            flower.y = Math.max(5, Math.min(95, flower.y + centerOffsetY));
            const el = document.getElementById(`canvasFlower-${flower.id}`);
            if (el) {
                el.style.left = `${flower.x}%`;
                el.style.top = `${flower.y}%`;
            }
        });
    }
    
    renderFlowerCard(newFlower);
    renderCanvasFlower(newFlower);
    updateFlowerCount();
    updateTextSummary();
    updateWarnings();
    initInteract();
}

// ===== Render Flower Card in Control Panel =====
function renderFlowerCard(flower) {
    const container = document.getElementById('flowerCards');
    const card = document.createElement('div');
    card.className = 'flower-card';
    card.id = `flowerCard-${flower.id}`;
    card.innerHTML = `
        <div class="flower-card-header">
            <span class="flower-card-title">Flower #${flower.id}</span>
            <button class="flower-card-delete" onclick="deleteFlower(${flower.id})">×</button>
        </div>
        <div class="flower-card-content">
            <div class="month-selector">
                <button class="month-selector-btn" onclick="openMonthPicker(${flower.id})">
                    <div class="month-preview" id="monthPreview-${flower.id}">
                        ${monthFlowers[flower.month].svg}
                    </div>
                    <span class="month-label" id="monthLabel-${flower.id}">${getMonthName(flower.month)}</span>
                    <span class="month-arrow">›</span>
                </button>
            </div>
            <div class="name-input-wrapper">
                <input type="text" class="name-input" id="nameInput-${flower.id}" 
                       placeholder="Enter name" maxlength="20" value="${flower.name}"
                       oninput="updateFlowerName(${flower.id}, this.value)">
                <span class="name-warning ${flower.name.length > 9 ? '' : 'hidden'}">⚠️</span>
            </div>
        </div>
    `;
    container.appendChild(card);
}

// ===== Get Month Name (English) =====
function getMonthName(month) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[month - 1];
}

// ===== Get Full Month Name =====
function getFullMonthName(month) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month - 1];
}

// ===== Update Flower Name =====
function updateFlowerName(id, name) {
    const flower = state.flowers.find(f => f.id === id);
    if (flower) {
        flower.name = name;
        const nameEl = document.querySelector(`#canvasFlower-${id} .flower-name`);
        if (nameEl) {
            nameEl.textContent = name;
            nameEl.title = name;
        }
        
        // Show/hide name warning
        const warning = document.querySelector(`#flowerCard-${id} .name-warning`);
        if (warning) {
            warning.classList.toggle('hidden', name.length <= 9);
        }
        
        updateTextSummary();
    }
}

// ===== Delete Flower =====
function deleteFlower(id) {
    state.flowers = state.flowers.filter(f => f.id !== id);
    
    // Remove card
    const card = document.getElementById(`flowerCard-${id}`);
    if (card) card.remove();
    
    // Remove canvas element
    const canvasEl = document.getElementById(`canvasFlower-${id}`);
    if (canvasEl) canvasEl.remove();
    
    // Recalculate positions for remaining flowers
    recalculateFlowerPositions();
    
    updateFlowerCount();
    updateTextSummary();
    updateWarnings();
    updateCardTitles();
}

// ===== Recalculate Flower Positions =====
function recalculateFlowerPositions() {
    const flowerCount = state.flowers.length;
    if (flowerCount === 0) return;
    
    const maxPerRow = 6; // Maximum flowers per row
    const flowerWidth = 14; // % width of each flower element
    const minSpacingX = 2; // minimum horizontal gap between flowers
    const totalWidth = 80; // use 80% of safe area width
    const rowSpacing = 25; // vertical spacing between rows (25% = no overlap)
    
    // Calculate how many rows we need
    const numRows = Math.ceil(flowerCount / maxPerRow);
    
    // Calculate optimal horizontal spacing
    let spacingX = totalWidth / (Math.min(flowerCount, maxPerRow) + 1);
    spacingX = Math.max(spacingX, flowerWidth + minSpacingX);
    
    // Calculate base Y position
    // 1 row: center at 50%
    // 2+ rows: distribute with tighter spacing
    const getRowY = (rowIndex, totalRows) => {
        if (totalRows === 1) {
            return 50; // Single row centered
        }
        // Two rows: 30% (upper) and 60% (lower) - 30% spacing
        if (totalRows === 2) {
            return rowIndex === 0 ? 30 : 60;
        }
        // More rows: distribute evenly within safe area
        const startY = 20;
        const endY = 80;
        const spacing = (endY - startY) / (totalRows - 1);
        return startY + rowIndex * spacing;
    };
    
    state.flowers.forEach((flower, index) => {
        // Determine row and column
        const row = Math.floor(index / maxPerRow);
        const col = index % maxPerRow;
        
        // Get Y position based on row
        const yPos = getRowY(row, numRows);
        
        // Calculate position
        // Center horizontally within each row
        const rowFlowerCount = Math.min(maxPerRow, flowerCount - row * maxPerRow);
        const rowCenterOffset = (rowFlowerCount - 1) / 2;
        
        const offsetX = col - rowCenterOffset;
        
        flower.x = 50 + offsetX * spacingX;
        flower.y = yPos;
        
        const el = document.getElementById(`canvasFlower-${flower.id}`);
        if (el) {
            el.style.left = `${flower.x}%`;
            el.style.top = `${flower.y}%`;
        }
    });
}

// ===== Update Card Titles =====
function updateCardTitles() {
    const cards = document.querySelectorAll('.flower-card');
    cards.forEach((card, index) => {
        const title = card.querySelector('.flower-card-title');
        if (title) {
            title.textContent = `Flower #${index + 1}`;
        }
    });
}

// ===== Render Canvas Flower =====
function renderCanvasFlower(flower) {
    const container = document.getElementById('canvasElements');
    const el = document.createElement('div');
    el.className = 'canvas-element flower-element draggable-flower';
    el.id = `canvasFlower-${flower.id}`;
    el.dataset.flowerId = flower.id;
    el.style.left = `${flower.x}%`;
    el.style.top = `${flower.y}%`;
    el.style.zIndex = flower.zIndex;
    el.innerHTML = `
        <div class="flower-visual">${monthFlowers[flower.month].svg}</div>
        <span class="flower-name">${flower.name}</span>
    `;
    container.appendChild(el);
}

// ===== Update Flower Positions (on size change) =====
function updateFlowerPositions() {
    state.flowers.forEach(flower => {
        const el = document.getElementById(`canvasFlower-${flower.id}`);
        if (el) {
            el.style.left = `${flower.x}%`;
            el.style.top = `${flower.y}%`;
        }
    });
}

// ===== Update Flower Count =====
function updateFlowerCount() {
    document.getElementById('flowerCount').textContent = state.flowers.length;
}

// ===== Update Warnings =====
function updateWarnings() {
    const crowdedWarning = document.getElementById('crowdedWarning');
    crowdedWarning.classList.toggle('hidden', state.flowers.length <= 15);
}

// ===== Month Picker =====
let currentPickerFlowerId = null;

function openMonthPicker(flowerId) {
    currentPickerFlowerId = flowerId;
    const modal = document.getElementById('monthPickerModal');
    const swatches = modal.querySelector('.month-swatches');
    
    swatches.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
        const flower = state.flowers.find(f => f.id === flowerId);
        const isSelected = flower && flower.month === i;
        
        const swatch = document.createElement('div');
        swatch.className = `month-swatch ${isSelected ? 'selected' : ''}`;
        swatch.innerHTML = `
            <div class="month-swatch-icon">${monthFlowers[i].svg}</div>
            <span class="month-swatch-label">${getMonthName(i)}</span>
        `;
        swatch.addEventListener('click', () => selectMonth(i));
        swatches.appendChild(swatch);
    }
    
    modal.classList.remove('hidden');
}

function selectMonth(month) {
    if (currentPickerFlowerId) {
        const flower = state.flowers.find(f => f.id === currentPickerFlowerId);
        if (flower) {
            flower.month = month;
            
            // Update preview
            const preview = document.getElementById(`monthPreview-${flower.id}`);
            if (preview) {
                preview.innerHTML = monthFlowers[month].svg;
            }
            
            // Update label
            const label = document.getElementById(`monthLabel-${flower.id}`);
            if (label) {
                label.textContent = `${getMonthName(month)} - ${monthFlowers[month].name}`;
            }
            
            // Update canvas element
            const canvasEl = document.getElementById(`canvasFlower-${flower.id}`);
            if (canvasEl) {
                const visual = canvasEl.querySelector('.flower-visual');
                if (visual) {
                    visual.innerHTML = monthFlowers[month].svg;
                }
            }
            
            updateTextSummary();
        }
    }
    closeMonthPicker();
}

function closeMonthPicker() {
    document.getElementById('monthPickerModal').classList.add('hidden');
    currentPickerFlowerId = null;
}

// ===== Update Text Summary =====
function updateTextSummary() {
    const summaryFlowers = document.getElementById('summaryFlowers');
    const summary = document.getElementById('textSummary');
    
    let html = `<div class="summary-item">Title: ${state.title}</div>`;
    html += `<div class="summary-item">Subtitle: ${state.subtitle}</div>`;
    html += `<div class="summary-divider"></div>`;
    
    if (state.flowers.length === 0) {
        html += '<div class="summary-item">(No flowers added)</div>';
    } else {
        html += '<div class="summary-flowers">';
        state.flowers.forEach(flower => {
            const monthName = getMonthName(flower.month);
            const name = flower.name || '(No name)';
            html += `<div class="summary-flower-item">${monthName} -- ${name}</div>`;
        });
        html += '</div>';
    }
    
    summary.innerHTML = html;
}

// ===== Initialize Copy Button =====
function initCopyButton() {
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.addEventListener('click', () => {
        const text = generateSummaryText();
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.querySelector('span:last-child').textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.querySelector('span:last-child').textContent = 'Copy Summary';
            }, 2000);
        });
    });
}

// ===== Generate Summary Text =====
function generateSummaryText() {
    let text = `Title: ${state.title}\n`;
    text += `Subtitle: ${state.subtitle}\n`;
    text += `Flowers:\n`;
    
    if (state.flowers.length === 0) {
        text += '(No flowers added)\n';
    } else {
        state.flowers.forEach(flower => {
            const monthName = getMonthName(flower.month);
            const name = flower.name || '(No name)';
            text += `${monthName} -- ${name}\n`;
        });
    }
    
    return text;
}

// ===== Initialize Submit Button =====
function initSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', handleSubmit);
}

// ===== Handle Submit =====
async function handleSubmit() {
    const orderId = document.getElementById('orderId').value.trim();
    
    if (!orderId) {
        alert('Please enter your order number or email');
        return;
    }
    
    // Show loading
    const loading = document.getElementById('loadingOverlay');
    loading.classList.remove('hidden');
    
    try {
        // Temporarily adjust safe-area for screenshot
        const safeArea = document.getElementById('safeArea');
        const originalTransform = safeArea.style.transform;
        const originalLeft = safeArea.style.left;

        safeArea.style.transform = 'none';
        safeArea.style.left = '0';

        // Wait for layout update
        await new Promise(resolve => setTimeout(resolve, 50));

        // Generate canvas screenshot
        const canvas = await html2canvas(safeArea, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false
        });

        // Restore original styles
        safeArea.style.transform = originalTransform;
        safeArea.style.left = originalLeft;

        const imageBase64 = canvas.toDataURL('image/png');
        
        // Prepare layout data
        const layoutData = {
            global_text: {
                title: { text: state.title, x: '50%', y: '8%' },
                subtitle: { text: state.subtitle, x: '50%', y: '88%' }
            },
            flowers: state.flowers.map(f => ({
                id: `uuid-${f.id}`,
                month: f.month,
                name: f.name,
                x: `${f.x}%`,
                y: `${f.y}%`,
                z_index: f.zIndex
            }))
        };
        
        // Prepare payload
        const payload = {
            order_id: orderId,
            text_summary: generateSummaryText(),
            image_base64: imageBase64,
            layout_data: layoutData
        };
        
        // Send to Google Apps Script
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        // Note: Google Apps Script 部署为 Web 应用时会自动处理 CORS
        
        // Hide loading and show success
        loading.classList.add('hidden');
        document.getElementById('successModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Submit error:', error);
        loading.classList.add('hidden');
        alert('Submission failed. Please try again.');
    }
}

// ===== Close Success Modal =====
function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
    document.getElementById('orderId').value = '';
}

// ===== Initialize Drag and Drop =====
function initDragAndDrop() {
    // Text elements
    const titleEl = document.getElementById('titleElement');
    const subtitleEl = document.getElementById('subtitleElement');
    
    [titleEl, subtitleEl].forEach(el => {
        el.addEventListener('mousedown', bringToFront);
        el.addEventListener('touchstart', bringToFront);
    });
    
    // Flower elements - bring to front on pointer down (before drag)
    document.querySelectorAll('.draggable-flower').forEach(el => {
        el.addEventListener('pointerdown', function(e) {
            this.style.zIndex = ++state.nextZIndex;
        });
    });
}

function bringToFront(e) {
    const el = e.currentTarget;
    el.style.zIndex = ++state.nextZIndex;
}

// ===== Initialize Interact.js =====
function initInteract() {
    if (typeof interact === 'undefined') return;
    
    const safeArea = document.getElementById('safeArea');
    const rect = safeArea.getBoundingClientRect();
    
    // Make text elements draggable
    interact('.draggable-text').draggable({
        modifiers: [
            interact.modifiers.restrict({
                restriction: safeArea,
                endOnly: true,
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            })
        ],
        listeners: {
            start(event) {
                event.target.style.zIndex = ++state.nextZIndex;
                event.target.classList.add('dragging');
            },
            move(event) {
                const target = event.target;
                const x = parseFloat(target.style.left) || 50;
                const y = parseFloat(target.style.top) || 50;
                
                // Calculate new position based on drag delta
                const deltaX = event.dx / rect.width * 100;
                const deltaY = event.dy / rect.height * 100;
                
                let newX = x + deltaX;
                let newY = y + deltaY;
                
                // Clamp to safe area
                newX = Math.max(5, Math.min(95, newX));
                newY = Math.max(5, Math.min(95, newY));
                
                target.style.left = `${newX}%`;
                target.style.top = `${newY}%`;
                target.style.transform = 'translate(-50%, -50%)';
            },
            end(event) {
                event.target.classList.remove('dragging');
            }
        }
    });
    
    // Make flower elements draggable
    interact('.draggable-flower').draggable({
        modifiers: [
            interact.modifiers.restrict({
                restriction: safeArea,
                endOnly: true,
                elementRect: { top: 0, left: 0, bottom: 0, right: 0 }
            })
        ],
        listeners: {
            start(event) {
                // Immediately bring to front on drag start
                event.target.style.zIndex = ++state.nextZIndex;
                event.target.classList.add('dragging');
            },
            move(event) {
                const target = event.target;
                const flowerId = parseInt(target.dataset.flowerId);
                const flower = state.flowers.find(f => f.id === flowerId);
                
                if (!flower) return;
                
                // Calculate new position based on drag delta
                const deltaX = event.dx / rect.width * 100;
                const deltaY = event.dy / rect.height * 100;
                
                let newX = flower.x + deltaX;
                let newY = flower.y + deltaY;
                
                // Clamp to safe area
                newX = Math.max(5, Math.min(95, newX));
                newY = Math.max(5, Math.min(95, newY));
                
                flower.x = newX;
                flower.y = newY;
                
                target.style.left = `${newX}%`;
                target.style.top = `${newY}%`;
            },
            end(event) {
                event.target.classList.remove('dragging');
            }
        }
    });
}

// ===== Update UI =====
function updateUI() {
    updateFlowerCount();
    updateTextSummary();
    updateWarnings();
}
