const initialStates = { 
    m00: 26, m01: 11, m02: 1,  
    m10: 3,  m11: 7,  m12: 1,  
    m20: 1,  m21: 2,  m22: 3   
};

let matrix = { ...initialStates };
let isPresentationMode = false;
let currentShap = 1;
let currentFig = 1;
const totalFigs = 4;
let sectionsList = [];

function computeMetrics3x3(m) {
    const correct = m.m00 + m.m11 + m.m22;
    const total = 55; 
    const acc = correct / total;

    const tp0 = m.m00, fp0 = m.m10 + m.m20, fn0 = m.m01 + m.m02;
    const p0 = tp0 / (tp0 + fp0) || 0;
    const r0 = tp0 / (tp0 + fn0) || 0;
    const f1_0 = (p0 + r0 > 0) ? 2 * p0 * r0 / (p0 + r0) : 0;

    const tp1 = m.m11, fp1 = m.m01 + m.m21, fn1 = m.m10 + m.m12;
    const p1 = tp1 / (tp1 + fp1) || 0;
    const r1 = tp1 / (tp1 + fn1) || 0;
    const f1_1 = (p1 + r1 > 0) ? 2 * p1 * r1 / (p1 + r1) : 0;

    const tp2 = m.m22, fp2 = m.m02 + m.m12, fn2 = m.m20 + m.m21;
    const p2 = tp2 / (tp2 + fp2) || 0;
    const r2 = tp2 / (tp2 + fn2) || 0;
    const f1_2 = (p2 + r2 > 0) ? 2 * p2 * r2 / (p2 + r2) : 0;

    return { accuracy: acc * 100, f1Macro: (f1_0 + f1_1 + f1_2) / 3 };
}

const BASE_METRICS = computeMetrics3x3(initialStates);

function calculateMetrics() {
    const currentMetrics = computeMetrics3x3(matrix);
    const f1Element = document.getElementById('live-f1');
    
    document.getElementById('live-acc').innerText = currentMetrics.accuracy.toFixed(1) + '%';
    f1Element.innerText = currentMetrics.f1Macro.toFixed(2);
    
    if (currentMetrics.f1Macro > BASE_METRICS.f1Macro) {
        f1Element.style.color = 'var(--safe)';
    } else if (currentMetrics.f1Macro < BASE_METRICS.f1Macro) {
        f1Element.style.color = 'var(--danger)';
    } else {
        f1Element.style.color = 'var(--accent)';
    }
}

function updateMatrixUI() {
    if (!document.getElementById('val-m00')) return;
    
    Object.keys(matrix).forEach(key => {
        const el = document.getElementById(`val-${key}`);
        if (el) el.innerText = matrix[key];
    });

    calculateMetrics();
}

function shiftValue(fromKey, toKey) {
    if (matrix[fromKey] > 0) {
        matrix[fromKey]--;
        matrix[toKey]++;
        updateMatrixUI();
    }
}

function resetSimulation() {
    matrix = { ...initialStates };
    updateMatrixUI();
}

function changeShap(direction) {
    const img1 = document.getElementById('shap-img-1');
    const img2 = document.getElementById('shap-img-2');
    const dot1 = document.getElementById('shap-dot-1');
    const dot2 = document.getElementById('shap-dot-2');
    const badge = document.getElementById('shap-badge');

    if (!img1 || !img2 || !badge) return;

    currentShap = currentShap + direction;
    if (currentShap > 2) currentShap = 1;
    if (currentShap < 1) currentShap = 2;

    const isFase1 = currentShap === 1;

    img1.style.display = isFase1 ? 'block' : 'none';
    img2.style.display = isFase1 ? 'none' : 'block';
    dot1.style.opacity = isFase1 ? '1' : '0.3';
    dot2.style.opacity = isFase1 ? '0.3' : '1';

    badge.innerText = isFase1 ? 'FASE 1: PRESENCIA' : 'FASE 2: PELIGROSIDAD';
    badge.style.color = isFase1 ? 'var(--accent)' : 'var(--danger)';
    badge.style.borderColor = isFase1 ? 'var(--accent)' : 'var(--danger)';
    badge.style.background = isFase1 ? 'var(--accent-bg)' : 'var(--danger-bg)';
}

