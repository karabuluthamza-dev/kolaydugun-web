import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usePlanning } from '../context/PlanningContext';
import { AiGateway } from '../services/ai/AiGateway';
import { aiChatService } from '../services/ai/AiChatService';
import { chatSessionService } from '../services/ai/ChatSessionService';
import { handoffService, HANDOFF_CHANNELS, DEFAULT_WHATSAPP_NUMBER } from '../services/ai/handoffService';
import { 
    MessageSquare, X, Send, Trash2, Plus, 
    AlertCircle, RefreshCw, LogIn, UserPlus, Phone,
    SendHorizontal, Sparkles, Building2, Crown, Handshake, HelpCircle
} from 'lucide-react';
import './AiChatDrawer.css';

export const AiChatDrawer = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    
    const planningData = usePlanning() || {};
    const { 
        addGuest, removeGuest, updateGuest, 
        addTask, updateTask, removeTask, 
        addBudgetItem, updateBudgetItem, removeBudgetItem, 
        setBudget 
    } = planningData;

    const [isEnabled, setIsEnabled] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    
    // Tab switching: 'form' (WhatsApp Form) or 'chat' (AI Chat)
    const [activeTab, setActiveTab] = useState('form');

    // AI Sessions & Chat state
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [isSessionsLoading, setIsSessionsLoading] = useState(false);
    const [sessionError, setSessionError] = useState(null);
    
    // WhatsApp Inquiry Form State
    const [formCategory, setFormCategory] = useState('venue');
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        date: '',
        guests: '',
        budget: '',
        companyName: '',
        vendorSector: '',
        services: [],
        notes: ''
    });

    const messageEndRef = useRef(null);
    const lastScrollY = useRef(0);
    const [isTeaserExpanded, setIsTeaserExpanded] = useState(true);

    // Smart Scroll awareness for floating teaser badge
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 80) {
                setIsTeaserExpanded(false);
            } else if (currentScrollY < lastScrollY.current - 10) {
                setIsTeaserExpanded(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto populate form data when user or planningData changes
    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const validWeddingDate = planningData.weddingDate && planningData.weddingDate >= todayStr 
            ? planningData.weddingDate 
            : '';

        setFormData(prev => ({
            ...prev,
            name: prev.name || '',
            phone: prev.phone || user?.phone || user?.user_metadata?.phone || '',
            city: prev.city || planningData.city || '',
            date: prev.date && prev.date >= todayStr ? prev.date : validWeddingDate,
            guests: prev.guests || (Array.isArray(planningData.guests) && planningData.guests.length > 0 ? String(planningData.guests.length) : ''),
            budget: prev.budget || (planningData.budget ? String(planningData.budget) : '')
        }));
    }, [user, planningData]);

    // 1. Check Feature Flag
    useEffect(() => {
        const checkFeatureFlag = async () => {
            try {
                const flag = await AiGateway.getFeatureFlag('global_drawer');
                setIsEnabled(flag ?? true);
            } catch (err) {
                console.error('[AiChatDrawer] Feature flag check failed:', err);
                setIsEnabled(true);
            }
        };
        checkFeatureFlag();
    }, []);

    // 2. Fetch Sessions on Login / Open
    useEffect(() => {
        if (isEnabled && user && isOpen && activeTab === 'chat') {
            loadSessions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled, user, isOpen, activeTab]);

    // 3. Auto Scroll to Bottom on New Messages / Typing
    useEffect(() => {
        if (activeTab === 'chat') {
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isAiTyping, activeTab]);

    const loadSessions = async () => {
        setIsSessionsLoading(true);
        setSessionError(null);
        try {
            const list = await chatSessionService.fetchSessions(user.id);
            setSessions(list);
            
            if (list.length > 0) {
                setActiveSessionId(list[0].id);
                loadMessages(list[0].id);
            } else {
                await handleCreateSession();
            }
        } catch (err) {
            console.error('[AiChatDrawer] Failed to load sessions:', err);
            setSessionError(language === 'tr' ? 'Sohbet oturumları yüklenirken bir hata oluştu.' : 'Failed to load chat sessions.');
        } finally {
            setIsSessionsLoading(false);
        }
    };

    const loadMessages = async (sessionId) => {
        try {
            const history = await chatSessionService.fetchMessages(sessionId);
            const defaultWelcome = language === 'tr' 
                ? 'Merhaba! Ben Yapay Zekâ Düğün Asistanınız. Düğün planlama panelinize bağlandım. Bugün bütçenizi optimize etmeye, davetlileri yönetmeye veya işlerinizi organize etmeye nasıl yardımcı olabilirim?'
                : language === 'en'
                ? 'Hello! I am your AI Wedding Assistant. How can I help you today?'
                : 'Hallo! Ich bin Ihr KI-Hochzeitsplaner. Wie kann ich Ihnen heute helfen?';

            const mapped = history.map(msg => {
                let displayContent = msg.content;
                if (!displayContent || displayContent.startsWith('aiChat.')) {
                    displayContent = t(displayContent, { defaultValue: defaultWelcome });
                    if (displayContent.startsWith('aiChat.')) {
                        displayContent = defaultWelcome;
                    }
                }
                return {
                    id: msg.id,
                    role: msg.role,
                    content: displayContent,
                    status: msg.metadata?.status || 'sent'
                };
            });
            setMessages(mapped);
        } catch (err) {
            console.error('[AiChatDrawer] Failed to load messages:', err);
        }
    };

    const handleCreateSession = async () => {
        if (!user) return;
        setSessionError(null);
        try {
            const defaultNewChatStr = language === 'tr' ? 'Yeni Sohbet' : language === 'en' ? 'New Chat' : 'Neuer Chat';
            const sessionTitle = `${t('aiChat.newChat', defaultNewChatStr)} - ${new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : 'en-US')}`;
            const newSession = await chatSessionService.createSession(user.id, sessionTitle);
            
            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
            
            const defaultWelcome = language === 'tr' 
                ? 'Merhaba! Ben Yapay Zekâ Düğün Asistanınız. Düğün planlama panelinize bağlandım. Bugün bütçenizi optimize etmeye, davetlileri yönetmeye veya işlerinizi organize etmeye nasıl yardımcı olabilirim?'
                : language === 'en'
                ? 'Hello! I am your AI Wedding Assistant. How can I help you today?'
                : 'Hallo! Ich bin Ihr KI-Hochzeitsplaner. Wie kann ich Ihnen heute helfen?';
            
            let welcomeText = t('aiChat.welcomeMessage', { defaultValue: defaultWelcome });
            if (!welcomeText || welcomeText.startsWith('aiChat.')) {
                welcomeText = defaultWelcome;
            }

            const welcomeMsg = await chatSessionService.saveMessage({
                session_id: newSession.id,
                role: 'assistant',
                content: welcomeText,
                metadata: { status: 'sent' }
            });

            setMessages([{
                id: welcomeMsg.id,
                role: 'assistant',
                content: welcomeText,
                status: 'sent'
            }]);
        } catch (err) {
            console.error('[AiChatDrawer] Failed to create session:', err);
            setSessionError(language === 'tr' ? 'Yeni sohbet oluşturulamadı.' : 'Failed to create new chat session.');
        }
    };

    const handleDeleteSession = async (sessionId, e) => {
        e.stopPropagation();
        setSessionError(null);
        try {
            await chatSessionService.deleteSession(sessionId);
            const remaining = sessions.filter(s => s.id !== sessionId);
            setSessions(remaining);
            
            if (activeSessionId === sessionId) {
                if (remaining.length > 0) {
                    setActiveSessionId(remaining[0].id);
                    loadMessages(remaining[0].id);
                } else {
                    setActiveSessionId(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            console.error('[AiChatDrawer] Failed to delete session:', err);
            setSessionError(language === 'tr' ? 'Sohbet silinemedi.' : 'Failed to delete session.');
        }
    };

    const handleSendMessage = async (textToSend) => {
        if (!textToSend.trim() || !activeSessionId) return;
        
        const tempId = `temp-${Date.now()}`;
        const userMsg = {
            id: tempId,
            role: 'user',
            content: textToSend,
            status: 'sending'
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsAiTyping(true);

        let savedMsg = null;
        try {
            savedMsg = await chatSessionService.saveMessage({
                session_id: activeSessionId,
                role: 'user',
                content: textToSend,
                metadata: { status: 'sent' }
            });
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: savedMsg.id, status: 'sent' } : m));
        } catch (err) {
            console.error('[AiChatDrawer] Failed to save user message to DB:', err);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
            setIsAiTyping(false);
            return;
        }

        try {
            const chatHistory = messages
                .filter(m => m.role !== 'system' && m.status === 'sent')
                .map(m => ({ role: m.role, content: m.content }));

            const toolCallbacks = {
                add_guest: async (args) => {
                    await addGuest({ name: args.name });
                    return { status: 'success', message: `Added guest: ${args.name}` };
                },
                remove_guest: async (args) => {
                    await removeGuest(args.guest_id);
                    return { status: 'success', message: `Removed guest with ID: ${args.guest_id}` };
                },
                add_todo: async (args) => {
                    const taskObj = {
                        title: args.title,
                        category: args.category || 'Other',
                        month: args.month || '12-10 months',
                        completed: false,
                        notes: args.notes || ''
                    };
                    const result = await addTask(taskObj);
                    return { status: 'success', message: `Added todo: ${args.title}`, task: result };
                },
                update_todo_status: async (args) => {
                    await updateTask(args.todo_id, { completed: args.completed });
                    return { status: 'success', message: `Updated todo status to completed=${args.completed}` };
                },
                remove_todo: async (args) => {
                    await removeTask(args.todo_id);
                    return { status: 'success', message: `Removed todo with ID: ${args.todo_id}` };
                },
                add_budget_item: async (args) => {
                    const itemObj = {
                        category: args.category,
                        estimated: args.estimated,
                        actual: 0,
                        notes: args.notes || ''
                    };
                    await addBudgetItem(itemObj);
                    return { status: 'success', message: `Added budget item: ${args.category}` };
                },
                update_budget_item_cost: async (args) => {
                    const updates = {};
                    if (args.estimated !== undefined) updates.estimated = args.estimated;
                    if (args.actual !== undefined) updates.actual = args.actual;
                    if (args.notes !== undefined) updates.notes = args.notes;
                    await updateBudgetItem(args.item_id, updates);
                    return { status: 'success', message: `Updated budget item with ID: ${args.item_id}` };
                },
                remove_budget_item: async (args) => {
                    await removeBudgetItem(args.item_id);
                    return { status: 'success', message: `Removed budget item with ID: ${args.item_id}` };
                },
                set_total_budget: async (args) => {
                    await setBudget(args.amount);
                    return { status: 'success', message: `Total budget set to: ${args.amount} EUR` };
                }
            };

            const aiResponse = await aiChatService.sendMessage(
                textToSend, 
                chatHistory, 
                planningData, 
                language,
                toolCallbacks
            );

            const aiSavedMsg = await chatSessionService.saveMessage({
                session_id: activeSessionId,
                role: 'assistant',
                content: aiResponse,
                metadata: { status: 'sent' }
            });

            setMessages(prev => [...prev, {
                id: aiSavedMsg.id,
                role: 'assistant',
                content: aiResponse,
                status: 'sent'
            }]);
        } catch (err) {
            console.error('[AiChatDrawer] AI response generation failed:', err);
            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: language === 'tr' 
                    ? 'Yapay zekâ yanıtı oluşturulurken bir hata oluştu. Lütfen mesajınızı yeniden gönderin.' 
                    : language === 'en'
                    ? 'An error occurred while generating AI response. Please try sending your message again.'
                    : 'Ein Fehler ist beim Generieren der KI-Antwort aufgetreten. Bitte senden Sie Ihre Nachricht erneut.',
                status: 'failed'
            }]);
        } finally {
            setIsAiTyping(false);
        }
    };

    // Toggle service checkbox in form
    const handleServiceToggle = (serviceKey) => {
        setFormData(prev => {
            const exists = prev.services.includes(serviceKey);
            return {
                ...prev,
                services: exists 
                    ? prev.services.filter(s => s !== serviceKey)
                    : [...prev.services, serviceKey]
            };
        });
    };

    // Form Submit Handler -> Sends directly to WhatsApp (+491628726192)
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.name.trim() || !formData.phone.trim()) {
            const defaultErr = language === 'tr' ? 'Lütfen zorunlu alanları (Ad Soyad & Telefon) doldurun.' : 'Bitte füllen Sie die Pflichtfelder aus (Name & Telefon).';
            setFormError(t('whatsappForm.requiredError', defaultErr));
            return;
        }

        const categoryLabelsMap = {
            venue: t('whatsappForm.catVenue', language === 'tr' ? 'Düğün Mekanı & Hizmet Teklifi' : 'Hochzeitslocation & Angebote'),
            package: t('whatsappForm.catPackage', language === 'tr' ? 'Düğün Paketi & Bütçe Planlama' : 'Komplettpaket & Budgetberatung'),
            vendor: t('whatsappForm.catVendor', language === 'tr' ? 'Tedarikçi & İş Ortaklığı' : 'Partner & Dienstleister-Anmeldung'),
            general: t('whatsappForm.catGeneral', language === 'tr' ? 'Genel Soru & Özel İletişim' : 'Allgemeine Frage & Nachricht')
        };
            
        const categoryLabel = categoryLabelsMap[formCategory] || formCategory;

        const translatedServices = formData.services.map(s => {
            const sKey = `whatsappForm.services.${s}`;
            return t(sKey, s);
        });

        const submissionData = {
            isFormSubmission: true,
            category: formCategory,
            categoryLabel,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            city: formData.city.trim(),
            date: formData.date.trim(),
            guests: formData.guests.trim(),
            budget: formData.budget.trim(),
            companyName: formData.companyName.trim(),
            vendorSector: formData.vendorSector.trim(),
            services: translatedServices,
            notes: formData.notes.trim()
        };

        const whatsappUrl = handoffService.getLink(
            HANDOFF_CHANNELS.WHATSAPP, 
            DEFAULT_WHATSAPP_NUMBER, 
            submissionData, 
            language
        );

        window.open(whatsappUrl, '_blank');
    };

    const getDisplayedMessageContent = (msg) => {
        if (msg.role === 'assistant') {
            const isWelcomeMessage = !msg.content || 
                msg.content.startsWith('aiChat.welcomeMessage') ||
                msg.content.includes('Ben Yapay Zekâ') || 
                msg.content.includes('Ben Yapay Zeka') ||
                msg.content.includes('AI Wedding Assistant') ||
                msg.content.includes('KI-Hochzeitsplaner');
            if (isWelcomeMessage) {
                return t('aiChat.welcomeMessage', language === 'tr' 
                    ? 'Merhaba! Ben Yapay Zekâ Düğün Asistanınız. Düğün planlama panelinize bağlandım. Bugün bütçenizi optimize etmeye, davetlileri yönetmeye veya işlerinizi organize etmeye nasıl yardımcı olabilirim?'
                    : language === 'en'
                    ? 'Hello! I am your AI Wedding Assistant. Connected to your wedding planner panel. How can I help optimize your budget, manage guests, or organize tasks today?'
                    : 'Hallo! Ich bin Ihr KI-Hochzeitsplaner. Mit Ihrem Hochzeitsplaner-Panel verbunden. Wie kann ich Ihnen heute bei Budget, Gästen oder Aufgaben helfen?');
            }
        }
        return msg.content;
    };

    if (!isEnabled) return null;

    // Translation helpers with default fallbacks
    const txtTabForm = t('whatsappForm.tabForm', language === 'tr' ? 'WhatsApp İletişim' : language === 'en' ? 'WhatsApp Form' : 'WhatsApp Formular');
    const txtTabChat = t('whatsappForm.tabChat', language === 'tr' ? 'Yapay Zekâ' : language === 'en' ? 'AI Assistant' : 'KI-Assistent');
    const txtTitle = t('whatsappForm.title', language === 'tr' ? 'Doğrudan WhatsApp İletişimi' : language === 'en' ? 'Direct WhatsApp Inquiry' : 'Direkte WhatsApp-Anfrage');
    const txtSubtitle = t('whatsappForm.subtitle', language === 'tr' ? 'İhtiyaç kategorinizi seçin, talebiniz doğrudan WhatsApp hattımıza gelsin.' : language === 'en' ? 'Select your inquiry category and submit directly to our WhatsApp support team.' : 'Wählen Sie Ihre Kategorie und senden Sie Ihre Anfrage direkt an unser WhatsApp-Team.');
    const txtSelectCat = t('whatsappForm.selectCategory', language === 'tr' ? 'Kategori Seçin' : language === 'en' ? 'Select Category' : 'Kategorie wählen');
    const txtCatVenue = t('whatsappForm.catVenue', language === 'tr' ? 'Düğün Mekanı & Hizmet' : language === 'en' ? 'Venue & Services' : 'Location & Angebote');
    const txtCatPackage = t('whatsappForm.catPackage', language === 'tr' ? 'Düğün Paketi & Bütçe' : language === 'en' ? 'Package & Budget' : 'Komplettpaket & Budget');
    const txtCatVendor = t('whatsappForm.catVendor', language === 'tr' ? 'Tedarikçi & Ortaklık' : language === 'en' ? 'Vendor & Partnership' : 'Partner & Dienstleister');
    const txtCatGeneral = t('whatsappForm.catGeneral', language === 'tr' ? 'Genel Soru & İletişim' : language === 'en' ? 'General Inquiry' : 'Allgemeine Anfrage');
    const txtNameLabel = t('whatsappForm.labels.fullName', language === 'tr' ? 'Ad Soyad *' : language === 'en' ? 'Full Name *' : 'Vollständiger Name *');
    const txtPhoneLabel = t('whatsappForm.labels.phone', language === 'tr' ? 'Telefon / WhatsApp *' : language === 'en' ? 'Phone / WhatsApp *' : 'Telefon / WhatsApp *');
    const txtCityLabel = t('whatsappForm.labels.city', language === 'tr' ? 'Şehir / Bölge' : language === 'en' ? 'City / Region' : 'Stadt / Region');
    const txtDateLabel = t('whatsappForm.labels.date', language === 'tr' ? 'Düğün Tarihi' : language === 'en' ? 'Wedding Date' : 'Hochzeitsdatum');
    const txtGuestsLabel = t('whatsappForm.labels.guests', language === 'tr' ? 'Tahmini Davetli Sayısı' : language === 'en' ? 'Estimated Guests' : 'Geschätzte Gäste');
    const txtBudgetLabel = t('whatsappForm.labels.budget', language === 'tr' ? 'Tahmini Bütçe (€)' : language === 'en' ? 'Target Budget (€)' : 'Zielbudget (€)');
    const txtCompanyLabel = t('whatsappForm.labels.companyName', language === 'tr' ? 'Firma / Salon Adı' : language === 'en' ? 'Company / Venue Name' : 'Firmen- / Saalname');
    const txtSectorLabel = t('whatsappForm.labels.vendorSector', language === 'tr' ? 'Hizmet Alanı' : language === 'en' ? 'Service Sector' : 'Dienstleistungsbereich');
    const txtServicesNeeded = t('whatsappForm.labels.servicesNeeded', language === 'tr' ? 'İhtiyaç Duyduğunuz Hizmetler' : language === 'en' ? 'Services Needed' : 'Benötigte Dienstleistungen');
    const txtNotesLabel = t('whatsappForm.labels.notes', language === 'tr' ? 'Mesajınız / Özel Notlar' : language === 'en' ? 'Message / Notes' : 'Nachricht / Wünsche');
    const txtSubmitBtn = t('whatsappForm.submitBtn', language === 'tr' ? "WhatsApp'tan Gönder" : language === 'en' ? 'Send via WhatsApp' : 'Per WhatsApp senden');

    const phName = t('whatsappForm.placeholders.fullName', language === 'tr' ? 'Örn: Ahmet Yılmaz' : language === 'en' ? 'e.g. John Doe' : 'z.B. Max Mustermann');
    const phPhone = t('whatsappForm.placeholders.phone', language === 'tr' ? 'Örn: +49 162 8726192' : 'z.B. +49 162 8726192');
    const phCity = t('whatsappForm.placeholders.city', language === 'tr' ? 'Örn: Frankfurt, München' : language === 'en' ? 'e.g. Frankfurt, Munich' : 'z.B. Frankfurt, München');
    const phGuests = t('whatsappForm.placeholders.guests', language === 'tr' ? 'Örn: 200' : 'z.B. 200');
    const phBudget = t('whatsappForm.placeholders.budget', language === 'tr' ? 'Örn: 15000' : 'z.B. 15000');
    const phCompany = t('whatsappForm.placeholders.companyName', language === 'tr' ? 'Örn: Kral Düğün Salonu' : language === 'en' ? 'e.g. Royal Wedding Hall' : 'z.B. Grand Saal Mainz');
    const phSector = t('whatsappForm.placeholders.vendorSector', language === 'tr' ? 'Örn: Fotoğraf / Mekan' : language === 'en' ? 'e.g. Photography / Venue' : 'z.B. Fotografie / Location');
    const phNotes = t('whatsappForm.placeholders.notes', language === 'tr' ? 'İsteklerinizi veya sorularınızı buraya yazabilirsiniz...' : language === 'en' ? 'Write your requests or questions here...' : 'Schreiben Sie Ihre Wünsche oder Fragen hier...');

    return (
        <div className="ai-chat-drawer-container">
            {/* 1. Smart Floating Trigger Wrapper */}
            {!isOpen && (
                <div className="ai-chat-trigger-wrapper">
                    <div 
                        className={`ai-chat-teaser-badge ${isTeaserExpanded ? 'expanded' : 'collapsed'}`}
                        onClick={() => setIsOpen(true)}
                    >
                        <span className="teaser-dot animate-pulse"></span>
                        <span className="teaser-text">
                            {t('aiChat.triggerBadge', language === 'tr' ? 'WhatsApp & Asistan' : language === 'de' ? 'WhatsApp & KI' : 'WhatsApp & AI')}
                        </span>
                    </div>

                    <button 
                        className="ai-chat-trigger-bubble" 
                        onClick={() => setIsOpen(true)}
                        title={t('aiChat.triggerTooltip', language === 'tr' ? 'KolayDüğün İletişim & Asistan' : language === 'en' ? 'KolayDüğün Support & Assistant' : 'KolayDüğün Support & KI')}
                        aria-label="WhatsApp ve AI Asistan"
                    >
                        <MessageSquare size={24} className="text-white" />
                        <span className="ai-online-status-dot"></span>
                        <span className="ai-chat-pulse"></span>
                    </button>
                </div>
            )}

            {/* 2. Side Drawer Panel */}
            {isOpen && (
                <div className="ai-chat-drawer-panel" data-aos="slide-left">
                    <div className="ai-chat-mobile-drag-handle"></div>
                    {/* Header */}
                    <div className="ai-chat-drawer-header">
                        <div className="flex items-center gap-2.5">
                            <div className="ai-chat-avatar-icon">
                                <Sparkles size={18} className="text-white animate-pulse" />
                            </div>
                            <div>
                                <h3>{t('aiChat.headerTitle', language === 'tr' ? 'KolayDüğün WhatsApp & Asistan' : language === 'en' ? 'KolayDüğün WhatsApp & Assistant' : 'KolayDüğün WhatsApp & KI-Assistent')}</h3>
                                <span className="ai-chat-status-text">{t('aiChat.onlineStatus', 'online')} (+49 162 8726192)</span>
                            </div>
                        </div>
                        <button className="ai-chat-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mode Navigation Tabs */}
                    <div className="ai-chat-nav-tabs">
                        <button 
                            className={`nav-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
                            onClick={() => setActiveTab('form')}
                        >
                            <Phone size={16} />
                            <span>{txtTabForm}</span>
                        </button>
                        <button 
                            className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            <Sparkles size={16} />
                            <span>{txtTabChat}</span>
                        </button>
                    </div>

                    {/* MODE 1: WHATSAPP FORM VIEW */}
                    {activeTab === 'form' && (
                        <div className="whatsapp-form-view">
                            <div className="form-intro-card">
                                <h4>{txtTitle}</h4>
                                <p>{txtSubtitle}</p>
                            </div>

                            {formError && (
                                <div className="ai-chat-error-banner">
                                    <AlertCircle size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} className="whatsapp-form-body">
                                {/* Category Selection */}
                                <div className="form-group">
                                    <label className="form-label">{txtSelectCat}</label>
                                    <div className="category-grid">
                                        <button 
                                            type="button" 
                                            className={`cat-card ${formCategory === 'venue' ? 'active' : ''}`}
                                            onClick={() => setFormCategory('venue')}
                                        >
                                            <span className="cat-icon"><Building2 size={18} /></span>
                                            <span>{txtCatVenue}</span>
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`cat-card ${formCategory === 'package' ? 'active' : ''}`}
                                            onClick={() => setFormCategory('package')}
                                        >
                                            <span className="cat-icon"><Crown size={18} /></span>
                                            <span>{txtCatPackage}</span>
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`cat-card ${formCategory === 'vendor' ? 'active' : ''}`}
                                            onClick={() => setFormCategory('vendor')}
                                        >
                                            <span className="cat-icon"><Handshake size={18} /></span>
                                            <span>{txtCatVendor}</span>
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`cat-card ${formCategory === 'general' ? 'active' : ''}`}
                                            onClick={() => setFormCategory('general')}
                                        >
                                            <span className="cat-icon"><HelpCircle size={18} /></span>
                                            <span>{txtCatGeneral}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Personal Information Inputs */}
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label className="form-label">{txtNameLabel}</label>
                                        <input 
                                            type="text" 
                                            required
                                            autoComplete="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder={phName}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label className="form-label">{txtPhoneLabel}</label>
                                        <input 
                                            type="tel" 
                                            required
                                            inputMode="tel"
                                            autoComplete="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder={phPhone}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label className="form-label">{txtCityLabel}</label>
                                        <input 
                                            type="text" 
                                            autoComplete="address-level2"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder={phCity}
                                            className="form-input"
                                        />
                                    </div>

                                    {formCategory !== 'vendor' && (
                                        <div className="form-group flex-1">
                                            <label className="form-label">{txtDateLabel}</label>
                                            <input 
                                                type="date" 
                                                min={new Date().toISOString().split('T')[0]}
                                                value={formData.date && formData.date >= new Date().toISOString().split('T')[0] ? formData.date : ''}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="form-input"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Category-specific fields */}
                                {formCategory !== 'vendor' && (
                                    <div className="form-row">
                                        <div className="form-group flex-1">
                                            <label className="form-label">{txtGuestsLabel}</label>
                                            <input 
                                                type="number" 
                                                inputMode="numeric"
                                                value={formData.guests}
                                                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                                                placeholder={phGuests}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group flex-1">
                                            <label className="form-label">{txtBudgetLabel}</label>
                                            <input 
                                                type="number" 
                                                inputMode="numeric"
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                                placeholder={phBudget}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                )}

                                {formCategory === 'vendor' && (
                                    <div className="form-row">
                                        <div className="form-group flex-1">
                                            <label className="form-label">{txtCompanyLabel}</label>
                                            <input 
                                                type="text" 
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                placeholder={phCompany}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group flex-1">
                                            <label className="form-label">{txtSectorLabel}</label>
                                            <input 
                                                type="text" 
                                                value={formData.vendorSector}
                                                onChange={(e) => setFormData({ ...formData, vendorSector: e.target.value })}
                                                placeholder={phSector}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Requested Services Pill Buttons (Venue/Package mode) */}
                                {(formCategory === 'venue' || formCategory === 'package') && (
                                    <div className="form-group">
                                        <label className="form-label">{txtServicesNeeded}</label>
                                        <div className="services-pill-grid">
                                            {[
                                                { key: 'venue', label: t('whatsappForm.services.venue', language === 'tr' ? 'Düğün Salonu' : language === 'en' ? 'Wedding Venue' : 'Hochzeitslocation') },
                                                { key: 'photo', label: t('whatsappForm.services.photo', language === 'tr' ? 'Fotoğraf & Video' : language === 'en' ? 'Photo & Video' : 'Foto & Video') },
                                                { key: 'dress', label: t('whatsappForm.services.dress', language === 'tr' ? 'Gelinlik & Damatlık' : language === 'en' ? 'Bridal & Suit' : 'Brautkleid & Anzug') },
                                                { key: 'music', label: t('whatsappForm.services.music', language === 'tr' ? 'Müzik / DJ' : language === 'en' ? 'Music / DJ' : 'Musik / DJ') },
                                                { key: 'deco', label: t('whatsappForm.services.deco', language === 'tr' ? 'Süsleme & Dekor' : language === 'en' ? 'Decoration' : 'Dekoration') },
                                                { key: 'catering', label: t('whatsappForm.services.catering', language === 'tr' ? 'Catering & Yemek' : language === 'en' ? 'Catering' : 'Catering') },
                                            ].map((svc) => {
                                                const isSelected = formData.services.includes(svc.key);
                                                return (
                                                    <button 
                                                        key={svc.key} 
                                                        type="button"
                                                        className={`service-pill-btn ${isSelected ? 'active' : ''}`}
                                                        onClick={() => handleServiceToggle(svc.key)}
                                                    >
                                                        <span className="pill-status-icon">{isSelected ? '✓' : '+'}</span>
                                                        <span>{svc.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Message / Notes */}
                                <div className="form-group">
                                    <label className="form-label">{txtNotesLabel}</label>
                                    <textarea 
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder={phNotes}
                                        className="form-textarea"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="btn-whatsapp-submit">
                                    <SendHorizontal size={18} />
                                    <span>{txtSubmitBtn}</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {/* MODE 2: AI CHAT VIEW */}
                    {activeTab === 'chat' && (
                        !user ? (
                            <div className="ai-chat-guest-view">
                                <div className="ai-chat-guest-illustration">💖</div>
                                <h4>{t('aiChat.guestWelcomeTitle', language === 'tr' ? 'Yapay Zekâ Düğün Asistanı' : language === 'en' ? 'Meet Your AI Wedding Planner!' : 'Lernen Sie Ihren KI-Hochzeitsplaner kennen!')}</h4>
                                <p>{t('aiChat.guestWelcomeDesc', language === 'tr' ? 'Hayalinizdeki düğünü kolayca planlayın!' : language === 'en' ? 'Plan your dream wedding effortlessly!' : 'Planen Sie Ihre Traumhochzeit mühelos!')}</p>
                                <div className="ai-chat-guest-actions">
                                    <button className="btn-guest-login" onClick={() => { setIsOpen(false); navigate('/login'); }}>
                                        <LogIn size={16} />
                                        <span>{t('aiChat.loginBtn', language === 'tr' ? 'Giriş Yap' : language === 'en' ? 'Log In' : 'Einloggen')}</span>
                                    </button>
                                    <button className="btn-guest-register" onClick={() => { setIsOpen(false); navigate('/register'); }}>
                                        <UserPlus size={16} />
                                        <span>{t('aiChat.registerBtn', language === 'tr' ? 'Kayıt Ol' : language === 'en' ? 'Register Now' : 'Jetzt registrieren')}</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="ai-chat-user-view">
                                <div className="ai-chat-sessions-header">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {t('aiChat.chatHistory', language === 'tr' ? 'Sohbet Geçmişi' : language === 'en' ? 'Chat History' : 'Verlauf')}
                                    </span>
                                    <button className="btn-new-session" onClick={handleCreateSession} title={t('aiChat.newChat', 'Yeni Sohbet')}>
                                        <Plus size={14} />
                                        <span>{t('aiChat.newChatBtn', language === 'tr' ? 'Yeni' : language === 'en' ? 'New' : 'Neu')}</span>
                                    </button>
                                </div>

                                {sessions.length > 1 && (
                                    <div className="ai-chat-sessions-tabs">
                                        {sessions.map(s => (
                                            <div 
                                                key={s.id} 
                                                className={`session-tab-item ${activeSessionId === s.id ? 'active' : ''}`}
                                                onClick={() => { setActiveSessionId(s.id); loadMessages(s.id); }}
                                            >
                                                <span className="session-tab-title">{s.title}</span>
                                                <button className="session-tab-delete" onClick={(e) => handleDeleteSession(s.id, e)}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="ai-chat-message-stream">
                                    {messages.map((msg) => (
                                        <div 
                                            key={msg.id} 
                                            className={`message-bubble-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'assistant-wrapper'}`}
                                        >
                                            <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                                                <p className="message-content">{getDisplayedMessageContent(msg)}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {isAiTyping && (
                                        <div className="message-bubble-wrapper assistant-wrapper">
                                            <div className="message-bubble assistant-bubble ai-typing-bubble">
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messageEndRef} />
                                </div>

                                <div className="ai-chat-drawer-footer">
                                    <div className="ai-chat-input-wrapper">
                                        <textarea
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(inputText);
                                                }
                                            }}
                                            placeholder={t('aiChat.placeholder', language === 'tr' ? 'Mesajınızı yazın...' : language === 'en' ? 'Type your message...' : 'Schreiben Sie Ihre Nachricht...')}
                                            rows={1}
                                        />
                                        <button 
                                            onClick={() => handleSendMessage(inputText)}
                                            disabled={!inputText.trim() || isAiTyping}
                                            className="btn-send-message"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

