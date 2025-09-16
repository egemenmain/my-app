import { promises as fs } from 'fs';
import path from 'path';
import HeroSection from '@/components/home/hero-section';
import AnnouncementsSection from '@/components/home/announcements-section';
import SystemStatus from '@/components/home/system-status';

export default async function Home() {
  // Duyuruları oku
  const announcementsPath = path.join(process.cwd(), 'data', 'duyurular.json');
  const announcementsData = await fs.readFile(announcementsPath, 'utf8');
  const announcements = JSON.parse(announcementsData);

  // Sistem durumları (demo veri)
  const systems = [
    {
      name: "Ödeme Sistemi",
      status: "online" as const,
      lastUpdate: "14.12.2024 15:30"
    },
    {
      name: "Randevu Sistemi",
      status: "online" as const,
      lastUpdate: "14.12.2024 15:25"
    },
    {
      name: "Destek Sistemi",
      status: "online" as const,
      lastUpdate: "14.12.2024 15:20"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <AnnouncementsSection announcements={announcements} />
      <SystemStatus systems={systems} />
    </div>
  );
}
