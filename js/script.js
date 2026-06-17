// ============================================
// ÔN TẬP KTMT & BTMT - JAVASCRIPT
// ============================================

// ============ UTILITY FUNCTIONS ============

// Decimal to Binary (with optional two's complement for negative numbers)
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

// Binary to Decimal (with sign support for 8/16/32-bit)
function binaryToDecimal(binary) {
    binary = binary.replace(/[^01]/g, '');
    if (!binary) return 0;
    
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

// Count bits '1' in a string
function countOnes(str) {
    return (str.match(/1/g) || []).length;
}

// XOR two binary strings of equal length
function xorBinary(a, b) {
    let r = '';
    for (let i = 0; i < a.length; i++) {
        r += (a[i] === b[i]) ? '0' : '1';
    }
    return r;
}

// ============ TWOS COMPLEMENT WITH STEPS ============
function twosComplementWithSteps(decimalStr, bits = 8) {
    const num = parseInt(decimalStr);
    if (isNaN(num)) return null;
    
    const isNegative = num < 0;
    const positive = Math.abs(num);
    const bin = positive.toString(2).padStart(bits, '0');
    
    if (!isNegative) {
        return {
            original: decimalStr,
            bits: bits,
            binPositive: bin,
            bin1: null,
            bin2: null,
            result: bin,
            isNegative: false
        };
    }
    
    // Step 1: positive binary
    // Step 2: invert (bù 1)
    const bin1 = bin.split('').map(b => b === '0' ? '1' : '0').join('');
    // Step 3: +1 (bù 2)
    let carry = 1;
    let bin2 = '';
    for (let i = bin1.length - 1; i >= 0; i--) {
        if (bin1[i] === '1' && carry === 1) { bin2 = '0' + bin2; }
        else if (bin1[i] === '0' && carry === 1) { bin2 = '1' + bin2; carry = 0; }
        else { bin2 = bin1[i] + bin2; }
    }
    
    return {
        original: decimalStr,
        bits: bits,
        binPositive: bin,
        bin1: bin1,
        bin2: bin2,
        result: bin2,
        isNegative: true,
        originalNum: num
    };
}

// ============ IEEE 754 Single Precision WITH STEPS ============
function floatToIEEE754WithSteps(numStr) {
    const num = parseFloat(numStr);
    if (isNaN(num)) return null;
    
    const steps = [];
    
    if (num === 0) {
        return {
            sign: '0', exponent: '00000000', mantissa: '0'.repeat(23),
            full: '0'.repeat(32), steps: ['Số 0 → biểu diễn đặc biệt: tất cả bit = 0']
        };
    }
    
    const sign = num < 0 ? 1 : 0;
    const absNum = Math.abs(num);
    
    // STEP 1: Convert to binary
    let intPart = Math.floor(absNum);
    let fracPart = absNum - intPart;
    
    let intBinary = intPart.toString(2);
    let fracBinary = '';
    let maxIter = 30;
    while (fracPart > 0 && maxIter-- > 0) {
        fracPart *= 2;
        if (fracPart >= 1) { fracBinary += '1'; fracPart -= 1; }
        else { fracBinary += '0'; }
    }
    
    const fullBinary = intBinary + '.' + fracBinary;
    steps.push(`B1: Tách phần nguyên và phần lẻ rồi đổi sang nhị phân: ${absNum} = ${intBinary}.${fracBinary || '0'}₂`);
    
    // STEP 2: Normalize
    let exponent, mantissa;
    if (intBinary.length > 0 && intBinary !== '0') {
        exponent = intBinary.length - 1;
        mantissa = intBinary.substring(1) + fracBinary;
        steps.push(`B2: Chuẩn hóa về dạng 1.xxx × 2^k: ${intBinary}.${fracBinary || '0'}₂ = 1.${(intBinary.substring(1) + fracBinary)}₂ × 2^${exponent}`);
    } else {
        const firstOne = fracBinary.indexOf('1');
        if (firstOne === -1) {
            return { sign: sign.toString(), exponent: '00000000', mantissa: '0'.repeat(23), full: sign + '0'.repeat(31), steps: steps };
        }
        exponent = -(firstOne + 1);
        mantissa = fracBinary.substring(firstOne + 1);
        steps.push(`B2: Chuẩn hóa (số < 1): 0.${fracBinary}₂ = 1.${mantissa}₂ × 2^${exponent}`);
    }
    
    // STEP 3: Compute biased exponent E = k + 127
    const biasedExp = exponent + 127;
    const expBinary = biasedExp.toString(2).padStart(8, '0');
    steps.push(`B3: Tính E = k + B = ${exponent} + 127 = ${biasedExp} = ${expBinary}₂ (8 bit)`);
    
    // STEP 4: Mantissa (23 bit)
    const mantissaPadded = mantissa.padEnd(23, '0').substring(0, 23);
    steps.push(`B4: Lấy F = phần sau dấu chấm của 1.F = ${mantissaPadded} (23 bit, thêm 0 nếu thiếu)`);
    
    // STEP 5: Sign
    steps.push(`B5: S = ${sign} (số ${sign === 1 ? 'âm' : 'dương'})`);
    
    // Final
    const full = sign + expBinary + mantissaPadded;
    steps.push(`B6: Ghép S | E | F = ${sign} | ${expBinary} | ${mantissaPadded} = ${full}`);
    
    return {
        sign: sign.toString(),
        exponent: expBinary,
        mantissa: mantissaPadded,
        full: full,
        steps: steps,
        binaryForm: fullBinary,
        exponent: expBinary,
        biasedExp: biasedExp
    };
}

// ============ CRC WITH FULL STEPS ============
function calculateCRCWithSteps(dataStr, polyStr) {
    const data = dataStr.replace(/[^01]/g, '');
    const poly = polyStr.replace(/[^01]/g, '');
    
    if (!data || !poly || poly.length < 2) return null;
    
    const steps = [];
    const n = poly.length - 1; // degree of polynomial
    
    // STEP 1
    const padded = data + '0'.repeat(n);
    steps.push({ label: `B1`, text: `Thêm ${n} bit 0 vào sau dữ liệu m=${data.length} bit:`, value: `${data} → ${padded}` });
    
    // STEP 2 - division
    steps.push({ label: `B2`, text: `Chia N(x) cho G(x) theo XOR (chú ý: XOR từng bit, không phải phép trừ thường):`, value: '' });
    
    let dividend = padded.slice();
    const divisionSteps = [];
    let iter = 0;
    while (dividend.length >= poly.length) {
        iter++;
        if (dividend[0] === '1') {
            const before = dividend.substring(0, poly.length);
            const after = xorBinary(before, poly);
            divisionSteps.push({
                iter: iter,
                operation: `${before} XOR ${poly}`,
                result: after,
                remainder: dividend.substring(poly.length)
            });
            dividend = after + dividend.substring(poly.length);
        } else {
            divisionSteps.push({
                iter: iter,
                operation: `${dividend.substring(0, poly.length)} (bit đầu = 0, kéo xuống)`,
                result: dividend.substring(0, poly.length),
                remainder: dividend.substring(poly.length)
            });
            dividend = dividend.substring(1);
        }
    }
    
    const crc = dividend.padStart(n, '0');
    const transmit = data + crc;
    
    return {
        data: data,
        poly: poly,
        n: n,
        padded: padded,
        crc: crc,
        transmit: transmit,
        steps: steps,
        divisionSteps: divisionSteps
    };
}

// ============ HAMMING CODE WITH FULL STEPS ============
function calculateHammingWithSteps(dataStr) {
    const data = dataStr.replace(/[^01]/g, '');
    if (!data) return null;
    
    const m = data.length;
    let r = 0;
    while (Math.pow(2, r) < m + r + 1) r++;
    const n = m + r;
    
    const steps = [];
    steps.push(`B1: m = ${m} bit dữ liệu. Tìm r sao cho 2^r ≥ m + r + 1 → r = ${r}. Tổng n = m + r = ${n} bit.`);
    
    // Build positions
    const hamming = new Array(n + 1).fill('_'); // 1-indexed
    const dataBitNames = [];
    
    // Place data bits at non-power-of-2 positions
    let di = 0;
    for (let i = 1; i <= n; i++) {
        if ((i & (i - 1)) !== 0) { // not power of 2
            hamming[i] = data[di];
            dataBitNames.push({ name: `i${di + 1}`, pos: i, value: data[di] });
            di++;
        }
    }
    steps.push(`B2: Đặt bit dữ liệu vào các vị trí KHÔNG phải lũy thừa 2. Bit kiểm tra sẽ vào vị trí 1, 2, 4, 8, ... (lũy thừa 2).`);
    
    // Calculate parity bits
    const parityInfo = [];
    for (let p = 0; p < r; p++) {
        const pos = Math.pow(2, p);
        let parity = 0;
        const involvedBits = [];
        for (let i = 1; i <= n; i++) {
            if (i & pos) {
                if (i !== pos) {
                    involvedBits.push(`vị trí ${i}=${hamming[i]}`);
                    parity ^= parseInt(hamming[i]);
                }
            }
        }
        hamming[pos] = parity.toString();
        parityInfo.push({
            name: `C${p + 1}`,
            pos: pos,
            involvedBits: involvedBits,
            parity: parity.toString()
        });
        steps.push(`B3.${p + 1}: Tính C${p + 1} tại vị trí ${pos}: XOR của các vị trí có bit ${pos} = ${1 << p} → ${involvedBits.join(', ')} → C${p + 1} = ${parity}`);
    }
    
    // Build final string (MSB first = position n)
    let result = '';
    for (let i = n; i >= 1; i--) {
        result += hamming[i];
    }
    
    steps.push(`B4: Ghép các bit từ vị trí ${n} đến vị trí 1 (đọc từ trái sang phải): kết quả = ${result}`);
    
    return {
        data: data,
        m: m, r: r, n: n,
        hamming: hamming,
        result: result,
        parityInfo: parityInfo,
        dataBitNames: dataBitNames,
        steps: steps
    };
}

// ============ HAMMING ERROR CORRECTION WITH STEPS ============
function hammingErrorCorrectWithSteps(receivedStr) {
    const received = receivedStr.replace(/[^01]/g, '');
    if (!received) return null;
    
    const n = received.length;
    // find r
    let r = 0;
    while (Math.pow(2, r) < n + 1) r++;
    r--; // because n = m + r, not n + r + 1
    
    const steps = [];
    steps.push(`B1: Mã nhận được có ${n} bit → r = ${r} bit kiểm tra tại các vị trí 1, 2, 4, 8, ...`);
    
    // Reverse string for 1-indexed access
    const receivedArr = received.split('').reverse();
    receivedArr.unshift('_'); // 1-indexed
    
    let syndrome = '';
    const syndromeArr = [];
    
    for (let p = 0; p < r; p++) {
        const pos = Math.pow(2, p);
        let parity = 0;
        const involved = [];
        for (let i = 1; i <= n; i++) {
            if (i & pos) {
                involved.push(`bit${i}=${receivedArr[i]}`);
                parity ^= parseInt(receivedArr[i]);
            }
        }
        syndromeArr.push({ pos: pos, parity: parity, involved: involved });
        syndrome = parity.toString() + syndrome;
        steps.push(`B2.${p + 1}: Tính lại C${p + 1} (vị trí ${pos}) = XOR ${involved.join(', ')} = ${parity}`);
    }
    
    const errorPos = parseInt(syndrome, 2);
    steps.push(`B3: Syndrome = ${syndrome}₂ = ${errorPos}₁₀`);
    
    let corrected = receivedArr.slice();
    let isError = false;
    if (errorPos !== 0 && errorPos <= n) {
        isError = true;
        corrected[errorPos] = corrected[errorPos] === '0' ? '1' : '0';
        steps.push(`B4: Có lỗi tại vị trí ${errorPos}! Đảo bit ${corrected[errorPos] === '0' ? '1→0' : '0→1'}`);
    } else {
        steps.push(`B4: Syndrome = 0 → không có lỗi`);
    }
    
    let correctedStr = '';
    for (let i = n; i >= 1; i--) correctedStr += corrected[i];
    
    return {
        received: received,
        syndrome: syndrome,
        errorPos: errorPos,
        isError: isError,
        corrected: correctedStr,
        syndromeArr: syndromeArr,
        steps: steps
    };
}

// ============ PHYSICAL ADDRESS 8088 WITH STEPS ============
function physicalAddressWithSteps(segStr, offStr) {
    const seg = parseInt(segStr, 16);
    const off = parseInt(offStr, 16);
    if (isNaN(seg) || isNaN(off)) return null;
    
    const segShifted = (seg * 16) & 0xFFFFF;
    const physical = (seg * 16 + off) & 0xFFFFF;
    
    return {
        seg: segStr.toUpperCase(),
        off: offStr.toUpperCase(),
        segShifted: segShifted.toString(16).toUpperCase().padStart(5, '0') + 'H',
        physical: physical.toString(16).toUpperCase().padStart(5, '0') + 'H',
        steps: [
            `B1: Lấy Segment = ${segStr.toUpperCase()}H, nhân với 16 (≈ dịch trái 4 bit = thêm 1 chữ số 0 hexa).`,
            `B2: Segment × 16 = ${segStr.toUpperCase()}H × 10H = ${segShifted.toString(16).toUpperCase().padStart(5, '0')}H.`,
            `B3: Cộng Offset ${offStr.toUpperCase()}H: ${segShifted.toString(16).toUpperCase().padStart(5, '0')}H + ${offStr.toUpperCase()}H.`,
            `B4: Địa chỉ vật lý = ${physical.toString(16).toUpperCase().padStart(5, '0')}H (chỉ lấy 20 bit thấp nhất).`
        ]
    };
}

// ============ CRC WITHOUT STEPS (legacy) ============
function calculateCRC(data, polynomial) {
    data = data.replace(/[^01]/g, '');
    polynomial = polynomial.replace(/[^01]/g, '');
    if (!data || !polynomial || polynomial.length < 2) return '';
    const polyLength = polynomial.length;
    let dividend = data + '0'.repeat(polyLength - 1);
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

// ============ HAMMING WITHOUT STEPS (legacy) ============
function calculateHamming(data) {
    data = data.replace(/[^01]/g, '');
    if (!data) return { code: '', m: 0, r: 0, n: 0 };
    const m = data.length;
    let r = 0;
    while (Math.pow(2, r) < m + r + 1) r++;
    const n = m + r;
    const hamming = new Array(n).fill('0');
    let dataIndex = 0;
    for (let i = 1; i <= n; i++) {
        if ((i & (i - 1)) !== 0) {
            hamming[n - i] = data[dataIndex];
            dataIndex++;
        }
    }
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
    return { code: hamming.join(''), m: m, r: r, n: n };
}

function calculatePhysicalAddress(segment, offset) {
    const seg = parseInt(segment, 16) || 0;
    const off = parseInt(offset, 16) || 0;
    const physical = (seg * 16 + off) & 0xFFFFF;
    return physical.toString(16).toUpperCase().padStart(5, '0') + 'H';
}

// ============================================
// CALCULATOR UPDATES - LEGACY (Basic display)
// ============================================

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

// ============================================
// ENHANCED INTERACTIVE CALCULATORS
// ============================================

// === Twos Complement Visualizer ===
function updateTwosComplementViz() {
    const inputEl = document.getElementById('twosInput');
    const bitsEl = document.getElementById('twosBits');
    if (!inputEl || !bitsEl) return;
    
    const input = inputEl.value;
    const bits = parseInt(bitsEl.value) || 8;
    const result = twosComplementWithSteps(input, bits);
    
    const vizEl = document.getElementById('twosViz');
    const stepsEl = document.getElementById('twosSteps');
    if (!result) {
        vizEl.innerHTML = '<p style="color:#64748b;text-align:center;">Nhập một số nguyên để xem chi tiết</p>';
        stepsEl.innerHTML = '';
        return;
    }
    
    // Visualize
    let html = '';
    if (result.isNegative) {
        html += `<div class="bit-stage">
            <div class="bit-stage-label">Số dương |${result.originalNum}| = ${result.originalNum}</div>
            <div class="bit-row">${formatBits(result.binPositive, bits, 'green')}</div>
        </div>`;
        html += `<div class="bit-arrow">↓ Đảo tất cả bit (0→1, 1→0) → Bù 1</div>`;
        html += `<div class="bit-stage">
            <div class="bit-stage-label">Bù 1</div>
            <div class="bit-row">${formatBits(result.bin1, bits, 'orange')}</div>
        </div>`;
        html += `<div class="bit-arrow">↓ Cộng thêm 1 → Bù 2</div>`;
        html += `<div class="bit-stage">
            <div class="bit-stage-label">Bù 2 = biểu diễn số ${result.originalNum} trong máy</div>
            <div class="bit-row">${formatBits(result.bin2, bits, 'red')}</div>
        </div>`;
    } else {
        html += `<div class="bit-stage">
            <div class="bit-stage-label">Số dương → biểu diễn trực tiếp</div>
            <div class="bit-row">${formatBits(result.binPositive, bits, 'green')}</div>
        </div>`;
    }
    vizEl.innerHTML = html;
    
    // Steps
    let stepsHtml = '<ol class="step-list">';
    if (result.isNegative) {
        stepsHtml += `<li>Lấy giá trị tuyệt đối: ${result.originalNum}</li>`;
        stepsHtml += `<li>Đổi sang nhị phân ${bits} bit: ${result.binPositive}</li>`;
        stepsHtml += `<li><strong>Bù 1:</strong> Đảo bit (0→1, 1→0): ${result.bin1}</li>`;
        stepsHtml += `<li><strong>Bù 2:</strong> Cộng 1 vào bù 1: ${result.bin2}</li>`;
        stepsHtml += `<li>Kết quả: số ${result.original} được biểu diễn = <code>${result.bin2}</code></li>`;
    } else {
        stepsHtml += `<li>Số ${result.original} là số dương → biểu diễn trực tiếp.</li>`;
        stepsHtml += `<li>Đổi sang nhị phân ${bits} bit: <code>${result.binPositive}</code></li>`;
    }
    stepsHtml += '</ol>';
    stepsEl.innerHTML = stepsHtml;
}

// Helper: format bits with position labels
function formatBits(binStr, bits, color) {
    let html = '<div class="bit-group">';
    for (let i = 0; i < binStr.length; i++) {
        const pos = binStr.length - i;
        const isSign = (i === 0 && binStr[0] === '1');
        html += `<div class="bit-cell bit-${color} ${isSign ? 'bit-sign' : ''}">
            <div class="bit-value">${binStr[i]}</div>
            <div class="bit-pos">${pos-1}</div>
        </div>`;
    }
    html += '</div>';
    return html;
}

// === IEEE 754 Visualizer ===
function updateIEEE754Viz() {
    const inputEl = document.getElementById('floatInput');
    if (!inputEl) return;
    
    const result = floatToIEEE754WithSteps(inputEl.value);
    
    // Update basic display (legacy elements)
    if (document.getElementById('floatSign')) {
        if (!result) {
            document.getElementById('floatSign').textContent = '-';
            document.getElementById('floatExp').textContent = '--------';
            document.getElementById('floatMant').textContent = '-----------------------';
            document.getElementById('floatFull').textContent = '--------------------------------';
        } else {
            document.getElementById('floatSign').textContent = result.sign;
            document.getElementById('floatExp').textContent = result.exponent;
            document.getElementById('floatMant').textContent = result.mantissa;
            document.getElementById('floatFull').textContent = result.full;
        }
    }
    
    // Update visualizer
    const vizEl = document.getElementById('ieeeViz');
    const stepsEl = document.getElementById('ieeeSteps');
    if (!vizEl) return;
    
    if (!result) {
        vizEl.innerHTML = '<p style="color:#64748b;text-align:center;">Nhập một số thực để xem chi tiết</p>';
        if (stepsEl) stepsEl.innerHTML = '';
        return;
    }
    
    // Visual: 32 boxes
    let html = '<div class="ieee-bit-container">';
    html += '<div class="ieee-bit-section ieee-sign">';
    html += `<div class="ieee-section-label">Sign (1 bit)</div>`;
    html += `<div class="bit-cell bit-${result.sign === '1' ? 'red' : 'green'}"><div class="bit-value">${result.sign}</div><div class="bit-pos">31</div></div>`;
    html += `<div class="ieee-section-meaning">${result.sign === '1' ? 'số âm' : 'số dương'}</div>`;
    html += '</div>';
    
    html += '<div class="ieee-bit-section ieee-exp">';
    html += `<div class="ieee-section-label">Exponent (8 bit)</div>`;
    html += '<div class="bit-group">';
    for (let i = 0; i < 8; i++) {
        html += `<div class="bit-cell bit-orange"><div class="bit-value">${result.exponent[i]}</div><div class="bit-pos">${30-i}</div></div>`;
    }
    html += '</div>';
    html += `<div class="ieee-section-meaning">E = ${parseInt(result.exponent, 2)} = ${result.biasedExp || parseInt(result.exponent, 2)}</div>`;
    html += '</div>';
    
    html += '<div class="ieee-bit-section ieee-mant">';
    html += `<div class="ieee-section-label">Mantissa / Fraction (23 bit)</div>`;
    html += '<div class="bit-group">';
    for (let i = 0; i < 23; i++) {
        html += `<div class="bit-cell bit-blue"><div class="bit-value">${result.mantissa[i]}</div><div class="bit-pos">${22-i}</div></div>`;
    }
    html += '</div>';
    html += `<div class="ieee-section-meaning">1.${result.mantissa} (đọc là 1.F)</div>`;
    html += '</div>';
    html += '</div>';
    
    vizEl.innerHTML = html;
    
    // Steps
    if (stepsEl && result.steps) {
        stepsEl.innerHTML = '<ol class="step-list">' + result.steps.map(s => `<li>${s}</li>`).join('') + '</ol>';
    }
}

// === CRC Visualizer ===
function updateCRCViz() {
    const dataEl = document.getElementById('crcData');
    const polyEl = document.getElementById('crcPoly');
    if (!dataEl || !polyEl) return;
    
    const result = calculateCRCWithSteps(dataEl.value, polyEl.value);
    
    // Legacy
    if (document.getElementById('crcResult')) {
        if (!result) {
            document.getElementById('crcResult').textContent = '---';
            document.getElementById('crcTransmit').textContent = '---';
        } else {
            document.getElementById('crcResult').textContent = result.crc;
            document.getElementById('crcTransmit').textContent = result.transmit;
        }
    }
    
    const vizEl = document.getElementById('crcViz');
    const stepsEl = document.getElementById('crcSteps');
    if (!vizEl) return;
    
    if (!result) {
        vizEl.innerHTML = '<p style="color:#64748b;text-align:center;">Nhập dữ liệu và đa thức G(x) để xem chi tiết</p>';
        if (stepsEl) stepsEl.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Step 1 visualization: append zeros
    html += `<div class="crc-stage">
        <div class="crc-stage-label">Dữ liệu gốc (m = ${result.data.length} bit):</div>
        <div class="bit-group">`;
    for (let i = 0; i < result.data.length; i++) {
        html += `<div class="bit-cell bit-blue"><div class="bit-value">${result.data[i]}</div></div>`;
    }
    html += '</div></div>';
    
    html += `<div class="crc-stage">
        <div class="crc-stage-label">Đa thức sinh G(x) (bậc ${result.n}, ${result.poly.length} bit):</div>
        <div class="bit-group">`;
    for (let i = 0; i < result.poly.length; i++) {
        html += `<div class="bit-cell bit-orange"><div class="bit-value">${result.poly[i]}</div></div>`;
    }
    html += '</div></div>';
    
    html += `<div class="crc-stage">
        <div class="crc-stage-label">Thêm ${result.n} bit 0 → N(x) = ${result.padded}</div>
        <div class="bit-group">`;
    for (let i = 0; i < result.padded.length; i++) {
        const isOriginal = i < result.data.length;
        html += `<div class="bit-cell ${isOriginal ? 'bit-blue' : 'bit-gray'}"><div class="bit-value">${result.padded[i]}</div></div>`;
    }
    html += '</div></div>';
    
    // Division steps
    html += '<div class="crc-stage">';
    html += `<div class="crc-stage-label">Phép chia XOR (mỗi bước: nếu bit đầu = 1 thì XOR với G(x), nếu = 0 thì bỏ qua):</div>`;
    html += '<div class="crc-division-log">';
    result.divisionSteps.slice(0, 12).forEach(d => {
        html += `<div class="crc-div-row">
            <span class="crc-div-iter">#${d.iter}</span>
            <code>${d.operation}</code>
            ${d.result ? `<span class="crc-div-arrow">=</span><code class="crc-div-result">${d.result}</code>` : ''}
        </div>`;
    });
    if (result.divisionSteps.length > 12) {
        html += `<div class="crc-div-row"><em>... (còn ${result.divisionSteps.length - 12} bước nữa)</em></div>`;
    }
    html += '</div></div>';
    
    // Final result
    html += `<div class="crc-stage crc-result">
        <div class="crc-stage-label">CRC (phần dư, ${result.n} bit):</div>
        <div class="bit-group">`;
    for (let i = 0; i < result.crc.length; i++) {
        html += `<div class="bit-cell bit-red"><div class="bit-value">${result.crc[i]}</div></div>`;
    }
    html += '</div></div>';
    
    html += `<div class="crc-stage crc-transmit">
        <div class="crc-stage-label">Dữ liệu truyền đi = DATA + CRC:</div>
        <div class="bit-group">`;
    for (let i = 0; i < result.transmit.length; i++) {
        const isData = i < result.data.length;
        html += `<div class="bit-cell ${isData ? 'bit-blue' : 'bit-red'}"><div class="bit-value">${result.transmit[i]}</div></div>`;
    }
    html += '</div></div>';
    
    vizEl.innerHTML = html;
    
    // Steps
    if (stepsEl) {
        let stepsHtml = '<ol class="step-list">';
        stepsHtml += `<li>Dữ liệu gốc m = ${result.data.length} bit: <code>${result.data}</code></li>`;
        stepsHtml += `<li>Đa thức G(x) = ${result.poly} (bậc ${result.n})</li>`;
        stepsHtml += `<li>Thêm ${result.n} bit 0: N(x) = <code>${result.padded}</code></li>`;
        stepsHtml += `<li>Chia N(x) cho G(x) bằng XOR (chia modulo 2): kết quả nhận được phần dư ${result.n} bit</li>`;
        stepsHtml += `<li>CRC = phần dư = <code>${result.crc}</code></li>`;
        stepsHtml += `<li>Dữ liệu truyền đi = DATA + CRC = <code>${result.transmit}</code></li>`;
        stepsHtml += '</ol>';
        stepsEl.innerHTML = stepsHtml;
    }
}

// === Hamming Visualizer ===
function updateHammingViz() {
    const inputEl = document.getElementById('hammingInput');
    if (!inputEl) return;
    
    const result = calculateHammingWithSteps(inputEl.value);
    
    // Legacy
    if (document.getElementById('hammingResult')) {
        if (!result) {
            document.getElementById('hammingResult').textContent = '---';
            document.getElementById('hammingM').textContent = '0';
            document.getElementById('hammingR').textContent = '0';
            document.getElementById('hammingN').textContent = '0';
        } else {
            document.getElementById('hammingResult').textContent = result.result;
            document.getElementById('hammingM').textContent = result.m;
            document.getElementById('hammingR').textContent = result.r;
            document.getElementById('hammingN').textContent = result.n;
        }
    }
    
    const vizEl = document.getElementById('hammingViz');
    const stepsEl = document.getElementById('hammingSteps');
    if (!vizEl) return;
    
    if (!result) {
        vizEl.innerHTML = '<p style="color:#64748b;text-align:center;">Nhập m bit dữ liệu (nhị phân) để xem chi tiết</p>';
        if (stepsEl) stepsEl.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Display the positions table
    html += `<div class="hamming-table-wrap">`;
    html += `<div class="hamming-info">m = ${result.m} (bit dữ liệu), r = ${result.r} (bit kiểm tra), n = ${result.n} (tổng bit)</div>`;
    html += '<div class="hamming-positions">';
    
    // Show positions from n down to 1 (MSB first)
    for (let pos = result.n; pos >= 1; pos--) {
        const isParity = (pos & (pos - 1)) === 0; // power of 2
        const value = result.hamming[pos];
        const colorClass = isParity ? 'bit-orange' : 'bit-blue';
        const label = isParity ? `C${Math.log2(pos) + 1}` : '';
        html += `<div class="hamming-cell ${colorClass} ${isParity ? 'hamming-parity' : 'hamming-data'}">
            <div class="hamming-label">${label}</div>
            <div class="bit-value">${value}</div>
            <div class="bit-pos">${pos}</div>
        </div>`;
    }
    html += '</div>';
    html += '<div class="hamming-legend">';
    html += '<span class="legend-item"><span class="legend-dot legend-data"></span>Bit dữ liệu (i)</span>';
    html += '<span class="legend-item"><span class="legend-dot legend-parity"></span>Bit kiểm tra (C) - tại vị trí lũy thừa 2</span>';
    html += '</div>';
    
    // Show parity calculations
    html += '<div class="hamming-parity-info">';
    html += '<h6>Chi tiết tính từng bit kiểm tra:</h6>';
    result.parityInfo.forEach(p => {
        html += `<div class="parity-row">
            <span class="parity-name">${p.name} (vị trí ${p.pos}):</span>
            <span class="parity-calc">XOR các vị trí có bit ${p.pos} trong biểu diễn nhị phân</span>
            <span class="parity-result">= ${p.parity}</span>
        </div>`;
    });
    html += '</div>';
    
    // Final result
    html += `<div class="hamming-final">
        <div class="hamming-final-label">MÃ HAMMING TRUYỀN ĐI (đọc từ vị trí ${result.n} → 1):</div>
        <div class="hamming-final-value">${result.result}</div>
    </div>`;
    
    html += '</div>';
    vizEl.innerHTML = html;
    
    if (stepsEl) {
        stepsEl.innerHTML = '<ol class="step-list">' + result.steps.map(s => `<li>${s}</li>`).join('') + '</ol>';
    }
}

// === Hamming Error Correction Visualizer ===
function updateHammingErrorViz() {
    const inputEl = document.getElementById('hammingErrorInput');
    if (!inputEl) return;
    
    const result = hammingErrorCorrectWithSteps(inputEl.value);
    const vizEl = document.getElementById('hammingErrorViz');
    const stepsEl = document.getElementById('hammingErrorSteps');
    
    if (!result) {
        if (vizEl) vizEl.innerHTML = '<p style="color:#64748b;text-align:center;">Nhập mã Hamming nhận được để kiểm tra lỗi</p>';
        if (stepsEl) stepsEl.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Display received bits
    html += '<div class="hamming-error-stage">';
    html += '<div class="crc-stage-label">Mã nhận được:</div>';
    html += '<div class="bit-group">';
    for (let i = 0; i < result.received.length; i++) {
        const pos = result.received.length - i;
        const isError = (pos === result.errorPos && result.isError);
        html += `<div class="bit-cell ${isError ? 'bit-red' : 'bit-blue'} ${isError ? 'bit-error' : ''}">
            <div class="bit-value">${result.received[i]}</div>
            <div class="bit-pos">${pos}${isError ? ' ← LỖI!' : ''}</div>
        </div>`;
    }
    html += '</div></div>';
    
    // Syndrome calculation
    html += '<div class="hamming-error-stage">';
    html += '<div class="crc-stage-label">Tính syndrome (XOR lại các bit kiểm tra):</div>';
    html += '<div class="syndrome-calc">';
    result.syndromeArr.forEach(s => {
        html += `<div class="syndrome-row">
            <span class="syndrome-name">C${Math.log2(s.pos) + 1} (vị trí ${s.pos}):</span>
            <code>${s.parity}</code>
        </div>`;
    });
    html += `<div class="syndrome-result">
        <span>Syndrome = ${result.syndrome.split('').reverse().join('')} (đọc từ C1→Cr) = ${result.syndrome}₂ = ${result.errorPos}₁₀</span>
    </div>`;
    html += '</div></div>';
    
    // Result
    if (result.isError) {
        html += `<div class="hamming-error-stage hamming-corrected">
            <div class="crc-stage-label">SỬA LỖI: đảo bit tại vị trí ${result.errorPos}</div>
            <div class="bit-group">`;
        for (let i = 0; i < result.corrected.length; i++) {
            const pos = result.corrected.length - i;
            const wasError = (pos === result.errorPos);
            html += `<div class="bit-cell ${wasError ? 'bit-green' : 'bit-blue'}">
                <div class="bit-value">${result.corrected[i]}</div>
                <div class="bit-pos">${pos}${wasError ? ' ← đã sửa' : ''}</div>
            </div>`;
        }
        html += '</div></div>';
    } else {
        html += '<div class="hamming-error-stage hamming-no-error"><div class="crc-stage-label">Syndrome = 0 → Không có lỗi!</div></div>';
    }
    
    vizEl.innerHTML = html;
    
    if (stepsEl) {
        stepsEl.innerHTML = '<ol class="step-list">' + result.steps.map(s => `<li>${s}</li>`).join('') + '</ol>';
    }
}

// === Physical Address Visualizer ===
function updatePhysicalAddressViz() {
    const segEl = document.getElementById('segInput');
    const offEl = document.getElementById('offInput');
    if (!segEl || !offEl) return;
    
    const result = physicalAddressWithSteps(segEl.value, offEl.value);
    
    // Legacy
    if (document.getElementById('physAddr')) {
        document.getElementById('physAddr').textContent = result ? result.physical : '---';
    }
    
    const vizEl = document.getElementById('physAddrViz');
    if (!vizEl) return;
    
    if (!result) {
        vizEl.innerHTML = '<p style="color:#64748b;text-align:center;">Nhập Segment và Offset (hexa) để xem chi tiết</p>';
        return;
    }
    
    let html = '';
    html += `<div class="phys-stage">
        <div class="phys-stage-label">Segment: ${result.seg}</div>
        <div class="phys-arrow">↓ × 16 (dịch trái 4 bit ≈ thêm 1 số 0 hexa)</div>
        <div class="phys-stage-label">Segment × 16: ${result.segShifted}</div>
        <div class="phys-arrow">↓ + Offset: ${result.off}</div>
        <div class="phys-stage-label phys-final">ĐỊA CHỈ VẬT LÝ: ${result.physical}</div>
    </div>`;
    
    vizEl.innerHTML = html;
}

// ============================================
// UI INTERACTIONS
// ============================================

function setupTabs() {
    const tabButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.subject-section');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`${tab}-section`).classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function toggleChapter(header) {
    const chapter = header.parentElement;
    chapter.classList.toggle('expanded');
    header.classList.toggle('expanded');
}

function setupMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav-tabs');
    if (btn && nav) {
        btn.addEventListener('click', () => {
            nav.classList.toggle('mobile-visible');
        });
    }
}

function setupQuickNav() {
    document.querySelectorAll('.quick-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                if (!target.classList.contains('expanded')) {
                    target.classList.add('expanded');
                    target.querySelector('.chapter-header').classList.add('expanded');
                }
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
}

function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) btn.classList.add('visible');
        else btn.classList.remove('visible');
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function setupCalculators() {
    // Number converters (legacy)
    const decInput = document.getElementById('decInput');
    const binInput = document.getElementById('binInput');
    const hexInput = document.getElementById('hexInput');
    if (decInput) decInput.addEventListener('input', updateDecConversion);
    if (binInput) binInput.addEventListener('input', updateBinConversion);
    if (hexInput) hexInput.addEventListener('input', updateHexConversion);
    
    // IEEE 754 (legacy + visualizer)
    const floatInput = document.getElementById('floatInput');
    if (floatInput) floatInput.addEventListener('input', updateIEEE754Viz);
    
    // CRC (legacy + visualizer)
    const crcData = document.getElementById('crcData');
    const crcPoly = document.getElementById('crcPoly');
    if (crcData) crcData.addEventListener('input', updateCRCViz);
    if (crcPoly) crcPoly.addEventListener('input', updateCRCViz);
    
    // Hamming (legacy + visualizer)
    const hammingInput = document.getElementById('hammingInput');
    if (hammingInput) hammingInput.addEventListener('input', updateHammingViz);
    
    // Hamming error correction (new)
    const hammingErrorInput = document.getElementById('hammingErrorInput');
    if (hammingErrorInput) hammingErrorInput.addEventListener('input', updateHammingErrorViz);
    
    // Two's complement (new)
    const twosInput = document.getElementById('twosInput');
    const twosBits = document.getElementById('twosBits');
    if (twosInput) twosInput.addEventListener('input', updateTwosComplementViz);
    if (twosBits) twosBits.addEventListener('change', updateTwosComplementViz);
    
    // Physical address (new)
    const segInput = document.getElementById('segInput');
    const offInput = document.getElementById('offInput');
    if (segInput) segInput.addEventListener('input', updatePhysicalAddressViz);
    if (offInput) offInput.addEventListener('input', updatePhysicalAddressViz);
    
    // PSU Calculator
    const cpuTdp = document.getElementById('cpuTdp');
    const gpuTdp = document.getElementById('gpuTdp');
    const otherTdp = document.getElementById('otherTdp');
    const psuBuffer = document.getElementById('psuBuffer');
    if (cpuTdp) cpuTdp.addEventListener('input', updatePSU);
    if (gpuTdp) gpuTdp.addEventListener('input', updatePSU);
    if (otherTdp) otherTdp.addEventListener('input', updatePSU);
    if (psuBuffer) psuBuffer.addEventListener('input', updatePSU);
}

// PSU Calculator
function updatePSU() {
    const cpuTdp = parseInt(document.getElementById('cpuTdp')?.value) || 0;
    const gpuTdp = parseInt(document.getElementById('gpuTdp')?.value) || 0;
    const otherTdp = parseInt(document.getElementById('otherTdp')?.value) || 0;
    const buffer = parseFloat(document.getElementById('psuBuffer')?.value) || 1.5;
    
    const total = cpuTdp + gpuTdp + otherTdp;
    const recommended = Math.ceil(total * buffer / 50) * 50;
    
    if (document.getElementById('totalPower')) document.getElementById('totalPower').textContent = total;
    if (document.getElementById('psuRecommend')) document.getElementById('psuRecommend').textContent = recommended;
}

// ============================================
// SIDEBAR
// ============================================

function toggleSbSubject(btn) {
    const subject = btn.closest('.sb-subject');
    if (subject) subject.classList.toggle('collapsed');
}
window.toggleSbSubject = toggleSbSubject;

function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarClose');
    const mobileBtn = document.getElementById('mobileSidebarBtn');
    const toggleBtn = document.getElementById('sidebarToggle');
    const wrapper = document.querySelector('.layout-wrapper');
    const search = document.getElementById('sidebarSearch');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            wrapper.classList.toggle('sidebar-collapsed');
            const svg = toggleBtn.querySelector('svg');
            if (wrapper.classList.contains('sidebar-collapsed')) {
                svg.innerHTML = '<polyline points="9 18 15 12 9 6"/>';
            } else {
                svg.innerHTML = '<polyline points="15 18 9 12 15 6"/>';
            }
        });
    }
    
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
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('show')) closeMobileSidebar();
    });
    
    const sbLinks = document.querySelectorAll('.sb-tree a');
    sbLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || '';
            if (!href.startsWith('#')) return;
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            if (!target) return;
            e.preventDefault();
            const chapter = target.closest('.chapter');
            if (chapter && !chapter.classList.contains('expanded')) {
                chapter.classList.add('expanded');
                const header = chapter.querySelector('.chapter-header');
                if (header) header.classList.add('expanded');
            }
            setTimeout(() => {
                const headerHeight = 80;
                const rect = target.getBoundingClientRect();
                const top = window.scrollY + rect.top - headerHeight - 8;
                window.scrollTo({ top, behavior: 'smooth' });
            }, 80);
            sbLinks.forEach(l => l.classList.remove('flash'));
            link.classList.add('flash');
            setTimeout(() => link.classList.remove('flash'), 1300);
            if (window.innerWidth <= 992) closeMobileSidebar();
            sbLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    const sectionIds = Array.from(sbLinks).map(l => l.getAttribute('href').substring(1));
    let ticking = false;
    function updateActiveOnScroll() {
        const headerOffset = 100;
        const scrollPos = window.scrollY + headerOffset + 20;
        let activeId = null;
        for (let id of sectionIds) {
            const el = document.getElementById(id);
            if (!el) continue;
            const chapter = el.closest('.chapter');
            if (chapter && !chapter.classList.contains('expanded')) continue;
            if (el.offsetTop <= scrollPos) activeId = id;
            else break;
        }
        if (activeId) {
            sbLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + activeId));
            if (document.activeElement !== search) {
                const activeLink = document.querySelector('.sb-tree a.active');
                if (activeLink) {
                    const linkTop = activeLink.offsetTop;
                    const linkHeight = activeLink.offsetHeight;
                    const nav = document.getElementById('sidebarNav');
                    const navVisibleHeight = nav.clientHeight;
                    const currentScroll = nav.scrollTop;
                    if (linkTop < currentScroll || linkTop + linkHeight > currentScroll + navVisibleHeight) {
                        nav.scrollTo({ top: linkTop - navVisibleHeight / 2 + linkHeight / 2, behavior: 'smooth' });
                    }
                }
            }
        }
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(updateActiveOnScroll); ticking = true; }
    }, { passive: true });
    
    if (search) {
        search.addEventListener('input', () => {
            const q = search.value.toLowerCase().trim();
            document.querySelectorAll('.sb-subject').forEach(subject => {
                let anyMatch = false;
                const chapters = subject.querySelectorAll('.sb-tree > li');
                chapters.forEach(chap => {
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
                    chap.style.display = (anySubMatch || chapMatch) ? '' : 'none';
                    if (anySubMatch || chapMatch) anyMatch = true;
                });
                if (q) {
                    subject.classList.remove('collapsed');
                    subject.style.display = anyMatch ? '' : 'none';
                } else {
                    subject.style.display = '';
                }
            });
        });
    }
    
    const tabButtons = document.querySelectorAll('.nav-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.sb-subject').forEach(sub => {
                if (sub.dataset.subject === tab) {
                    sub.classList.remove('collapsed');
                    setTimeout(() => {
                        const titleBtn = sub.querySelector('.sb-subject-title');
                        if (titleBtn) titleBtn.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 150);
                } else sub.classList.add('collapsed');
            });
        });
    });
    
    const ktmtSub = document.querySelector('.sb-subject[data-subject="ktmt"]');
    const btmtSub = document.querySelector('.sb-subject[data-subject="btmt"]');
    if (ktmtSub) ktmtSub.classList.remove('collapsed');
    if (btmtSub) btmtSub.classList.add('collapsed');
    setTimeout(updateActiveOnScroll, 200);
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
    updateIEEE754Viz();
    updateCRCViz();
    updateHammingViz();
    updateTwosComplementViz();
    updateHammingErrorViz();
    updatePhysicalAddressViz();
    updatePSU();
    
    // Auto-expand first chapter
    const firstKtmtChapter = document.querySelector('#ktmt-section .chapter');
    if (firstKtmtChapter) {
        firstKtmtChapter.classList.add('expanded');
        firstKtmtChapter.querySelector('.chapter-header').classList.add('expanded');
    }
    
    console.log('✅ Ôn Tập KTMT & BTMT loaded successfully!');
});

window.toggleChapter = toggleChapter;
