# Ôn Tập Kiến Trúc Máy Tính & Bảo Trì Máy Tính

> Trang web ôn tập cuối kỳ cho môn **Kiến Trúc Máy Tính (KTMT)** và **Bảo Trì Máy Tính (BTMT)** — 4 tín chỉ.
> Được sử dụng tài liệu khi làm bài thi.

## 🎯 Giới thiệu

Đây là trang web tĩnh (static web) được xây dựng bằng **HTML, CSS và JavaScript thuần** (không sử dụng framework), giúp ôn tập đầy đủ và trực quan kiến thức hai môn KTMT & BTMT.

## 📁 Cấu trúc dự án

```
kien_truc_may_tinh_on_tap/
├── index.html         # File HTML chính chứa toàn bộ nội dung
├── css/
│   └── style.css      # Toàn bộ CSS giao diện
├── js/
│   └── script.js      # JavaScript: tương tác & công cụ tính toán
└── README.md
```

## 🚀 Cách chạy

### Cách 1: Mở trực tiếp
Mở file `index.html` bằng trình duyệt (Chrome, Firefox, Edge, ...).

### Cách 2: Chạy qua HTTP server (khuyến nghị)
```bash
# Python
python3 -m http.server 8080

# Hoặc Node.js
npx serve

# Sau đó mở trình duyệt: http://localhost:8080
```

## 📚 Nội dung ôn tập

### 🔵 KTMT (Kiến Trúc Máy Tính)

**Chương 1: Số Học Máy Tính**
- Hệ nhị phân, hệ cơ số 16 (hex)
- Biểu diễn số nguyên (có dấu/không dấu, bù 2, Big/Little Endian)
- Biểu diễn số thực theo IEEE 754-1985
- Mã phát hiện & sửa lỗi: Parity, CRC, Hamming

**Chương 2: Tổng Quan Về Máy Tính**
- Nguyên lý Von Neumann
- Phân loại kiến trúc Flynn (SISD, SIMD, MISD, MIMD)
- Bus hệ thống (địa chỉ, dữ liệu, điều khiển)
- Lịch sử phát triển máy tính

**Chương 3: Tổ Chức Hệ Vi Xử Lý 8088**
- Sơ đồ cấu trúc: BIU (Bus Interface Unit) & EU (Execution Unit)
- Các thanh ghi: đa năng (AX, BX, CX, DX), đoạn (CS, DS, SS, ES), con trỏ (IP, SP, BP, SI, DI), cờ FR
- Chế độ địa chỉ: Segment:Offset
- Tập lệnh 8088 (6 nhóm)

**Chương 4: Kỹ Thuật Ống Dẫn & Bộ Nhớ**
- Pipeline (kỹ thuật ống dẫn) - hazards & giải pháp
- Bộ nhớ Cache (L1, L2, L3, nguyên lý locality)
- ROM & RAM (các loại DRAM: SDR, DDR, DDR2, DDR3, DDR4, DDR5)

### 🟣 BTMT (Bảo Trì Máy Tính)

**Phần 1: Cấu Tạo Máy Vi Tính**
- Mainboard (các thành phần, chuẩn bus)
- CPU (chức năng, công nghệ HT, multicore)
- RAM (SRAM, DRAM, thông số)
- PSU (phân loại, chuẩn 80 Plus)
- Storage (HDD, SSD, NVMe)

**Phần 2: Lắp Ráp & Tính Tương Thích**
- Nguyên tắc chọn thiết bị tương thích
- Quy trình lắp ráp 8 bước
- Thiết lập BIOS & định dạng file hệ thống
- Beep code BIOS

**Phần 3: Bảo Trì Máy Tính**
- Kế hoạch bảo dưỡng định kỳ
- Sao lưu dữ liệu (Full, Differential, Incremental)
- Windows Registry
- Phòng chống virus & sự cố máy tính
- Chế độ Safe Mode, Stop Message (BSOD)

## 🧮 Công cụ tính toán tích hợp

Trang web có các công cụ tính toán trực tiếp trong trình duyệt:

1. **Chuyển đổi số** - Decimal ↔ Binary ↔ Hex
2. **IEEE 754 Single Precision** - Chuyển số thực sang binary 32 bit
3. **Mã CRC** - Tính CRC cho dữ liệu + đa thức sinh
4. **Mã Hamming** - Tính mã Hamming cho m bit dữ liệu
5. **Địa chỉ vật lý 8088** - Tính Segment × 16 + Offset
6. **PSU Calculator** - Tính công suất nguồn khuyến nghị

## 🎨 Tính năng giao diện

- ✅ Responsive (mobile, tablet, desktop)
- ✅ Dark/Light theme tự theo hệ điều hành
- ✅ Collapsible chapters
- ✅ Quick navigation
- ✅ Back to top button
- ✅ Smooth scroll
- ✅ Animations & transitions
- ✅ Print friendly

## 🛠 Công nghệ sử dụng

- **HTML5** - Cấu trúc trang
- **CSS3** - Giao diện (Flexbox, Grid, CSS Variables, Animations)
- **Vanilla JavaScript** - Tương tác và tính toán (ES6+)
- **Google Fonts** - Inter & JetBrains Mono
- **SVG Icons** - Inline SVG (không cần thư viện)

Không sử dụng framework, không cần build, không cần cài đặt dependencies.

## 📝 Tác giả

Trang web được tạo để hỗ trợ ôn tập cuối kỳ môn KTMT & BTMT.

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa.
