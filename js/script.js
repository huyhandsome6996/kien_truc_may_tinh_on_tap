// ============================================
// ÔN TẬP KTMT & BTMT - JAVASCRIPT
// ============================================

// ============ UTILITY FUNCTIONS ============

// Decimal to Binary
function decimalToBinary(num, bits = 8) {
    if (num >= 0) {
        return num.toString(2).padStart(bits, '0');
    }
    // Two's complement
    const positive = Math.abs(num);
    const binary = positive.toString(2).padStart(bits, '0');
    const inverted = binary.split('').map(b => b === '0' ? '1' : '0').join('');
    let result = '';
    let carry = 1;
    for (let i = inverted.length - 1; i >= 0; i--) {
        if (inverted[i] === '1' && carry === 1) {
            result = '0' + result;
        } else if (inverted[i] === '0' && carry === 1) {
            result = '1' + result;
            carry = 0;
        } else {
            result = inverted[i] + result;
        }
    }
    return result;
}

// Binary to Decimal (with sign support)
function binaryToDecimal(binary) {
    binary = binary.replace(/[^01]/g, '');
    if (!binary) return 0;
    
    // Treat as signed if first bit is 1 and length is 8/16/32
    if (binary.length === 8 || binary.length === 16 || binary.length === 32) {
        if (binary[0] === '1') {
            const inverted = binary.split('').map(b => b === '0' ? '1' : '0').join('');
            const positive = parseInt(inverted, 2) + 1;
            return -positive;
        }
    }
    return parseInt(binary, 2);
}

function decimalToHex(num) {
    return num.toString(16).toUpperCase();
}

function hexToDecimal(hex) {
    return parseInt(hex, 16) || 0;
}

function binaryToHex(binary) {
    binary = binary.replace(/[^01]/g, '');
    if (!binary) return '0';
    const decimal = parseInt(binary, 2);
    return decimal.toString(16).toUpperCase();
}

function hexToBinary(hex) {
    hex = hex.replace(/[^0-9A-Fa-f]/g, '');
    if (!hex) return '0';
    const decimal = parseInt(hex, 16);
    return decimal.toString(2);
}

// IEEE 754 Single Precision
function floatToIEEE754(num) {
    const sign = num < 0 ? '1' : '0';
    const absNum = Math.abs(num);
    
    if (absNum === 0) {
        return {
            sign: '0',
            exponent: '00000000',
            mantissa: '00000000000000000000000',
            full: '00000000000000000000000000000000'
        };
    }
    
    // Convert to binary
    let intPart = Math.floor(absNum);
    let fracPart = absNum - intPart;
    
    let intBinary = intPart.toString(2);
    let fracBinary = '';
    
    let maxIterations = 30;
    while (fracPart > 0 && maxIterations-- > 0) {
        fracPart *= 2;
        if (fracPart >= 1) {
            fracBinary += '1';
            fracPart -= 1;
        } else {
            fracBinary += '0';
        }
    }
    
    // Normalize
    let exponent, mantissa;
    
    if (intBinary.length > 0 && intBinary !== '0') {
        exponent = intBinary.length - 1;
        mantissa = intBinary.substring(1) + fracBinary;
    } else {
        // Number < 1, find first 1 in fractional part
        const firstOne = fracBinary.indexOf('1');
        if (firstOne === -1) {
            return {
                sign,
                exponent: '00000000',
                mantissa: '00000000000000000000000',
                full: sign + '00000000' + '00000000000000000000000'
            };
        }
        exponent = -(firstOne + 1);
        mantissa = fracBinary.substring(firstOne + 1);
    }
    
    // Bias = 127
    const biasedExponent = exponent + 127;
    
    if (biasedExponent <= 0) {
        // Denormalized number
        return {
            sign,
            exponent: '00000000',
            mantissa: mantissa.padEnd(23, '0').substring(0, 23),
            full: sign + '00000000' + mantissa.padEnd(23, '0').substring(0, 23)
        };
    }
    
    if (biasedExponent >= 255) {
        // Overflow - Infinity
        return {
            sign,
            exponent: '11111111',
            mantissa: '00000000000000000000000',
            full: sign + '11111111' + '00000000000000000000000'
        };
    }
    
    const expBinary = biasedExponent.toString(2).padStart(8, '0');
    const mantissaPadded = mantissa.padEnd(23, '0').substring(0, 23);
    
    return {
        sign,
        exponent: expBinary,
        mantissa: mantissaPadded,
        full: sign + expBinary + mantissaPadded
    };
}