function toggleFigureUI(activeNum) {
    const slides = document.querySelectorAll('.figure-slide');
    const dots = document.querySelectorAll('.fig-dot');
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    const nextSlide = document.getElementById(`fig-slide-${activeNum}`);
    const nextDot = document.getElementById(`fig-dot-${activeNum}`);

    if (nextSlide) nextSlide.classList.add('active');
    if (nextDot) nextDot.classList.add('active');
}

function changeFigure(direction) {
    currentFig += direction;
    if (currentFig > totalFigs) currentFig = 1;
    if (currentFig < 1) currentFig = totalFigs;
    toggleFigureUI(currentFig);
}

function setFigure(num) {
    currentFig = num;
    toggleFigureUI(currentFig);
}

function toggleElementFullscreen(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (!document.fullscreenElement) {
        if (element.requestFullscreen) element.requestFullscreen();
        else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
        else if (element.msRequestFullscreen) element.msRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}

function openModal(modalType) {
    document.querySelectorAll('.modal-content').forEach(el => el.style.display = 'none');
    
    const targetModal = document.getElementById(`modal-${modalType}`);
    const modalOverlay = document.getElementById('technical-modal');
    
    if (targetModal && modalOverlay) {
        targetModal.style.display = 'block';
        modalOverlay.classList.add('active');
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('technical-modal');
    if (modalOverlay) modalOverlay.classList.remove('active');
}

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (!toggleBtn) return;
    
    const icon = toggleBtn.querySelector('i');
    const savedTheme = localStorage.getItem('presentation-theme');

    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    toggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('presentation-theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('presentation-theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });
}

function initPresentationToggle() {
    const toggleBtn = document.getElementById('presentation-toggle-btn');
    if (!toggleBtn) return;
    
    const icon = toggleBtn.querySelector('i');
    sectionsList = Array.from(document.querySelectorAll('section'));

    toggleBtn.addEventListener('click', () => {
        isPresentationMode = !isPresentationMode;
        
        if (isPresentationMode) {
            document.documentElement.classList.add('presentation-mode');
            icon.classList.replace('fa-book-open', 'fa-desktop');
            toggleBtn.classList.add('active');
            toggleBtn.setAttribute('title', 'Volver a Modo Lectura');
        } else {
            document.documentElement.classList.remove('presentation-mode');
            icon.classList.replace('fa-desktop', 'fa-book-open');
            toggleBtn.classList.remove('active');
            toggleBtn.setAttribute('title', 'Activar Modo Presentación');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initPresentationToggle();
    updateMatrixUI();

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.dot').forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.getAttribute('href') === `#${entry.target.id}`) {
                        dot.classList.add('active');
                    }
                });
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.5 });

    document.querySelectorAll('section').forEach(section => {
        sectionObserver.observe(section);
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        return;
    }

    if (e.key === 'ArrowRight') {
        changeShap(1);
        changeFigure(1);
        return;
    }
    
    if (e.key === 'ArrowLeft') {
        changeShap(-1);
        changeFigure(-1);
        return;
    }

    if (!isPresentationMode) return;
        
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        
        let currentIdx = sectionsList.findIndex(sec => {
            const rect = sec.getBoundingClientRect();
            return rect.top >= -50 && rect.top <= window.innerHeight / 2;
        });
        
        if (currentIdx === -1) currentIdx = 0;

        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            if (currentIdx < sectionsList.length - 1) {
                sectionsList[currentIdx + 1].scrollIntoView({ behavior: 'smooth' });
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            if (currentIdx > 0) {
                sectionsList[currentIdx - 1].scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
});