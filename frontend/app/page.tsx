import { Button } from "@/components/ui/button";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Chia sẻ nội dung",
    description:
      "Đăng bài, cập nhật hoạt động và giữ kết nối với cộng đồng PTIT.",
    icon: MessageSquare,
  },
  {
    title: "Tài liệu học tập",
    description:
      "Tìm kiếm tài liệu, kinh nghiệm và hỗ trợ từ các bạn cùng khóa.",
    icon: BookOpen,
  },
  {
    title: "Bảo mật và tin cậy",
    description: "Trải nghiệm nền tảng an toàn, sạch và tối ưu cho sinh viên.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.16),_transparent_32%),linear-gradient(135deg,_#fff7f7_0%,_#ffffff_58%,_#fef2f2_100%)] text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-wrap items-center justify-between rounded-full border border-red-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-bold text-white">
              PT
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">AntiPtit</p>
              <p className="text-xs text-slate-500">Community Hub</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-red-600">
              Tính năng
            </a>
            <a href="#about" className="transition hover:text-red-600">
              Về AntiPTIT
            </a>
            <a href="#contact" className="transition hover:text-red-600">
              Liên hệ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Show when="signed-in">
              <UserButton afterSwitchSessionUrl="/" />
            </Show>

            <Show when="signed-out">
              <Button
                variant="outline"
                className="border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                <Link href={"/login"}>Đăng nhập</Link>
              </Button>

              <Button className="bg-red-600 text-white hover:bg-red-700">
                <Link href={"/register"}>Đăng ký</Link>
              </Button>
            </Show>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Cộng đồng PTIT hiện đại, kết nối và sáng tạo
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Kết nối <span className="text-red-600">sinh viên</span> và các
              hoạt động tại PTIT
            </h1>

            <p className="max-w-xl text-lg text-slate-600">
              Khám phá tin tức, chia sẻ câu chuyện, tìm kiếm cộng đồng và tham
              gia những hoạt động học tập hiệu quả trong một nền tảng duy nhất.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-red-600 px-5 text-white hover:bg-red-700">
                <Link href={"/login"} className="flex items-center">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-50"
              >
                Khám phá tính năng
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-red-500" />
                1000+ thành viên đang hoạt động
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-red-500" />
                Giao diện hiện đại và thân thiện
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-red-100 bg-white p-5 shadow-[0_25px_80px_-25px_rgba(220,38,38,0.35)]">
            <div className="rounded-[1.25rem] bg-gradient-to-br from-red-600 via-red-500 to-red-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-100">
                    Nền tảng mới
                  </p>
                  <p className="text-xl font-semibold">AntiPTIT</p>
                </div>
                <div className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  Live
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm text-red-50">Tin tức mới</p>
                  <p className="mt-1 font-semibold">
                    Sự kiện sinh viên PTIT đang diễn ra
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm text-red-50">Cộng đồng</p>
                  <p className="mt-1 font-semibold">
                    Kết nối cùng những người cùng đam mê
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm text-red-50">Tài nguyên</p>
                  <p className="mt-1 font-semibold">
                    Tìm ngay tài liệu và kinh nghiệm học tập
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-[1.5rem] border border-red-100 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </section>

        <section
          id="about"
          className="mt-16 rounded-[2rem] border border-red-100 bg-gradient-to-r from-red-600 to-red-700 p-8 text-white shadow-lg"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-100">
                Về AntiPTIT
              </p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Một nơi để học tập, kết nối và phát triển cùng PTIT.
              </h2>
            </div>
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              Tìm hiểu thêm
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