// CRC Calculation
function calculateCRC(data, polynomial) {
    data = data.replace(/[^01]/g, '');
    polynomial = polynomial.replace(/[^01]/g, '');
    
    if (!data || !polynomial || polynomial.length < 2) return '';
    
    const polyLength = polynomial.length;
    let dividend = data + '0'.repeat(polyLength - 1);
    
    // XOR division
    while (dividend.length >= polyLength) {
        if (dividend[0] === '1') {
            let result = '';
            for (let i = 0; i < polyLength; i++) {
                result += (dividend[i] === polynomial[i]) ? '0' : '1';
            }
            dividend = result + dividend.substring(polyLength);
        } else {
            dividend = dividend.substring(1);
        }
    }
    
    return dividend.padStart(polyLength - 1, '0');
}

// Hamming Code
function calculateHamming(data) {
    data = data.replace(/[^01]/g, '');
    if (!data) return { code: '', m: 0, r: 0, n: 0 };
    
    const m = data.length;
    // Find r such that 2^r >= m + r + 1
    let r = 0;
    while (Math.pow(2, r) < m + r + 1) r++;
    
    const n = m + r;
    const hamming = new Array(n).fill('0');
    
    // Place data bits (skip positions that are powers of 2)
    let dataIndex = 0;
    for (let i = 1; i <= n; i++) {
        if ((i & (i - 1)) !== 0) { // Not a power of 2
            hamming[n - i] = data[dataIndex];
            dataIndex++;
        }
    }
    
    // Calculate parity bits
    for (let p = 0; p < r; p++) {
        const pos = Math.pow(2, p);
        let parity = 0;
        for (let i = 1; i <= n; i++) {
            if (i & pos) {
                parity ^= parseInt(hamming[n - i]);
            }
        }
        hamming[n - pos] = parity.toString();
    }
    
    return {
        code: hamming.join(''),
        m: m,
        r: r,
        n: n
    };
}

// Physical Address Calculation (8088)
function calculatePhysicalAddress(segment, offset) {
    const seg = parseInt(segment, 16) || 0;
    const off = parseInt(offset, 16) || 0;
    const physical = (seg * 16 + off) & 0xFFFFF;
    return physical.toString(16).toUpperCase().padStart(5, '0') + 'H';
}

// ============================================
// CALCULATOR UPDATES
// ============================================

// Number converter
function updateDecConversion() {
    const input = document.getElementById('decInput').value;
    const num = parseInt(input);
    
    if (isNaN(num)) {
        document.getElementById('decToBin8').textContent = '---';
        document.getElementById('decToBin16').textContent = '---';
        document.getElementById('decToHex').textContent = '---';
        return;
    }
    
    document.getElementById('decToBin8').textContent = decimalToBinary(num, 8);
    document.getElementById('decToBin16').textContent = decimalToBinary(num, 16);
    document.getElementById('decToHex').textContent = '0x' + decimalToHex(num);
}

function updateBinConversion() {
    const input = document.getElementById('binInput').value;
    const clean = input.replace(/[^01]/g, '');
    
    if (!clean) {
        document.getElementById('binToDec').textContent = '---';
        document.getElementById('binToHex').textContent = '---';
        return;
    }
    
    document.getElementById('binToDec').textContent = binaryToDecimal(clean);
    document.getElementById('binToHex').textContent = '0x' + binaryToHex(clean);
}

function updateHexConversion() {
    const input = document.getElementById('hexInput').value;
    const clean = input.replace(/[^0-9A-Fa-f]/g, '');
    
    if (!clean) {
        document.getElementById('hexToDec').textContent = '---';
        document.getElementById('hexToBin').textContent = '---';
        return;
    }
    
    document.getElementById('hexToDec').textContent = hexToDecimal(clean);
    document.getElementById('hexToBin').textContent = hexToBinary(clean);
}

