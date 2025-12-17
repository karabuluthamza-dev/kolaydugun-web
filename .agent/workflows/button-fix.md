---
description: Buton çalışmıyor - inline async pattern kullan
---

# Çalışan Buton Tekniği

Frontend'de supabase butonları çalışmıyorsa bu tekniği kullan:

## 1. Fonksiyon Yapısı

```jsx
const handleAction = async (id) => {
    console.log('Action started:', id);
    
    try {
        const { data, error } = await supabase
            .from('tablo_adi')
            .delete()  // veya .insert({...}) veya .update({...})
            .eq('id', id)
            .select();  // optional

        console.log('Result:', { data, error });

        if (error) {
            console.error('Error:', error);
            alert('Hata: ' + (error.message || JSON.stringify(error)));
            return;
        }

        alert('✅ İşlem başarılı!');
        fetchData(); // Listeyi yenile
    } catch (error) {
        console.error('Catch error:', error);
        alert('Hata: ' + error.message);
    }
};
```

## 2. Buton Yapısı

```jsx
<button
    onClick={() => handleAction(item.id)}
    style={{
        background: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    }}
>
    🗑️ Sil
</button>
```

## 3. Kullanılmaması Gerekenler

- ❌ `supabase.rpc()` - RPC fonksiyonu yoksa çalışmaz
- ❌ `supabase.sql` template - Frontend'de çalışmaz
- ❌ Array insert `[{...}]` yerine object `{...}` kullan
- ❌ Karmaşık promise chain - async/await kullan

## 4. Debug

Console'da hata görüntülemek için:
1. Tarayıcı DevTools > Console aç
2. Butona tıkla
3. console.log çıktılarını kontrol et

## 5. RLS Sorunu

Eğer hala çalışmıyorsa RLS policy eksik olabilir:

```sql
-- Admin için tüm işlemler
CREATE POLICY "admin_all" ON tablo_adi
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
```
