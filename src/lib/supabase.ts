import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 检查 Supabase 是否配置
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// 创建 Supabase 客户端（仅在配置了环境变量时）
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  if (!_supabase) {
    _supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  }
  
  return _supabase;
}

// 兼容旧代码的导出（可能为 null）
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;

// Storage bucket 名称
export const MOOD_IMAGES_BUCKET = "mood-images";

// 上传图片到 Supabase Storage
export async function uploadImage(file: File): Promise<string | null> {
  const client = getSupabase();
  if (!client) {
    console.log("Supabase 未配置，跳过图片上传");
    return null;
  }
  
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await client.storage
    .from(MOOD_IMAGES_BUCKET)
    .upload(filePath, file);

  if (error) {
    console.error("图片上传失败:", error);
    return null;
  }

  // 获取公开 URL
  const { data } = client.storage
    .from(MOOD_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// 从 Blob URL 上传图片
export async function uploadImageFromBlobUrl(
  blobUrl: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    // Supabase 未配置时，返回 null（将使用本地 blob URL）
    return null;
  }
  
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const file = new File([blob], `mood-${Date.now()}.jpg`, {
      type: blob.type || "image/jpeg",
    });
    return uploadImage(file);
  } catch (error) {
    console.error("从 Blob URL 上传图片失败:", error);
    return null;
  }
}

// 数据库类型定义
export interface DbSchedule {
  id: string;
  date: string;
  content: string;
  completed: boolean;
  created_at: string;
  start_time: string | null;
  end_time: string | null;
  user_id: string;
}

export interface DbMoodRecord {
  id: string;
  image_url: string;
  timestamp: string;
  emoji: string;
  note: string | null;
  user_id: string;
}

export interface DbDailyNote {
  id: string;
  date: string;
  content: string;
  updated_at: string;
  user_id: string;
}
