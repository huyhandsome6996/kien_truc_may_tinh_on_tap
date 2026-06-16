'use client'

import { useState, useMemo } from 'react'
import { 
  Calculator, 
  BookOpen, 
  Cpu, 
  MemoryStick, 
  Binary, 
  CircuitBoard,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  HardDrive,
  Monitor,
  Wrench,
  Shield,
  ArrowRight,
  Menu,
  X,
  GraduationCap
} from 'lucide-react'

// ============ UTILITY FUNCTIONS ============
const decimalToBinary = (num: number, bits: number = 8): string => {
  if (num >= 0) {
    return num.toString(2).padStart(bits, '0')
  }
  // Two's complement for negative numbers
  const positive = Math.abs(num)
  const binary = positive.toString(2).padStart(bits, '0')
  const inverted = binary.split('').map(b => b === '0' ? '1' : '0').join('')
  let result = ''
  let carry = 1
  for (let i = inverted.length - 1; i >= 0; i--) {
    if (inverted[i] === '1' && carry === 1) {
      result = '0' + result
    } else if (inverted[i] === '0' && carry === 1) {
      result = '1' + result
      carry = 0
    } else {
      result = inverted[i] + result
    }
  }
  return result
}

const binaryToDecimal = (binary: string): number => {
  // Check if it's negative (first bit is 1)
  if (binary[0] === '1') {
    // Two's complement
    const inverted = binary.split('').map(b => b === '0' ? '1' : '0').join('')
    const positive = parseInt(inverted, 2) + 1
    return -positive
  }
  return parseInt(binary, 2)
}

const decimalToHex = (num: number): string => {
  return num.toString(16).toUpperCase()
}

const hexToDecimal = (hex: string): number => {
  return parseInt(hex, 16)
}

const binaryToHex = (binary: string): string => {
  const decimal = parseInt(binary, 2)
  return decimal.toString(16).toUpperCase()
}

const hexToBinary = (hex: string): string => {
  const decimal = parseInt(hex, 16)
  return decimal.toString(2)
}

// IEEE 754 Single Precision
const floatToIEEE754 = (num: number): { sign: string, exponent: string, mantissa: string, full: string } => {
  const sign = num < 0 ? '1' : '0'
  const absNum = Math.abs(num)
  
  if (absNum === 0) {
    return { sign: '0', exponent: '00000000', mantissa: '00000000000000000000000', full: '00000000000000000000000000000000' }
  }
  
  // Convert to binary
  let intPart = Math.floor(absNum)
  let fracPart = absNum - intPart
  
  let intBinary = intPart.toString(2)
  let fracBinary = ''
  
  for (let i = 0; i < 23; i++) {
    fracPart *= 2
    if (fracPart >= 1) {
      fracBinary += '1'
      fracPart -= 1
    } else {
      fracBinary += '0'
    }
  }
  
  // Normalize
  let exponent: number
  let mantissa: string
  
  if (intBinary.length > 0) {
    exponent = intBinary.length - 1
    mantissa = intBinary.substring(1) + fracBinary
  } else {
    const firstOne = fracBinary.indexOf('1')
    exponent = -(firstOne + 1)
    mantissa = fracBinary.substring(firstOne + 1)
  }
  
  // Bias = 127
  const biasedExponent = exponent + 127
  const expBinary = biasedExponent.toString(2).padStart(8, '0')
  const mantissaPadded = mantissa.padEnd(23, '0').substring(0, 23)
  
  return {
    sign,
    exponent: expBinary,
    mantissa: mantissaPadded,
    full: sign + expBinary + mantissaPadded
  }
}

// CRC Calculation
const calculateCRC = (data: string, polynomial: string): string => {
  // Append zeros
  const polyLength = polynomial.length
  let dividend = data + '0'.repeat(polyLength - 1)
  
  // XOR division
  while (dividend.length >= polyLength) {
    if (dividend[0] === '1') {
      let result = ''
      for (let i = 0; i < polyLength; i++) {
        result += dividend[i] === polynomial[i] ? '0' : '1'
      }
      dividend = result + dividend.substring(polyLength)
    } else {
      dividend = dividend.substring(1)
    }
  }
  
  return dividend.padStart(polyLength - 1, '0')
}

// Hamming Code
const calculateHamming = (data: string): string => {
  const m = data.length
  // Find r such that 2^r >= m + r + 1
  let r = 0
  while (Math.pow(2, r) < m + r + 1) r++
  
  const n = m + r
  const hamming: string[] = new Array(n).fill('0')
  
  // Place data bits
  let dataIndex = 0
  for (let i = 1; i <= n; i++) {
    if ((i & (i - 1)) !== 0) { // Not a power of 2
      hamming[n - i] = data[dataIndex]
      dataIndex++
    }
  }
  
  // Calculate parity bits
  for (let p = 0; p < r; p++) {
    const pos = Math.pow(2, p)
    let parity = 0
    for (let i = 1; i <= n; i++) {
      if (i & pos) {
        parity ^= parseInt(hamming[n - i])
      }
    }
    hamming[n - pos] = parity.toString()
  }
  
  return hamming.join('')
}

// ============ COMPONENTS ============
interface CollapsibleProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ReactNode
}

const Collapsible = ({ title, children, defaultOpen = false, icon }: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border border-border rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-muted/50 hover:bg-muted flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-card">
          {children}
        </div>
      )}
    </div>
  )
}

interface CalculatorCardProps {
  title: string
  children: React.ReactNode
}

const CalculatorCard = ({ title, children }: CalculatorCardProps) => (
  <div className="bg-card border border-border rounded-lg p-4 mb-4">
    <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
      <Calculator className="w-4 h-4" />
      {title}
    </h4>
    {children}
  </div>
)

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'info' }) => {
  const colors = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  )
}

const Formula = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-muted/50 border border-border rounded px-3 py-2 font-mono text-sm my-2 overflow-x-auto">
    {children}
  </div>
)

