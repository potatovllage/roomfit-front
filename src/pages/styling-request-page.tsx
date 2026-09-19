import { useRef, useState } from "react";
import { Camera, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCreateDesignMutation, useThemesQuery } from "@/api/roomfit";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRoomfitStore } from "@/stores/roomfit-store";

const formatWon = (value: number) =>
  `${new Intl.NumberFormat("ko-KR").format(value)}원`;

const themeColors: Record<string, string> = {
  modern_dark: "bg-[#8E99A8]",
  modern_light: "bg-[#8E99A8]",
  minimal: "border border-[#D7D2C9] bg-[#F2F0EB]",
  vintage: "bg-[#B57B50]",
  scandinavian: "bg-[#DCC69D]",
  industrial: "bg-[#5B5B5B]",
  warm_natural: "bg-[#C69061]",
  custom: "bg-[#2D2D2D]",
};

const sources = [
  {
    id: "ikea",
    label: "이케아",
    image: "/figma-assets/ikea.png",
    imageClass: "w-11",
  },
  {
    id: "ohouse",
    label: "오늘의 집",
    image: "/figma-assets/ohouse.png",
    imageClass: "size-4",
  },
  {
    id: "barahouse",
    label: "바라하우스",
    image: "/figma-assets/barahouse.png",
    imageClass: "h-4 w-7",
  },
  {
    id: "someanddeco",
    label: "썸앤데코",
    image: "/figma-assets/someanddeco.png",
    imageClass: "size-4",
  },
];

