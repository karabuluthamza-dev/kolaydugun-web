import React, { useState, useEffect } from 'react';
import { useShopOwner } from '../../context/ShopOwnerContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';

const ShopOwnerGallery = () => {
    const { shopAccount } = useShopOwner();
    const { language } = useLanguage();
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newItem, setNewItem] = useState({
        type: 'image',
        url: '',
        title_tr: '',
        title_de: '',
        title_en: '',
        album_id: ''
    });
    const [showHelp, setShowHelp] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [showAlbumForm, setShowAlbumForm] = useState(false);
    const [newAlbum, setNewAlbum] = useState({
        name_tr: '',
        name_de: '',
        name_en: '',
        icon: '📷',
        cover_image_url: ''
    });
    const [editingItem, setEditingItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState(null);
    const [showAlbumEditModal, setShowAlbumEditModal] = useState(false);

    // Delete Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const texts = {
        tr: {
            pageTitle: 'Galeri Yönetimi',
            subtitle: 'Mağaza sayfanızda gösterilecek fotoğraf ve videoları ekleyin',
            addNew: 'Yeni Ekle',
            type: 'Tür',
            image: 'Fotoğraf',
            video: 'Video',
            url: 'URL',
            urlHelpImage: 'Imgur, Google Drive vb. linkini yapıştırın',
            urlHelpVideo: 'YouTube, TikTok, Instagram, Facebook veya Vimeo video linkini yapıştırın',
            itemTitle: 'Başlık (opsiyonel)',
            turkish: 'Türkçe',
            german: 'Almanca',
            english: 'İngilizce',
            add: 'Ekle',
            delete: 'Sil',
            noItems: 'Henüz galeri öğesi eklenmedi',
            saved: '✅ Eklendi!',
            deleted: '🗑️ Silindi!',
            dragToReorder: 'Sıralamak için sürükleyin',
            preview: 'Önizleme',
            helpTitle: '💡 Nasıl Yüklerim?',
            helpImageTitle: '📷 Fotoğraf Yüklemek İçin',
            helpVideoTitle: '🎥 Video Yüklemek İçin',
            helpImgur: 'Imgur kullanarak',
            helpImgurSteps: '1. imgur.com adresine gidin\n2. "New post" butonuna tıklayın\n3. Fotoğrafınızı yükleyin\n4. Yükledikten sonra "Copy link" ile linki kopyalayın\n5. Bu linki buraya yapıştırın',
            helpDrive: 'Google Drive kullanarak',
            helpDriveSteps: '1. drive.google.com adresine gidin\n2. Fotoğrafı yükleyin\n3. Sağ tıklayıp "Link al" seçin\n4. "Bağlantısı olan herkes görebilir" yapın\n5. Linki kopyalayıp buraya yapıştırın',
            helpYoutube: 'YouTube video eklemek',
            helpYoutubeSteps: '1. youtube.com\'da videonuzu açın\n2. Tarayıcı adres çubuğundaki URL\'yi kopyalayın\n3. Örnek: https://www.youtube.com/watch?v=XXXXX\n4. Bu linki buraya yapıştırın',
            helpVimeo: 'Vimeo video eklemek',
            helpVimeoSteps: '1. vimeo.com\'da videonuzu açın\n2. Adres çubuğundaki URL\'yi kopyalayın\n3. Örnek: https://vimeo.com/123456789\n4. Bu linki buraya yapıştırın',
            helpTiktok: 'TikTok video eklemek',
            helpTiktokSteps: '1. tiktok.com\'da videonuzu açın\n2. Paylaş butonuna tıklayıp "Link kopyala" seçin\n3. Örnek: https://www.tiktok.com/@kullanici/video/123\n4. Bu linki buraya yapıştırın',
            helpInstagram: 'Instagram Reels/Video eklemek',
            helpInstagramSteps: '1. instagram.com\'da Reels/videonuzu açın\n2. Üç nokta menüsünden "Bağlantıyı kopyala" seçin\n3. Örnek: https://www.instagram.com/reel/ABC123\n4. Bu linki buraya yapıştırın',
            helpFacebook: 'Facebook Video eklemek',
            helpFacebookSteps: '1. facebook.com\'da videonuzu açın\n2. Video üzerinde sağ tıklayıp "Video bağlantısını kopyala" seçin\n3. Örnek: https://www.facebook.com/watch/?v=123456\n4. Bu linki buraya yapıştırın',
            helpDriveVideo: 'Google Drive video eklemek',
            helpDriveVideoSteps: '1. drive.google.com\'a videonuzu yükleyin\n2. Sağ tıklayıp "Link al" seçin\n3. "Bağlantısı olan herkes görebilir" yapın\n4. Bu linki buraya yapıştırın',
            visitSite: 'Siteye Git',
            showHelp: 'Yardımı Göster',
            hideHelp: 'Yardımı Gizle',
            albums: 'Albümler',
            createAlbum: 'Yeni Albüm Oluştur',
            albumName: 'Albüm Adı',
            albumIcon: 'İkon',
            selectAlbum: 'Albüm Seçin',
            noAlbum: 'Albüm Yok',
            allItems: 'Tümü',
            albumCreated: '✅ Albüm oluşturuldu!',
            albumDeleted: '🗑️ Albüm silindi!'
        },
        de: {
            pageTitle: 'Galerie-Verwaltung',
            subtitle: 'Fügen Sie Fotos und Videos hinzu, die auf Ihrer Shop-Seite angezeigt werden',
            addNew: 'Neu hinzufügen',
            type: 'Typ',
            image: 'Foto',
            video: 'Video',
            url: 'URL',
            urlHelpImage: 'Link von Imgur, Google Drive usw. einfügen',
            urlHelpVideo: 'YouTube-, TikTok-, Instagram-, Facebook- oder Vimeo-Videolink einfügen',
            itemTitle: 'Titel (optional)',
            turkish: 'Türkisch',
            german: 'Deutsch',
            english: 'Englisch',
            add: 'Hinzufügen',
            delete: 'Löschen',
            noItems: 'Noch keine Galerie-Elemente hinzugefügt',
            saved: '✅ Hinzugefügt!',
            deleted: '🗑️ Gelöscht!',
            dragToReorder: 'Zum Sortieren ziehen',
            preview: 'Vorschau',
            helpTitle: '💡 Wie lade ich hoch?',
            helpImageTitle: '📷 Um Fotos hochzuladen',
            helpVideoTitle: '🎥 Um Videos hochzuladen',
            helpImgur: 'Mit Imgur',
            helpImgurSteps: '1. Gehen Sie zu imgur.com\n2. Klicken Sie auf "New post"\n3. Laden Sie Ihr Foto hoch\n4. Klicken Sie auf "Copy link"\n5. Fügen Sie den Link hier ein',
            helpDrive: 'Mit Google Drive',
            helpDriveSteps: '1. Gehen Sie zu drive.google.com\n2. Laden Sie das Foto hoch\n3. Rechtsklick → "Link abrufen"\n4. Ändern Sie zu "Jeder mit dem Link"\n5. Fügen Sie den Link hier ein',
            helpYoutube: 'YouTube-Video hinzufügen',
            helpYoutubeSteps: '1. Öffnen Sie Ihr Video auf youtube.com\n2. Kopieren Sie die URL aus der Adressleiste\n3. Beispiel: https://www.youtube.com/watch?v=XXXXX\n4. Fügen Sie den Link hier ein',
            helpVimeo: 'Vimeo-Video hinzufügen',
            helpVimeoSteps: '1. Öffnen Sie Ihr Video auf vimeo.com\n2. Kopieren Sie die URL\n3. Beispiel: https://vimeo.com/123456789\n4. Fügen Sie den Link hier ein',
            helpTiktok: 'TikTok-Video hinzufügen',
            helpTiktokSteps: '1. Öffnen Sie Ihr Video auf tiktok.com\n2. Klicken Sie auf Teilen und wählen Sie "Link kopieren"\n3. Beispiel: https://www.tiktok.com/@user/video/123\n4. Fügen Sie den Link hier ein',
            helpInstagram: 'Instagram Reels/Video hinzufügen',
            helpInstagramSteps: '1. Öffnen Sie Ihr Reels/Video auf instagram.com\n2. Klicken Sie auf die drei Punkte und wählen Sie "Link kopieren"\n3. Beispiel: https://www.instagram.com/reel/ABC123\n4. Fügen Sie den Link hier ein',
            helpFacebook: 'Facebook-Video hinzufügen',
            helpFacebookSteps: '1. Öffnen Sie Ihr Video auf facebook.com\n2. Rechtsklick auf Video → "Videolink kopieren"\n3. Beispiel: https://www.facebook.com/watch/?v=123456\n4. Fügen Sie den Link hier ein',
            helpDriveVideo: 'Google Drive Video hinzufügen',
            helpDriveVideoSteps: '1. Laden Sie Ihr Video auf drive.google.com hoch\n2. Rechtsklick → "Link abrufen"\n3. Ändern Sie zu "Jeder mit dem Link"\n4. Fügen Sie den Link hier ein',
            visitSite: 'Zur Website',
            showHelp: 'Hilfe anzeigen',
            hideHelp: 'Hilfe ausblenden',
            albums: 'Alben',
            createAlbum: 'Neues Album erstellen',
            albumName: 'Albumname',
            albumIcon: 'Symbol',
            selectAlbum: 'Album auswählen',
            noAlbum: 'Kein Album',
            allItems: 'Alle',
            albumCreated: '✅ Album erstellt!',
            albumDeleted: '🗑️ Album gelöscht!'
        },
        en: {
            pageTitle: 'Gallery Management',
            subtitle: 'Add photos and videos to display on your shop page',
            addNew: 'Add New',
            type: 'Type',
            image: 'Photo',
            video: 'Video',
            url: 'URL',
            urlHelpImage: 'Paste link from Imgur, Google Drive, etc.',
            urlHelpVideo: 'Paste YouTube, TikTok, Instagram, Facebook or Vimeo video link',
            itemTitle: 'Title (optional)',
            turkish: 'Turkish',
            german: 'German',
            english: 'English',
            add: 'Add',
            delete: 'Delete',
            noItems: 'No gallery items added yet',
            saved: '✅ Added!',
            deleted: '🗑️ Deleted!',
            dragToReorder: 'Drag to reorder',
            preview: 'Preview',
            helpTitle: '💡 How to Upload?',
            helpImageTitle: '📷 To Upload Photos',
            helpVideoTitle: '🎥 To Upload Videos',
            helpImgur: 'Using Imgur',
            helpImgurSteps: '1. Go to imgur.com\n2. Click "New post" button\n3. Upload your photo\n4. Click "Copy link" after upload\n5. Paste the link here',
            helpDrive: 'Using Google Drive',
            helpDriveSteps: '1. Go to drive.google.com\n2. Upload your photo\n3. Right-click → "Get link"\n4. Change to "Anyone with the link"\n5. Paste the link here',
            helpYoutube: 'Adding YouTube video',
            helpYoutubeSteps: '1. Open your video on youtube.com\n2. Copy the URL from address bar\n3. Example: https://www.youtube.com/watch?v=XXXXX\n4. Paste the link here',
            helpVimeo: 'Adding Vimeo video',
            helpVimeoSteps: '1. Open your video on vimeo.com\n2. Copy the URL from address bar\n3. Example: https://vimeo.com/123456789\n4. Paste the link here',
            helpTiktok: 'Adding TikTok video',
            helpTiktokSteps: '1. Open your video on tiktok.com\n2. Click Share and select "Copy link"\n3. Example: https://www.tiktok.com/@user/video/123\n4. Paste the link here',
            helpInstagram: 'Adding Instagram Reels/Video',
            helpInstagramSteps: '1. Open your Reels/video on instagram.com\n2. Click three dots menu and select "Copy link"\n3. Example: https://www.instagram.com/reel/ABC123\n4. Paste the link here',
            helpFacebook: 'Adding Facebook Video',
            helpFacebookSteps: '1. Open your video on facebook.com\n2. Right-click on video → "Copy video link"\n3. Example: https://www.facebook.com/watch/?v=123456\n4. Paste the link here',
            helpDriveVideo: 'Adding Google Drive video',
            helpDriveVideoSteps: '1. Upload your video to drive.google.com\n2. Right-click → "Get link"\n3. Change to "Anyone with the link"\n4. Paste the link here',
            visitSite: 'Visit Site',
            showHelp: 'Show Help',
            hideHelp: 'Hide Help',
            albums: 'Albums',
            createAlbum: 'Create New Album',
            albumName: 'Album Name',
            albumIcon: 'Icon',
            selectAlbum: 'Select Album',
            noAlbum: 'No Album',
            allItems: 'All',
            albumCreated: '✅ Album created!',
            albumDeleted: '🗑️ Album deleted!'
        }
    };

    const txt = texts[language] || texts.tr;

    // Load draft from LocalStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('gallery_draft');
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setNewItem(draft);
            } catch (e) {
                console.error('Failed to load draft:', e);
            }
        }
    }, []);

    // Save draft to LocalStorage whenever newItem changes
    useEffect(() => {
        if (newItem.url || newItem.title_tr || newItem.title_de || newItem.title_en) {
            localStorage.setItem('gallery_draft', JSON.stringify(newItem));
        }
    }, [newItem]);

    useEffect(() => {
        if (shopAccount?.id) {
            fetchGallery();
            fetchAlbums();
        }
    }, [shopAccount]);

    const fetchGallery = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('shop_gallery')
                .select('*')
                .eq('shop_id', shopAccount.id)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setGallery(data || []);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAlbums = async () => {
        try {
            const { data, error } = await supabase
                .from('shop_gallery_albums')
                .select('*')
                .eq('shop_id', shopAccount.id)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setAlbums(data || []);
        } catch (error) {
            console.error('Error fetching albums:', error);
        }
    };

    const handleAddAlbum = async () => {
        if (!newAlbum.name_tr.trim()) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('shop_gallery_albums')
                .insert({
                    shop_id: shopAccount.id,
                    name_tr: newAlbum.name_tr.trim(),
                    name_de: newAlbum.name_de.trim() || null,
                    name_en: newAlbum.name_en.trim() || null,
                    icon: newAlbum.icon || '📷',
                    cover_image_url: newAlbum.cover_image_url.trim() || null,
                    sort_order: albums.length
                });

            if (error) throw error;

            setNewAlbum({ name_tr: '', name_de: '', name_en: '', icon: '📷', cover_image_url: '' });
            setShowAlbumForm(false);
            fetchAlbums();
            alert(txt.albumCreated);
        } catch (error) {
            console.error('Error adding album:', error);
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEditAlbum = (album) => {
        setEditingAlbum(album);
        setShowAlbumEditModal(true);
    };

    const handleUpdateAlbum = async () => {
        if (!editingAlbum) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('shop_gallery_albums')
                .update({
                    name_tr: editingAlbum.name_tr.trim(),
                    name_de: editingAlbum.name_de?.trim() || null,
                    name_en: editingAlbum.name_en?.trim() || null,
                    icon: editingAlbum.icon || '📷',
                    cover_image_url: editingAlbum.cover_image_url?.trim() || null
                })
                .eq('id', editingAlbum.id);

            if (error) throw error;

            setShowAlbumEditModal(false);
            setEditingAlbum(null);
            fetchAlbums();
            alert('✅ Albüm güncellendi!');
        } catch (error) {
            console.error('Error updating album:', error);
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAlbum = (album) => {
        setItemToDelete({ ...album, deleteType: 'album' });
        setShowDeleteModal(true);
    };



    const handleAdd = async () => {
        if (!newItem.url.trim()) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('shop_gallery')
                .insert({
                    shop_id: shopAccount.id,
                    type: newItem.type,
                    url: newItem.url.trim(),
                    title_tr: newItem.title_tr || null,
                    title_de: newItem.title_de || null,
                    title_en: newItem.title_en || null,
                    album_id: newItem.album_id || null,
                    sort_order: gallery.length
                });

            if (error) throw error;

            setNewItem({ type: 'image', url: '', title_tr: '', title_de: '', title_en: '', album_id: '' });
            localStorage.removeItem('gallery_draft'); // Clear draft after successful save
            fetchGallery();
            alert(txt.saved);
        } catch (error) {
            console.error('Error adding gallery item:', error);
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const handleUpdateItem = async () => {
        if (!editingItem) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('shop_gallery')
                .update({
                    album_id: editingItem.album_id || null,
                    title_tr: editingItem.title_tr || null,
                    title_de: editingItem.title_de || null,
                    title_en: editingItem.title_en || null
                })
                .eq('id', editingItem.id);

            if (error) throw error;

            setShowEditModal(false);
            setEditingItem(null);
            fetchGallery();
            alert('✅ Güncellendi!');
        } catch (error) {
            console.error('Error updating gallery item:', error);
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            if (itemToDelete.deleteType === 'album') {
                // Delete Album
                const { error } = await supabase
                    .from('shop_gallery_albums')
                    .delete()
                    .eq('id', itemToDelete.id);

                if (error) throw error;

                setAlbums(albums.filter(a => a.id !== itemToDelete.id));
                // Refresh gallery to remove album references if any (optional, but good practice)
                fetchGallery();
            } else {
                // Delete Gallery Item
                const { error } = await supabase
                    .from('shop_gallery')
                    .delete()
                    .eq('id', itemToDelete.id);

                if (error) throw error;

                setGallery(gallery.filter(g => g.id !== itemToDelete.id));
            }

            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Hata: Silinemedi. ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Convert YouTube/Vimeo/TikTok URL to embed URL
    // Convert YouTube/Vimeo/TikTok/Instagram URL to embed URL
    const getEmbedUrl = (url) => {
        if (!url) return null;

        // YouTube Shorts detection
        if (url.includes('youtube.com/shorts/')) {
            const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
            if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
        }

        // YouTube
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?background=1`;

        // TikTok
        const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
        if (tiktokMatch) return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;

        // TikTok short URL
        const tiktokShortMatch = url.match(/vm\.tiktok\.com\/([a-zA-Z0-9]+)/);
        if (tiktokShortMatch) return url;

        // Instagram Reels/Video (Updated with captioned endpoint)
        const instagramMatch = url.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/);
        if (instagramMatch) return `https://www.instagram.com/${instagramMatch[1]}/${instagramMatch[2]}/embed/captioned`;

        // Facebook Video
        const fbWatchMatch = url.match(/facebook\.com\/watch\/\?v=(\d+)/);
        if (fbWatchMatch) {
            const videoUrl = `https://www.facebook.com/watch/?v=${fbWatchMatch[1]}`;
            return `https://www.facebook.com/plugins/video.php?height=314&href=${encodeURIComponent(videoUrl)}&show_text=false&width=560&t=0`;
        }

        const fbVideoMatch = url.match(/facebook\.com\/([^\/]+)\/videos\/(\d+)/);
        if (fbVideoMatch) {
            return `https://www.facebook.com/plugins/video.php?height=314&href=${encodeURIComponent(url)}&show_text=false&width=560&t=0`;
        }

        // Facebook share links (fbwat.ch)
        const fbShortMatch = url.match(/(fbwat\.ch|fb\.watch)\/([a-zA-Z0-9_-]+)/);
        if (fbShortMatch) {
            return `https://www.facebook.com/plugins/video.php?height=314&href=${encodeURIComponent(url)}&show_text=false&width=560&t=0`;
        }

        // Google Drive
        if (url.includes('drive.google')) return url.replace('/view', '/preview');

        return url;
    };

    return (
        <div className="shop-owner-gallery">
            <div className="shop-page-header">
                <h1>🖼️ {txt.pageTitle}</h1>
                <p>{txt.subtitle}</p>
            </div>

            {/* Help Toggle Button */}
            <button
                className="help-toggle-btn"
                onClick={() => setShowHelp(!showHelp)}
            >
                {showHelp ? `📕 ${txt.hideHelp}` : `📗 ${txt.showHelp}`}
            </button>

            {/* Expandable Help Section */}
            {showHelp && (
                <div className="gallery-help-section">
                    <h3>{txt.helpTitle}</h3>

                    <div className="help-grid">
                        {/* Photo Upload Help */}
                        <div className="help-category">
                            <h4>{txt.helpImageTitle}</h4>

                            {/* Imgur */}
                            <div className="help-card imgur">
                                <div className="help-card-header">
                                    <span className="help-icon">🟢</span>
                                    <strong>{txt.helpImgur}</strong>
                                    <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="help-link">
                                        {txt.visitSite} →
                                    </a>
                                </div>
                                <ol className="help-steps">
                                    {txt.helpImgurSteps.split('\\n').map((step, i) => (
                                        <li key={i}>{step.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ol>
                            </div>

                            {/* Google Drive */}
                            <div className="help-card drive">
                                <div className="help-card-header">
                                    <span className="help-icon">🔵</span>
                                    <strong>{txt.helpDrive}</strong>
                                    <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="help-link">
                                        {txt.visitSite} →
                                    </a>
                                </div>
                                <ol className="help-steps">
                                    {txt.helpDriveSteps.split('\\n').map((step, i) => (
                                        <li key={i}>{step.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        {/* Video Upload Help */}
                        <div className="help-category">
                            <h4>{txt.helpVideoTitle}</h4>

                            {/* YouTube */}
                            <div className="help-card youtube">
                                <div className="help-card-header">
                                    <span className="help-icon">🔴</span>
                                    <strong>{txt.helpYoutube}</strong>
                                    <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="help-link">
                                        {txt.visitSite} →
                                    </a>
                                </div>
                                <ol className="help-steps">
                                    {txt.helpYoutubeSteps.split('\\n').map((step, i) => (
                                        <li key={i}>{step.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ol>
                            </div>

                            {/* TikTok */}
                            <div className="help-card tiktok">
                                <div className="help-card-header">
                                    <span className="help-icon">⚫</span>
                                    <strong>{txt.helpTiktok}</strong>
                                    <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="help-link">
                                        {txt.visitSite} →
                                    </a>
                                </div>
                                <ol className="help-steps">
                                    {txt.helpTiktokSteps.split('\\n').map((step, i) => (
                                        <li key={i}>{step.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ol>
                            </div>

                            {/* Vimeo */}
                            <div className="help-card vimeo">
                                <div className="help-card-header">
                                    <span className="help-icon">🟣</span>
                                    <strong>{txt.helpVimeo}</strong>
                                    <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className="help-link">
                                        {txt.visitSite} →
                                    </a>
                                </div>
                                <ol className="help-steps">
                                    {txt.helpVimeoSteps.split('\\n').map((step, i) => (
                                        <li key={i}>{step.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ol>
                            </div>

                            {/* Google Drive Video */}
                            <div className="help-card drive-video">
                                <div className="help-card-header">
                                    <span className="help-icon">🔵</span>
                                    <strong>{txt.helpDriveVideo}</strong>
                                    <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="help-link">
                                        {txt.visitSite} →
                                    </a>
                                </div>
                                <ol className="help-steps">
                                    {txt.helpDriveVideoSteps.split('\\n').map((step, i) => (
                                        <li key={i}>{step.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Album Management Section */}
            <div className="album-management-section">
                <div className="section-header">
                    <h3>📁 {txt.albums}</h3>
                    <button
                        className="btn-create-album"
                        onClick={() => setShowAlbumForm(!showAlbumForm)}
                    >
                        {showAlbumForm ? '✕' : `➕ ${txt.createAlbum}`}
                    </button>
                </div>

                {/* Album Create Form */}
                {showAlbumForm && (
                    <div className="album-create-form">
                        <div className="album-form-row">
                            <div className="form-group">
                                <label>{txt.albumIcon}</label>
                                <select
                                    value={newAlbum.icon}
                                    onChange={(e) => setNewAlbum({ ...newAlbum, icon: e.target.value })}
                                >
                                    <option value="📷">📷 Fotoğraf</option>
                                    <option value="🎥">🎥 Video</option>
                                    <option value="💒">💒 Düğün</option>
                                    <option value="💃">💃 Kına</option>
                                    <option value="🎵">🎵 Müzik</option>
                                    <option value="🎨">🎨 Dekor</option>
                                    <option value="💐">💐 Çiçek</option>
                                    <option value="🎂">🎂 Pasta</option>
                                    <option value="👗">👗 Gelinlik</option>
                                    <option value="💍">💍 Takı</option>
                                </select>
                            </div>
                            <div className="form-group flex-grow">
                                <label>🇹🇷 {txt.turkish}</label>
                                <input
                                    type="text"
                                    value={newAlbum.name_tr}
                                    onChange={(e) => setNewAlbum({ ...newAlbum, name_tr: e.target.value })}
                                    placeholder={txt.albumName}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇩🇪 {txt.german}</label>
                                <input
                                    type="text"
                                    value={newAlbum.name_de}
                                    onChange={(e) => setNewAlbum({ ...newAlbum, name_de: e.target.value })}
                                    placeholder={txt.albumName}
                                />
                            </div>
                            <div className="form-group">
                                <label>🇬🇧 {txt.english}</label>
                                <input
                                    type="text"
                                    value={newAlbum.name_en}
                                    onChange={(e) => setNewAlbum({ ...newAlbum, name_en: e.target.value })}
                                    placeholder={txt.albumName}
                                />
                            </div>
                        </div>
                        <div className="album-form-row">
                            <div className="form-group flex-grow">
                                <label>🖼️ Kapak Görseli URL (opsiyonel)</label>
                                <input
                                    type="url"
                                    value={newAlbum.cover_image_url}
                                    onChange={(e) => setNewAlbum({ ...newAlbum, cover_image_url: e.target.value })}
                                    placeholder="Imgur, Google Drive vb. görsel linki"
                                />
                            </div>
                            <button onClick={handleAddAlbum} className="btn-add" disabled={saving || !newAlbum.name_tr.trim()}>
                                {saving ? '...' : `➕ ${txt.add}`}
                            </button>
                        </div>
                    </div>
                )}

                {/* Album List */}
                {albums.length > 0 && (
                    <div className="albums-table-container">
                        <table className="albums-table">
                            <thead>
                                <tr>
                                    <th>Kapak</th>
                                    <th>Albüm</th>
                                    <th>İstatistikler</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {albums.map(album => {
                                    const albumItems = gallery.filter(g => g.album_id === album.id);
                                    const photoCount = albumItems.filter(item => item.type === 'image').length;
                                    const videoCount = albumItems.filter(item => item.type === 'video').length;
                                    const coverImage = album.cover_image_url || albumItems.find(item => item.type === 'image')?.url;

                                    return (
                                        <tr key={album.id} className="album-row">
                                            <td className="album-cover-cell">
                                                {coverImage ? (
                                                    <img src={coverImage} alt={album.name_tr} className="album-thumb" onError={(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23f3f4f6" width="60" height="60"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24"%3E🖼️%3C/text%3E%3C/svg%3E'} />
                                                ) : (
                                                    <div className="album-thumb-placeholder">🖼️</div>
                                                )}
                                            </td>
                                            <td className="album-info-cell">
                                                <div className="album-title">
                                                    <span className="album-icon-small">{album.icon || '📁'}</span>
                                                    <span className="album-name-text">{album[`name_${language}`] || album.name_tr}</span>
                                                </div>
                                            </td>
                                            <td className="album-stats-cell">
                                                <div className="stats-badges">
                                                    {photoCount > 0 && <span className="stat-badge-small">📷 {photoCount}</span>}
                                                    {videoCount > 0 && <span className="stat-badge-small">🎥 {videoCount}</span>}
                                                    {albumItems.length === 0 && <span className="stat-badge-small empty">Boş</span>}
                                                </div>
                                            </td>
                                            <td className="album-actions-cell">
                                                <button
                                                    className="table-btn edit"
                                                    onClick={() => handleEditAlbum(album)}
                                                    title="Düzenle"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="table-btn delete"
                                                    onClick={() => handleDeleteAlbum(album)}
                                                    title="Sil"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add New Form */}
            <div className="gallery-add-form">
                <h3>➕ {txt.addNew}</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>{txt.type}</label>
                        <select
                            value={newItem.type}
                            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                        >
                            <option value="image">📷 {txt.image}</option>
                            <option value="video">🎥 {txt.video}</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{txt.selectAlbum}</label>
                        <select
                            value={newItem.album_id}
                            onChange={(e) => setNewItem({ ...newItem, album_id: e.target.value })}
                        >
                            <option value="">📁 {txt.noAlbum}</option>
                            {albums.map(album => (
                                <option key={album.id} value={album.id}>
                                    {album.icon} {album[`name_${language}`] || album.name_tr}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group flex-grow">
                        <label>{txt.url}</label>
                        <input
                            type="url"
                            value={newItem.url}
                            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                            placeholder={newItem.type === 'image' ? txt.urlHelpImage : txt.urlHelpVideo}
                        />
                    </div>
                </div>

                <div className="form-row titles">
                    <div className="form-group">
                        <label>🇹🇷 {txt.turkish}</label>
                        <input
                            type="text"
                            value={newItem.title_tr}
                            onChange={(e) => setNewItem({ ...newItem, title_tr: e.target.value })}
                            placeholder={txt.itemTitle}
                        />
                    </div>
                    <div className="form-group">
                        <label>🇩🇪 {txt.german}</label>
                        <input
                            type="text"
                            value={newItem.title_de}
                            onChange={(e) => setNewItem({ ...newItem, title_de: e.target.value })}
                            placeholder={txt.itemTitle}
                        />
                    </div>
                    <div className="form-group">
                        <label>🇬🇧 {txt.english}</label>
                        <input
                            type="text"
                            value={newItem.title_en}
                            onChange={(e) => setNewItem({ ...newItem, title_en: e.target.value })}
                            placeholder={txt.itemTitle}
                        />
                    </div>
                </div>

                {/* Preview */}
                {newItem.url && (
                    <div className="preview-section">
                        <label>👁️ {txt.preview}:</label>
                        {newItem.type === 'image' ? (
                            <div className="preview-wrapper">
                                <img
                                    src={newItem.url}
                                    alt="Preview"
                                    className="preview-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <div className="preview-error" style={{ display: 'none' }}>
                                    ⚠️ Görsel yüklenemedi. URL'yi kontrol edin.
                                </div>
                            </div>
                        ) : (
                            <div className="preview-wrapper">
                                <iframe
                                    src={getEmbedUrl(newItem.url)}
                                    className="preview-video"
                                    frameBorder="0"
                                    allowFullScreen
                                    title="Video Preview"
                                />
                            </div>
                        )}
                    </div>
                )}

                <button onClick={handleAdd} className="btn-add" disabled={saving || !newItem.url.trim()}>
                    {saving ? '...' : `➕ ${txt.add}`}
                </button>
            </div>

            {/* Gallery Grid */}
            <div className="gallery-list">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                    </div>
                ) : gallery.length === 0 ? (
                    <div className="empty-state">
                        <span className="icon">🖼️</span>
                        <p>{txt.noItems}</p>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {gallery.map((item, index) => (
                            <div key={item.id} className="gallery-item">
                                <div className="item-media">
                                    {item.type === 'image' ? (
                                        <img src={item.url} alt={item.title_tr || ''} />
                                    ) : (
                                        <div className={`video-preview-wrapper ${item.url.includes('shorts') ||
                                            item.url.includes('tiktok') ||
                                            item.url.includes('instagram')
                                            ? 'vertical' : 'horizontal'
                                            }`}>
                                            <iframe
                                                src={getEmbedUrl(item.url)}
                                                frameBorder="0"
                                                allowFullScreen
                                            />
                                        </div>
                                    )}
                                    <span className="type-badge">{item.type === 'image' ? '📷' : '🎥'}</span>
                                </div>
                                <div className="item-info">
                                    <span className="item-title">
                                        {item[`title_${language}`] || item.title_tr || `#${index + 1}`}
                                    </span>
                                    <div className="item-actions">
                                        <button onClick={() => handleEdit(item)} className="btn-edit">
                                            ✏️ Düzenle
                                        </button>
                                        <button onClick={() => handleDelete(item)} className="btn-delete">
                                            🗑️ {txt.delete}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>✏️ Düzenle</h3>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Albüm Seçin</label>
                                <select
                                    value={editingItem.album_id || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, album_id: e.target.value })}
                                >
                                    <option value="">📁 Albüm Yok</option>
                                    {albums.map(album => (
                                        <option key={album.id} value={album.id}>
                                            {album.icon} {album[`name_${language}`] || album.name_tr}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>🇹🇷 Başlık (Türkçe)</label>
                                <input
                                    type="text"
                                    value={editingItem.title_tr || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, title_tr: e.target.value })}
                                    placeholder="Başlık (opsiyonel)"
                                />
                            </div>
                            <div className="form-group">
                                <label>🇩🇪 Başlık (Almanca)</label>
                                <input
                                    type="text"
                                    value={editingItem.title_de || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, title_de: e.target.value })}
                                    placeholder="Titel (optional)"
                                />
                            </div>
                            <div className="form-group">
                                <label>🇬🇧 Başlık (İngilizce)</label>
                                <input
                                    type="text"
                                    value={editingItem.title_en || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, title_en: e.target.value })}
                                    placeholder="Title (optional)"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                                İptal
                            </button>
                            <button className="btn-save" onClick={handleUpdateItem} disabled={saving}>
                                {saving ? '...' : '💾 Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>🗑️ Silme Onayı</h3>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p>Bu öğeyi silmek istediğinize emin misiniz?</p>
                            {itemToDelete && (
                                <div className="delete-preview" style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                                    {itemToDelete.deleteType === 'album' ? '📁' : (itemToDelete.type === 'page' ? '📄' : (itemToDelete.type === 'image' ? '📷' : '🎥'))}
                                    {' '}
                                    {itemToDelete[`title_${language}`] || itemToDelete[`name_${language}`] || itemToDelete.title_tr || itemToDelete.name_tr || 'Adsız Öğe'}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>İptal</button>
                            <button
                                className="btn-save btn-delete-confirm"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                style={{ background: '#ef4444' }}
                            >
                                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Album Edit Modal */}
            {showAlbumEditModal && editingAlbum && (
                <div className="modal-overlay" onClick={() => setShowAlbumEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>✏️ Albümü Düzenle</h3>
                            <button className="modal-close" onClick={() => setShowAlbumEditModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>İkon</label>
                                <select
                                    value={editingAlbum.icon || '📷'}
                                    onChange={(e) => setEditingAlbum({ ...editingAlbum, icon: e.target.value })}
                                >
                                    <option value="📷">📷 Fotoğraf</option>
                                    <option value="🎥">🎥 Video</option>
                                    <option value="💒">💒 Düğün</option>
                                    <option value="💃">💃 Kına</option>
                                    <option value="🎵">🎵 Müzik</option>
                                    <option value="🎨">🎨 Dekor</option>
                                    <option value="💐">💐 Çiçek</option>
                                    <option value="🎂">🎂 Pasta</option>
                                    <option value="👗">👗 Gelinlik</option>
                                    <option value="💍">💍 Takı</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>🇹🇷 Albüm Adı (Türkçe)</label>
                                <input
                                    type="text"
                                    value={editingAlbum.name_tr || ''}
                                    onChange={(e) => setEditingAlbum({ ...editingAlbum, name_tr: e.target.value })}
                                    placeholder="Albüm adı"
                                />
                            </div>
                            <div className="form-group">
                                <label>🇩🇪 Albüm Adı (Almanca)</label>
                                <input
                                    type="text"
                                    value={editingAlbum.name_de || ''}
                                    onChange={(e) => setEditingAlbum({ ...editingAlbum, name_de: e.target.value })}
                                    placeholder="Albumname"
                                />
                            </div>
                            <div className="form-group">
                                <label>🇬🇧 Albüm Adı (İngilizce)</label>
                                <input
                                    type="text"
                                    value={editingAlbum.name_en || ''}
                                    onChange={(e) => setEditingAlbum({ ...editingAlbum, name_en: e.target.value })}
                                    placeholder="Album name"
                                />
                            </div>
                            <div className="form-group">
                                <label>🖼️ Kapak Görseli URL (opsiyonel)</label>
                                <input
                                    type="url"
                                    value={editingAlbum.cover_image_url || ''}
                                    onChange={(e) => setEditingAlbum({ ...editingAlbum, cover_image_url: e.target.value })}
                                    placeholder="Imgur, Google Drive vb. görsel linki"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowAlbumEditModal(false)}>
                                İptal
                            </button>
                            <button className="btn-save" onClick={handleUpdateAlbum} disabled={saving || !editingAlbum.name_tr?.trim()}>
                                {saving ? '...' : '💾 Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <style>{`
                .shop-owner-gallery {
                    padding: 0;
                }

                .gallery-add-form {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }

                .gallery-add-form h3 {
                    margin: 0 0 1.5rem 0;
                    font-size: 1.1rem;
                    color: #111827;
                }

                .form-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .form-row.titles {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group.flex-grow {
                    flex: 1;
                }

                .form-group label {
                    font-weight: 500;
                    font-size: 0.9rem;
                    color: #374151;
                }

                .form-group input,
                .form-group select {
                    padding: 12px 14px;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #FF6B9D;
                }

                .preview-section {
                    margin: 1.5rem 0;
                    padding: 1.5rem;
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    border: 2px dashed #3b82f6;
                    border-radius: 12px;
                }

                .preview-section label {
                    display: block;
                    margin-bottom: 1rem;
                    font-weight: 600;
                    color: #1e40af;
                    font-size: 1rem;
                }

                .preview-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 150px;
                }

                .preview-image {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 8px;
                    object-fit: contain;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .preview-video {
                    width: 100%;
                    max-width: 500px;
                    height: 280px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .preview-error {
                    padding: 1rem;
                    background: #fef2f2;
                    border: 2px solid #fca5a5;
                    border-radius: 8px;
                    color: #dc2626;
                    font-weight: 500;
                    text-align: center;
                }

                .btn-add {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #FF6B9D 0%, #c084fc 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-add:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 107, 157, 0.3);
                }

                .btn-add:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .gallery-item {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    transition: transform 0.2s;
                }

                .gallery-item:hover {
                    transform: translateY(-4px);
                }

                .item-media {
                    position: relative;
                    height: 180px;
                    overflow: hidden;
                    background: #f3f4f6;
                }

                .item-media img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .item-media iframe {
                    width: 100%;
                    height: 100%;
                }

                .type-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.6);
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.9rem;
                }

                .item-info {
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .item-title {
                    font-weight: 500;
                    color: #111827;
                }

                .btn-delete {
                    padding: 6px 12px;
                    background: #fee2e2;
                    color: #dc2626;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-delete:hover {
                    background: #fecaca;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 16px;
                }

                .empty-state .icon {
                    font-size: 4rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .empty-state p {
                    color: #6b7280;
                }

                /* Help Section Styles */
                .help-toggle-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 16px;
                    transition: all 0.2s;
                }

                .help-toggle-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .gallery-help-section {
                    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                    border: 2px solid #86efac;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                }

                .gallery-help-section h3 {
                    color: #166534;
                    margin: 0 0 20px 0;
                    font-size: 1.25rem;
                }

                .help-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }

                .help-category h4 {
                    margin: 0 0 12px 0;
                    color: #374151;
                    font-size: 1rem;
                }

                .help-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                    border-left: 4px solid #e5e7eb;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                }

                .help-card.imgur { border-left-color: #1bb76e; }
                .help-card.drive { border-left-color: #4285f4; }
                .help-card.youtube { border-left-color: #ff0000; }
                .help-card.tiktok { border-left-color: #000000; }
                .help-card.vimeo { border-left-color: #1ab7ea; }
                .help-card.drive-video { border-left-color: #4285f4; }

                .help-card-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .help-icon {
                    font-size: 1.2rem;
                }

                .help-card-header strong {
                    flex: 1;
                    color: #0f172a;
                }

                .help-link {
                    color: #6366f1;
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .help-link:hover {
                    text-decoration: underline;
                }

                .help-steps {
                    margin: 0;
                    padding-left: 20px;
                    color: #4b5563;
                    font-size: 0.9rem;
                    line-height: 1.6;
                }

                .help-steps li {
                    margin-bottom: 4px;
                }

                /* Album Management Styles */
                .album-management-section {
                    background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
                    border: 2px solid #fcd34d;
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .section-header h3 {
                    margin: 0;
                    color: #92400e;
                    font-size: 1.1rem;
                }

                .btn-create-album {
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-create-album:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
                }

                .album-create-form {
                    background: white;
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 16px;
                }

                .album-form-row {
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                    flex-wrap: wrap;
                }

                .albums-table-container {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .albums-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .albums-table thead {
                    background: #f9fafb;
                }

                .albums-table th {
                    padding: 12px 16px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #e5e7eb;
                }

                .albums-table tbody tr {
                    border-bottom: 1px solid #f3f4f6;
                    transition: background 0.2s;
                }

                .albums-table tbody tr:hover {
                    background: #f9fafb;
                }

                .albums-table tbody tr:last-child {
                    border-bottom: none;
                }

                .albums-table td {
                    padding: 12px 16px;
                    vertical-align: middle;
                }

                .album-cover-cell {
                    width: 80px;
                }

                .album-thumb {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    object-fit: cover;
                    display: block;
                }

                .album-thumb-placeholder {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    background: #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                .album-info-cell {
                    min-width: 200px;
                }

                .album-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .album-icon-small {
                    font-size: 1.5rem;
                }

                .album-name-text {
                    font-weight: 600;
                    color: #111827;
                    font-size: 0.95rem;
                }

                .album-stats-cell {
                    min-width: 150px;
                }

                .stats-badges {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .stat-badge-small {
                    background: #f3f4f6;
                    color: #6b7280;
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                .stat-badge-small.empty {
                    background: #fef3c7;
                    color: #92400e;
                }

                .album-actions-cell {
                    width: 100px;
                    text-align: right;
                }

                .table-btn {
                    background: #f3f4f6;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 0.5rem;
                }

                .table-btn.edit:hover {
                    background: #dbeafe;
                    transform: scale(1.1);
                }

                .table-btn.delete:hover {
                    background: #fee2e2;
                    transform: scale(1.1);
                }
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .album-delete-btn:hover {
                    background: #fee2e2;
                }

                @media (max-width: 768px) {
                    .help-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-row {
                        flex-direction: column;
                    }

                    .form-row.titles {
                        grid-template-columns: 1fr;
                    }

                    .gallery-grid {
                        grid-template-columns: 1fr;
                    }

                    .album-form-row {
                        flex-direction: column;
                    }

                    .modal-content {
                        width: 95%;
                        max-width: 95%;
                    }
                }

                /* Edit Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    background: white;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: modalSlideIn 0.3s ease-out;
                }

                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 2px solid #f3f4f6;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.3rem;
                    color: #111827;
                }

                .modal-close {
                    background: #f3f4f6;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-close:hover {
                    background: #e5e7eb;
                    transform: rotate(90deg);
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .modal-body .form-group {
                    margin-bottom: 1.2rem;
                }

                .modal-footer {
                    display: flex;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-top: 2px solid #f3f4f6;
                    justify-content: flex-end;
                }

                .btn-cancel {
                    padding: 12px 24px;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-cancel:hover {
                    background: #e5e7eb;
                }

                .btn-save {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-save:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
                }

                .btn-save:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Item Actions */
                .item-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }

                .video-preview-wrapper {
                    width: 100%;
                    height: 100%;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border-radius: 8px;
                }

                .video-preview-wrapper.horizontal iframe {
                    width: 100%;
                    aspect-ratio: 16/9;
                    height: auto;
                }

                .video-preview-wrapper.vertical iframe {
                    height: 100%;
                    aspect-ratio: 9/16;
                    width: auto;
                    max-width: 100%;
                }

                .gallery-item .item-media iframe {
                    pointer-events: none;
                }

                .btn-edit {
                    flex: 1;
                    padding: 8px 12px;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-edit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .btn-delete {
                    flex: 1;
                }

                /* Delete Modal Styles */
                .delete-modal .modal-header {
                    border-bottom: 2px solid #fee2e2;
                }
                .delete-modal .modal-header h3 {
                    color: #b91c1c;
                }
                
                .btn-delete-confirm:hover {
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4) !important;
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
                }

            `}</style>
        </div>
    );
};

export default ShopOwnerGallery;