const Table = ({ headers, rows }: { headers: string[], rows: string[][] }) => (
  <div className="overflow-x-auto my-4">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-muted">
          {headers.map((h, i) => (
            <th key={i} className="border border-border px-3 py-2 text-left font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-muted/50">
            {row.map((cell, j) => (
              <td key={j} className="border border-border px-3 py-2">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// ============ MAIN PAGE ============
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'ktmt' | 'btmt'>('ktmt')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Calculator states
  const [decInput, setDecInput] = useState('42')
  const [binInput, setBinInput] = useState('101010')
  const [hexInput, setHexInput] = useState('2A')
  const [floatInput, setFloatInput] = useState('-2345.125')
  const [crcData, setCrcData] = useState('11010110110111')
  const [crcPoly, setCrcPoly] = useState('10011')
  const [hammingInput, setHammingInput] = useState('1101')

  // Conversion results
  const decResult = useMemo(() => {
    const num = parseInt(decInput) || 0
    return {
      binary: decimalToBinary(num),
      hex: decimalToHex(num),
      binary16: decimalToBinary(num, 16)
    }
  }, [decInput])

  const binResult = useMemo(() => {
    const clean = binInput.replace(/[^01]/g, '')
    return {
      decimal: binaryToDecimal(clean.padStart(8, '0')),
      hex: binaryToHex(clean) || '0'
    }
  }, [binInput])

  const hexResult = useMemo(() => {
    const clean = hexInput.replace(/[^0-9A-Fa-f]/g, '')
    return {
      decimal: hexToDecimal(clean) || 0,
      binary: hexToBinary(clean) || '0'
    }
  }, [hexInput])

  const floatResult = useMemo(() => {
    const num = parseFloat(floatInput) || 0
    return floatToIEEE754(num)
  }, [floatInput])

  const crcResult = useMemo(() => {
    return calculateCRC(crcData.replace(/[^01]/g, ''), crcPoly.replace(/[^01]/g, ''))
  }, [crcData, crcPoly])

  const hammingResult = useMemo(() => {
    return calculateHamming(hammingInput.replace(/[^01]/g, ''))
  }, [hammingInput])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ôn Tập KTMT & BTMT
                </h1>
                <p className="text-xs text-muted-foreground">Kiến trúc Máy tính & Bảo trì Máy tính</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setActiveTab('ktmt')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'ktmt' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  KTMT
                </span>
              </button>
              <button
                onClick={() => setActiveTab('btmt')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'btmt' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
                    : 'hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  BTMT
                </span>
              </button>
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 flex gap-2">
              <button
                onClick={() => { setActiveTab('ktmt'); setMobileMenuOpen(false) }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'ktmt' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Cpu className="w-4 h-4" />
                  KTMT
                </span>
              </button>
              <button
                onClick={() => { setActiveTab('btmt'); setMobileMenuOpen(false) }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'btmt' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Wrench className="w-4 h-4" />
                  BTMT
                </span>
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* KTMT Content */}
        {activeTab === 'ktmt' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Kiến Trúc Máy Tính (KTMT)</h2>
              <p className="text-blue-100">Ôn tập cuối kỳ - 4 tín chỉ - Được sử dụng tài liệu</p>
            </div>

            {/* Chương 1: Số học máy tính */}
            <Collapsible title="Chương 1: Số Học Máy Tính" icon={<Binary className="w-5 h-5 text-blue-600" />} defaultOpen>
              <div className="space-y-6">
                {/* 1.1 Hệ nhị phân */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">1.1 Hệ Nhị Phân & Hệ Cơ Số 16</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-semibold mb-2">Khái niệm cơ bản:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><strong>Hệ nhị phân (Binary):</strong> Chỉ dùng 2 chữ số 0 và 1</li>
                        <li><strong>Hệ thập lục phân (Hex):</strong> 16 chữ số: 0-9, A, B, C, D, E, F</li>
                        <li><strong>Quy đổi:</strong> 4 bit nhị phân = 1 chữ số hex</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Ví dụ chuyển đổi:</h5>
                      <Formula>AC1BH = 1010 1100 0001 1011 B</Formula>
                      <Formula>1011 1011 B = BBH</Formula>
                    </div>
                  </div>

                  <CalculatorCard title="Công cụ chuyển đổi số">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Thập phân:</label>
                        <input 
                          type="text" 
                          value={decInput} 
                          onChange={(e) => setDecInput(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                        <div className="mt-2 text-sm space-y-1">
                          <p><Badge variant="info">Binary 8bit</Badge> {decResult.binary}</p>
                          <p><Badge variant="success">Binary 16bit</Badge> {decResult.binary16}</p>
                          <p><Badge variant="warning">Hex</Badge> {decResult.hex}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Nhị phân:</label>
                        <input 
                          type="text" 
                          value={binInput} 
                          onChange={(e) => setBinInput(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                        <div className="mt-2 text-sm space-y-1">
                          <p><Badge variant="info">Decimal</Badge> {binResult.decimal}</p>
                          <p><Badge variant="warning">Hex</Badge> {binResult.hex}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Hex:</label>
                        <input 
                          type="text" 
                          value={hexInput} 
                          onChange={(e) => setHexInput(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                        <div className="mt-2 text-sm space-y-1">
                          <p><Badge variant="info">Decimal</Badge> {hexResult.decimal}</p>
                          <p><Badge variant="success">Binary</Badge> {hexResult.binary}</p>
                        </div>
                      </div>
                    </div>
                  </CalculatorCard>
                </div>

                {/* 1.2 Biểu diễn số nguyên */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">1.2 Biểu Diễn Số Nguyên</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <Badge>Số không dấu</Badge>
                      </h5>
                      <Table 
                        headers={['Số bit', 'Khoảng giá trị', 'Tên gọi']}
                        rows={[
                          ['8 bit', '0 đến 255', 'Byte'],
                          ['16 bit', '0 đến 65.535', 'Word'],
                          ['32 bit', '0 đến 4.294.967.295', 'DWord']
                        ]}
                      />
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <Badge variant="warning">Số có dấu</Badge>
                      </h5>
                      <Table 
                        headers={['Số bit', 'Khoảng giá trị', 'Tên gọi']}
                        rows={[
                          ['8 bit', '-128 đến 127', 'Short integer'],
                          ['16 bit', '-32.768 đến 32.767', 'Integer'],
                          ['32 bit', '-2³¹ đến 2³¹-1', 'Long integer']
                        ]}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Số bù 2 (Two's Complement)</h5>
                    <p className="text-sm mb-2">Cách tính số bù 2 của một số dương:</p>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li><strong>Bù 1:</strong> Đảo tất cả các bit (0→1, 1→0)</li>
                      <li><strong>Bù 2:</strong> Lấy bù 1 cộng thêm 1</li>
                    </ol>
                    <div className="mt-2">
                      <Formula>
                        5 = 00000101 B<br/>
                        Bù 1: 11111010 B<br/>
                        Bù 2: 11111011 B = -5
                      </Formula>
                    </div>
                  </div>
                </div>

                {/* 1.3 Biểu diễn số thực */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">1.3 Biểu Diễn Số Thực (IEEE 754-1985)</h4>
                  
                  <div className="mb-4">
                    <p className="text-sm mb-2">Dạng tổng quát: <Formula>X = (-1)^S × 2^(E-B) × 1.F</Formula></p>
                    <p className="text-sm">Trong đó: S = bit dấu, E = số mũ, F = phần định trị, B = bias</p>
                  </div>

                  <Table 
                    headers={['Loại', 'S (bit)', 'E (bit)', 'F (bit)', 'Bias']}
                    rows={[
                      ['Single (32 bit)', '1', '8', '23', '127'],
                      ['Double (64 bit)', '1', '11', '52', '1023'],
                      ['Quadruple (128 bit)', '1', '15', '111', '16383']
                    ]}
                  />

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Các bước chuyển đổi:</h5>
                    <ol className="list-decimal list-inside text-sm space-y-2">
                      <li>Đổi số thực sang nhị phân</li>
                      <li>Chuẩn hóa về dạng ±1.xxx × 2^k</li>
                      <li>Tính E = k + B (B = bias)</li>
                      <li>Ghép S + E(nhị phân) + F(phần sau dấu phẩy)</li>
                    </ol>
                    <div className="mt-3">
                      <strong>Ví dụ: X = -2345.125</strong>
                      <Formula>
                        B1: -1001 0010 1001.001₂<br/>
                        B2: -1.00100101001 × 2¹¹<br/>
                        B3: E = 11 + 127 = 138 = 10001010₂<br/>
                        B4: 1 10001010 00100101001000000000000
                      </Formula>
                    </div>
                  </div>

                  <CalculatorCard title="Tính IEEE 754 Single Precision">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium">Nhập số thực:</label>
                        <input 
                          type="text" 
                          value={floatInput} 
                          onChange={(e) => setFloatInput(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-muted rounded-lg font-mono text-sm">
                      <p><Badge>Sign (1bit)</Badge> {floatResult.sign}</p>
                      <p><Badge variant="info">Exponent (8bit)</Badge> {floatResult.exponent}</p>
                      <p><Badge variant="success">Mantissa (23bit)</Badge> {floatResult.mantissa}</p>
                      <p className="mt-2 pt-2 border-t"><Badge variant="warning">Full (32bit)</Badge></p>
                      <p className="break-all">{floatResult.full}</p>
                    </div>
                  </CalculatorCard>
                </div>

                {/* 1.4 Mã phát hiện sửa lỗi */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">1.4 Mã Phát Hiện & Sửa Lỗi</h4>
                  
                  {/* Parity Bit */}
                  <div className="mb-6">
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      Bit Chẵn Lẻ (Parity Bit)
                    </h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm mb-2">Thêm 1 bit để tổng số bit 1 là:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>Parity chẵn:</strong> Tổng bit 1 là số chẵn</li>
                          <li><strong>Parity lẻ:</strong> Tổng bit 1 là số lẻ</li>
                        </ul>
                        <div className="mt-2">
                          <Formula>
                            Truyền 1001010 + 1 = 10010101<br/>
                            (có 4 bit 1 → chẵn)
                          </Formula>
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Ưu điểm:</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          <li>Đơn giản, dễ implement</li>
                          <li>Phát hiện lỗi 1 bit</li>
                        </ul>
                        <p className="text-sm font-medium text-red-600 mt-2">Nhược điểm:</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          <li>Không sửa được lỗi</li>
                          <li>Không phát hiện lỗi 2 bit</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* CRC */}
                  <div className="mb-6">
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-600" />
                      Mã CRC (Cyclic Redundancy Check)
                    </h5>
                    <p className="text-sm mb-2">Phát hiện lỗi nhiều bit khi đọc/ghi đĩa</p>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-3">
                      <h6 className="font-medium mb-2">Thuật toán:</h6>
                      <ol className="list-decimal list-inside text-sm space-y-1">
                        <li>Thêm n bit 0 vào sau dữ liệu m bit (n = bậc đa thức G(x))</li>
                        <li>Chia cho đa thức sinh G(x) dùng XOR</li>
                        <li>Phần dư = CRC (n bit)</li>
                        <li>Truyền: dữ liệu + CRC</li>
                      </ol>
                    </div>

                    <CalculatorCard title="Tính CRC">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Dữ liệu (nhị phân):</label>
                          <input 
                            type="text" 
                            value={crcData} 
                            onChange={(e) => setCrcData(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-lg bg-background font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Đa thức G(x) (nhị phân):</label>
                          <input 
                            type="text" 
                            value={crcPoly} 
                            onChange={(e) => setCrcPoly(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-lg bg-background font-mono"
                          />
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p><Badge variant="success">CRC Result</Badge> <span className="font-mono">{crcResult}</span></p>
                        <p className="mt-2"><Badge variant="info">Dữ liệu truyền</Badge></p>
                        <p className="font-mono break-all">{crcData.replace(/[^01]/g, '') + crcResult}</p>
                      </div>
                    </CalculatorCard>

                    <div className="mt-3">
                      <p className="text-sm font-medium">Các đa thức CRC phổ biến:</p>
                      <Formula>
                        CRC-16: x¹⁶ + x¹⁵ + x² + 1<br/>
                        CRC-CCITT: x¹⁶ + x¹² + x⁵ + 1<br/>
                        CRC-32: x³² + x²⁶ + x²³ + x²² + x¹⁶ + x¹² + x¹¹ + x¹⁰ + x⁸ + x⁷ + x⁵ + x⁴ + x² + x + 1
                      </Formula>
                    </div>
                  </div>

                  {/* Hamming */}
                  <div>
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      Mã Hamming (Phát hiện và SỬA lỗi)
                    </h5>
                    <p className="text-sm mb-2">Có khả năng phát hiện VÀ sửa lỗi 1 bit</p>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg mb-3">
                      <h6 className="font-medium mb-2">Quy tắc:</h6>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>m bit dữ liệu + r bit kiểm tra</li>
                        <li>Chọn r: 2ʳ ≥ m + r + 1</li>
                        <li>Vị trí bit kiểm tra: 2ᵏ (vị trí 1, 2, 4, 8, ...)</li>
                      </ul>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium">Ví dụ Hamming(7,4):</p>
                      <Table 
                        headers={['Vị trí', '7', '6', '5', '4', '3', '2', '1']}
                        rows={[
                          ['Bit', 'i₄', 'i₃', 'i₂', 'C₃', 'i₁', 'C₂', 'C₁'],
                          ['Giá trị', '1', '1', '0', '0', '1', '1', '0']
                        ]}
                      />
                      <p className="text-sm mt-2">Công thức tính bit kiểm tra:</p>
                      <Formula>
                        C₃ = i₂ ⊕ i₃ ⊕ i₄<br/>
                        C₂ = i₁ ⊕ i₃ ⊕ i₄<br/>
                        C₁ = i₁ ⊕ i₂ ⊕ i₄
                      </Formula>
                    </div>

                    <CalculatorCard title="Tính Mã Hamming">
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="text-sm font-medium">Dữ liệu (m bit):</label>
                          <input 
                            type="text" 
                            value={hammingInput} 
                            onChange={(e) => setHammingInput(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-lg bg-background font-mono"
                            placeholder="Ví dụ: 1101"
                          />
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p><Badge variant="success">Mã Hamming</Badge></p>
                        <p className="font-mono text-lg">{hammingResult}</p>
                      </div>
                    </CalculatorCard>
                  </div>
                </div>
              </div>
            </Collapsible>

            {/* Chương 2: Tổng quan máy tính */}
            <Collapsible title="Chương 2: Tổng Quan Về Máy Tính" icon={<Monitor className="w-5 h-5 text-green-600" />}>
              <div className="space-y-6">
                {/* Von Neumann */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">2.1 Nguyên Lý Von Neumann</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-semibold mb-2">5 khối cơ bản:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Đơn vị xử lý:</strong> Thực hiện các phép tính</li>
                        <li><strong>Đơn vị điều khiển:</strong> Điều phối hoạt động</li>
                        <li><strong>Bộ nhớ:</strong> Lưu trữ dữ liệu và chương trình</li>
                        <li><strong>Thiết bị nhập:</strong> Nhận dữ liệu đầu vào</li>
                        <li><strong>Thiết bị xuất:</strong> Xuất kết quả</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Nguyên lý chính:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Chương trình được lưu trữ trong bộ nhớ</li>
                        <li>Bộ nhớ chia thành nhiều ô có địa chỉ</li>
                        <li>Thực hiện lệnh tuần tự qua bộ đếm chương trình</li>
                      </ul>
                    </div>
                  </div>

                  {/* Sơ đồ khối */}
                  <div className="p-4 bg-white dark:bg-slate-800 border rounded-lg">
                    <h5 className="font-semibold mb-3 text-center">Sơ Đồ Tổ Chức Tổng Quát</h5>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-4 flex-wrap justify-center">
                        <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-center">
                          <Cpu className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                          <span className="text-xs">CPU</span>
                        </div>
                        <ArrowRight className="w-5 h-5 self-center" />
                        <div className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                          <MemoryStick className="w-6 h-6 mx-auto mb-1 text-green-600" />
                          <span className="text-xs">Bộ nhớ</span>
                        </div>
                        <ArrowRight className="w-5 h-5 self-center" />
                        <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg text-center">
                          <HardDrive className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                          <span className="text-xs">Bộ nhớ ngoài</span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <div className="px-4 py-2 bg-amber-100 dark:bg-amber-900 rounded-lg text-center">
                          <Monitor className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                          <span className="text-xs">Thiết bị vào/ra</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-sm">
                      <Badge variant="info">Bus hệ thống</Badge>: Bus địa chỉ + Bus dữ liệu + Bus điều khiển
                    </div>
                  </div>
                </div>

                {/* Phân loại kiến trúc */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">2.2 Phân Loại Kiến Trúc</h4>
                  <Table 
                    headers={['Kiến trúc', 'Mô tả', 'Đặc điểm']}
                    rows={[
                      ['SISD', 'Single Instruction Single Data', 'Một lệnh xử lý một dữ liệu'],
                      ['SIMD', 'Single Instruction Multiple Data', 'Một lệnh xử lý nhiều dữ liệu song song'],
                      ['MIMD', 'Multiple Instruction Multiple Data', 'Nhiều lệnh xử lý nhiều dữ liệu song song']
                    ]}
                  />
                </div>

                {/* Bus hệ thống */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">2.3 Bus Hệ Thống</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h5 className="font-semibold text-red-800 dark:text-red-200">Bus Địa Chỉ</h5>
                      <p className="text-sm mt-1">Truyền địa chỉ ô nhớ hoặc cổng I/O từ CPU</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h5 className="font-semibold text-green-800 dark:text-green-200">Bus Dữ Liệu</h5>
                      <p className="text-sm mt-1">Truyền dữ liệu hai chiều giữa các khối</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200">Bus Điều Khiển</h5>
                      <p className="text-sm mt-1">Truyền tín hiệu điều khiển, trạng thái</p>
                    </div>
                  </div>
                </div>
              </div>
            </Collapsible>

            {/* Chương 3: Vi xử lý 8088 */}
            <Collapsible title="Chương 3: Tổ Chức Hệ Vi Xử Lý 8088" icon={<Cpu className="w-5 h-5 text-red-600" />}>
              <div className="space-y-6">
                {/* Sơ đồ cấu trúc */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">3.1 Sơ Đồ Cấu Trúc 8088</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* BIU */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h5 className="font-bold text-blue-800 dark:text-blue-200 mb-2">BIU (Bus Interface Unit)</h5>
                      <p className="text-sm mb-2">Đơn vị giao tiếp bus - Nạp lệnh và dữ liệu</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Các thanh ghi đoạn: CS, DS, SS, ES</li>
                        <li>Con trỏ lệnh IP</li>
                        <li>Bộ điều khiển logic bus (BCL)</li>
                        <li>Hàng đợi lệnh 4 byte (instruction queue)</li>
                      </ul>
                    </div>
                    
                    {/* EU */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h5 className="font-bold text-green-800 dark:text-green-200 mb-2">EU (Execution Unit)</h5>
                      <p className="text-sm mb-2">Đơn vị thực hiện lệnh</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Khối điều khiển CU với mạch giải mã</li>
                        <li>ALU - đơn vị số học và logic</li>
                        <li>Các thanh ghi đa năng</li>
                        <li>Thanh ghi cờ FR</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Hoạt động Pipeline:</h5>
                    <p className="text-sm">Trong khi EU thực hiện lệnh hiện tại, BIU đã nạp sẵn lệnh tiếp theo vào hàng đợi. Điều này giúp CPU xử lý liên tục, không phải chờ nạp lệnh.</p>
                  </div>
                </div>

                {/* Các thanh ghi */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">3.2 Các Thanh Ghi</h4>
                  
                  {/* Thanh ghi đa năng */}
                  <div className="mb-4">
                    <h5 className="font-semibold mb-2">a. Thanh ghi đa năng (16 bit):</h5>
                    <Table 
                      headers={['Thanh ghi', 'Tên', 'Chức năng chính']}
                      rows={[
                        ['AX (AH + AL)', 'Accumulator', 'Chứa kết quả phép tính, I/O'],
                        ['BX (BH + BL)', 'Base', 'Con trỏ bộ nhớ, địa chỉ cơ sở'],
                        ['CX (CH + CL)', 'Count', 'Đếm vòng lặp, số lần dịch/quay'],
                        ['DX (DH + DL)', 'Data', 'Dữ liệu, địa chỉ cổng I/O 16 bit']
                      ]}
                    />
                  </div>

                  {/* Thanh ghi đoạn */}
                  <div className="mb-4">
                    <h5 className="font-semibold mb-2">b. Thanh ghi đoạn (Segment):</h5>
                    <Table 
                      headers={['Thanh ghi', 'Tên', 'Kết hợp với', 'Mục đích']}
                      rows={[
                        ['CS', 'Code Segment', 'IP', 'Địa chỉ mã lệnh (CS:IP)'],
                        ['DS', 'Data Segment', 'SI, DI', 'Địa chỉ dữ liệu'],
                        ['SS', 'Stack Segment', 'SP, BP', 'Địa chỉ ngăn xếp'],
                        ['ES', 'Extra Segment', 'DI', 'Địa chỉ chuỗi đích']
                      ]}
                    />
                  </div>

                  {/* Thanh ghi con trỏ */}
                  <div className="mb-4">
                    <h5 className="font-semibold mb-2">c. Thanh ghi con trỏ và chỉ số:</h5>
                    <Table 
                      headers={['Thanh ghi', 'Chức năng']}
                      rows={[
                        ['IP (Instruction Pointer)', 'Con trỏ lệnh - chỉ lệnh tiếp theo'],
                        ['SP (Stack Pointer)', 'Con trỏ đỉnh ngăn xếp'],
                        ['BP (Base Pointer)', 'Con trỏ cơ sở - trỏ dữ liệu trong stack'],
                        ['SI (Source Index)', 'Chỉ số nguồn - địa chỉ chuỗi nguồn'],
                        ['DI (Destination Index)', 'Chỉ số đích - địa chỉ chuỗi đích']
                      ]}
                    />
                  </div>

                  {/* Thanh ghi cờ */}
                  <div>
                    <h5 className="font-semibold mb-2">d. Thanh ghi cờ FR (Flag Register):</h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-medium text-sm mb-1">Cờ trạng thái:</h6>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>CF (Carry):</strong> Cờ nhớ/borrow</li>
                          <li><strong>PF (Parity):</strong> Cờ chẵn lẻ</li>
                          <li><strong>AF (Auxiliary):</strong> Cờ nhớ phụ (BCD)</li>
                          <li><strong>ZF (Zero):</strong> Kết quả bằng 0</li>
                          <li><strong>SF (Sign):</strong> Kết quả âm</li>
                          <li><strong>OF (Overflow):</strong> Tràn số có dấu</li>
                        </ul>
                      </div>
                      <div>
                        <h6 className="font-medium text-sm mb-1">Cờ điều khiển:</h6>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li><strong>TF (Trap):</strong> Chế độ chạy từng lệnh</li>
                          <li><strong>IF (Interrupt):</strong> Cho phép ngắt</li>
                          <li><strong>DF (Direction):</strong> Hướng xử lý chuỗi</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chế độ địa chỉ */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">3.3 Chế Độ Địa Chỉ</h4>
                  <p className="text-sm mb-3">Địa chỉ vật lý 20 bit = Segment × 16 + Offset</p>
                  <Formula>
                    Địa chỉ vật lý = CS × 16 + IP (cho mã lệnh)<br/>
                    Địa chỉ vật lý = SS × 16 + SP (cho ngăn xếp)
                  </Formula>
                  <div className="mt-3">
                    <p className="text-sm font-medium">Ví dụ: CS = 2000H, IP = 0100H</p>
                    <p className="text-sm">Địa chỉ vật lý = 20000H + 0100H = 20100H</p>
                  </div>
                </div>
              </div>
            </Collapsible>

            {/* Chương 4: Kỹ thuật ống dẫn & Bộ nhớ */}
            <Collapsible title="Chương 4: Kỹ Thuật Ống Dẫn & Bộ Nhớ" icon={<Zap className="w-5 h-5 text-yellow-600" />}>
              <div className="space-y-6">
                {/* Pipeline */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">4.1 Kỹ Thuật Ống Dẫn (Pipeline)</h4>
                  
                  <p className="text-sm mb-3">Kỹ thuật chia quá trình thực hiện lệnh thành các giai đoạn nhỏ, cho phép xử lý chồng lấn nhiều lệnh cùng lúc.</p>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                    <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">3 Giai đoạn thực hiện lệnh:</h5>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li><strong>Fetch:</strong> Đọc mã lệnh từ bộ nhớ</li>
                      <li><strong>Decode:</strong> Giải mã lệnh</li>
                      <li><strong>Execute:</strong> Thực hiện lệnh</li>
                    </ol>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border px-3 py-2">Lệnh/Giai đoạn</th>
                          <th className="border px-3 py-2">T1</th>
                          <th className="border px-3 py-2">T2</th>
                          <th className="border px-3 py-2">T3</th>
                          <th className="border px-3 py-2">T4</th>
                          <th className="border px-3 py-2">T5</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border px-3 py-2 font-medium">Lệnh 1</td>
                          <td className="border px-3 py-2 bg-blue-100 dark:bg-blue-900/30">F</td>
                          <td className="border px-3 py-2 bg-green-100 dark:bg-green-900/30">D</td>
                          <td className="border px-3 py-2 bg-purple-100 dark:bg-purple-900/30">E</td>
                          <td className="border px-3 py-2"></td>
                          <td className="border px-3 py-2"></td>
                        </tr>
                        <tr>
                          <td className="border px-3 py-2 font-medium">Lệnh 2</td>
                          <td className="border px-3 py-2"></td>
                          <td className="border px-3 py-2 bg-blue-100 dark:bg-blue-900/30">F</td>
                          <td className="border px-3 py-2 bg-green-100 dark:bg-green-900/30">D</td>
                          <td className="border px-3 py-2 bg-purple-100 dark:bg-purple-900/30">E</td>
                          <td className="border px-3 py-2"></td>
                        </tr>
                        <tr>
                          <td className="border px-3 py-2 font-medium">Lệnh 3</td>
                          <td className="border px-3 py-2"></td>
                          <td className="border px-3 py-2"></td>
                          <td className="border px-3 py-2 bg-blue-100 dark:bg-blue-900/30">F</td>
                          <td className="border px-3 py-2 bg-green-100 dark:bg-green-900/30">D</td>
                          <td className="border px-3 py-2 bg-purple-100 dark:bg-purple-900/30">E</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground">F = Fetch, D = Decode, E = Execute</p>
                </div>

                {/* Bộ nhớ Cache */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">4.2 Bộ Nhớ Cache</h4>
                  
                  <p className="text-sm mb-3">Bộ nhớ đệm tốc độ cao nằm giữa CPU và RAM chính, giảm thời gian truy xuất bộ nhớ.</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-semibold mb-2">Nguyên lý hoạt động:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Temporal locality:</strong> Dữ liệu vừa dùng sẽ được dùng lại</li>
                        <li><strong>Spatial locality:</strong> Dữ liệu gần nhau thường được dùng cùng lúc</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Phân loại theo vị trí:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>L1 Cache:</strong> Nằm trong CPU, nhanh nhất</li>
                        <li><strong>L2 Cache:</strong> Ngoài CPU nhưng gần, nhanh</li>
                        <li><strong>L3 Cache:</strong> Chia sẻ giữa các core</li>
                      </ul>
                    </div>
                  </div>

                  <Table 
                    headers={['Loại', 'Dung lượng', 'Tốc độ', 'Vị trí']}
                    rows={[
                      ['L1', '8-64 KB', '1-4 chu kỳ', 'Trong CPU core'],
                      ['L2', '256 KB - 1 MB', '4-10 chu kỳ', 'Trong/ngoài CPU'],
                      ['L3', '2-64 MB', '10-20 chu kỳ', 'Chia sẻ giữa cores'],
                      ['RAM', '4-128 GB', '100+ chu kỳ', 'Trên mainboard']
                    ]}
                  />
                </div>

                {/* ROM & RAM */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">4.3 Bộ Nhớ ROM & RAM</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">ROM (Read Only Memory)</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Chỉ đọc, không ghi được (thường)</li>
                        <li>Lưu BIOS, firmware</li>
                        <li>Không mất dữ liệu khi tắt nguồn</li>
                        <li>Các loại: PROM, EPROM, EEPROM, Flash</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">RAM (Random Access Memory)</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Đọc và ghi được</li>
                        <li>Lưu dữ liệu tạm khi chạy</li>
                        <li>Mất dữ liệu khi tắt nguồn</li>
                        <li>Các loại: SRAM (Cache), DRAM (RAM chính)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-semibold mb-2">Các thế hệ DRAM:</h5>
                    <Table 
                      headers={['Loại', 'Số chân', 'Tốc độ', 'Đặc điểm']}
                      rows={[
                        ['SDR SDRAM', '168', '66-133 MHz', 'Truyền 1 lần/chu kỳ'],
                        ['DDR', '184', '200-400 MHz', 'Truyền 2 lần/chu kỳ'],
                        ['DDR2', '240', '400-1066 MHz', 'Bus cao gấp đôi DDR'],
                        ['DDR3', '240', '800-2133 MHz', 'Điện áp thấp hơn'],
                        ['DDR4', '288', '2133-4266 MHz', 'Hiệu suất cao hơn']
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Collapsible>
          </div>
        )}

        {/* BTMT Content */}
        {activeTab === 'btmt' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Bảo Trì Máy Tính (BTMT)</h2>
              <p className="text-purple-100">Ôn tập cuối kỳ - 4 tín chỉ - Được sử dụng tài liệu</p>
            </div>

            {/* Phần 1: Cấu tạo máy tính */}
            <Collapsible title="Phần 1: Cấu Tạo Máy Vi Tính" icon={<CircuitBoard className="w-5 h-5 text-purple-600" />} defaultOpen>
              <div className="space-y-6">
                {/* Mainboard */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">1.1 Mainboard (Bo mạch chủ)</h4>
                  
                  <p className="text-sm mb-3">Bảng mạch lớn nhất trong máy vi tính, liên kết và điều khiển các thành phần.</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-semibold mb-2">Các thành phần chính:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Socket/Slot CPU:</strong> Khe cắm vi xử lý</li>
                        <li><strong>Khe DIMM:</strong> Cắm RAM</li>
                        <li><strong>Chipset:</strong> Bắc cầu (NB) & Nam cầu (SB)</li>
                        <li><strong>Khe mở rộng:</strong> PCI, PCIe, AGP (cũ)</li>
                        <li><strong>BIOS/UEFI:</strong> ROM chứa chương trình khởi động</li>
                        <li><strong>CMOS + Pin:</strong> Lưu thiết lập BIOS</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Các chuẩn bus chính:</h5>
                      <Table 
                        headers={['Bus', 'Độ rộng', 'Ứng dụng']}
                        rows={[
                          ['PCI', '32/64 bit', 'Card mở rộng'],
                          ['PCIe', 'x1, x4, x8, x16', 'GPU, SSD, card mạng'],
                          ['USB', 'Serial', 'Thiết bị ngoại vi'],
                          ['SATA', 'Serial', 'HDD, SSD, ODD']
                        ]}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h5 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Thông số quan trọng khi chọn Mainboard:</h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Hỗ trợ CPU (Socket type, thế hệ)</li>
                      <li>Số lượng và loại khe RAM (DDR4, DDR5)</li>
                      <li>Tốc độ bus (FSB, HyperTransport, DMI)</li>
                      <li>Số lượng khe PCIe, M.2, SATA</li>
                      <li>Form factor (ATX, Micro-ATX, Mini-ITX)</li>
                    </ul>
                  </div>
                </div>

                {/* CPU */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">1.2 CPU (Vi xử lý)</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-semibold mb-2">Chức năng:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Thực hiện tính toán và xử lý dữ liệu</li>
                        <li>Điều khiển hoạt động hệ thống</li>
                        <li>Liên hệ qua mainboard và bus hệ thống</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Tiêu chí đánh giá:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Tốc độ xung nhịp (GHz)</li>
                        <li>Số nhân (core) và số luồng (thread)</li>
                        <li>Dung lượng Cache (L1, L2, L3)</li>
                        <li>Tập lệnh hỗ trợ (SSE, AVX, ...)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Công nghệ hiện đại:</h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li><strong>Hyper-Threading:</strong> 1 core xử lý 2 threads, tăng 15-30% hiệu suất</li>
                      <li><strong>Multicore:</strong> Nhiều core trên 1 chip, xử lý song song</li>
                      <li><strong>Turbo Boost:</strong> Tăng xung tự động khi cần</li>
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-semibold mb-2">Hệ số Ratio (Multiplier):</h5>
                    <Formula>
                      Tốc độ CPU = FSB × Ratio<br/>
                      Ví dụ: FSB = 100 MHz, Ratio = 40<br/>
                      Tốc độ CPU = 100 × 40 = 4000 MHz = 4 GHz
                    </Formula>
                  </div>
                </div>

                {/* RAM */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">1.3 Bộ Nhớ Trong (RAM)</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">SRAM (Static RAM)</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Tốc độ cao, không cần refresh</li>
                        <li>Giá thành cao</li>
                        <li>Dùng làm Cache (L1, L2, L3)</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">DRAM (Dynamic RAM)</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Cần refresh định kỳ</li>
                        <li>Giá rẻ hơn SRAM</li>
                        <li>Dùng làm RAM chính</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-semibold mb-2">Thông số quan trọng:</h5>
                    <Table 
                      headers={['Thông số', 'Mô tả', 'Ví dụ']}
                      rows={[
                        ['Dung lượng', 'Khả năng lưu trữ', '8GB, 16GB, 32GB'],
                        ['Tốc độ', 'Tần số hoạt động', '3200MHz, 3600MHz'],
                        ['Băng thông', 'Lượng dữ liệu truyền/giây', 'DDR4-3200: 25.6 GB/s'],
                        ['Latency', 'Độ trễ (CL)', 'CL16, CL18, CL22']
                      ]}
                    />
                  </div>
                </div>

                {/* PSU */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">1.4 Nguồn (PSU - Power Supply Unit)</h4>
                  
                  <p className="text-sm mb-3">Chuyển điện AC thành DC ±3.3V, ±5V, ±12V cho hệ thống.</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold mb-2">Phân loại theo Form Factor:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>ATX:</strong> Phổ biến nhất</li>
                        <li><strong>SFX:</strong> Nhỏ gọn, mini PC</li>
                        <li><strong>TFX:</strong> Dạng mỏng</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Phân loại theo hiệu suất (80 Plus):</h5>
                      <div className="flex flex-wrap gap-1">
                        <Badge>White</Badge>
                        <Badge variant="info">Bronze</Badge>
                        <Badge variant="success">Silver</Badge>
                        <Badge variant="warning">Gold</Badge>
                        <Badge>Platinum</Badge>
                        <Badge>Titanium</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-semibold mb-2">Công suất theo nhu cầu:</h5>
                    <Table 
                      headers={['Công suất', 'Nhu cầu sử dụng']}
                      rows={[
                        ['< 400W', 'Văn phòng cơ bản'],
                        ['400-700W', 'Phổ thông, gaming nhẹ'],
                        ['> 700W', 'Gaming cao cấp, workstation']
                      ]}
                    />
                  </div>
                </div>

                {/* Storage */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">1.5 Bộ Nhớ Ngoài (Storage)</h4>
                  
                  <Table 
                    headers={['Loại', 'Tốc độ', 'Độ bền', 'Giá thành', 'Ứng dụng']}
                    rows={[
                      ['HDD', 'Chậm (80-200 MB/s)', 'Cơ học, dễ hỏng', 'Rẻ', 'Lưu trữ lớn'],
                      ['SSD SATA', 'Nhanh (500 MB/s)', 'Cao', 'Trung bình', 'Hệ điều hành'],
                      ['SSD NVMe', 'Rất nhanh (3000+ MB/s)', 'Cao', 'Cao', 'Gaming, productivity'],
                      ['SSHD', 'Vừa phải', 'Trung bình', 'Vừa phải', 'Cân bằng']
                    ]}
                  />
                </div>
              </div>
            </Collapsible>

            {/* Phần 2: Lắp ráp & Tính tương thích */}
            <Collapsible title="Phần 2: Lắp Ráp & Tính Tương Thích" icon={<Wrench className="w-5 h-5 text-green-600" />}>
              <div className="space-y-6">
                {/* Tính tương thích */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">2.1 Tính Tương Thích Khi Chọn Thiết Bị</h4>
                  
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                    <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Nguyên tắc quan trọng:
                    </h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Xác định mục đích sử dụng (gaming, văn phòng, đồ họa, ...)</li>
                      <li>Tính tương thích giữa các thiết bị</li>
                      <li>Tính đồng bộ (tốc độ CPU, bus, RAM)</li>
                      <li>Khả năng nâng cấp trong tương lai</li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold mb-2">CPU ↔ Mainboard:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Socket phải khớp (LGA 1200, AM4, ...)</li>
                        <li>Chipset hỗ trợ CPU đó</li>
                        <li>BIOS version tương thích</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">RAM ↔ Mainboard:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Loại DDR khớp (DDR4, DDR5)</li>
                        <li>Tốc độ được hỗ trợ</li>
                        <li>Số lượng khe và dung lượng max</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">GPU ↔ Mainboard/PSU:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Khe PCIe (x16)</li>
                        <li>Công suất PSU đủ cho GPU</li>
                        <li>Kích thước vừa case</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">PSU ↔ Hệ thống:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Công suất đủ tổng tiêu thụ</li>
                        <li>Đủ cổng kết nối</li>
                        <li>Hiệu suất (80 Plus)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">Ví dụ cấu hình theo nhu cầu:</h5>
                    <Table 
                      headers={['Nhu cầu', 'CPU', 'RAM', 'GPU', 'PSU']}
                      rows={[
                        ['Văn phòng', 'i3/Ryzen 3', '8GB', 'Onboard', '400W'],
                        ['Gaming', 'i5/Ryzen 5', '16GB', 'RTX 4060', '600W'],
                        ['Workstation', 'i7/Ryzen 7', '32GB', 'RTX 4070', '750W']
                      ]}
                    />
                  </div>
                </div>

                {/* Quy trình lắp ráp */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">2.2 Quy Trình Lắp Ráp</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                      <div>
                        <h5 className="font-semibold">Chuẩn bị</h5>
                        <p className="text-sm">Chuẩn bị thiết bị, công cụ, đọc tài liệu hướng dẫn. Xả tĩnh điện trước khi chạm vào linh kiện.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                      <div>
                        <h5 className="font-semibold">Lắp nguồn vào case</h5>
                        <p className="text-sm">Đặt nguồn đúng vị trí, bắt vít chắc chắn.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                      <div>
                        <h5 className="font-semibold">Cài đặt CPU + tản nhiệt</h5>
                        <p className="text-sm">Nâng đòn bẩy socket, đặt CPU đúng chiều, đóng đòn bẩy. Bôi nhiệt chute, lắp quạt tản nhiệt.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                      <div>
                        <h5 className="font-semibold">Lắp RAM</h5>
                        <p className="text-sm">Mở khóa khe DIMM, cắm RAM đúng chiều, ấn đến khi khóa tự đóng.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                      <div>
                        <h5 className="font-semibold">Lắp mainboard vào case</h5>
                        <p className="text-sm">Lắp standoff, đặt mainboard, bắt vít. Kết nối dây đèn, nút nguồn, USB, audio từ case.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</div>
                      <div>
                        <h5 className="font-semibold">Lắp ổ đĩa và GPU</h5>
                        <p className="text-sm">Lắp HDD/SSD vào khoang, kết nối cáp SATA và nguồn. Lắp GPU vào khe PCIe x16.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">7</div>
                      <div>
                        <h5 className="font-semibold">Kết nối nguồn và kiểm tra</h5>
                        <p className="text-sm">Kết nối cáp nguồn 24-pin ATX, CPU 4/8-pin. Kiểm tra kỹ trước khi bật nguồn.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lưu ý quan trọng */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">2.3 Lưu Ý Quan Trọng</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">KHÔNG được làm:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Kết nối điện khi đang lắp</li>
                        <li>Chạm trực tiếp vào chip/vi mạch</li>
                        <li>Ép mạnh linh kiện</li>
                        <li>Cắm ngược chiều các chân</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">NÊN làm:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Xả tĩnh điện trước khi thao tác</li>
                        <li>Đọc kỹ tài liệu hướng dẫn</li>
                        <li>Kiểm tra tính tương thích</li>
                        <li>Làm việc trên bề mặt cách điện</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Collapsible>

            {/* Phần 3: Bảo trì */}
            <Collapsible title="Phần 3: Bảo Trì Máy Tính" icon={<Shield className="w-5 h-5 text-amber-600" />}>
              <div className="space-y-6">
                {/* Kế hoạch bảo trì */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">3.1 Kế Hoạch Bảo Dưỡng</h4>
                  
                  <Table 
                    headers={['Thành phần', 'Công việc', 'Tần suất']}
                    rows={[
                      ['Bên trong case', 'Làm vệ sinh, thổi bụi bằng khí nén', 'Hàng năm'],
                      ['CMOS Setup', 'Sao lưu thiết lập BIOS', 'Khi thay đổi'],
                      ['Ổ đĩa cứng', 'Sao lưu dữ liệu, quét virus, gom mảnh', 'Định kỳ'],
                      ['Bàn phím', 'Làm vệ sinh', 'Hàng năm'],
                      ['Mouse', 'Vệ sinh trục lăn (mouse cơ)', 'Hàng tháng'],
                      ['Monitor', 'Lau màn hình bằng vải mềm', 'Hàng tháng'],
                      ['Máy in', 'Làm sạch bụi, mảnh giấy', 'Hàng tháng']
                    ]}
                  />
                </div>

                {/* Sao lưu dữ liệu */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">3.2 Sao Lưu Dữ Liệu</h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Full Backup</h5>
                      <p className="text-sm">Sao lưu đầy đủ tất cả dữ liệu. Tốn thời gian và dung lượng nhưng khôi phục nhanh nhất.</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">Differential</h5>
                      <p className="text-sm">Sao lưu các file thay đổi từ lần full backup gần nhất. Trung gian về thời gian và dung lượng.</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Incremental</h5>
                      <p className="text-sm">Sao lưu file thay đổi từ lần backup gần nhất (bất kỳ loại nào). Nhanh nhất nhưng khôi phục phức tạp.</p>
                    </div>
                  </div>
                </div>

                {/* Phòng chống virus */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">3.3 Phòng Chống Virus & Sự Cố</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-semibold mb-2">Các loại mã độc:</h5>
                    <Table 
                      headers={['Loại', 'Đặc điểm', 'Cách lây lan']}
                      rows={[
                        ['Virus', 'Bám vào file/chương trình khác', 'File thực thi, boot sector'],
                        ['Worm', 'Tự lây lan qua mạng', 'Email, lỗ hổng mạng'],
                        ['Trojan', 'Không tự lây lan', 'Phần mềm crack, game lậu'],
                        ['Spyware', 'Ăn cắp thông tin', 'Kèm theo phần mềm miễn phí'],
                        ['Ransomware', 'Mã hóa dữ liệu, đòi tiền chuộc', 'Email, website độc']
                      ]}
                    />
                  </div>

                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h5 className="font-semibold text-red-800 dark:text-red-200 mb-2">Dấu hiệu nhiễm virus:</h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Chương trình nạp lâu, file biến mất hoặc xuất hiện lạ</li>
                      <li>Dung lượng đĩa giảm, đèn HDD sáng liên tục</li>
                      <li>Máy chạy chậm, xuất hiện cửa sổ quảng cáo</li>
                      <li>Thông báo từ phần mềm diệt virus</li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">Biện pháp phòng chống:</h5>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Cài và cập nhật phần mềm diệt virus</li>
                      <li>Không mở email/link/file không rõ nguồn gốc</li>
                      <li>Cập nhật hệ điều hành và phần mềm</li>
                      <li>Sao lưu dữ liệu định kỳ</li>
                      <li>Sử dụng Safe Mode khi cần xử lý</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Collapsible>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-border mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Ôn Tập Cuối Kỳ - Kiến Trúc Máy Tính & Bảo Trì Máy Tính | 4 Tín Chỉ</p>
          <p className="mt-1">Được sử dụng tài liệu khi làm bài</p>
        </div>
      </footer>
    </div>
  )
}
