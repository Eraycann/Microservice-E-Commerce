import { apiClient } from '@/lib/axios'

export interface Brand {
  id: string // Admin panelinde string kullanmıştık, uyumlu olsun
  name: string
  slug?: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  active: boolean
}

// Admin paneli için
export interface BrandCreateRequest {
  name: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  active?: boolean
}

export const brandService = {
  // Tüm markaları getir
  getAllBrands: async () => (await apiClient.get<Brand[]>('/api/v1/brands')).data,
  
  // Tek marka getir
  getBrandById: async (id: string) => (await apiClient.get<Brand>(`/api/v1/brands/${id}`)).data,
  
  // Popüler markaları getir (Limitli)
  getTopBrands: async (limit: number = 8) => {
    // Backend'de özel endpoint yoksa hepsini çekip kesiyoruz
    const response = await apiClient.get<Brand[]>('/api/v1/brands')
    const brands = response.data
    return brands.slice(0, limit)
  },

  // Admin metodları
  createBrand: async (data: BrandCreateRequest) => (await apiClient.post<Brand>('/api/v1/brands', data)).data,
  updateBrand: async (id: string, data: Partial<BrandCreateRequest>) => (await apiClient.put<Brand>(`/api/v1/brands/${id}`, data)).data,
  deleteBrand: async (id: string) => (await apiClient.delete(`/api/v1/brands/${id}`)).data
}