// IEEE 754
function updateFloatConversion() {
    const input = document.getElementById('floatInput').value;
    const num = parseFloat(input);
    
    if (isNaN(num)) {
        document.getElementById('floatSign').textContent = '-';
        document.getElementById('floatExp').textContent = '--------';
        document.getElementById('floatMant').textContent = '-----------------------';
        document.getElementById('floatFull').textContent = '--------------------------------';
        return;
    }
    
    const result = floatToIEEE754(num);
    document.getElementById('floatSign').textContent = result.sign;
    document.getElementById('floatExp').textContent = result.exponent;
    document.getElementById('floatMant').textContent = result.mantissa;
    document.getElementById('floatFull').textContent = result.full;
}

// CRC
function updateCRC() {
    const data = document.getElementById('crcData').value;
    const poly = document.getElementById('crcPoly').value;
    
    const crc = calculateCRC(data, poly);
    const cleanData = data.replace(/[^01]/g, '');
    
    document.getElementById('crcResult').textContent = crc;
    document.getElementById('crcTransmit').textContent = cleanData + crc;
}

// Hamming
function updateHamming() {
    const data = document.getElementById('hammingInput').value;
    const result = calculateHamming(data);
    
    document.getElementById('hammingResult').textContent = result.code || '---';
    document.getElementById('hammingM').textContent = result.m;
    document.getElementById('hammingR').textContent = result.r;
    document.getElementById('hammingN').textContent = result.n;
}

// Physical Address
function updatePhysicalAddress() {
    const seg = document.getElementById('segInput').value;
    const off = document.getElementById('offInput').value;
    
    document.getElementById('physAddr').textContent = calculatePhysicalAddress(seg, off);
}

// PSU Calculator
function updatePSU() {
    const cpuTdp = parseInt(document.getElementById('cpuTdp').value) || 0;
    const gpuTdp = parseInt(document.getElementById('gpuTdp').value) || 0;
    const otherTdp = parseInt(document.getElementById('otherTdp').value) || 0;
    const buffer = parseFloat(document.getElementById('psuBuffer').value) || 1.5;
    
    const total = cpuTdp + gpuTdp + otherTdp;
    const recommended = Math.ceil(total * buffer / 50) * 50;
    
    document.getElementById('totalPower').textContent = total;
    document.getElementById('psuRecommend').textContent = recommended;
}

// ============================================
// UI INTERACTIONS
// ============================================

// Tab switching
function setupTabs() {
    const tabButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.subject-section');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update sections
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`${tab}-section`).classList.add('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// Chapter toggle
function toggleChapter(header) {
    const chapter = header.parentElement;
    chapter.classList.toggle('expanded');
    header.classList.toggle('expanded');
}

// Mobile menu
function setupMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav-tabs');
    
    if (btn && nav) {
        btn.addEventListener('click', () => {
            nav.classList.toggle('mobile-visible');
        });
    }
}

// Quick nav scroll
function setupQuickNav() {
    document.querySelectorAll('.quick-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                // Auto-expand chapter
                if (!target.classList.contains('expanded')) {
                    target.classList.add('expanded');
                    target.querySelector('.chapter-header').classList.add('expanded');
                }
                
                // Scroll to chapter
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
}

// Back to top
function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Setup all input listeners
function setupCalculators() {
    // Number converters
    document.getElementById('decInput').addEventListener('input', updateDecConversion);
    document.getElementById('binInput').addEventListener('input', updateBinConversion);
    document.getElementById('hexInput').addEventListener('input', updateHexConversion);
    
    // IEEE 754
    document.getElementById('floatInput').addEventListener('input', updateFloatConversion);
    
    // CRC
    document.getElementById('crcData').addEventListener('input', updateCRC);
    document.getElementById('crcPoly').addEventListener('input', updateCRC);
    
    // Hamming
    document.getElementById('hammingInput').addEventListener('input', updateHamming);
    
    // Physical Address
    document.getElementById('segInput').addEventListener('input', updatePhysicalAddress);
    document.getElementById('offInput').addEventListener('input', updatePhysicalAddress);
    
    // PSU Calculator
    document.getElementById('cpuTdp').addEventListener('input', updatePSU);
    document.getElementById('gpuTdp').addEventListener('input', updatePSU);
    document.getElementById('otherTdp').addEventListener('input', updatePSU);
    document.getElementById('psuBuffer').addEventListener('input', updatePSU);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupMobileMenu();
    setupQuickNav();
    setupBackToTop();
    setupCalculators();
    setupSidebar();
    
    // Initial calculations
    updateDecConversion();
    updateBinConversion();
    updateHexConversion();
    updateFloatConversion();
    updateCRC();
    updateHamming();
    updatePhysicalAddress();
    updatePSU();
    
    // Auto-expand first chapter of each section
    const firstKtmtChapter = document.querySelector('#ktmt-section .chapter');
    if (firstKtmtChapter) {
        firstKtmtChapter.classList.add('expanded');
        firstKtmtChapter.querySelector('.chapter-header').classList.add('expanded');
    }
    
    console.log('✅ Ôn Tập KTMT & BTMT loaded successfully!');
});

