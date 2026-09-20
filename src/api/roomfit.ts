import { useMutation, useQuery } from "@tanstack/react-query";

const apiBaseUrl = "https://circle-extend-felt-optimize.trycloudflare.com";
const accessToken = import.meta.env.VITE_ROOMFIT_API_TOKEN;

export interface Theme {
  code: string;
  name: string;
  description: string;
  preview_image_url: string;
}

interface ThemeListResponse {
  themes: Theme[];
}

export interface FurnitureItem {
  product_id: string;
  name: string;
  category: string;
  brand: string | null;
  merchant: string;
  image_url: string;
  shopping_url: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  currency: "KRW";
  availability: "in_stock" | "out_of_stock" | "unknown";
  match_type: "exact" | "similar";
  placement_reason: string;
  placement: {
    center_x: number;
    center_y: number;
    width: number;
    height: number;
    rotation_degrees: number;
  };
}

export interface DesignJob {
  design_id: string;
  status:
    | "queued"
    | "analyzing"
    | "selecting_products"
    | "rendering"
    | "succeeded"
    | "failed";
  progress: number;
  poll_after_ms: number | null;
  result: {
    summary: string;
    rendered_image: {
      url: string;
      width: number;
      height: number;
      expires_at: string;
    };
    budget: {
      estimated_furniture_total: number;
      requested_max_amount: number;
      within_budget: boolean;
    };
    furniture_items: FurnitureItem[];
    warnings: string[];
  } | null;
  error: { code: string; message: string; retryable: boolean } | null;
}

interface DesignJobAccepted {
  design_id: string;
  status: "queued";
  progress: 0;
  poll_after_ms: number;
}

export interface CreateDesignInput {
  image: File;
  theme: string;
  maxAmount: number;
  prompt?: string;
  sources?: string[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (response.ok) return response.json() as Promise<T>;

  const body = await response.json().catch(() => null);
  throw new Error(
    body?.error?.message ?? `API 요청에 실패했습니다. (${response.status})`,
  );
}

export const roomfitQueryKeys = {
  themes: ["roomfit", "themes"] as const,
  design: (designId: string) => ["roomfit", "design", designId] as const,
};

export function useThemesQuery() {
  return useQuery({
    queryKey: roomfitQueryKeys.themes,
    queryFn: () => request<ThemeListResponse>("/api/v1/themes"),
    select: (response) => response.themes,
    staleTime: 1000 * 60 * 30,
  });
}

export function useCreateDesignMutation() {
  return useMutation({
    mutationFn: async ({
      image,
      theme,
      maxAmount,
      prompt,
      sources,
    }: CreateDesignInput) => {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("theme", theme);
      formData.append("max_amount", String(maxAmount));
      formData.append("currency", "KRW");
      formData.append("min_amount", "0");
      formData.append("preserve_existing_furniture", "true");
      formData.append("exclude_out_of_stock", "true");
      if (prompt?.trim()) formData.append("prompt", prompt.trim());
      sources?.forEach((source) => formData.append("sources", source));

      return request<DesignJobAccepted>("/api/v1/designs", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: formData,
      });
    },
  });
}

export function useDesignJobQuery(designId: string | null) {
  return useQuery({
    queryKey: roomfitQueryKeys.design(designId ?? ""),
    queryFn: () => request<DesignJob>(`/api/v1/designs/${designId}`),
    enabled: Boolean(designId),
    refetchInterval: (query) => {
      const job = query.state.data;
      if (!job || job.status === "succeeded" || job.status === "failed")
        return false;
      return job.poll_after_ms ?? 5000;
    },
  });
}
