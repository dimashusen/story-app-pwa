# 📱 Panduan Fitur Upload Offline

## Fitur yang Sudah Diimplementasikan

### ✅ 1. Label Accessibility
- Semua label form sudah terasosiasi dengan benar ke input elements
- Map picker menggunakan `<p>` dengan `aria-labelledby` untuk accessibility
- Memenuhi standar WCAG untuk form accessibility

### ✅ 2. Offline Story Upload
- Cerita bisa dibuat saat mode offline
- Cerita disimpan di IndexedDB dengan status "pending"
- Background Sync API untuk auto-upload saat online kembali
- Notifikasi push saat upload berhasil

## Cara Testing Fitur Offline Upload

### Metode 1: Menggunakan DevTools (Recommended)
1. Buka aplikasi di browser (Chrome/Edge)
2. Tekan `F12` untuk membuka DevTools
3. Pergi ke tab **Network**
4. Centang checkbox **Offline** di bagian atas
5. Coba buat cerita baru di halaman Add Story
6. Cerita akan tersimpan dengan badge "⏳ Menunggu Upload"
7. Uncheck **Offline** untuk kembali online
8. Tunggu beberapa detik, cerita akan otomatis terupload
9. Anda akan menerima notifikasi "Upload Berhasil! 🎉"

### Metode 2: Matikan WiFi/Internet
1. Matikan koneksi internet di komputer Anda
2. Buat cerita baru
3. Cerita akan tersimpan lokal
4. Nyalakan kembali internet
5. Cerita akan otomatis terupload

### Metode 3: Trigger Manual Sync (DevTools)
1. Buat cerita saat offline (menggunakan metode 1 atau 2)
2. Buka DevTools > Application > Service Workers
3. Klik tombol **Sync** dan masukkan tag: `sync-pending-stories`
4. Cerita akan langsung diupload

## Alur Kerja Fitur

```
User membuat cerita
    ↓
Cek: Apakah online?
    ↓
┌─────────────────┬─────────────────┐
│   OFFLINE       │     ONLINE      │
├─────────────────┼─────────────────┤
│ 1. Convert foto │ 1. Upload       │
│    ke base64    │    langsung     │
│ 2. Simpan ke    │ 2. Redirect     │
│    IndexedDB    │    ke home      │
│ 3. Register     │                 │
│    sync event   │                 │
│ 4. Tampilkan    │                 │
│    di beranda   │                 │
│    dengan badge │                 │
└─────────────────┴─────────────────┘
         ↓
    Saat online kembali
         ↓
    Background Sync triggered
         ↓
    Upload semua pending stories
         ↓
    Kirim notifikasi sukses
         ↓
    Hapus dari IndexedDB
```

## Komponen yang Terlibat

### 1. **pending-stories-db.js**
- Helper untuk operasi IndexedDB
- Menyimpan, mengambil, dan menghapus pending stories

### 2. **sw.js (Service Worker)**
- Menangani Background Sync event
- Upload pending stories ke server
- Mengirim notifikasi push

### 3. **add-page.js**
- Deteksi mode offline
- Convert foto ke base64
- Simpan ke IndexedDB
- Register sync event

### 4. **home-page.js**
- Menampilkan pending stories dengan badge
- Membedakan pending vs published stories

## Browser Support

✅ **Didukung:**
- Chrome/Edge (Desktop & Mobile)
- Opera
- Samsung Internet

⚠️ **Tidak Didukung:**
- Safari (Background Sync API belum tersedia)
- Firefox (Background Sync masih experimental)

Untuk browser yang tidak support, cerita tetap tersimpan di IndexedDB dan bisa diupload manual dengan refresh halaman saat online.

## Troubleshooting

### Cerita tidak terupload otomatis?
1. Pastikan Service Worker aktif (cek di DevTools > Application > Service Workers)
2. Coba trigger manual sync di DevTools
3. Refresh halaman saat sudah online

### Notifikasi tidak muncul?
1. Pastikan izin notifikasi sudah diberikan
2. Cek apakah browser mendukung Push API
3. Pastikan Service Worker sudah registered

### Pending stories tidak muncul di beranda?
1. Refresh halaman
2. Cek IndexedDB di DevTools > Application > IndexedDB > storyverse-pending-db
3. Pastikan ada data di object store "pending-stories"

