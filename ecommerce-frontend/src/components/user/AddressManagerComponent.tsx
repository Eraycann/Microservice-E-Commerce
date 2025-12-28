/**
 * AddressManager Bileşeni
 * 
 * Backend UserController API'larına uygun adres yönetimi bileşeni
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { userService } from '@/services/userService'
import { useAuth } from '@/features/auth/authStore'
import { 
  Address, 
  CreateAddressRequest,
  User
} from '@/types/user'
import { 
  Plus, 
  MapPin, 
  Star,
  Loader2,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface AddressManagerProps {
  user: User
  onAddressChange?: (addresses: Address[]) => void
}

const AddressManager: React.FC<AddressManagerProps> = ({
  user,
  onAddressChange
}) => {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  // Check authentication before allowing address operations
  if (!isAuthenticated) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>Adres yönetimi için giriş yapmanız gerekiyor</span>
        </div>
      </div>
    )
  }

  // Adresleri getir
  const { data: addresses, isLoading, error } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: () => userService.getAddresses(),
    initialData: user.addresses || []
  })

  // Adres ekleme mutation'ı
  const addAddressMutation = useMutation({
    mutationFn: (data: CreateAddressRequest) => userService.createAddress(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', 'profile'], updatedUser)
      queryClient.setQueryData(['user', 'addresses'], updatedUser.addresses)
      onAddressChange?.(updatedUser.addresses)
      setShowAddForm(false)
      toast.success('Adres başarıyla eklendi')
    },
    onError: (error: any) => {
      console.error('[AddressManager] Adres ekleme hatası:', error)
      console.error('[AddressManager] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      })
      
      // Specific error handling
      if (error.response?.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
      } else if (error.response?.status === 403) {
        toast.error('Bu işlem için yetkiniz bulunmuyor.')
      } else if (error.response?.status === 405) {
        toast.error('Adres ekleme servisi şu anda kullanılamıyor. (405 Method Not Allowed)')
      } else {
        toast.error('Adres eklenirken hata oluştu. Lütfen tekrar deneyin.')
      }
    }
  })

  // Varsayılan adres ayarlama mutation'ı
  const setDefaultMutation = useMutation({
    mutationFn: (addressId: string) => userService.setDefaultAddress(addressId),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', 'profile'], updatedUser)
      queryClient.setQueryData(['user', 'addresses'], updatedUser.addresses)
      onAddressChange?.(updatedUser.addresses)
      toast.success('Varsayılan adres güncellendi')
    },
    onError: (error: any) => {
      console.error('[AddressManager] Varsayılan adres hatası:', error)
      toast.error('Varsayılan adres ayarlanırken hata oluştu')
    }
  })

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Adresler yükleniyor...</span>
        </div>
      </div>
    )
  }

  // Hata durumu
  if (error) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-center py-8 text-destructive">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>Adresler yüklenirken hata oluştu</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Adreslerim</h2>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adres Ekle
        </Button>
      </div>

      {/* Adres Listesi */}
      {addresses && addresses.length > 0 ? (
        <div className="space-y-4 mb-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onSetDefault={(id) => setDefaultMutation.mutate(id)}
              onEdit={(address) => setEditingAddress(address)}
              isSettingDefault={setDefaultMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">Henüz adres eklenmemiş</p>
          <p className="text-sm">Hızlı ödeme için ilk adresinizi ekleyin</p>
        </div>
      )}

      {/* Adres Ekleme Formu */}
      {showAddForm && (
        <AddressForm
          onSubmit={(data) => addAddressMutation.mutate(data)}
          onCancel={() => setShowAddForm(false)}
          isLoading={addAddressMutation.isPending}
        />
      )}

      {/* Adres Düzenleme Formu */}
      {editingAddress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Adres Düzenle</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Özellik Geliştiriliyor</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Adres düzenleme özelliği henüz Backend'de mevcut değil. 
                Şimdilik yeni adres ekleyebilirsiniz.
              </p>
            </div>
            <Button
              onClick={() => setEditingAddress(null)}
              className="w-full"
            >
              Tamam
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Adres Kartı Bileşeni
 */
interface AddressCardProps {
  address: Address
  onSetDefault: (id: string) => void
  onEdit: (address: Address) => void
  isSettingDefault: boolean
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onSetDefault,
  onEdit,
  isSettingDefault
}) => {
  return (
    <div className={`border rounded-lg p-4 ${
      address.defaultAddress ? 'border-primary bg-primary/5' : 'border-border'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium">{address.title}</h3>
            {address.defaultAddress && (
              <div className="flex items-center gap-1 text-primary text-xs bg-primary/10 px-2 py-1 rounded">
                <Star className="h-3 w-3 fill-current" />
                Varsayılan
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-1">
            {address.fullAddress}
          </p>
          
          <p className="text-sm text-muted-foreground">
            {address.district}, {address.city} {address.zipCode}
          </p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {!address.defaultAddress && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(address.id)}
              disabled={isSettingDefault}
            >
              {isSettingDefault ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Star className="h-3 w-3" />
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(address)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Silme özelliği Backend'de yok
              toast.error('Adres silme özelliği henüz mevcut değil')
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
/**
 * Adres Formu Bileşeni
 */
interface AddressFormProps {
  onSubmit: (data: CreateAddressRequest) => void
  onCancel: () => void
  isLoading: boolean
}

const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<CreateAddressRequest>({
    title: '',
    fullAddress: '',
    city: '',
    district: '',
    zipCode: '',
    defaultAddress: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof CreateAddressRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Adres başlığı zorunludur'
    }

    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = 'Adres detayı zorunludur'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Şehir zorunludur'
    }

    if (!formData.district.trim()) {
      newErrors.district = 'İlçe zorunludur'
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Posta kodu zorunludur'
    } else if (!/^\d{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Geçerli bir posta kodu giriniz (5 haneli)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    onSubmit(formData)
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Yeni Adres Ekle</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Adres Başlığı */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Adres Başlığı *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.title ? 'border-destructive' : 'border-input'
            }`}
            placeholder="Ev, İş, vb."
          />
          {errors.title && (
            <p className="text-destructive text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Adres Detayı */}
        <div>
          <label htmlFor="fullAddress" className="block text-sm font-medium mb-2">
            Adres Detayı *
          </label>
          <textarea
            id="fullAddress"
            value={formData.fullAddress}
            onChange={(e) => handleInputChange('fullAddress', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.fullAddress ? 'border-destructive' : 'border-input'
            }`}
            placeholder="Mahalle, sokak, bina no, daire no"
            rows={3}
          />
          {errors.fullAddress && (
            <p className="text-destructive text-sm mt-1">{errors.fullAddress}</p>
          )}
        </div>

        {/* Şehir ve İlçe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-2">
              Şehir *
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.city ? 'border-destructive' : 'border-input'
              }`}
              placeholder="İstanbul"
            />
            {errors.city && (
              <p className="text-destructive text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium mb-2">
              İlçe *
            </label>
            <input
              id="district"
              type="text"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.district ? 'border-destructive' : 'border-input'
              }`}
              placeholder="Kadıköy"
            />
            {errors.district && (
              <p className="text-destructive text-sm mt-1">{errors.district}</p>
            )}
          </div>
        </div>

        {/* Posta Kodu */}
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium mb-2">
            Posta Kodu *
          </label>
          <input
            id="zipCode"
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.zipCode ? 'border-destructive' : 'border-input'
            }`}
            placeholder="34000"
            maxLength={5}
          />
          {errors.zipCode && (
            <p className="text-destructive text-sm mt-1">{errors.zipCode}</p>
          )}
        </div>

        {/* Varsayılan Adres */}
        <div className="flex items-center gap-2">
          <input
            id="defaultAddress"
            type="checkbox"
            checked={formData.defaultAddress}
            onChange={(e) => handleInputChange('defaultAddress', e.target.checked)}
            className="text-primary focus:ring-primary/20"
          />
          <label htmlFor="defaultAddress" className="text-sm">
            Bu adresi varsayılan adres olarak ayarla
          </label>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ekleniyor...
              </>
            ) : (
              'Adres Ekle'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddressManager