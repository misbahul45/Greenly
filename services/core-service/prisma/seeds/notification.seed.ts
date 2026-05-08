import { PrismaClient } from '../../generated/prisma/client'

export async function seedNotifications(prisma: PrismaClient, userIds: Record<string, string>) {
  const allUserIds = Object.values(userIds)

  const notificationTemplates = [
    { title: 'Pesanan Dikonfirmasi', message: 'Pesanan Anda telah dikonfirmasi dan sedang diproses oleh penjual.', isRead: true },
    { title: 'Pesanan Dikirim', message: 'Pesanan Anda sedang dalam perjalanan. Estimasi tiba 2-3 hari kerja.', isRead: true },
    { title: 'Pesanan Selesai', message: 'Pesanan Anda telah selesai. Jangan lupa berikan ulasan!', isRead: false },
    { title: 'Promo Spesial Untukmu', message: 'Dapatkan diskon 20% untuk pembelian berikutnya dengan kode FLASH20.', isRead: false },
    { title: 'Pembayaran Berhasil', message: 'Pembayaran Anda sebesar Rp 650.000 telah berhasil diproses.', isRead: true },
    { title: 'Toko Baru Mengikutimu', message: 'Fashion Store Bandung kini tersedia di platform kami. Cek koleksi terbarunya!', isRead: false },
    { title: 'Flash Sale Dimulai', message: 'Flash sale 24 jam dimulai sekarang! Diskon hingga 50% untuk produk pilihan.', isRead: false },
    { title: 'Verifikasi Email Berhasil', message: 'Email Anda telah berhasil diverifikasi. Selamat berbelanja!', isRead: true },
    { title: 'Pengingat Keranjang', message: 'Anda memiliki item di keranjang yang belum di-checkout. Selesaikan pembelian Anda!', isRead: false },
    { title: 'Poin Reward Ditambahkan', message: 'Selamat! 500 poin reward telah ditambahkan ke akun Anda.', isRead: false },
    { title: 'Pesanan Dibatalkan', message: 'Pesanan Anda telah dibatalkan. Dana akan dikembalikan dalam 1-3 hari kerja.', isRead: true },
    { title: 'Update Keamanan Akun', message: 'Kami mendeteksi login baru dari perangkat yang tidak dikenal. Amankan akun Anda.', isRead: false },
  ]

  for (const userId of allUserIds) {
    const count = Math.floor(Math.random() * 4) + 2
    const shuffled = [...notificationTemplates].sort(() => Math.random() - 0.5)

    for (let i = 0; i < count; i++) {
      const tpl = shuffled[i % shuffled.length]
      await prisma.notification.create({
        data: {
          userId,
          title: tpl.title,
          message: tpl.message,
          isRead: tpl.isRead,
        },
      })
    }
  }

  console.log('✅ Notifications Seeded Successfully')
}