export function StylingRequestPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const {
    imageFile,
    imagePreviewUrl,
    style,
    budget,
    request,
    setImage,
    setStyle,
    setBudget,
    setRequest,
    setStatus,
    setError,
    setDesignId,
  } = useRoomfitStore();
  const themesQuery = useThemesQuery();
  const createDesign = useCreateDesignMutation();

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (imagePreviewUrl?.startsWith("blob:"))
      URL.revokeObjectURL(imagePreviewUrl);
    setImage(file, URL.createObjectURL(file));
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources((current) =>
      current.includes(sourceId)
        ? current.filter((id) => id !== sourceId)
        : [...current, sourceId],
    );
  };

  const createSuggestion = () => {
    if (!style) return setError("원하는 스타일을 선택해 주세요.");
    if (!imageFile) return setError("방 사진을 먼저 업로드해 주세요.");

    setError(null);
    setStatus("generating");
    createDesign.mutate(
      { image: imageFile, theme: style, maxAmount: budget, prompt: request },
      {
        onSuccess: (job) => {
          setDesignId(job.design_id);
          navigate("/results");
        },
        onError: (error) => {
          setStatus("failed");
          setError(
            error instanceof Error
              ? error.message
              : "배치 요청에 실패했습니다.",
          );
        },
      },
    );
  };

  const requestError = useRoomfitStore((state) => state.error);
  const isSubmitting = createDesign.isPending;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#171717]">
      <header className="relative z-20 h-[84px] border-b border-[#e0e0e0] bg-white">
        <div className="mx-auto flex h-full max-w-[1680px] items-center justify-between px-5 sm:px-10 lg:px-[120px]">
          <span className="text-lg font-bold tracking-[-0.05em]">룸핏</span>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="h-auto rounded-lg bg-[#171717] px-5 py-3 text-sm font-medium hover:bg-[#303030]"
          >
            인테리어 시작하기
          </Button>
        </div>
      </header>

      <section className="relative flex h-[334px] items-start justify-center overflow-hidden bg-[#282828] pt-20 text-center sm:pt-[86px]">
        <div className="absolute -left-52 top-7 size-[520px] rounded-full bg-white/80 blur-[95px]" />
        <div className="absolute -right-52 -top-80 size-[720px] rounded-full bg-white/75 blur-[105px]" />
        <h1 className="relative z-10 text-[clamp(30px,3.2vw,48px)] leading-[1.38] tracking-[-0.055em] text-white">
          <span className="block font-light">느낌 좋은 인테리어부터</span>
          <strong className="font-extrabold">
            흩어져 있는 가구 최저가까지
          </strong>
        </h1>
      </section>

      <section className="relative z-10 mx-auto -mt-[42px] max-w-[1200px] px-5 pb-16 sm:px-8 lg:px-0 lg:pb-24">
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files[0]);
          }}
          role="button"
          tabIndex={0}
          className="flex h-[260px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-[1.5px] border-dashed border-[#d8d8d8] bg-white shadow-[0_2px_8px_rgba(31,36,33,.08)] transition-colors hover:border-[#171717] sm:h-[361px]"
        >
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="업로드한 방 미리보기"
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              <Camera className="mb-3 size-12 stroke-[1.8]" />
              <p className="text-sm font-semibold">
                클릭하거나 파일을 끌어다 놓아주세요
              </p>
              <p className="mt-2 text-xs text-[#5e5e5e]">
                JPG, PNG, WebP · 최대 20MB
              </p>
              <Button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-7 h-auto rounded-lg bg-[#171717] px-6 py-3 text-sm font-medium hover:bg-[#0EA5A0]"
              >
                <Upload className="size-4" />
                파일 선택하기
              </Button>
            </>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-[#5e5e5e]">
          방 전체가 잘 보이는 사진일수록 배치 제안 정확도가 올라가요
        </p>

        <div className="mt-8 space-y-7">
          <div>
            <h2 className="mb-4 text-sm font-bold">분위기</h2>
            <div className="flex flex-wrap gap-3">
              {themesQuery.isPending && (
                <p className="text-sm text-[#777]">
                  스타일을 불러오는 중이에요.
                </p>
              )}
              {themesQuery.isError && (
                <p className="text-sm text-red-600">
                  스타일 목록을 불러오지 못했습니다.
                </p>
              )}
              {themesQuery.data?.map((theme) => (
                <button
                  key={theme.code}
                  type="button"
                  title={theme.description}
                  onClick={() => setStyle(theme.code)}
                  style={
                    style === theme.code
                      ? { borderColor: "#171717" }
                      : undefined
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-[15px] font-medium transition",
                    style === theme.code
                      ? "border-2 border-[#171717] px-[15px] py-[11px] font-bold"
                      : "border-[#e0e0e0] hover:border-[#171717]",
                  )}
                >
                  <span
                    className={cn(
                      "size-3.5 rounded-full",
                      themeColors[theme.code] ?? "bg-[#8e99a8]",
                    )}
                  />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold">출처</h2>
            <div className="flex flex-wrap gap-3">
              {sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  aria-pressed={selectedSources.includes(source.id)}
                  onClick={() => toggleSource(source.id)}
                  style={
                    selectedSources.includes(source.id)
                      ? { borderColor: "#171717" }
                      : undefined
                  }
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-xl border bg-white px-4 text-[15px] font-medium transition",
                    selectedSources.includes(source.id)
                      ? "border-2 border-[#171717] px-[15px]"
                      : "border-[#171717] hover:border-[#171717]",
                  )}
                >
                  <img
                    src={source.image}
                    alt=""
                    className={cn("object-contain", source.imageClass)}
                  />
                  {source.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-bold">예산 설정</h2>
            <Slider
              value={[budget]}
              min={100000}
              max={10000000}
              step={50000}
              onValueChange={([value]) => setBudget(value)}
              className="[&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-[#171717] [&_[data-slot=slider-range]]:bg-[#171717]"
            />
            <p className="mt-3 text-sm font-medium text-[#454545]">
              {formatWon(budget)}까지
            </p>
          </div>

          <div>
            <Textarea
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              placeholder="예: 창가 쪽에 식물이랑 러그 놓고 싶어요"
              className="min-h-40 resize-none rounded-lg border-[#e0e0e0] p-4 text-sm shadow-none focus-visible:border-[#171717] focus-visible:ring-[#171717]/20 sm:min-h-[236px]"
            />
            <p className="mt-3 text-xs text-[#5e5e5e]">
              추가로 원하는 스타일이 있다면 자유롭게 적어주세요 (선택)
            </p>
          </div>
        </div>

        {requestError && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {requestError}
          </p>
        )}
        <Button
          onClick={createSuggestion}
          disabled={isSubmitting}
          className="mt-7 h-[62px] w-full rounded-xl bg-[linear-gradient(3deg,#000_15%,#333_85%)] text-lg font-bold shadow-[0_8px_20px_rgba(0,0,0,.30)] hover:bg-[#303030]"
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ImagePlus className="size-[22px]" />
          )}
          {isSubmitting ? "AI 배치안을 요청하고 있어요" : "AI 배치 제안 받기"}
        </Button>
        <p className="mt-4 text-center text-[13px] text-[#5e5e5e]">
          약 15초 안에 3가지 배치안을 받아보세요
        </p>
      </section>
    </main>
  );
}