// Make toggleChapter globally accessible
window.toggleChapter = toggleChapter;

// ============================================
// SIDEBAR
// ============================================

// Toggle collapse subject (KTMT / BTMT) trong sidebar
function toggleSbSubject(btn) {
    const subject = btn.closest('.sb-subject');
    if (subject) {
        subject.classList.toggle('collapsed');
    }
}
window.toggleSbSubject = toggleSbSubject;

// Setup sidebar interactions
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarClose');
    const mobileBtn = document.getElementById('mobileSidebarBtn');
    const toggleBtn = document.getElementById('sidebarToggle');
    const wrapper = document.querySelector('.layout-wrapper');
    const search = document.getElementById('sidebarSearch');

    // ----- Desktop: ẩn/hiện sidebar -----
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            wrapper.classList.toggle('sidebar-collapsed');
            // Đổi icon
            const svg = toggleBtn.querySelector('svg');
            if (wrapper.classList.contains('sidebar-collapsed')) {
                svg.innerHTML = '<polyline points="9 18 15 12 9 6"/>';
            } else {
                svg.innerHTML = '<polyline points="15 18 9 12 15 6"/>';
            }
        });
    }

    // ----- Mobile: mở sidebar dạng drawer -----
    function openMobileSidebar() {
        sidebar.classList.add('show');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    function closeMobileSidebar() {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
    if (mobileBtn) mobileBtn.addEventListener('click', openMobileSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileSidebar);
    if (overlay) overlay.addEventListener('click', closeMobileSidebar);

    // Đóng sidebar mobile khi bấm ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('show')) {
            closeMobileSidebar();
        }
    });

    // ----- Click vào link trong sidebar -----
    const sbLinks = document.querySelectorAll('.sb-tree a');
    sbLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || '';
            if (!href.startsWith('#')) return;

            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            if (!target) return;

            e.preventDefault();

            // Nếu là chương/chapter, expand nó ra
            const chapter = target.closest('.chapter');
            if (chapter && !chapter.classList.contains('expanded')) {
                chapter.classList.add('expanded');
                const header = chapter.querySelector('.chapter-header');
                if (header) header.classList.add('expanded');
            }

            // Đợi DOM update rồi scroll
            setTimeout(() => {
                const headerHeight = 80; // tương đương scroll-padding-top
                const rect = target.getBoundingClientRect();
                const top = window.scrollY + rect.top - headerHeight - 8;
                window.scrollTo({ top, behavior: 'smooth' });
            }, 80);

            // Flash hiệu ứng vàng nhạt
            sbLinks.forEach(l => l.classList.remove('flash'));
            link.classList.add('flash');
            setTimeout(() => link.classList.remove('flash'), 1300);

            // Đóng sidebar mobile
            if (window.innerWidth <= 992) {
                closeMobileSidebar();
            }

            // Cập nhật active ngay
            sbLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // ----- Highlight mục đang xem khi scroll -----
    const sectionIds = Array.from(sbLinks).map(l => l.getAttribute('href').substring(1));
    let ticking = false;

    function updateActiveOnScroll() {
        const headerOffset = 100;
        const scrollPos = window.scrollY + headerOffset + 20;

        let activeId = null;
        for (let id of sectionIds) {
            const el = document.getElementById(id);
            if (!el) continue;
            // Bỏ qua nếu section (chapter) chưa expand
            const chapter = el.closest('.chapter');
            if (chapter && !chapter.classList.contains('expanded')) continue;

            if (el.offsetTop <= scrollPos) {
                activeId = id;
            } else {
                break;
            }
        }

        if (activeId) {
            sbLinks.forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === '#' + activeId);
            });

            // Scroll sidebar để theo dõi mục active (chỉ khi không đang focus search)
            if (document.activeElement !== search) {
                const activeLink = document.querySelector('.sb-tree a.active');
                if (activeLink) {
                    const linkTop = activeLink.offsetTop;
                    const linkHeight = activeLink.offsetHeight;
                    const nav = document.getElementById('sidebarNav');
                    const navVisibleHeight = nav.clientHeight;
                    const currentScroll = nav.scrollTop;

                    if (linkTop < currentScroll || linkTop + linkHeight > currentScroll + navVisibleHeight) {
                        nav.scrollTo({
                            top: linkTop - navVisibleHeight / 2 + linkHeight / 2,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateActiveOnScroll);
            ticking = true;
        }
    }, { passive: true });

    // ----- Search trong sidebar -----
    if (search) {
        search.addEventListener('input', () => {
            const q = search.value.toLowerCase().trim();

            document.querySelectorAll('.sb-subject').forEach(subject => {
                let anyMatch = false;
                const chapters = subject.querySelectorAll('.sb-tree > li');

                chapters.forEach(chap => {
                    // Hỗ trợ cả .sb-chapter (cũ) và .sb-topic (mới)
                    const chapLink = chap.querySelector('.sb-topic') || chap.querySelector('.sb-chapter');
                    const subLinks = chap.querySelectorAll('ul li a');

                    const chapText = chapLink ? chapLink.textContent.toLowerCase() : '';
                    const chapMatch = chapText.includes(q);

                    let anySubMatch = false;
                    subLinks.forEach(s => {
                        const t = s.textContent.toLowerCase();
                        const match = t.includes(q) || chapMatch;
                        s.classList.toggle('hidden-by-search', !match);
                        if (match) anySubMatch = true;
                    });

                    // Ẩn cả chương nếu không có match
                    chap.style.display = (anySubMatch || chapMatch) ? '' : 'none';
                    if (anySubMatch || chapMatch) anyMatch = true;
                });

                // Mở rộng subject nếu có match, thu gọn nếu rỗng search
                if (q) {
                    subject.classList.remove('collapsed');
                    subject.style.display = anyMatch ? '' : 'none';
                } else {
                    subject.style.display = '';
                }
            });
        });
    }

    // ----- Khi đổi tab KTMT/BTMT, tự scroll subject tương ứng trong sidebar -----
    const tabButtons = document.querySelectorAll('.nav-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab; // 'ktmt' hoặc 'btmt'
            // Mở rộng subject tương ứng, thu gọn subject kia
            document.querySelectorAll('.sb-subject').forEach(sub => {
                if (sub.dataset.subject === tab) {
                    sub.classList.remove('collapsed');
                    // Scroll sidebar tới subject đó
                    setTimeout(() => {
                        const titleBtn = sub.querySelector('.sb-subject-title');
                        if (titleBtn) {
                            titleBtn.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 150);
                } else {
                    sub.classList.add('collapsed');
                }
            });
        });
    });

    // ----- Khởi tạo: mở rộng KTMT, thu gọn BTMT -----
    const ktmtSub = document.querySelector('.sb-subject[data-subject="ktmt"]');
    const btmtSub = document.querySelector('.sb-subject[data-subject="btmt"]');
    if (ktmtSub) ktmtSub.classList.remove('collapsed');
    if (btmtSub) btmtSub.classList.add('collapsed');

    // Tính active ban đầu
    setTimeout(updateActiveOnScroll, 200);
}
