/**
 * UserProfileForm Bileşeni
 * 
 * Kullanıcı profil bilgilerini düzenleme formu
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { userService } from '@/services/userService'
import { 
  User, 
  UpdateUserProfileRequest 
} from '@/types/user'
import { 
  Save, 
  Loader2, 
  User as UserIcon,
  Phone,
  Mail
} from 'lucide-react'

interface UserProfileFormProps {
  user: User
  onSuccess?: (updatedUser: User) => void
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  user,
  onSuccess
}) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber || '',
    taxNumber: user.taxNumber || '',
    username: user.username,
    email: user.email
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Profil güncelleme mutation'ı
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => userService.updateUserProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', 'profile'], updatedUser)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      onSuccess?.(updatedUser)
      setErrors({})
    },
    onError: (error: any) => {
      console.error('[UserProfileForm] Profil güncelleme hatası:', error)
      
      // API'den gelen validation hatalarını işle
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: 'Profil güncellenirken bir hata oluştu' })
      }
    }
  })

  // Form değişikliklerini işle
  const handleInputChange = (field: keyof UpdateUserProfileRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Form validasyonu
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Ad alanı zorunludur'
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Soyad alanı zorunludur'
    }

    if (formData.phoneNumber && !/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz'
    }

    if (formData.taxNumber && !/^[0-9]{10,11}$/.test(formData.taxNumber.replace(/\s/g, ''))) {
      newErrors.taxNumber = 'Geçerli bir vergi numarası giriniz (10-11 haneli)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form gönderimi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Boş değerleri temizle
    const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key as keyof UpdateUserProfileRequest] = value
      }
      return acc
    }, {} as UpdateUserProfileRequest)

    updateProfileMutation.mutate(cleanData)
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <UserIcon className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Kişisel Bilgiler</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Genel Hata */}
        {errors.general && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive text-sm">{errors.general}</p>
          </div>
        )}

        {/* Ad Soyad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2">
              Ad *
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.firstName ? 'border-destructive' : 'border-input'
              }`}
              placeholder="Adınızı giriniz"
            />
            {errors.firstName && (
              <p className="text-destructive text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2">
              Soyad *
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.lastName ? 'border-destructive' : 'border-input'
              }`}
              placeholder="Soyadınızı giriniz"
            />
            {errors.lastName && (
              <p className="text-destructive text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* E-posta (sadece görüntüleme) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            E-posta Adresi
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{user.email}</span>
            {user.isEmailVerified && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Doğrulandı
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            E-posta adresinizi değiştirmek için destek ekibiyle iletişime geçin
          </p>
        </div>

        {/* Telefon */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
            <Phone className="h-4 w-4 inline mr-1" />
            Telefon Numarası
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber || ''}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.phoneNumber ? 'border-destructive' : 'border-input'
            }`}
            placeholder="+90 555 123 45 67"
          />
          {errors.phoneNumber && (
            <p className="text-destructive text-sm mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Vergi Numarası */}
        <div>
          <label htmlFor="taxNumber" className="block text-sm font-medium mb-2">
            Vergi Numarası
          </label>
          <input
            id="taxNumber"
            type="text"
            value={formData.taxNumber || ''}
            onChange={(e) => handleInputChange('taxNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.taxNumber ? 'border-destructive' : 'border-input'
            }`}
            placeholder="12345678901"
            maxLength={11}
          />
          {errors.taxNumber && (
            <p className="text-destructive text-sm mt-1">{errors.taxNumber}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Fatura için gerekli (isteğe bağlı)
          </p>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="min-w-[120px]"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}