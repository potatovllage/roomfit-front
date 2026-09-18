import { useRef } from "react";
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

export function StylingRequestPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    <main className="min-h-screen bg-white px-5 py-12 text-[#171717] sm:px-8 lg:py-20">
      <section className="mx-auto max-w-[1280px]">
        <h1 className="mb-9 text-3xl font-bold tracking-[-0.04em]">
          어떤 공간을 스타일링할까요?
        </h1>
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
          className="flex h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8d8d8] bg-[#f7f7f7] transition-colors hover:border-[#171717] hover:bg-[#f0f0f0] sm:h-[385px]"
        >
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="업로드한 방 미리보기"
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <>
              <Camera className="mb-4 size-10 stroke-[2]" />
              <p className="text-sm font-medium">
                클릭하거나 파일을 끌어다 놓아주세요
              </p>
              <p className="mt-2 text-xs text-[#777]">
                JPG, PNG, WebP · 최대 20MB
              </p>
              <Button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-8 h-auto rounded-lg bg-[#171717] px-6 py-3 text-sm font-medium text-white hover:bg-[#0EA5A0]"
              >
                <Upload />
                파일 선택하기
              </Button>
            </>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-[#777]">
          방 전체가 잘 보이는 사진일수록 배치 제안 정확도가 올라가요
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {themesQuery.isPending && (
            <p className="text-sm text-[#777]">스타일을 불러오는 중이에요.</p>
          )}
          {themesQuery.data?.map((theme) => (
            <button
              key={theme.code}
              type="button"
              title={theme.description}
              onClick={() => setStyle(theme.code)}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-medium transition",
                style === theme.code
                  ? "border-[#171717] bg-[#171717] text-white shadow-sm"
                  : "border-[#e0e0e0] bg-white text-[#454545] hover:border-[#171717]",
              )}
            >
              {theme.name}
            </button>
          ))}
        </div>
        <div className="mt-8">
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
        <div className="mt-8">
          <Textarea
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="예: 창가 쪽에 식물이랑 러그 놓고 싶어요"
            className="min-h-40 resize-none rounded-xl border-[#e0e0e0] p-5 text-base shadow-none focus-visible:border-[#171717] focus-visible:ring-[#171717]/20"
          />
          <p className="mt-2 text-xs text-[#777]">
            추가로 원하는 스타일이 있다면 자유롭게 적어주세요 (선택)
          </p>
        </div>
        {requestError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {requestError}
          </p>
        )}
        <Button
          onClick={createSuggestion}
          disabled={isSubmitting}
          className="mt-4 h-[68px] w-full rounded-xl bg-[#171717] text-base font-bold shadow-[0_8px_16px_rgba(23,23,23,.16)] hover:bg-[#303030]"
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ImagePlus />
          )}
          {isSubmitting ? "AI 배치안을 요청하고 있어요" : "AI 배치 제안 받기"}
        </Button>
        <p className="mt-3 text-center text-xs text-[#777]">
          약 15초 안에 가구 배치안을 받아보세요
        </p>
      </section>
    </main>
  );
}
